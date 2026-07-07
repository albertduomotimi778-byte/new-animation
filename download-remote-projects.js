import { createClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://tyqjnfoiooujylzijwtb.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5cWpuZm9pb291anlsemlqd3RiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzEwODUyOCwiZXhwIjoyMDkyNjg0NTI4fQ.idChwwk9yPaZtb1pCik3QmNXc2WcD1xTJu0GQtiBEhM';

const supabase = createClient(FALLBACK_URL, FALLBACK_KEY);

async function run() {
  console.log("Downloading db_store/user_cloud_projects.json from Supabase Storage...");
  const { data, error } = await supabase.storage
    .from('animato_uploads')
    .download('db_store/user_cloud_projects.json');
    
  if (error) {
    console.error("Download failed:", error);
    return;
  }
  
  try {
    const text = await data.text();
    const json = JSON.parse(text);
    console.log("user_cloud_projects.json records parsed successfully.");
    console.log("Keys count:", Object.keys(json).length);
    for (const key of Object.keys(json)) {
      console.log(`- Key: ${key}`);
      console.log(`  Name: ${json[key].name}`);
      console.log(`  Email: ${json[key].email}`);
    }
  } catch (e) {
    console.error("Error parsing downloaded content:", e.message);
  }
}
run();
