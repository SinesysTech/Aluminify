/**
 * Cadastra um novo aluno na empresa CDF, curso CDF Live.
 * Cria usuário no Auth, usuarios, usuarios_empresas, alunos_cursos e matriculas.
 *
 * Uso: npx tsx scripts/usuario/cadastrar-aluno-cdf-live.ts
 *
 * Requer: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_SECRET_KEY
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
  console.error(
    "❌ Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_SECRET_KEY)"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function normalizeEmail(s: string): string {
  return s.trim().toLowerCase();
}

function normalizeCpf(s: string): string {
  return s.replace(/\D/g, "").trim() || s.trim();
}

function normalizePhone(s: string): string {
  return s.replace(/\D/g, "").trim() || s.trim();
}

async function getAuthUserIdByEmail(email: string): Promise<string | null> {
  const normalized = normalizeEmail(email);
  let page: string | null = null;
  do {
    const { data, error } = await supabase.auth.admin.listUsers({
      perPage: 100,
      page: page ?? undefined,
    });
    if (error) return null;
    const users = data?.users ?? [];
    const match = users.find((u) => (u.email ?? "").toLowerCase() === normalized);
    if (match?.id) return match.id;
    page = data?.nextPage ?? null;
    if (!users.length) break;
  } while (page);
  return null;
}

async function findEmpresaByNameOrThrow(nome: string): Promise<{ id: string; nome: string }> {
  const { data: exact, error: exactError } = await supabase
    .from("empresas")
    .select("id, nome")
    .eq("nome", nome)
    .maybeSingle();
  if (exactError) throw new Error(`Falha ao buscar empresa: ${exactError.message}`);
  if (exact?.id) return { id: exact.id as string, nome: exact.nome as string };

  const { data: list, error: listError } = await supabase
    .from("empresas")
    .select("id, nome")
    .ilike("nome", `%${nome}%`)
    .limit(10);
  if (listError) throw new Error(`Falha ao buscar empresa (ilike): ${listError.message}`);
  const normalizedTarget = nome.trim().toLowerCase();
  const pick =
    (list ?? []).find((e) => String(e.nome ?? "").trim().toLowerCase().includes(normalizedTarget)) ??
    (list ?? [])[0];
  if (!pick?.id) throw new Error(`Empresa não encontrada: "${nome}"`);
  return { id: pick.id as string, nome: pick.nome as string };
}

async function findCursoByEmpresaAndNameOrThrow(params: {
  empresaId: string;
  nome: string;
}): Promise<{ id: string; nome: string }> {
  const { data: exact, error: exactError } = await supabase
    .from("cursos")
    .select("id, nome")
    .eq("empresa_id", params.empresaId)
    .eq("nome", params.nome)
    .maybeSingle();
  if (exactError) throw new Error(`Falha ao buscar curso: ${exactError.message}`);
  if (exact?.id) return { id: exact.id as string, nome: exact.nome as string };

  const { data: list, error: listError } = await supabase
    .from("cursos")
    .select("id, nome")
    .eq("empresa_id", params.empresaId)
    .ilike("nome", `%${params.nome}%`)
    .limit(10);
  if (listError) throw new Error(`Falha ao buscar curso (ilike): ${listError.message}`);
  const normalizedTarget = params.nome.trim().toLowerCase();
  const pick =
    (list ?? []).find((c) => String(c.nome ?? "").trim().toLowerCase().includes(normalizedTarget)) ??
    (list ?? [])[0];
  if (!pick?.id)
    throw new Error(`Curso não encontrado: "${params.nome}" (empresa_id: ${params.empresaId})`);
  return { id: pick.id as string, nome: pick.nome as string };
}

const PASSWORD = "CDF@2026!";

async function main() {
  const fullName = "Jonas Andrade Melo Brandão";
  const email = normalizeEmail("jonasandrade0231@gmail.com");
  const telefone = normalizePhone("85985504936");
  const cpf = normalizeCpf("62706073373");

  console.log("🚀 Cadastrando aluno na CDF / CDF Live");
  console.log("=".repeat(50));
  console.log(`   Nome: ${fullName}`);
  console.log(`   Email: ${email}`);
  console.log(`   Telefone: ${telefone}`);
  console.log(`   CPF: ${cpf}`);
  console.log("=".repeat(50));

  const empresa = await findEmpresaByNameOrThrow("CDF");
  console.log(`🏢 Empresa: ${empresa.nome} (id: ${empresa.id})`);

  const curso = await findCursoByEmpresaAndNameOrThrow({
    empresaId: empresa.id,
    nome: "CDF Live",
  });
  console.log(`📚 Curso: ${curso.nome} (id: ${curso.id})`);

  let userId: string | null = null;

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: {
      role: "aluno",
      full_name: fullName,
      empresa_id: empresa.id,
    },
  });

  if (createError) {
    const m = (createError.message ?? "").toLowerCase();
    const isConflict =
      m.includes("already be registered") ||
      m.includes("already registered") ||
      m.includes("already exists") ||
      createError.status === 422;

    if (!isConflict) {
      throw new Error(`Erro ao criar usuário no Auth: ${createError.message}`);
    }

    userId = await getAuthUserIdByEmail(email);
    if (!userId) {
      throw new Error("Usuário já existe no Auth mas não foi possível obter o id.");
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: PASSWORD,
      user_metadata: {
        role: "aluno",
        full_name: fullName,
        empresa_id: empresa.id,
      },
    });
    if (updateError) {
      console.warn("⚠️ Atualização de senha/metadata no Auth:", updateError.message);
    }
    console.log("   (usuário já existia no Auth; senha e vínculos atualizados)");
  } else {
    userId = created?.user?.id ?? null;
  }

  if (!userId) {
    throw new Error("Falha inesperada: userId vazio.");
  }

  const { error: usuarioError } = await supabase.from("usuarios").upsert(
    {
      id: userId,
      empresa_id: empresa.id,
      nome_completo: fullName,
      email,
      cpf: cpf || null,
      telefone: telefone || null,
    },
    { onConflict: "id" }
  );
  if (usuarioError) throw new Error(`Erro ao salvar usuarios: ${usuarioError.message}`);
  console.log("   ✅ usuarios");

  const { error: ueError } = await supabase.from("usuarios_empresas").upsert(
    {
      usuario_id: userId,
      empresa_id: empresa.id,
      papel_base: "aluno",
      ativo: true,
    },
    { onConflict: "usuario_id,empresa_id,papel_base", ignoreDuplicates: true }
  );
  if (ueError) throw new Error(`Erro ao vincular usuarios_empresas: ${ueError.message}`);
  console.log("   ✅ usuarios_empresas");

  const { error: acError } = await supabase.from("alunos_cursos").upsert(
    { usuario_id: userId, curso_id: curso.id },
    { onConflict: "usuario_id,curso_id", ignoreDuplicates: true }
  );
  if (acError) throw new Error(`Erro ao vincular alunos_cursos: ${acError.message}`);
  console.log("   ✅ alunos_cursos");

  const dataInicio = new Date();
  const dataFim = new Date();
  dataFim.setFullYear(dataFim.getFullYear() + 1);
  const { error: matError } = await supabase.from("matriculas").insert({
    usuario_id: userId,
    empresa_id: empresa.id,
    curso_id: curso.id,
    data_matricula: dataInicio.toISOString(),
    data_inicio_acesso: dataInicio.toISOString().split("T")[0],
    data_fim_acesso: dataFim.toISOString().split("T")[0],
    ativo: true,
  });
  if (matError && (matError as { code?: string }).code !== "23505") {
    console.warn("   ⚠️ matriculas (ignorado):", matError.message);
  } else {
    console.log("   ✅ matriculas");
  }

  console.log("\n" + "=".repeat(50));
  console.log("✅ Cadastro concluído com sucesso!");
  console.log(`   Email: ${email}`);
  console.log(`   Senha: ${PASSWORD}`);
  console.log("=".repeat(50));
}

main().catch((err) => {
  console.error("❌ Erro:", err instanceof Error ? err.message : String(err));
  process.exit(99);
});
