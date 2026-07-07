import { createClient } from "@supabase/supabase-js";
const FALLBACK_URL = "https://tyqjnfoiooujylzijwtb.supabase.co";
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5cWpuZm9pb291anlsemlqd3RiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzEwODUyOCwiZXhwIjoyMDkyNjg0NTI4fQ.idChwwk9yPaZtb1pCik3QmNXc2WcD1xTJu0GQtiBEhM";
const supabase = createClient(FALLBACK_URL, FALLBACK_KEY);
async function test() {
  const { data, error } = await supabase.from("dropbox_keys").select("*").limit(2);
  console.log("dropbox_keys query result:", data, error);
}
test();
