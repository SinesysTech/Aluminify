/**
 * Verifica se existe uma aula com o nome dado na empresa "Jana Rabelo".
 *
 * Execute com:
 *   npx tsx scripts/check-aula-jana-rabelo.ts
 *
 * Requer: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_SECRET_KEY)
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

const EMPRESA_NOME = "jana rabelo";
const AULA_NOME = "Comentário ENEM 2024 (1a aplicação) + Análise de redação";

async function main() {
  // 1. Buscar empresa por nome (case-insensitive)
  const { data: empresas, error: errEmpresa } = await supabase
    .from("empresas")
    .select("id, nome, slug")
    .ilike("nome", `%${EMPRESA_NOME}%`);

  if (errEmpresa) {
    console.error("❌ Erro ao buscar empresa:", errEmpresa.message);
    process.exit(1);
  }

  if (!empresas?.length) {
    console.log(`❌ Nenhuma empresa encontrada com nome contendo "${EMPRESA_NOME}".`);
    process.exit(0);
  }

  console.log(`🏢 Empresa(s) encontrada(s):`);
  for (const e of empresas) {
    console.log(`   - ${e.nome} (slug: ${e.slug}, id: ${e.id})`);
  }

  const empresaId = empresas[0].id;

  // 2. Buscar aula com o nome exato na empresa
  const { data: aulasExato, error: errAulasExato } = await supabase
    .from("aulas")
    .select("id, nome, modulo_id, curso_id, created_at")
    .eq("empresa_id", empresaId)
    .eq("nome", AULA_NOME);

  if (errAulasExato) {
    console.error("❌ Erro ao buscar aulas:", errAulasExato.message);
    process.exit(1);
  }

  if (aulasExato?.length) {
    console.log(`\n✅ Aula encontrada (nome exato):`);
    for (const a of aulasExato) {
      console.log(`   - id: ${a.id}`);
      console.log(`     nome: ${a.nome}`);
      console.log(`     modulo_id: ${a.modulo_id ?? "—"}`);
      console.log(`     curso_id: ${a.curso_id ?? "—"}`);
      console.log(`     created_at: ${a.created_at ?? "—"}`);
    }
    return;
  }

  // 3. Buscar por nome similar (ilike) caso exato não encontre
  const { data: aulasSimilar, error: errSimilar } = await supabase
    .from("aulas")
    .select("id, nome, modulo_id, curso_id, created_at")
    .eq("empresa_id", empresaId)
    .ilike("nome", `%ENEM 2024%`)
    .ilike("nome", `%Análise de redação%`);

  if (errSimilar) {
    console.error("❌ Erro ao buscar aulas similares:", errSimilar.message);
    process.exit(1);
  }

  if (aulasSimilar?.length) {
    console.log(`\n⚠️ Nenhuma aula com nome exato; aulas com nome parecido na empresa:`);
    for (const a of aulasSimilar) {
      console.log(`   - ${a.nome} (id: ${a.id})`);
    }
    return;
  }

  console.log(`\n❌ Nenhuma aula cadastrada na empresa "${empresas[0].nome}" com o nome:\n   "${AULA_NOME}"`);
}

main().catch((err) => {
  console.error("❌ Erro:", err instanceof Error ? err.message : String(err));
  process.exit(99);
});
