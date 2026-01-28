/**
 * Lista todas as empresas e todos os cursos cadastrados no banco.
 *
 * Execute com:
 *   npx tsx scripts/list-empresas-cursos.ts
 *
 * Requer variáveis de ambiente:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_SECRET_KEY)
 *
 * Observação:
 * - Este script NÃO imprime chaves/URLs sensíveis (apenas nomes/ids/slug).
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
  console.error(
    "   Certifique-se de ter NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_SECRET_KEY)",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type EmpresaRow = {
  id: string;
  nome: string;
  slug: string;
  ativo?: boolean;
};

type CursoRow = {
  id: string;
  nome: string;
  empresa_id?: string | null;
  ano_vigencia?: number | null;
  data_inicio?: string | null;
  data_termino?: string | null;
  meses_acesso?: number | null;
  modalidade?: string | null;
  tipo?: string | null;
};

async function fetchAllPages<T>(params: {
  table: string;
  select: string;
  orderBy?: string;
  pageSize?: number;
}): Promise<T[]> {
  const pageSize = params.pageSize ?? 1000;
  const out: T[] = [];

  let from = 0;
  while (true) {
    const to = from + pageSize - 1;
    let q = supabase.from(params.table).select(params.select).range(from, to);
    if (params.orderBy) q = q.order(params.orderBy as never, { ascending: true });

    const { data, error } = await q;
    if (error) {
      throw new Error(`Falha ao listar ${params.table}: ${error.message}`);
    }

    const rows = (data ?? []) as T[];
    out.push(...rows);
    if (rows.length < pageSize) break;
    from += pageSize;
  }

  return out;
}

function safeBool(v: unknown): string {
  if (typeof v === "boolean") return v ? "sim" : "não";
  return "—";
}

async function main() {
  console.log("📦 Listando empresas e cursos do banco");
  console.log("=".repeat(80));

  const empresas = await fetchAllPages<EmpresaRow>({
    table: "empresas",
    select: "id, nome, slug, ativo",
    orderBy: "nome",
  });

  const cursos = await fetchAllPages<CursoRow>({
    table: "cursos",
    // empresa_id foi adicionado em migrações posteriores; se não existir, o select falhará (e o erro será exibido)
    select:
      "id, nome, empresa_id, ano_vigencia, data_inicio, data_termino, meses_acesso, modalidade, tipo",
    orderBy: "nome",
  });

  const empresasById = new Map<string, EmpresaRow>();
  for (const e of empresas) empresasById.set(e.id, e);

  const cursosByEmpresaId = new Map<string, CursoRow[]>();
  const cursosSemEmpresa: CursoRow[] = [];

  for (const c of cursos) {
    const empresaId = c.empresa_id ?? null;
    if (!empresaId) {
      cursosSemEmpresa.push(c);
      continue;
    }
    if (!cursosByEmpresaId.has(empresaId)) cursosByEmpresaId.set(empresaId, []);
    cursosByEmpresaId.get(empresaId)!.push(c);
  }

  // Ordena os cursos dentro de cada empresa
  for (const list of cursosByEmpresaId.values()) {
    list.sort((a, b) => (a.nome ?? "").localeCompare(b.nome ?? ""));
  }

  console.log(`🏢 Empresas: ${empresas.length}`);
  console.log(`📚 Cursos: ${cursos.length}`);
  console.log("-".repeat(80));

  for (const empresa of empresas) {
    const cursosDaEmpresa = cursosByEmpresaId.get(empresa.id) ?? [];
    console.log(
      `\n- ${empresa.nome} (slug: ${empresa.slug}, id: ${empresa.id}, ativo: ${safeBool(
        empresa.ativo,
      )})`,
    );

    if (!cursosDaEmpresa.length) {
      console.log("  - (sem cursos cadastrados)");
      continue;
    }

    for (const c of cursosDaEmpresa) {
      const parts: string[] = [];
      if (c.ano_vigencia != null) parts.push(`ano: ${c.ano_vigencia}`);
      if (c.modalidade) parts.push(`modalidade: ${c.modalidade}`);
      if (c.tipo) parts.push(`tipo: ${c.tipo}`);
      if (c.data_inicio) parts.push(`início: ${c.data_inicio}`);
      if (c.data_termino) parts.push(`término: ${c.data_termino}`);
      if (c.meses_acesso != null) parts.push(`meses_acesso: ${c.meses_acesso}`);
      const meta = parts.length ? ` — ${parts.join(" | ")}` : "";

      console.log(`  - ${c.nome} (id: ${c.id})${meta}`);
    }
  }

  if (cursosSemEmpresa.length) {
    console.log("\n" + "-".repeat(80));
    console.log(`⚠️ Cursos sem empresa_id (${cursosSemEmpresa.length}):`);
    for (const c of cursosSemEmpresa.sort((a, b) => (a.nome ?? "").localeCompare(b.nome ?? ""))) {
      console.log(`- ${c.nome} (id: ${c.id})`);
    }
  }

  // Cursos com empresa_id sem registro correspondente em empresas
  const cursosComEmpresaInexistente: Array<{ empresa_id: string; curso: CursoRow }> = [];
  for (const [empresaId, list] of cursosByEmpresaId.entries()) {
    if (!empresasById.has(empresaId)) {
      for (const curso of list) {
        cursosComEmpresaInexistente.push({ empresa_id: empresaId, curso });
      }
    }
  }

  if (cursosComEmpresaInexistente.length) {
    console.log("\n" + "-".repeat(80));
    console.log(
      `⚠️ Cursos com empresa_id sem correspondente em empresas (${cursosComEmpresaInexistente.length}):`,
    );
    for (const row of cursosComEmpresaInexistente) {
      console.log(`- [empresa_id: ${row.empresa_id}] ${row.curso.nome} (id: ${row.curso.id})`);
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("✅ Concluído.");
}

main().catch((err) => {
  console.error("❌ Erro:", err instanceof Error ? err.message : String(err));
  process.exit(99);
});

