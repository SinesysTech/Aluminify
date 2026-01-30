/**
 * Conta quantos alunos estão matriculados em um curso (por nome da empresa e do curso).
 * Uso: npx tsx scripts/usuario/count-alunos-curso.ts "<empresa>" "<curso>"
 * Exemplo: npx tsx scripts/usuario/count-alunos-curso.ts "Química Online" "Química Online"
 */

import * as dotenv from "dotenv";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
if (!supabaseUrl || !key) {
  console.error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_SECRET_KEY)");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const empresaNome = process.argv[2] ?? "Química Online";
  const cursoNome = process.argv[3] ?? "Química Online";

  const { data: empresa, error: eErr } = await supabase
    .from("empresas")
    .select("id, nome")
    .eq("nome", empresaNome)
    .maybeSingle();
  if (eErr || !empresa?.id) {
    console.error("Empresa não encontrada:", empresaNome);
    process.exit(1);
  }

  const { data: curso, error: cErr } = await supabase
    .from("cursos")
    .select("id, nome")
    .eq("empresa_id", empresa.id)
    .eq("nome", cursoNome)
    .maybeSingle();
  if (cErr || !curso?.id) {
    console.error("Curso não encontrado:", cursoNome, "na empresa", empresaNome);
    process.exit(1);
  }

  const { count, error: acErr } = await supabase
    .from("alunos_cursos")
    .select("usuario_id", { count: "exact", head: true })
    .eq("curso_id", curso.id);

  if (acErr) {
    console.error("Erro ao contar matrículas:", acErr.message);
    process.exit(1);
  }

  console.log(`Empresa: ${empresa.nome}`);
  console.log(`Curso: ${curso.nome}`);
  console.log(`Alunos matriculados: ${count ?? 0}`);
}

main();
