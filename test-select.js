import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tyqjnfoiooujylzijwtb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5cWpuZm9pb291anlsemlqd3RiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzEwODUyOCwiZXhwIjoyMDkyNjg0NTI4fQ.idChwwk9yPaZtb1pCik3QmNXc2WcD1xTJu0GQtiBEhM';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const { data, error } = await supabase
    .from('user_subscriptions_v3')
    .select('*')
    .limit(5);

  console.log('Data:', data);
  console.log('Error:', error);
}
test().catch(console.error);
