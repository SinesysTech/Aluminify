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

  // Deleta a empresa (FKs com ON DELETE CASCADE limpam o resto)
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

