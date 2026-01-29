import ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

// Formato esperado pelo sistema
const COLUNAS_ESPERADAS = {
  fullName: ['nome completo', 'nome'],
  email: ['email', 'e-mail'],
  cpf: ['cpf'],
  phone: ['telefone', 'celular'],
  enrollmentNumber: ['numero de matricula', 'número de matrícula', 'matricula', 'matrícula'],
  courses: ['cursos', 'curso', 'courses'],
  temporaryPassword: ['senha temporaria', 'senha temporária', 'senha', 'password'],
};

function normalizeColumnName(value) {
  return (value ?? '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeCpf(rawCpf) {
  const digits = (rawCpf ?? '').toString().replace(/\D/g, '');
  if (digits.length >= 8 && digits.length <= 10) {
    return digits.padStart(11, '0');
  }
  return digits;
}

async function analisarArquivo(caminhoArquivo) {
  console.log('📊 Analisando arquivo:', caminhoArquivo);
  console.log('');

  if (!fs.existsSync(caminhoArquivo)) {
    console.error('❌ Arquivo não encontrado:', caminhoArquivo);
    return;
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(caminhoArquivo);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    console.error('❌ Nenhuma planilha encontrada no arquivo');
    return;
  }

  console.log(`📋 Planilha: ${worksheet.name}`);
  console.log(`📏 Total de linhas: ${worksheet.rowCount}`);
  console.log('');

  // Ler cabeçalhos
  const headers = [];
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell({ includeEmpty: false }, (cell) => {
    headers.push(String(cell.value ?? '').trim());
  });

  console.log('📌 Cabeçalhos encontrados:');
  headers.forEach((h, i) => {
    console.log(`   ${i + 1}. "${h}"`);
  });
  console.log('');

  // Normalizar cabeçalhos
  const normalizedHeaders = new Map();
  headers.forEach((header) => {
    const normalized = normalizeColumnName(header);
    normalizedHeaders.set(normalized, header);
  });

  console.log('🔍 Verificando mapeamento de colunas:');
  let problemasColunas = false;

  const colunasMapeadas = {};

  Object.entries(COLUNAS_ESPERADAS).forEach(([campo, aliases]) => {
    let encontrado = false;
    let colunaEncontrada = null;

    for (const alias of aliases) {
      const normalizedAlias = normalizeColumnName(alias);
      if (normalizedHeaders.has(normalizedAlias)) {
        encontrado = true;
        colunaEncontrada = normalizedHeaders.get(normalizedAlias);
        break;
      }
    }

    colunasMapeadas[campo] = colunaEncontrada;

    if (encontrado) {
      console.log(`   ✅ ${campo}: "${colunaEncontrada}"`);
    } else {
      console.log(`   ❌ ${campo}: NÃO ENCONTRADO (esperado: ${aliases.join(', ')})`);
      problemasColunas = true;
    }
  });

  console.log('');

  // Analisar linhas de dados
  console.log('📝 Analisando linhas de dados:');
  console.log('');

  const problemas = [];
  const linhasValidas = [];
  const linhasVazias = [];

  for (let rowNum = 2; rowNum <= worksheet.rowCount; rowNum++) {
    const row = worksheet.getRow(rowNum);
    const rowData = {};

    headers.forEach((header, colIndex) => {
      const cell = row.getCell(colIndex + 1);
      const value = cell.value;
      rowData[header] = value != null ? String(value).trim() : '';
    });

    // Verificar se a linha está vazia
    const valores = Object.values(rowData);
    if (valores.every((v) => !v || v === '')) {
      linhasVazias.push(rowNum);
      continue;
    }

    const erros = [];
    const email = rowData[colunasMapeadas.email || ''] || '';
    const fullName = rowData[colunasMapeadas.fullName || ''] || '';
    const enrollmentNumber = rowData[colunasMapeadas.enrollmentNumber || ''] || '';
    const cpfRaw = rowData[colunasMapeadas.cpf || ''] || '';
    const _phoneRaw = rowData[colunasMapeadas.phone || ''] || '';
    const coursesRaw = rowData[colunasMapeadas.courses || ''] || '';
    const tempPasswordRaw = rowData[colunasMapeadas.temporaryPassword || ''] || '';

    // Validar campos obrigatórios
    if (!fullName) {
      erros.push('Nome completo ausente');
    }

    if (!email) {
      erros.push('Email ausente');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      erros.push(`Email inválido: "${email}"`);
    }

    if (!enrollmentNumber) {
      erros.push('Número de matrícula ausente');
    }

    // Validar CPF
    if (cpfRaw) {
      const cpfDigits = normalizeCpf(cpfRaw);
      if (cpfDigits.length !== 11) {
        erros.push(`CPF inválido: "${cpfRaw}" (${cpfDigits.length} dígitos após normalização, esperado 11)`);
      }
    }

    // Verificar se tem CPF ou senha temporária
    if (!cpfRaw && !tempPasswordRaw) {
      erros.push('CPF ou senha temporária ausente');
    }

    // Validar senha temporária se fornecida
    if (tempPasswordRaw && tempPasswordRaw.length < 8) {
      erros.push(`Senha temporária muito curta: ${tempPasswordRaw.length} caracteres (mínimo 8)`);
    }

    // Validar cursos
    if (!coursesRaw) {
      erros.push('Cursos ausentes');
    } else {
      const cursos = coursesRaw.split(/[,;|/]/).map(c => c.trim()).filter(Boolean);
      if (cursos.length === 0) {
        erros.push('Nenhum curso válido encontrado');
      }
    }

    if (erros.length > 0) {
      problemas.push({
        linha: rowNum,
        email: email || 'N/A',
        nome: fullName || 'N/A',
        matricula: enrollmentNumber || 'N/A',
        erros,
      });
    } else {
      linhasValidas.push({
        linha: rowNum,
        email,
        nome: fullName,
        matricula: enrollmentNumber,
      });
    }
  }

  console.log(`✅ Linhas válidas: ${linhasValidas.length}`);
  console.log(`❌ Linhas com problemas: ${problemas.length}`);
  console.log(`⚪ Linhas vazias: ${linhasVazias.length}`);
  console.log('');

  // Estatísticas de problemas
  const problemasPorTipo = {};
  problemas.forEach((p) => {
    p.erros.forEach((erro) => {
      const tipo = erro.split(':')[0];
      problemasPorTipo[tipo] = (problemasPorTipo[tipo] || 0) + 1;
    });
  });

  if (Object.keys(problemasPorTipo).length > 0) {
    console.log('📊 Problemas por tipo:');
    Object.entries(problemasPorTipo)
      .sort((a, b) => b[1] - a[1])
      .forEach(([tipo, count]) => {
        console.log(`   ${tipo}: ${count} ocorrências`);
      });
    console.log('');
  }

  if (problemas.length > 0) {
    console.log('🚨 Primeiros 30 problemas encontrados:');
    console.log('');
    problemas.slice(0, 30).forEach((p) => {
      console.log(`   Linha ${p.linha} - ${p.nome} (${p.email})`);
      console.log(`      Matrícula: ${p.matricula || 'N/A'}`);
      p.erros.forEach((erro) => {
        console.log(`      ❌ ${erro}`);
      });
      console.log('');
    });

    if (problemas.length > 30) {
      console.log(`   ... e mais ${problemas.length - 30} linhas com problemas`);
      console.log('');
    }
  }

  // Mostrar algumas linhas válidas como exemplo
  if (linhasValidas.length > 0) {
    console.log('✅ Exemplos de linhas válidas (primeiras 5):');
    linhasValidas.slice(0, 5).forEach((v) => {
      console.log(`   Linha ${v.linha}: ${v.nome} (${v.email}) - Matrícula: ${v.matricula}`);
    });
    console.log('');
  }

  // Resumo final
  console.log('📊 RESUMO FINAL:');
  console.log('');
  console.log(`   Total de linhas no arquivo: ${worksheet.rowCount - 1}`);
  console.log(`   Linhas válidas (devem ser importadas): ${linhasValidas.length}`);
  console.log(`   Linhas com problemas (NÃO serão importadas): ${problemas.length}`);
  console.log(`   Linhas vazias (ignoradas): ${linhasVazias.length}`);
  console.log('');

  if (problemasColunas) {
    console.log('⚠️  ATENÇÃO: Algumas colunas esperadas não foram encontradas!');
    console.log('   O sistema pode não conseguir processar o arquivo corretamente.');
    console.log('');
  }

  if (linhasValidas.length === 33) {
    console.log('💡 Você mencionou que apenas 33 alunos foram importados.');
    console.log(`   Encontrei ${linhasValidas.length} linhas válidas na análise.`);
    console.log('   Isso sugere que os problemas podem estar relacionados a:');
    console.log('   1. Cursos não encontrados no sistema');
    console.log('   2. E-mails duplicados (já existentes)');
    console.log('   3. Matrículas duplicadas na mesma empresa');
    console.log('   4. Erros durante a criação no banco de dados');
    console.log('');
  }

  // Salvar relatório detalhado
  const relatorio = {
    totalLinhas: worksheet.rowCount - 1,
    linhasValidas: linhasValidas.length,
    linhasComProblemas: problemas.length,
    linhasVazias: linhasVazias.length,
    problemas: problemas.slice(0, 100), // Limitar a 100 para não ficar muito grande
    colunasMapeadas,
    problemasPorTipo,
  };

  const relatorioPath = path.join(path.dirname(caminhoArquivo), 'relatorio-importacao.json');
  fs.writeFileSync(relatorioPath, JSON.stringify(relatorio, null, 2), 'utf-8');
  console.log(`💾 Relatório detalhado salvo em: ${relatorioPath}`);
}

// Executar análise
const caminhoArquivo = process.argv[2] || 'c:\\Cronogramas - 2026 - CDF\\Química Online\\Alunos - Química Online.xlsx';

analisarArquivo(caminhoArquivo).catch((error) => {
  console.error('❌ Erro ao analisar arquivo:', error);
  console.error(error.stack);
  process.exit(1);
});
