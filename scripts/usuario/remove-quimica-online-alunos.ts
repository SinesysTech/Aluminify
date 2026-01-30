/**
 * Remove todos os vínculos de alunos com o curso e a empresa Química Online.
 * NÃO deleta os usuários (usuarios) — apenas:
 * 1. Matrículas em alunos_cursos (curso Química Online)
 * 2. Vínculos em usuarios_empresas (empresa Química Online, papel aluno)
 *
 * Alunos que estiverem em outras empresas permanecem intactos.
 * Nota: a lista de alunos da empresa deve considerar apenas quem tem matrícula em
 * algum curso (alunos_cursos), não apenas usuarios.empresa_id — ver student.repository list.
 *
 * Uso: npx tsx scripts/usuario/remove-quimica-online-alunos.ts
 * Requer: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_SECRET_KEY
 */

import * as dotenv from "dotenv";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
if (!supabaseUrl || !key) {
  console.error("❌ Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_SECRET_KEY)");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EMPRESA_NOME = "Química Online";
const CURSO_NOME = "Química Online";

async function main() {
  console.log("🔍 Buscando empresa e curso...");

  const { data: empresa, error: eErr } = await supabase
    .from("empresas")
    .select("id, nome")
    .eq("nome", EMPRESA_NOME)
    .maybeSingle();
  if (eErr || !empresa?.id) {
    console.error("❌ Empresa não encontrada:", EMPRESA_NOME);
    process.exit(1);
  }

  const { data: curso, error: cErr } = await supabase
    .from("cursos")
    .select("id, nome")
    .eq("empresa_id", empresa.id)
    .eq("nome", CURSO_NOME)
    .maybeSingle();
  if (cErr || !curso?.id) {
    console.error("❌ Curso não encontrado:", CURSO_NOME);
    process.exit(1);
  }

  // Contar antes
  const { count: countMatriculas } = await supabase
    .from("alunos_cursos")
    .select("usuario_id", { count: "exact", head: true })
    .eq("curso_id", curso.id);

  const { data: ueRows } = await supabase
    .from("usuarios_empresas")
    .select("usuario_id")
    .eq("empresa_id", empresa.id)
    .eq("papel_base", "aluno");
  const countUE = ueRows?.length ?? 0;

  console.log(`📊 Matrículas (alunos_cursos): ${countMatriculas ?? 0}`);
  console.log(`📊 Vínculos aluno na empresa (usuarios_empresas): ${countUE}`);
  console.log("");

  // 1) Remover matrículas no curso Química Online
  const { error: delAc } = await supabase
    .from("alunos_cursos")
    .delete()
    .eq("curso_id", curso.id);

  if (delAc) {
    console.error("❌ Erro ao remover matrículas (alunos_cursos):", delAc.message);
    process.exit(1);
  }
  console.log("✅ Matrículas removidas (alunos_cursos).");

  // 2) Remover vínculos de aluno com a empresa Química Online
  const { error: delUe } = await supabase
    .from("usuarios_empresas")
    .delete()
    .eq("empresa_id", empresa.id)
    .eq("papel_base", "aluno");

  if (delUe) {
    console.error("❌ Erro ao remover vínculos (usuarios_empresas):", delUe.message);
    process.exit(1);
  }
  console.log("✅ Vínculos de aluno com a empresa removidos (usuarios_empresas).");

  // Verificação final
  const { count: countAfter } = await supabase
    .from("alunos_cursos")
    .select("usuario_id", { count: "exact", head: true })
    .eq("curso_id", curso.id);

  console.log("");
  console.log("📋 Resumo:");
  console.log(`   Empresa: ${empresa.nome}`);
  console.log(`   Curso: ${curso.nome}`);
  console.log(`   Matrículas removidas: ${countMatriculas ?? 0}`);
  console.log(`   Alunos restantes no curso: ${countAfter ?? 0}`);
  console.log("✅ Concluído. Zero alunos vinculados ao curso/empresa Química Online.");
}

main().catch((err) => {
  console.error("❌ Erro fatal:", err);
  process.exit(99);
});
