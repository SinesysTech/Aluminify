/**
 * Deleta empresas (por slug) e todos os elementos relacionados via FK (ON DELETE CASCADE),
 * com limpeza extra de tabelas que usam ON DELETE SET NULL (disciplinas/segmentos).
 *
 * Execute com:
 *   npx tsx scripts/purge-empresas.ts miguelmarques phronesys study-cronograma
 *
 * Requer variáveis de ambiente:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_SECRET_KEY)
 *
 * Observações:
 * - Usa Service Role (bypass de RLS).
 * - Não mexe em arquivos de Storage (buckets). Apenas registros no Postgres.
 */

import * as dotenv from "dotenv";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Variáveis de ambiente não configuradas");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type EmpresaRow = { id: string; nome: string; slug: string };

async function countWhere(table: string, col: string, value: string): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq(col, value);
  if (error) throw new Error(`Falha ao contar ${table}: ${error.message}`);
  return count ?? 0;
}

async function safeDeleteWhere(table: string, col: string, value: string): Promise<number> {
  const { data, error } = await supabase.from(table).delete().eq(col, value).select("id");
  if (error) throw new Error(`Falha ao deletar de ${table}: ${error.message}`);
  return Array.isArray(data) ? data.length : 0;
}

async function bestEffortDeleteWhere(table: string, col: string, value: string): Promise<number> {
  try {
    return await safeDeleteWhere(table, col, value);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Em alguns ambientes/times, a tabela/coluna pode não existir; não queremos bloquear o purge por isso.
    const ignorable =
      msg.toLowerCase().includes("does not exist") ||
      msg.toLowerCase().includes("column") ||
      msg.toLowerCase().includes("schema cache") ||
      msg.toLowerCase().includes("could not find");
    if (ignorable) return 0;
    throw err;
  }
}

