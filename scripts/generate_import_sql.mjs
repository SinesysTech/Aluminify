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
    console.error("Error reading file:", e.message);
    process.exit(1);
  }

  const worksheet = workbook.getWorksheet(1);
  const students = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const values = row.values;
    const status = values[19];
    if (status !== "Aprovado") return;

    const name = values[20];
    const document = values[21];
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
    });
  });

  const empresaId = "c64a0fcc-5990-4b87-9de5-c4dbc6cb8da7";
  const cursoId = "9d26f2d0-9bfb-4e99-aaab-bf88bb347504";

  console.log(`DO $$
DECLARE
  v_user_id uuid;
  v_empresa_id uuid := '${empresaId}';
  v_curso_id uuid := '${cursoId}';
BEGIN`);

  for (const student of students) {
    if (!student.email) continue;

    // Sanitize strings for SQL
    const sanitize = (str) => (str ? `'${str.replace(/'/g, "''")}'` : "NULL");

    console.log(`
  -- Processing ${student.email}
  v_user_id := NULL;
  
  -- Check if user exists
  SELECT id INTO v_user_id FROM public.usuarios WHERE email = ${sanitize(student.email)} AND empresa_id = v_empresa_id;
  
  IF v_user_id IS NULL THEN
    INSERT INTO public.usuarios (
      id,
      empresa_id, 
      nome_completo, 
      email, 
      cpf, 
      telefone, 
      endereco, 
      numero_endereco, 
      complemento, 
      bairro, 
      cidade, 
      estado, 
      cep, 
      pais, 
      origem_cadastro,
      ativo
    ) VALUES (
      gen_random_uuid(),
      v_empresa_id,
      ${sanitize(student.nome_completo)},
      ${sanitize(student.email)},
      ${sanitize(student.cpf)},
      ${sanitize(student.telefone)},
      ${sanitize(student.endereco)},
      ${sanitize(student.numero_endereco)},
      ${sanitize(student.complemento)},
      ${sanitize(student.bairro)},
      ${sanitize(student.cidade)},
      ${sanitize(student.estado)},
      ${sanitize(student.cep)},
      ${sanitize(student.pais)},
      'excel_import_2026',
      true
    ) RETURNING id INTO v_user_id;
  END IF;

  -- Enroll in course
  IF NOT EXISTS (SELECT 1 FROM public.matriculas WHERE usuario_id = v_user_id AND curso_id = v_curso_id AND empresa_id = v_empresa_id) THEN
    INSERT INTO public.matriculas (
      empresa_id, 
      usuario_id, 
      curso_id, 
      data_matricula, 
      data_inicio_acesso,
      ativo
    ) VALUES (
      v_empresa_id, 
      v_user_id, 
      v_curso_id, 
      now(), 
      CURRENT_DATE,
      true
    );
  END IF;
`);
  }

  console.log(`END $$;`);
}

main();
