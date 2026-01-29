/**
 * Script de diagnóstico: tenta cadastrar o aluno
 * IGOR CARLOS DE BARROS / igorcontapessoal@outlook.com / 44074639882 / 16991703993
 *
 * Uso: npx tsx scripts/usuario/create-aluno-diagnostico.ts
 * Requer .env.local com NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SECRET_KEY (ou SERVICE_ROLE).
 */

import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

if (!process.env.SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
}

async function main() {
  const {
    getServiceRoleClient,
  } = await import("@/app/shared/core/database/database-auth");
  const { createStudentService } = await import(
    "@/app/[tenant]/(modules)/usuario/services"
  );

  const db = getServiceRoleClient();
  const service = createStudentService(db);

  const empresaId = "c64a0fcc-5990-4b87-9de5-c4dbc6cb8da7";
  const cursoId = "2c8a5974-6e3b-4eac-b680-618bd1a84dae";

  const payload = {
    empresaId,
    fullName: "IGOR CARLOS DE BARROS",
    email: "igorcontapessoal@outlook.com",
    cpf: "44074639882",
    phone: "16991703993",
    courseIds: [cursoId],
    temporaryPassword: "44074639882",
  };

  console.log("Tentando cadastrar aluno:", payload.email);
  console.log("Empresa:", empresaId, "| Curso:", cursoId);

  try {
    const student = await service.create(payload);
    console.log("\n✅ Sucesso! Aluno criado:", student.id, student.email);
  } catch (err) {
    console.error("\n❌ Erro ao cadastrar:");
    console.error(err);
    if (err instanceof Error) {
      console.error("\nMensagem:", err.message);
      console.error("Stack:", err.stack);
    }
    process.exit(1);
  }
}

main();
