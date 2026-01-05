// Script para verificar se as tabelas estão vazias usando o Supabase
/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas');
  console.error('   Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas no .env.local');
  process.exit(1);
}

// Criar cliente com service role key para bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkTables() {
  console.log('🔍 Verificando tabelas...\n');

  try {
    // 1. Verificar auth.users (precisa usar query SQL direta)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: authUsers, error: authError } = await supabase
      .from('_realtime')
      .select('*')
      .limit(0);
    
    // Para auth.users, precisamos usar uma função RPC ou query SQL
    // Vamos usar uma abordagem diferente - verificar através de uma query SQL
    const { data: authCount, error: authCountError } = await supabase.rpc('exec_sql', {
      query: 'SELECT COUNT(*) as count FROM auth.users'
    }).catch(() => {
      // Se não houver função RPC, vamos tentar outra abordagem
      return { data: null, error: { message: 'Não é possível acessar auth.users diretamente' } };
    });

    // 2. Verificar public.alunos
    const { data: alunos, error: alunosError } = await supabase
      .from('alunos')
      .select('id', { count: 'exact', head: true });

    // 3. Verificar public.professores
    const { data: professores, error: professoresError } = await supabase
      .from('professores')
      .select('id', { count: 'exact', head: true });

    // 4. Verificar public.empresa_admins
    const { data: empresaAdmins, error: empresaAdminsError } = await supabase
      .from('empresa_admins')
      .select('empresa_id', { count: 'exact', head: true });

    // Exibir resultados
    console.log('📊 Resultados:\n');
    
    // Auth.users - tentar obter via query direta
    console.log('1. auth.users:');
    if (authCountError) {
      console.log('   ⚠️  Não é possível verificar auth.users diretamente via API');
      console.log('   💡 Use o Supabase Dashboard ou MCP para verificar esta tabela');
    } else {
      console.log(`   Total: ${authCount?.count || 'N/A'}`);
    }

    console.log('\n2. public.alunos:');
    if (alunosError) {
      console.log(`   ❌ Erro: ${alunosError.message}`);
    } else {
      const count = alunos?.length || 0;
      console.log(`   Total: ${count}`);
      console.log(`   Status: ${count === 0 ? '✅ VAZIA' : '⚠️  CONTÉM DADOS'}`);
    }

    console.log('\n3. public.professores:');
    if (professoresError) {
      console.log(`   ❌ Erro: ${professoresError.message}`);
    } else {
      const count = professores?.length || 0;
      console.log(`   Total: ${count}`);
      console.log(`   Status: ${count === 0 ? '✅ VAZIA' : '⚠️  CONTÉM DADOS'}`);
    }

    console.log('\n4. public.empresa_admins:');
    if (empresaAdminsError) {
      console.log(`   ❌ Erro: ${empresaAdminsError.message}`);
    } else {
      const count = empresaAdmins?.length || 0;
      console.log(`   Total: ${count}`);
      console.log(`   Status: ${count === 0 ? '✅ VAZIA' : '⚠️  CONTÉM DADOS'}`);
    }

    console.log('\n📋 Resumo:');
    const alunosCount = alunos?.length || 0;
    const professoresCount = professores?.length || 0;
    const adminsCount = empresaAdmins?.length || 0;
    
    const allEmpty = alunosCount === 0 && professoresCount === 0 && adminsCount === 0;
    
    if (allEmpty) {
      console.log('   ✅ Todas as tabelas verificadas estão vazias (exceto auth.users)');
    } else {
      console.log('   ⚠️  Algumas tabelas contêm dados:');
      if (alunosCount > 0) console.log(`      - alunos: ${alunosCount} registro(s)`);
      if (professoresCount > 0) console.log(`      - professores: ${professoresCount} registro(s)`);
      if (adminsCount > 0) console.log(`      - empresa_admins: ${adminsCount} registro(s)`);
    }

  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error);
    process.exit(1);
  }
}

checkTables();