async function deleteEmpresaBySlug(slug: string) {
  const { data: empresa, error: empresaError } = await supabase
    .from("empresas")
    .select("id, nome, slug")
    .eq("slug", slug)
    .maybeSingle();
  if (empresaError) throw new Error(`Falha ao buscar empresa (${slug}): ${empresaError.message}`);

  if (!empresa) {
    console.log(`- ${slug}: (empresa não encontrada)`);
    return;
  }

  const e = empresa as EmpresaRow;
  console.log(`\n🗑️ Removendo empresa: ${e.nome} (slug: ${e.slug}, id: ${e.id})`);

  // Snapshot rápido (principais)
  const before = {
    cursos: await countWhere("cursos", "empresa_id", e.id).catch(() => -1),
    professores: await countWhere("professores", "empresa_id", e.id).catch(() => -1),
    alunos: await countWhere("alunos", "empresa_id", e.id).catch(() => -1),
    matriculas: await countWhere("matriculas", "empresa_id", e.id).catch(() => -1),
    empresa_admins: await countWhere("empresa_admins", "empresa_id", e.id).catch(() => -1),
  };
  console.log(
    `  Antes: cursos=${before.cursos}, professores=${before.professores}, alunos=${before.alunos}, matriculas=${before.matriculas}, empresa_admins=${before.empresa_admins}`,
  );

  // Limpeza extra: tabelas com empresa_id ON DELETE SET NULL
  const deletedDisciplinas = await safeDeleteWhere("disciplinas", "empresa_id", e.id).catch(
    () => 0,
  );
  const deletedSegmentos = await safeDeleteWhere("segmentos", "empresa_id", e.id).catch(() => 0);
  if (deletedDisciplinas || deletedSegmentos) {
    console.log(`  Limpeza extra: disciplinas=${deletedDisciplinas}, segmentos=${deletedSegmentos}`);
  }

  // Remoção explícita (defensiva) de dependências por empresa_id.
  // Em alguns bancos, alguns FKs podem não estar com ON DELETE CASCADE (como vimos em alunos).
  const deletedByEmpresaId = {
    // Acesso/relacionamentos
    empresa_admins: await bestEffortDeleteWhere("empresa_admins", "empresa_id", e.id),
    matriculas: await bestEffortDeleteWhere("matriculas", "empresa_id", e.id),

    // Navegação/visibilidade
    tenant_submodule_visibility: await bestEffortDeleteWhere(
      "tenant_submodule_visibility",
      "empresa_id",
      e.id,
    ),
    tenant_module_visibility: await bestEffortDeleteWhere(
      "tenant_module_visibility",
      "empresa_id",
      e.id,
    ),

    // Branding
    custom_theme_presets: await bestEffortDeleteWhere("custom_theme_presets", "empresa_id", e.id),
    font_schemes: await bestEffortDeleteWhere("font_schemes", "empresa_id", e.id),
    color_palettes: await bestEffortDeleteWhere("color_palettes", "empresa_id", e.id),
    tenant_branding: await bestEffortDeleteWhere("tenant_branding", "empresa_id", e.id),

    // IA
    ai_agents: await bestEffortDeleteWhere("ai_agents", "empresa_id", e.id),

    // Agendamentos/relatórios
    relatorios_agendamento: await bestEffortDeleteWhere("relatorios_agendamento", "empresa_id", e.id),
    agendamento_bloqueios: await bestEffortDeleteWhere("agendamento_bloqueios", "empresa_id", e.id),
    agendamento_recorrencia: await bestEffortDeleteWhere(
      "agendamento_recorrencia",
      "empresa_id",
      e.id,
    ),

    // Conteúdo/estudos
    cronogramas: await bestEffortDeleteWhere("cronogramas", "empresa_id", e.id),
    atividades: await bestEffortDeleteWhere("atividades", "empresa_id", e.id),
    flashcards: await bestEffortDeleteWhere("flashcards", "empresa_id", e.id),
    aulas: await bestEffortDeleteWhere("aulas", "empresa_id", e.id),
    modulos: await bestEffortDeleteWhere("modulos", "empresa_id", e.id),
    frentes: await bestEffortDeleteWhere("frentes", "empresa_id", e.id),
    materiais_curso: await bestEffortDeleteWhere("materiais_curso", "empresa_id", e.id),

    // Núcleo
    cursos: await bestEffortDeleteWhere("cursos", "empresa_id", e.id),
    professores: await bestEffortDeleteWhere("professores", "empresa_id", e.id),
    alunos: await bestEffortDeleteWhere("alunos", "empresa_id", e.id),
  };

  const deletedSum = Object.values(deletedByEmpresaId).reduce((a, b) => a + b, 0);
  if (deletedSum) {
    console.log(
      `  Remoções explícitas (empresa_id): ${Object.entries(deletedByEmpresaId)
        .filter(([, n]) => n > 0)
        .map(([k, n]) => `${k}=${n}`)
        .join(", ")}`,
    );
  }

  // Deleta a empresa
  const { error: delEmpresaError } = await supabase.from("empresas").delete().eq("id", e.id);
  if (delEmpresaError) {
    throw new Error(`Falha ao deletar empresa (${slug}): ${delEmpresaError.message}`);
  }

  // Verificação
  const { data: stillThere, error: stillThereError } = await supabase
    .from("empresas")
    .select("id")
    .eq("id", e.id)
    .maybeSingle();
  if (stillThereError) throw new Error(`Falha ao verificar empresa deletada: ${stillThereError.message}`);
  if (stillThere) throw new Error(`Empresa ainda existe após delete: ${e.id}`);

  const after = {
    cursos: await countWhere("cursos", "empresa_id", e.id).catch(() => -1),
    professores: await countWhere("professores", "empresa_id", e.id).catch(() => -1),
    alunos: await countWhere("alunos", "empresa_id", e.id).catch(() => -1),
    matriculas: await countWhere("matriculas", "empresa_id", e.id).catch(() => -1),
    empresa_admins: await countWhere("empresa_admins", "empresa_id", e.id).catch(() => -1),
  };
  console.log(
    `  Depois: cursos=${after.cursos}, professores=${after.professores}, alunos=${after.alunos}, matriculas=${after.matriculas}, empresa_admins=${after.empresa_admins}`,
  );
  console.log("  ✅ Empresa removida.");
}

async function main() {
  const slugs = process.argv.slice(2).filter(Boolean);
  if (!slugs.length) {
    console.error("❌ Informe os slugs das empresas para remover.");
    console.error("   Ex: npx tsx scripts/purge-empresas.ts miguelmarques phronesys study-cronograma");
    process.exit(1);
  }

  console.log("⚠️ ATENÇÃO: este script REMOVE dados do banco (Postgres).");
  console.log(`Empresas alvo: ${slugs.join(", ")}`);
  console.log("=".repeat(80));

  for (const slug of slugs) {
    await deleteEmpresaBySlug(slug);
  }

  console.log("\n✅ Purge concluído.");
}

main().catch((err) => {
  console.error("❌ Erro:", err instanceof Error ? err.message : String(err));
  process.exit(99);
});

