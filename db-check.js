import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tyqjnfoiooujylzijwtb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5cWpuZm9pb291anlsemlqd3RiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzEwODUyOCwiZXhwIjoyMDkyNjg0NTI4fQ.idChwwk9yPaZtb1pCik3QmNXc2WcD1xTJu0GQtiBEhM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking user_subscriptions_v3 structure...");
  const { data: subData, error: subError } = await supabase.from('user_subscriptions_v3').select('*').limit(1);
  if (subError) {
    console.error("subError:", subError);
  } else {
    console.log("Sub columns:", Object.keys(subData[0] || {}));
  }

  console.log("Checking user_accounts structure...");
  const { data: accData, error: accError } = await supabase.from('user_accounts').select('*').limit(1);
  if (accError) {
    console.error("accError:", accError);
  } else {
    console.log("Acc columns:", Object.keys(accData[0] || {}));
  }
}

check();
