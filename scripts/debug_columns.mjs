import ExcelJS from "exceljs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, "../sales_history_23-11 a 02-02-26.xls");

async function main() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet(1);

  console.log("=== HEADER ROW ===");
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell, colNumber) => {
    console.log(`Column ${colNumber}: "${cell.value}"`);
  });

  console.log("\n=== FIRST DATA ROW (Row 2) ===");
  const dataRow = worksheet.getRow(2);
  dataRow.eachCell((cell, colNumber) => {
    console.log(`Column ${colNumber}: "${cell.value}"`);
  });
}

main();
