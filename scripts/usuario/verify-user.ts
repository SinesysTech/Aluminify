import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    console.error("Missing env vars");
    process.exit(1);
  }

  const supabase = createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const email = "ti@sinesys.com.br";
  console.log(`Checking user: ${email}`);

  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error("Error listing users:", error);
    return;
  }

  const user = data.users.find((u) => u.email === email);

  if (user) {
    console.log("User found:", {
      id: user.id,
      email: user.email,
      confirmed_at: user.confirmed_at,
      email_confirmed_at: user.email_confirmed_at,
      last_sign_in_at: user.last_sign_in_at,
      role: user.role,
      user_metadata: user.user_metadata,
    });
  } else {
    console.log("User NOT found in list.");
  }
}

main();
