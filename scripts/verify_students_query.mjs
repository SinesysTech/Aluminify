import { readFileSync } from 'fs';

const students = JSON.parse(readFileSync('scripts/verify_students_data.json', 'utf8'));

// Mapping: Hotmart product name → DB course name
const productToCourse = {
  'Redação 360º [extensivo 2026]': 'Redação 360º',
  'Salinha de redação | Ao vivo [Extensivo 2026]': 'Salinha de redação ao vivo',
  'Salinha de redação | Presencial [Extensivo 2026]': 'Salinha de redação presencial',
  'Quero 02 atendimentos mensais - Plantões': 'Quero 02 atendimentos individual - Plantões',
  'Quero 04 atendimentos mensais - Plantões': 'Quero 04 atendimentos individual - Plantões',
  'Redação 360º VIP + Linguagens': 'Redação 360º VIP + Linguagens',
  'Redação 360º VIP [extensivo 2026]': 'Redação 360ª VIP',
  'Salinha ao vivo + Linguagens': 'Salinha ao vivo + Linguagens',
  ' Quero mais correções ': 'Quero atendimento individual',
};

// Build expected enrollments
const expected = students.map(s => ({
  email: s.email,
  nome: s.nome,
  expected_courses: s.produtos.map(p => productToCourse[p] || `UNMAPPED: ${p}`)
}));

// Output emails list for SQL
const emails = students.map(s => `'${s.email.replace(/'/g, "''")}'`).join(',\n');

console.log('--- EXPECTED ENROLLMENTS ---');
expected.forEach(s => {
  console.log(`${s.email} | ${s.nome} | ${s.expected_courses.join('; ')}`);
});

console.log('\n--- EMAIL COUNT:', students.length);
console.log('\n--- SQL_EMAILS ---');
console.log(emails);
