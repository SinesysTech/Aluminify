/**
 * Lista os horários de disponibilidade cadastrados por um professor em uma empresa.
 *
 * Uso: npx tsx scripts/agendamentos/list-professor-availability.ts <email_professor> <empresa>
 * Exemplo: npx tsx scripts/agendamentos/list-professor-availability.ts "felipe.vilanova148@gmail.com" "Jana Rabelo"
 *
 * Requer: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_SECRET_KEY
 */

import * as dotenv from "dotenv";
import * as path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "❌ Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_SECRET_KEY)",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

async function getUserIdByEmail(
  client: SupabaseClient,
  email: string,
): Promise<string | null> {
  const normalized = email.trim().toLowerCase();
  const { data, error } = await client
    .from("usuarios")
    .select("id")
    .eq("email", normalized)
    .is("deleted_at", null)
    .maybeSingle();
  if (error || !data?.id) return null;
  return data.id as string;
}

async function findEmpresaByNameOrThrow(
  client: SupabaseClient,
  nome: string,
): Promise<{ id: string; nome: string }> {
  const { data: exact, error: exactError } = await client
    .from("empresas")
    .select("id, nome")
    .eq("nome", nome)
    .maybeSingle();
  if (exactError) throw new Error(`Falha ao buscar empresa: ${exactError.message}`);
  if (exact?.id) return { id: exact.id as string, nome: exact.nome as string };

  const { data: list, error: listError } = await client
    .from("empresas")
    .select("id, nome")
    .ilike("nome", `%${nome}%`)
    .limit(10);
  if (listError) throw new Error(`Falha ao buscar empresa: ${listError.message}`);

  const normalizedTarget = nome.trim().toLowerCase();
  const pick =
    (list ?? []).find((e) =>
      String(e.nome ?? "").trim().toLowerCase().includes(normalizedTarget),
    ) ?? (list ?? [])[0];
  if (!pick?.id) throw new Error(`Empresa não encontrada: "${nome}"`);
  return { id: pick.id as string, nome: pick.nome as string };
}

async function main() {
  const emailProfessor = process.argv[2]?.trim();
  const empresaNome = process.argv[3]?.trim();

  if (!emailProfessor || !empresaNome) {
    console.error(
      "Uso: npx tsx scripts/agendamentos/list-professor-availability.ts <email_professor> <empresa>",
    );
    console.error(
      'Exemplo: npx tsx scripts/agendamentos/list-professor-availability.ts "felipe.vilanova148@gmail.com" "Jana Rabelo"',
    );
    process.exit(1);
  }

  const professorId = await getUserIdByEmail(supabase, emailProfessor);
  if (!professorId) {
    console.error(`❌ Professor não encontrado: ${emailProfessor}`);
    process.exit(1);
  }

  const empresa = await findEmpresaByNameOrThrow(supabase, empresaNome);

  console.log(`\n📅 Horários de disponibilidade para atendimento`);
  console.log(`   Professor: ${emailProfessor}`);
  console.log(`   Empresa: ${empresa.nome}\n`);

  // 1. agendamento_disponibilidade (legado)
  const { data: disp, error: dispErr } = await supabase
    .from("agendamento_disponibilidade")
    .select("id, dia_semana, hora_inicio, hora_fim, ativo")
    .eq("professor_id", professorId)
    .eq("empresa_id", empresa.id)
    .order("dia_semana")
    .order("hora_inicio");

  if (dispErr) {
    console.warn("⚠️ Erro ao buscar agendamento_disponibilidade:", dispErr.message);
  } else if (disp && disp.length > 0) {
    console.log("--- agendamento_disponibilidade (legado) ---");
    for (const r of disp) {
      const dia = DIAS[r.dia_semana] ?? `Dia ${r.dia_semana}`;
      const ativo = r.ativo ? "✓" : "✗";
      console.log(`  ${ativo} ${dia}: ${r.hora_inicio} às ${r.hora_fim}`);
    }
    console.log("");
  } else {
    console.log("   Nenhum registro em agendamento_disponibilidade.\n");
  }

  // 2. agendamento_recorrencia (novo)
  const { data: rec, error: recErr } = await supabase
    .from("agendamento_recorrencia")
    .select("id, tipo_servico, data_inicio, data_fim, dia_semana, hora_inicio, hora_fim, duracao_slot_minutos, ativo")
    .eq("professor_id", professorId)
    .eq("empresa_id", empresa.id)
    .order("dia_semana")
    .order("hora_inicio");

  if (recErr) {
    console.warn("⚠️ Erro ao buscar agendamento_recorrencia:", recErr.message);
  } else if (rec && rec.length > 0) {
    console.log("--- agendamento_recorrencia ---");
    for (const r of rec) {
      const dia = DIAS[r.dia_semana] ?? `Dia ${r.dia_semana}`;
      const ativo = r.ativo ? "✓" : "✗";
      const vigencia =
        r.data_fim
          ? `${r.data_inicio} a ${r.data_fim}`
          : `a partir de ${r.data_inicio}`;
      console.log(
        `  ${ativo} ${dia}: ${r.hora_inicio} às ${r.hora_fim} (${r.tipo_servico}, slots ${r.duracao_slot_minutos}min) — ${vigencia}`,
      );
    }
    console.log("");
  } else {
    console.log("   Nenhum registro em agendamento_recorrencia.\n");
  }

  const total =
    (disp?.length ?? 0) + (rec?.length ?? 0);
  if (total === 0) {
    console.log("⚠️ Este professor não tem horários de disponibilidade cadastrados para esta empresa.");
  } else {
    console.log(`Total: ${total} registro(s) de disponibilidade.\n`);
  }
}

main().catch((err) => {
  console.error("❌ Erro:", err instanceof Error ? err.message : String(err));
  process.exit(99);
});
