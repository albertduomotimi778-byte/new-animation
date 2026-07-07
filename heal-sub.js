import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tyqjnfoiooujylzijwtb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5cWpuZm9pb291anlsemlqd3RiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzEwODUyOCwiZXhwIjoyMDkyNjg0NTI4fQ.idChwwk9yPaZtb1pCik3QmNXc2WcD1xTJu0GQtiBEhM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const email = 'elcarton0001@gmail.com';
  const subData = {
    email: email,
    subscription_type: 'yearly',
    subscription_name: 'YEARLY',
    subscription_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    subscription_status: 'active',
    amount_paid: '0',
    currency: 'USD',
    payment_reference: 'HEALED',
    gateway: 'paystack',
    timestamp: new Date().toISOString()
  };
  
  const { data, error } = await supabase.from('user_subscriptions_v3').select('*').eq('email', email);
  if (!data || data.length === 0) {
    console.log('Inserting healed subscription');
    const { error: insErr } = await supabase.from('user_subscriptions_v3').insert([subData]);
    if (insErr) console.error(insErr);
    else console.log('Healed successfully!');
  } else {
    console.log('Updating healed subscription');
    const { error: updErr } = await supabase.from('user_subscriptions_v3').update(subData).eq('email', email);
    if (updErr) console.error(updErr);
    else console.log('Update successfully!');
  }
}

run();
