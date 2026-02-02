import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://wtqgfmtucqmpheghcvxo.supabase.co";
const SUPABASE_KEY = "sb_secret_AoIsjynbBWgLf9gEo9hKaw_5rO0Kz9u";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const EMPRESA_ID = "c64a0fcc-5990-4b87-9de5-c4dbc6cb8da7";

const COURSES = {
  "45705647-96d0-4685-ae55-e871958b0d32":
    "Quero 02 atendimentos individual - Plantões",
  "aeefb318-d120-44c5-9407-2afc4b585f45":
    "Quero 04 atendimentos individual - Plantões",
  "cf44d7c7-57be-41dd-b7cd-f689467a310b": "Quero atendimento individual",
  "b7c510fd-e067-45a1-9f5b-6e44584736ac": "Redação 360º VIP + Linguagens",
  "de3308e1-7f4e-4c27-989f-e820f846ced3": "Redação 360ª VIP",
  "7f045f35-37df-424c-b9cb-86df02f11151": "Redação 360º",
  "2c8a5974-6e3b-4eac-b680-618bd1a84dae": "Salinha ao vivo + Linguagens",
  "ec64a5d5-ca2f-4d8a-845f-1bf0f693b0a0": "Salinha de redação ao vivo",
};

async function main() {
  console.log("Verifying enrollment counts...\n");

  let totalEnrollments = 0;

  for (const [courseId, courseName] of Object.entries(COURSES)) {
    const { count, error } = await supabase
      .from("matriculas")
      .select("*", { count: "exact", head: true })
      .eq("curso_id", courseId)
      .eq("empresa_id", EMPRESA_ID);

    if (error) {
      console.error(`Error counting ${courseName}:`, error);
    } else {
      console.log(`${courseName}: ${count} enrollments`);
      totalEnrollments += count;
    }
  }

  console.log(`\nTotal enrollments across all courses: ${totalEnrollments}`);

  // Count users from this import
  const { count: userCount } = await supabase
    .from("usuarios")
    .select("*", { count: "exact", head: true })
    .eq("origem_cadastro", "excel_import_multi_2026")
    .eq("empresa_id", EMPRESA_ID);

  console.log(`Total users imported: ${userCount}`);
}

main();
