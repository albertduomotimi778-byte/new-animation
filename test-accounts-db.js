import { createClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://tyqjnfoiooujylzijwtb.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5cWpuZm9pb291anlsemlqd3RiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzEwODUyOCwiZXhwIjoyMDkyNjg0NTI4fQ.idChwwk9yPaZtb1pCik3QmNXc2WcD1xTJu0GQtiBEhM';

const supabase = createClient(FALLBACK_URL, FALLBACK_KEY);

async function run() {
  console.log("Checking user_accounts...");
  let res = await supabase.from('user_accounts').select('*').limit(5);
  console.log("user_accounts:", res.data, res.error);

  if (res.error && res.error.code === '42P01') {
      console.log("Table does not exist. Trying others...");
      let res2 = await supabase.from('users').select('*').limit(5);
      console.log("users:", res2.data, res2.error);
      
      let res3 = await supabase.from('user_account').select('*').limit(5);
      console.log("user_account:", res3.data, res3.error);
  }
}
run();
