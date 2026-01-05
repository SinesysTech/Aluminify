// Script para atualizar a configuração do MCP do shadcn no arquivo do usuário
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const os = require('os');

const userMcpPath = path.join(os.homedir(), '.cursor', 'mcp.json');

console.log('🔧 Atualizando configuração do MCP do shadcn...\n');

// Ler configuração existente
let config = {};
if (fs.existsSync(userMcpPath)) {
  try {
    const content = fs.readFileSync(userMcpPath, 'utf8');
    config = JSON.parse(content);
    console.log('✅ Arquivo mcp.json encontrado');
  } catch {
    console.log('⚠️  Erro ao ler arquivo, criando novo...');
    config = { mcpServers: {} };
  }
} else {
  console.log('📝 Criando novo arquivo mcp.json...');
  config = { mcpServers: {} };
}

// Garantir que mcpServers existe
if (!config.mcpServers) {
  config.mcpServers = {};
}

// Atualizar configuração do shadcn
config.mcpServers.shadcn = {
  command: 'npx',
  args: ['shadcn@latest', 'mcp']
};

// Criar diretório se não existir
const cursorDir = path.dirname(userMcpPath);
if (!fs.existsSync(cursorDir)) {
  fs.mkdirSync(cursorDir, { recursive: true });
  console.log('✅ Diretório .cursor criado');
}

// Salvar configuração
try {
  fs.writeFileSync(userMcpPath, JSON.stringify(config, null, 2), 'utf8');
  console.log('✅ Configuração atualizada com sucesso!');
  console.log(`\n📁 Arquivo: ${userMcpPath}`);
  console.log('\n📋 Configuração do shadcn:');
  console.log(JSON.stringify(config.mcpServers.shadcn, null, 2));
  console.log('\n🔄 Próximos passos:');
  console.log('   1. Feche completamente o Cursor');
  console.log('   2. Abra o Cursor novamente');
  console.log('   3. O MCP do shadcn deve estar disponível');
} catch (error) {
  console.error('❌ Erro ao salvar configuração:', error.message);
  process.exit(1);
}



