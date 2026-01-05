// Script para corrigir a configuração do MCP do shadcn removendo duplicatas
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const os = require('os');

const userMcpPath = path.join(os.homedir(), '.cursor', 'mcp.json');

console.log('🔧 Corrigindo configuração do MCP do shadcn...\n');

// Ler configuração existente
let config = {};
if (fs.existsSync(userMcpPath)) {
  try {
    const content = fs.readFileSync(userMcpPath, 'utf8');
    config = JSON.parse(content);
    console.log('✅ Arquivo mcp.json encontrado');
  } catch (error) {
    console.error('❌ Erro ao ler arquivo:', error.message);
    process.exit(1);
  }
} else {
  console.error('❌ Arquivo mcp.json não encontrado');
  process.exit(1);
}

// Garantir que mcpServers existe
if (!config.mcpServers) {
  config.mcpServers = {};
}

// Remover entrada duplicada do shadcn (se houver uma fora de mcpServers)
if (config.shadcn) {
  console.log('⚠️  Removendo entrada duplicada do shadcn...');
  delete config.shadcn;
}

// Garantir que a configuração do shadcn está correta dentro de mcpServers
config.mcpServers.shadcn = {
  command: 'npx',
  args: ['shadcn@latest', 'mcp']
};

// Salvar configuração corrigida
try {
  fs.writeFileSync(userMcpPath, JSON.stringify(config, null, 2), 'utf8');
  console.log('✅ Configuração corrigida com sucesso!');
  console.log(`\n📁 Arquivo: ${userMcpPath}`);
  console.log('\n📋 Configuração final:');
  console.log(JSON.stringify(config, null, 2));
  console.log('\n🔄 Próximos passos:');
  console.log('   1. Feche completamente o Cursor');
  console.log('   2. Abra o Cursor novamente');
  console.log('   3. O MCP do shadcn deve estar disponível');
} catch (error) {
  console.error('❌ Erro ao salvar configuração:', error.message);
  process.exit(1);
}



