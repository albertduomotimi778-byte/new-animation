import { createClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://tyqjnfoiooujylzijwtb.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5cWpuZm9pb291anlsemlqd3RiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzEwODUyOCwiZXhwIjoyMDkyNjg0NTI4fQ.idChwwk9yPaZtb1pCik3QmNXc2WcD1xTJu0GQtiBEhM';

const supabaseUrl = process.env.VITE_SUPABASE_URL || FALLBACK_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY || FALLBACK_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const email = 'albertduomotimi778@gmail.com';
  console.log(`Checking subscription for: ${email}`);
  const { data, error } = await supabase.from('user_subscriptions_v3').select('*').eq('email', email);
  if (error) {
    console.error("Error fetching subscription:", error.message);
  } else {
    console.log("Subscription record:", data);
  }
}
run();
