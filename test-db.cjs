const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://tyqjnfoiooujylzijwtb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5cWpuZm9pb291anlsemlqd3RiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzEwODUyOCwiZXhwIjoyMDkyNjg0NTI4fQ.idChwwk9yPaZtb1pCik3QmNXc2WcD1xTJu0GQtiBEhM';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
  console.log("Checking DB connection and table info on live environment...");
  const email = "elcarton0001@gmail.com";
  
  // Let's query any rows in user_cloud_projects
  const { data: list, error: listError } = await supabase
    .from('user_cloud_projects')
    .select('*')
    .eq('email', email);
    
  console.log("Projects for email:", email);
  console.log("Data size:", list ? list.length : 0);
  console.log("Data raw:", list);
  console.log("Error finding projects:", listError);

  // Let's try to upsert a test project to check constraints
  const testPayload = {
    id: `test_tag_id_${Date.now()}`,
    email: email,
    name: "__TEST_TAG__",
    project_data: JSON.stringify({ test: true }),
    size_bytes: 10,
    updated_at: new Date().toISOString()
  };

  const { error: upsertError } = await supabase
    .from('user_cloud_projects')
    .upsert([testPayload]);

  console.log("Upsert response error:", upsertError);
}

check().catch(console.error);
