/**
 * Verifica se existe algum curso ou material vinculado à empresa CDF (slug: cdf).
 *
 * Execute com:
 *   npx tsx scripts/check-empresa-cdf-materials-and-courses.ts
 *
 * Requer variáveis de ambiente:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_SECRET_KEY)
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

async function countEq(table: string, col: string, value: string): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq(col, value);
  if (error) throw new Error(`Falha ao contar ${table}.${col}: ${error.message}`);
  return count ?? 0;
}

async function main() {
  const slug = "cdf";
  const { data: empresa, error } = await supabase
    .from("empresas")
    .select("id, nome, slug")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Falha ao buscar empresa (${slug}): ${error.message}`);
  if (!empresa) {
    console.log(`Empresa "${slug}" não encontrada.`);
    process.exit(2);
  }

  const empresaId = (empresa as { id: string }).id;
  const empresaNome = (empresa as { nome: string }).nome;

  const cursos = await countEq("cursos", "empresa_id", empresaId);

  // materiais_curso no banco atual usa empresa_id (apesar de migração antiga não mostrar)
  let materiaisCurso = 0;
  try {
    materiaisCurso = await countEq("materiais_curso", "empresa_id", empresaId);
  } catch {
    // fallback: inferir por cursos (curso_id), caso não exista empresa_id
    const { data: cursosIds, error: cursosIdsError } = await supabase
      .from("cursos")
      .select("id")
      .eq("empresa_id", empresaId);
    if (cursosIdsError) throw new Error(`Falha ao listar cursos: ${cursosIdsError.message}`);
    const ids = (cursosIds ?? []).map((r: any) => r.id).filter(Boolean);
    if (ids.length) {
      const { count, error: mErr } = await supabase
        .from("materiais_curso")
        .select("*", { count: "exact", head: true })
        .in("curso_id", ids);
      if (mErr) throw new Error(`Falha ao contar materiais_curso: ${mErr.message}`);
      materiaisCurso = count ?? 0;
    }
  }

  console.log(`Empresa: ${empresaNome} (slug: ${slug}, id: ${empresaId})`);
  console.log(`Cursos vinculados (cursos.empresa_id): ${cursos}`);
  console.log(`Materiais vinculados (materiais_curso): ${materiaisCurso}`);
}

main().catch((err) => {
  console.error("❌ Erro:", err instanceof Error ? err.message : String(err));
  process.exit(99);
});

