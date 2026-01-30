/**
 * Define senha de um usuário e marca como "não precisa trocar no primeiro login".
 * Uso: npx tsx scripts/usuario/set-password-no-change-required.ts <email> <nova_senha>
 * Requisitos: .env.local com NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SECRET_KEY
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!url || !secretKey) {
    console.error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SECRET_KEY em .env.local");
    process.exit(1);
  }
  if (!email || !newPassword) {
    console.error("Uso: npx tsx scripts/usuario/set-password-no-change-required.ts <email> <nova_senha>");
    process.exit(1);
  }

  const supabase = createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const user = list?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) {
    console.error("Usuário não encontrado:", email);
    process.exit(1);
  }

  const { error: authError } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword,
    user_metadata: { ...user.user_metadata, must_change_password: false },
  });
  if (authError) {
    console.error("Erro ao atualizar senha no Auth:", authError.message);
    process.exit(1);
  }
  console.log("Senha atualizada no Auth para:", email);

  const { error: dbError } = await supabase
    .from("usuarios")
    .update({ must_change_password: false })
    .eq("id", user.id);
  if (dbError) {
    console.error("Erro ao atualizar must_change_password em usuarios:", dbError.message);
    process.exit(1);
  }
  console.log("must_change_password = false em usuarios.");
  console.log("Pronto.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
