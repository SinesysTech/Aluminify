// Script para verificar se as tabelas estão vazias usando função RPC
/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Tentar carregar .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ Erro: NEXT_PUBLIC_SUPABASE_URL não encontrada');
  console.error('   Certifique-se de que a variável está definida no .env.local');
  process.exit(1);
}

// Criar cliente - tentar com service key primeiro, depois anon key
const supabaseKey = supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ Erro: Chave do Supabase não encontrada');
  console.error('   Certifique-se de que SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_ANON_KEY está definida');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkTables() {
  console.log('🔍 Verificando tabelas usando função RPC...\n');

  try {
    // Tentar usar a função RPC se existir
    const { data: counts, error: rpcError } = await supabase
      .rpc('count_tables_records');

    if (rpcError) {
      console.log('⚠️  Função RPC não encontrada, usando queries diretas...\n');
      
      // Fallback: usar queries diretas
      const results = {
        'public.alunos': 0,
        'public.professores': 0,
        'public.empresa_admins': 0,
        'auth.users': 'N/A'
      };

      // Verificar public.alunos
      const { count: alunosCount, error: alunosError } = await supabase
        .from('alunos')
        .select('*', { count: 'exact', head: true });
      
      if (!alunosError) {
        results['public.alunos'] = alunosCount || 0;
      }

      // Verificar public.professores
      const { count: professoresCount, error: professoresError } = await supabase
        .from('professores')
        .select('*', { count: 'exact', head: true });
      
      if (!professoresError) {
        results['public.professores'] = professoresCount || 0;
      }

      // Verificar public.empresa_admins
      const { count: adminsCount, error: adminsError } = await supabase
        .from('empresa_admins')
        .select('*', { count: 'exact', head: true });
      
      if (!adminsError) {
        results['public.empresa_admins'] = adminsCount || 0;
      }

      // Exibir resultados
      console.log('📊 Resultados:\n');
      console.log('1. auth.users:');
      console.log('   ⚠️  Não é possível verificar auth.users diretamente via API');
      console.log('   💡 Use o Supabase Dashboard ou MCP para verificar esta tabela\n');

      console.log('2. public.alunos:');
      console.log(`   Total: ${results['public.alunos']}`);
      console.log(`   Status: ${results['public.alunos'] === 0 ? '✅ VAZIA' : '⚠️  CONTÉM DADOS'}\n`);

      console.log('3. public.professores:');
      console.log(`   Total: ${results['public.professores']}`);
      console.log(`   Status: ${results['public.professores'] === 0 ? '✅ VAZIA' : '⚠️  CONTÉM DADOS'}\n`);

      console.log('4. public.empresa_admins:');
      console.log(`   Total: ${results['public.empresa_admins']}`);
      console.log(`   Status: ${results['public.empresa_admins'] === 0 ? '✅ VAZIA' : '⚠️  CONTÉM DADOS'}\n`);

      // Resumo
      const allEmpty = results['public.alunos'] === 0 && 
                       results['public.professores'] === 0 && 
                       results['public.empresa_admins'] === 0;

      console.log('📋 Resumo:');
      if (allEmpty) {
        console.log('   ✅ Todas as tabelas verificadas estão vazias (exceto auth.users)');
      } else {
        console.log('   ⚠️  Algumas tabelas contêm dados:');
        if (results['public.alunos'] > 0) console.log(`      - alunos: ${results['public.alunos']} registro(s)`);
        if (results['public.professores'] > 0) console.log(`      - professores: ${results['public.professores']} registro(s)`);
        if (results['public.empresa_admins'] > 0) console.log(`      - empresa_admins: ${results['public.empresa_admins']} registro(s)`);
      }

    } else {
      // Usar resultados da função RPC
      console.log('📊 Resultados:\n');
      
      counts.forEach((row, index) => {
        const num = index + 1;
        console.log(`${num}. ${row.tabela}:`);
        console.log(`   Total: ${row.total}`);
        
        if (row.tabela === 'auth.users') {
          console.log(`   Status: ${row.total === 0 ? '✅ VAZIA' : '⚠️  CONTÉM DADOS'}\n`);
        } else {
          console.log(`   Status: ${row.total === 0 ? '✅ VAZIA' : '⚠️  CONTÉM DADOS'}\n`);
        }
      });

      // Resumo
      const alunosCount = counts.find(r => r.tabela === 'public.alunos')?.total || 0;
      const professoresCount = counts.find(r => r.tabela === 'public.professores')?.total || 0;
      const adminsCount = counts.find(r => r.tabela === 'public.empresa_admins')?.total || 0;
      const authUsersCount = counts.find(r => r.tabela === 'auth.users')?.total || 0;

      const allEmpty = alunosCount === 0 && professoresCount === 0 && adminsCount === 0 && authUsersCount === 0;

      console.log('📋 Resumo:');
      if (allEmpty) {
        console.log('   ✅ Todas as tabelas estão vazias');
      } else {
        console.log('   ⚠️  Algumas tabelas contêm dados:');
        if (authUsersCount > 0) console.log(`      - auth.users: ${authUsersCount} registro(s)`);
        if (alunosCount > 0) console.log(`      - alunos: ${alunosCount} registro(s)`);
        if (professoresCount > 0) console.log(`      - professores: ${professoresCount} registro(s)`);
        if (adminsCount > 0) console.log(`      - empresa_admins: ${adminsCount} registro(s)`);
      }
    }

  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error);
    process.exit(1);
  }
}

checkTables();



