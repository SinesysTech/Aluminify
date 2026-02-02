/**
 * Cria vínculos faltantes em usuarios_empresas para usuários que estão matriculados
 * via alunos_cursos mas não têm registro na tabela usuarios_empresas.
 *
 * Mantém a coerência: vincula à empresa do curso em que estão matriculados.
 *
 * Uso: npx tsx scripts/usuario/fix-missing-usuarios-empresas.ts
 *      npx tsx scripts/usuario/fix-missing-usuarios-empresas.ts --dry-run
 *
 * Requisitos: .env.local com NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SECRET_KEY
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

interface MissingLink {
  usuario_id: string;
  email: string;
  nome_completo: string;
  curso_id: string;
  curso_nome: string;
  empresa_id: string;
  empresa_nome: string;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !secretKey) {
    console.error(
      "Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SECRET_KEY (ou SUPABASE_SERVICE_ROLE_KEY) em .env.local",
    );
    process.exit(1);
  }

  const supabase = createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("=".repeat(80));
  console.log("Criar vínculos faltantes em usuarios_empresas");
  console.log("=".repeat(80));
  if (dryRun) {
    console.log("⚠️  MODO DRY-RUN: Nenhuma alteração será feita\n");
  }

  // 1) Buscar usuários matriculados via alunos_cursos sem vínculo em usuarios_empresas
  const { data: missing, error: missingError } = await supabase.rpc(
    "get_missing_usuarios_empresas_links",
  );

  if (missingError) {
    // Se a função RPC não existe, fazer a query manualmente
    console.log("Função RPC não encontrada, usando query SQL direta...\n");

    const { data: manualData, error: manualError } = await supabase.from(
      "alunos_cursos",
    ).select(`
        usuario_id,
        curso_id,
        cursos!inner(id, nome, empresa_id, empresas!inner(id, nome)),
        usuarios!inner(id, email, nome_completo)
      `);

    if (manualError) {
      console.error("Erro ao buscar dados:", manualError.message);
      process.exit(1);
    }

    // Filtrar apenas os que não têm vínculo em usuarios_empresas
    const allLinks = manualData || [];
    const missingLinks: MissingLink[] = [];

    for (const link of allLinks) {
      const usuario = link.usuarios as unknown as {
        email: string;
        nome_completo: string;
      };
      const curso = link.cursos as unknown as {
        id: string;
        nome: string;
        empresas: { id: string; nome: string };
      };
      const empresa = curso.empresas;

      // Verificar se já existe vínculo
      const { data: existing } = await supabase
        .from("usuarios_empresas")
        .select("id")
        .eq("usuario_id", link.usuario_id)
        .eq("empresa_id", empresa.id)
        .maybeSingle();

      if (!existing) {
        missingLinks.push({
          usuario_id: link.usuario_id,
          email: usuario.email,
          nome_completo: usuario.nome_completo,
          curso_id: curso.id,
          curso_nome: curso.nome,
          empresa_id: empresa.id,
          empresa_nome: empresa.nome,
        });
      }
    }

    await processMissingLinks(supabase, missingLinks, dryRun);
  } else {
    await processMissingLinks(supabase, missing || [], dryRun);
  }
}

async function processMissingLinks(
  supabase: SupabaseClient,
  missing: MissingLink[],
  dryRun: boolean,
) {
  if (!missing || missing.length === 0) {
    console.log(
      "✅ Nenhum vínculo faltante encontrado. Todos os alunos matriculados já têm registro em usuarios_empresas.\n",
    );
    return;
  }

  // Agrupar por empresa
  const byEmpresa = new Map<string, MissingLink[]>();
  for (const link of missing) {
    if (!byEmpresa.has(link.empresa_nome)) {
      byEmpresa.set(link.empresa_nome, []);
    }
    byEmpresa.get(link.empresa_nome)!.push(link);
  }

  console.log(
    `📋 Encontrados ${missing.length} vínculos faltantes em ${byEmpresa.size} empresa(s):\n`,
  );

  for (const [empresaNome, links] of Array.from(byEmpresa.entries())) {
    console.log(`\n${"=".repeat(80)}`);
    console.log(`Empresa: ${empresaNome} (${links.length} vínculos)`);
    console.log("=".repeat(80));

    // Agrupar usuários únicos por empresa (um usuário pode estar em múltiplos cursos)
    const uniqueUsers = new Map<string, MissingLink>();
    for (const link of links) {
      if (!uniqueUsers.has(link.usuario_id)) {
        uniqueUsers.set(link.usuario_id, link);
      }
    }

    console.log(`\nUsuários únicos a vincular: ${uniqueUsers.size}`);

    let count = 0;
    for (const [userId, link] of Array.from(uniqueUsers.entries())) {
      count++;
      const cursos = links
        .filter((l) => l.usuario_id === userId)
        .map((l) => l.curso_nome)
        .join(", ");

      console.log(`  ${count}. ${link.email} (${link.nome_completo})`);
      console.log(`     Cursos: ${cursos}`);
    }

    if (!dryRun) {
      console.log(
        `\n⏳ Criando ${uniqueUsers.size} vínculo(s) em usuarios_empresas...`,
      );

      const toInsert = Array.from(uniqueUsers.values()).map((link) => ({
        usuario_id: link.usuario_id,
        empresa_id: link.empresa_id,
        papel_base: "aluno",
        ativo: true,
      }));

      const { error: insertError } = await supabase
        .from("usuarios_empresas")
        .upsert(toInsert, {
          onConflict: "usuario_id,empresa_id,papel_base",
          ignoreDuplicates: false,
        });

      if (insertError) {
        console.error(
          `❌ Erro ao criar vínculos para ${empresaNome}:`,
          insertError.message,
        );
      } else {
        console.log(
          `✅ ${uniqueUsers.size} vínculo(s) criado(s) com sucesso para ${empresaNome}`,
        );
      }
    }
  }

  console.log("\n" + "=".repeat(80));
  if (dryRun) {
    console.log(`\n⚠️  DRY-RUN: ${missing.length} vínculo(s) seriam criados.`);
    console.log("Execute sem --dry-run para aplicar as alterações.");
  } else {
    console.log(
      `\n✅ Concluído! Total de vínculos processados: ${missing.length}`,
    );
  }
  console.log("=".repeat(80) + "\n");
}

main().catch(console.error);
