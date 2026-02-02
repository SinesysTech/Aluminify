import XLSX from 'xlsx';
import { writeFileSync } from 'fs';

// Parse both files
const wb1 = XLSX.readFile('sales_history_ salinha presencial 2026.xls');
const data1 = XLSX.utils.sheet_to_json(wb1.Sheets[wb1.SheetNames[0]]);

const wb2 = XLSX.readFile('sales_history_23-11 a 02-02-26.xls');
const data2 = XLSX.utils.sheet_to_json(wb2.Sheets[wb2.SheetNames[0]]);

// Get all unique product names
const products = new Set();
data1.forEach(r => products.add(r['Nome do Produto']));
data2.forEach(r => products.add(r['Nome do Produto']));
console.log('=== UNIQUE PRODUCTS IN EXCEL FILES ===');
products.forEach(p => console.log(' -', p));

// Get statuses from file 1
const statuses1 = new Set();
data1.forEach(r => statuses1.add(r['Status']));
console.log('\nStatuses in file 1:', [...statuses1]);
console.log('File 2 has Status?', data2[0] && 'Status' in data2[0]);

// Combine all students by email with their products
const allStudents = new Map();

function addStudent(row, source) {
  const email = (row['Email'] || '').toLowerCase().trim();
  if (!email) return;
  if (!allStudents.has(email)) {
    allStudents.set(email, {
      nome: row['Nome'],
      email: email,
      documento: row['Documento'],
      produtos: new Set(),
      statuses: new Set(),
      sources: new Set()
    });
  }
  const s = allStudents.get(email);
  s.produtos.add(row['Nome do Produto']);
  if (row['Status']) s.statuses.add(row['Status']);
  s.sources.add(source);
}

data1.forEach(r => addStudent(r, 'salinha_presencial'));
data2.forEach(r => addStudent(r, 'sales_history'));

console.log('\n=== TOTALS ===');
console.log('File 1 (salinha presencial):', data1.length, 'rows');
console.log('File 2 (sales history):', data2.length, 'rows');
console.log('Unique students (by email):', allStudents.size);

// Students per product
const prodCount = {};
allStudents.forEach(s => {
  s.produtos.forEach(p => {
    prodCount[p] = (prodCount[p] || 0) + 1;
  });
});
console.log('\n=== STUDENTS PER PRODUCT ===');
Object.entries(prodCount).sort((a, b) => b[1] - a[1]).forEach(([p, c]) => console.log(c, '-', p));

// Output student data as JSON for DB comparison
const studentData = [];
allStudents.forEach(s => {
  studentData.push({
    nome: s.nome,
    email: s.email,
    documento: s.documento,
    produtos: [...s.produtos],
    statuses: [...s.statuses],
    sources: [...s.sources]
  });
});

writeFileSync('scripts/verify_students_data.json', JSON.stringify(studentData, null, 2));
console.log('\nData written to scripts/verify_students_data.json');
