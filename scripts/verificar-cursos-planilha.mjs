import ExcelJS from 'exceljs';

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

async function verificarCursos(caminhoArquivo) {
  console.log('📊 Verificando cursos na planilha:', caminhoArquivo);
  console.log('');

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(caminhoArquivo);

  const worksheet = workbook.worksheets[0];
  const headers = [];
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell({ includeEmpty: false }, (cell) => {
    headers.push(String(cell.value ?? '').trim());
  });

  // Encontrar coluna de cursos
  let colunaCursos = null;
  headers.forEach((header, index) => {
    const normalized = normalizeColumnName(header);
    if (normalized.includes('curso')) {
      colunaCursos = index + 1;
    }
  });

  if (!colunaCursos) {
    console.error('❌ Coluna de cursos não encontrada');
    return;
  }

  console.log(`✅ Coluna de cursos encontrada: "${headers[colunaCursos - 1]}"`);
  console.log('');

  // Coletar todos os cursos únicos
  const cursosEncontrados = new Set();
  const cursosPorLinha = [];

  for (let rowNum = 2; rowNum <= worksheet.rowCount; rowNum++) {
    const row = worksheet.getRow(rowNum);
    const cell = row.getCell(colunaCursos);
    const value = cell.value;

    if (!value) continue;

    const cursosRaw = String(value).trim();
    if (!cursosRaw) continue;

    // Separar cursos (pode ser por ; , | /)
    const cursos = cursosRaw
      .split(/[,;|/]/)
      .map(c => c.trim())
      .filter(Boolean);

    cursos.forEach(curso => {
      const cursoNormalizado = curso.trim().toLowerCase();
      cursosEncontrados.add(cursoNormalizado);
    });

    cursosPorLinha.push({
      linha: rowNum,
      cursosRaw,
      cursos,
    });
  }

  console.log(`📚 Total de cursos únicos encontrados: ${cursosEncontrados.size}`);
  console.log('');
  console.log('📋 Cursos encontrados na planilha (normalizados para comparação):');
  Array.from(cursosEncontrados).sort().forEach((curso, index) => {
    console.log(`   ${index + 1}. "${curso}"`);
  });
  console.log('');

  // Mostrar exemplos de como os cursos aparecem
  console.log('📝 Exemplos de como os cursos aparecem nas linhas:');
  cursosPorLinha.slice(0, 10).forEach((item) => {
    console.log(`   Linha ${item.linha}: "${item.cursosRaw}"`);
    console.log(`      → Separado em: ${item.cursos.map(c => `"${c}"`).join(', ')}`);
  });
  console.log('');

  // Estatísticas
  const cursosComMaisOcorrencias = {};
  cursosPorLinha.forEach((item) => {
    item.cursos.forEach(curso => {
      const cursoNormalizado = curso.trim().toLowerCase();
      cursosComMaisOcorrencias[cursoNormalizado] = 
        (cursosComMaisOcorrencias[cursoNormalizado] || 0) + 1;
    });
  });

  console.log('📊 Cursos mais frequentes:');
  Object.entries(cursosComMaisOcorrencias)
    .sort((a, b) => b[1] - a[1])
    .forEach(([curso, count]) => {
      console.log(`   "${curso}": ${count} ocorrências`);
    });
  console.log('');

  console.log('💡 IMPORTANTE:');
  console.log('   Os nomes dos cursos devem corresponder EXATAMENTE aos cadastrados no sistema.');
  console.log('   O sistema compara os nomes em minúsculas, mas espaços e acentos importam.');
  console.log('   Verifique se os cursos acima estão cadastrados no sistema com esses nomes exatos.');
  console.log('');
}

const caminhoArquivo = process.argv[2] || 'c:\\Cronogramas - 2026 - CDF\\Química Online\\Alunos - Química Online.xlsx';

verificarCursos(caminhoArquivo).catch((error) => {
  console.error('❌ Erro:', error);
  process.exit(1);
});
