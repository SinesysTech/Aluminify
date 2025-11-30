/**
 * Script para deletar todos os registros de alunos do Supabase
 * 
 * Execute com: npx tsx scripts/delete-all-students.ts
 * 
 * Este script:
 * 1. Lista todos os alunos cadastrados
 * 2. Deleta os registros da tabela 'alunos' (que automaticamente limpa tabelas relacionadas por CASCADE)
 * 3. Deleta os usuários correspondentes em auth.users
 * 
 * ⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!
 */

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { getDatabaseClient } from '../backend/clients/database';

// Carrega variáveis de ambiente do arquivo .env.local
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    });
  }
}

// Carrega variáveis de ambiente antes de importar o cliente
loadEnvFile();

async function deleteAllStudents() {
  const client = getDatabaseClient();

  try {
    console.log('🔍 Buscando todos os alunos cadastrados...');
    
    // Lista todos os alunos
    const { data: alunos, error: listError } = await client
      .from('alunos')
      .select('id, email, nome_completo')
      .order('nome_completo', { ascending: true });

    if (listError) {
      throw new Error(`Erro ao listar alunos: ${listError.message}`);
    }

    if (!alunos || alunos.length === 0) {
      console.log('✅ Nenhum aluno encontrado no banco de dados.');
      return;
    }

    console.log(`\n📊 Total de alunos encontrados: ${alunos.length}`);
    console.log('\n📋 Lista de alunos que serão deletados:');
    alunos.forEach((aluno, index) => {
      console.log(`  ${index + 1}. ${aluno.nome_completo || 'Sem nome'} (${aluno.email}) - ID: ${aluno.id}`);
    });

    console.log('\n⚠️  ATENÇÃO: Esta ação é IRREVERSÍVEL!');
    console.log('⚠️  Todos os dados relacionados também serão deletados:');
    console.log('   - Relacionamentos aluno-curso (alunos_cursos)');
    console.log('   - Cronogramas e seus itens');
    console.log('   - Aulas concluídas');
    console.log('   - Usuários em auth.users\n');

    // Confirmação
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise<string>((resolve) => {
      rl.question('❓ Deseja continuar? (digite "SIM" para confirmar): ', resolve);
    });

    rl.close();

    if (answer.trim().toUpperCase() !== 'SIM') {
      console.log('❌ Operação cancelada.');
      return;
    }

    console.log('\n🗑️  Iniciando deleção...\n');

    // Deleta os registros da tabela alunos
    // Isso automaticamente deleta registros relacionados devido ao ON DELETE CASCADE
    const alunoIds = alunos.map(a => a.id);
    
    console.log('1️⃣  Deletando registros da tabela "alunos"...');
    const { error: deleteError } = await client
      .from('alunos')
      .delete()
      .in('id', alunoIds);

    if (deleteError) {
      throw new Error(`Erro ao deletar alunos: ${deleteError.message}`);
    }

    console.log(`✅ ${alunos.length} registro(s) deletado(s) da tabela "alunos"`);

    // Deleta os usuários em auth.users
    console.log('\n2️⃣  Deletando usuários em auth.users...');
    let deletedUsers = 0;
    let failedUsers = 0;

    for (const aluno of alunos) {
      try {
        const { error: authError } = await client.auth.admin.deleteUser(aluno.id);
        if (authError) {
          console.error(`   ⚠️  Erro ao deletar usuário ${aluno.email} (${aluno.id}): ${authError.message}`);
          failedUsers++;
        } else {
          deletedUsers++;
          console.log(`   ✅ Usuário deletado: ${aluno.email}`);
        }
      } catch (error) {
        console.error(`   ⚠️  Erro ao deletar usuário ${aluno.email}: ${error instanceof Error ? error.message : String(error)}`);
        failedUsers++;
      }
    }

    console.log(`\n✅ ${deletedUsers} usuário(s) deletado(s) de auth.users`);
    if (failedUsers > 0) {
      console.log(`⚠️  ${failedUsers} usuário(s) falharam ao serem deletados (pode ser que já tenham sido deletados)`);
    }

    console.log('\n🎉 Processo concluído!');
    console.log(`📊 Resumo:`);
    console.log(`   - Alunos deletados: ${alunos.length}`);
    console.log(`   - Usuários deletados de auth.users: ${deletedUsers}`);
    
    if (failedUsers > 0) {
      console.log(`   - Falhas: ${failedUsers}`);
    }

  } catch (error) {
    console.error('\n❌ Erro ao executar script:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Executa o script
deleteAllStudents()
  .then(() => {
    console.log('\n✅ Script finalizado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });

