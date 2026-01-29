import ExcelJS from 'exceljs';
import * as fs from 'fs';

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

function normalizeColumnName(value?: string | null): string {
  return (value ?? '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeCpf(rawCpf: string): string {
  const digits = (rawCpf ?? '').replace(/\D/g, '');
  if (digits.length >= 8 && digits.length <= 10) return digits.padStart(11, '0');
  return digits;
}

async function analisarArquivo(caminhoArquivo: string) {
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
  const headers: string[] = [];
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
  const normalizedHeaders = new Map<string, string>();
  headers.forEach((header) => {
    const normalized = normalizeColumnName(header);
    normalizedHeaders.set(normalized, header);
  });

  console.log('🔍 Verificando mapeamento de colunas:');
  let problemasColunas = false;

  const colunasMapeadas: Record<string, string | null> = {};

  Object.entries(COLUNAS_ESPERADAS).forEach(([campo, aliases]) => {
    let encontrado = false;
    let colunaEncontrada: string | null = null;

    for (const alias of aliases) {
      const normalizedAlias = normalizeColumnName(alias);
      if (normalizedHeaders.has(normalizedAlias)) {
        encontrado = true;
        colunaEncontrada = normalizedHeaders.get(normalizedAlias) || null;
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

  const problemas: Array<{
    linha: number;
    email?: string;
    erros: string[];
  }> = [];

  for (let rowNum = 2; rowNum <= worksheet.rowCount; rowNum++) {
    const row = worksheet.getRow(rowNum);
    const rowData: Record<string, string> = {};

    headers.forEach((header, colIndex) => {
      const cell = row.getCell(colIndex + 1);
      rowData[header] = String(cell.value ?? '').trim();
    });

    // Verificar se a linha está vazia
    const valores = Object.values(rowData);
    if (valores.every((v) => !v)) {
      continue; // Linha vazia, pular
    }

    const erros: string[] = [];
    const email = rowData[colunasMapeadas.email || ''] || '';

    // Validar campos obrigatórios
    if (!rowData[colunasMapeadas.fullName || '']) {
      erros.push('Nome completo ausente');
    }

    if (!email) {
      erros.push('Email ausente');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      erros.push('Email inválido');
    }

    if (!rowData[colunasMapeadas.enrollmentNumber || '']) {
      erros.push('Número de matrícula ausente');
    }

    // Validar CPF
    const cpfRaw = rowData[colunasMapeadas.cpf || ''] || '';
    if (cpfRaw) {
      const cpfDigits = normalizeCpf(cpfRaw);
      if (cpfDigits.length !== 11) {
        erros.push(`CPF inválido (${cpfDigits.length} dígitos, esperado 11)`);
      }
    }

    // Verificar se tem CPF ou senha temporária
    const senhaTemp = rowData[colunasMapeadas.temporaryPassword || ''] || '';
    if (!cpfRaw && !senhaTemp) {
      erros.push('CPF ou senha temporária ausente');
    }

    // Validar senha temporária se fornecida
    if (senhaTemp && senhaTemp.length < 8) {
      erros.push('Senha temporária deve ter pelo menos 8 caracteres');
    }

    // Validar cursos
    const cursosRaw = rowData[colunasMapeadas.courses || ''] || '';
    if (!cursosRaw) {
      erros.push('Cursos ausentes');
    }

    if (erros.length > 0) {
      problemas.push({
        linha: rowNum,
        email: email || undefined,
        erros,
      });
    }
  }

  console.log(`✅ Linhas válidas: ${worksheet.rowCount - 1 - problemas.length}`);
  console.log(`❌ Linhas com problemas: ${problemas.length}`);
  console.log('');

  if (problemas.length > 0) {
    console.log('🚨 Problemas encontrados:');
    console.log('');
    problemas.slice(0, 20).forEach((p) => {
      console.log(`   Linha ${p.linha}${p.email ? ` (${p.email})` : ''}:`);
      p.erros.forEach((erro) => {
        console.log(`      - ${erro}`);
      });
      console.log('');
    });

    if (problemas.length > 20) {
      console.log(`   ... e mais ${problemas.length - 20} linhas com problemas`);
      console.log('');
    }
  }

  // Resumo
  console.log('📊 RESUMO:');
  console.log('');
  console.log(`   Total de linhas: ${worksheet.rowCount - 1}`);
  console.log(`   Linhas válidas: ${worksheet.rowCount - 1 - problemas.length}`);
  console.log(`   Linhas com problemas: ${problemas.length}`);
  console.log('');

  if (problemasColunas) {
    console.log('⚠️  ATENÇÃO: Algumas colunas esperadas não foram encontradas!');
    console.log('   O sistema pode não conseguir processar o arquivo corretamente.');
    console.log('');
  }

  if (problemas.length === 0 && !problemasColunas) {
    console.log('✅ Arquivo parece estar correto!');
  }
}

// Executar análise
const caminhoArquivo = process.argv[2] || 'c:\\Cronogramas - 2026 - CDF\\Química Online\\Alunos - Química Online.xlsx';

analisarArquivo(caminhoArquivo).catch((error) => {
  console.error('❌ Erro ao analisar arquivo:', error);
  process.exit(1);
});
