import ExcelJS from "exceljs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(
  __dirname,
  "../sales_history_ salinha presencial 2026.xls",
);

async function main() {
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.readFile(filePath);
  } catch (e) {
    console.error("Error reading as xlsx:", e.message);
    process.exit(1);
  }

  const worksheet = workbook.getWorksheet(1);
  const students = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header

    const values = row.values;
    // ExcelJS row.values is 1-based index, so index 1 is the first column.

    // Mapping keys to indices based on inspection:
    // Status -> 19 (Approved check) - Wait, previous inspection said index 19 in the array.
    // The previous output `[ null, "Nome...", ... ]` means index 1 is "Nome do Produto".
    // "Status" was at index 19.
    // "Nome" was at index 20.

    // Let's verify with the printed header from previous step:
    // Header dump: [ null, "Nome do Produto" (1), ..., "Status" (19), "Nome" (20), "Documento" (21), "Email" (22), "DDD" (23), "Telefone" (24) ... ]

    const status = values[19];
    if (status !== "Aprovado") return;

    const name = values[20];
    const document = values[21]; // CPF
    const emailObj = values[22];
    const email = emailObj && emailObj.text ? emailObj.text : emailObj;

    const ddd = values[23];
    const phone = values[24];
    const fullPhone = ddd && phone ? `${ddd}${phone}` : phone;

    students.push({
      nome_completo: name,
      email: email ? email.toString().trim().toLowerCase() : "",
      cpf: document ? document.toString().replace(/\D/g, "") : "",
      telefone: fullPhone ? fullPhone.toString().replace(/\D/g, "") : "",
      endereco: values[30],
      numero_endereco: values[31] ? values[31].toString() : "",
      complemento: values[32] ? values[32].toString() : "",
      bairro: values[28],
      cidade: values[26],
      estado: values[27],
      cep: values[25] ? values[25].toString() : "",
      pais: values[29],
      empresa_id: "c64a0fcc-5990-4b87-9de5-c4dbc6cb8da7",
      origem_cadastro: "excel_import_2026",
    });
  });

  console.log(JSON.stringify(students, null, 2));
}

main();
