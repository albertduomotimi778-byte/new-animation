import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tyqjnfoiooujylzijwtb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5cWpuZm9pb291anlsemlqd3RiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzEwODUyOCwiZXhwIjoyMDkyNjg0NTI4fQ.idChwwk9yPaZtb1pCik3QmNXc2WcD1xTJu0GQtiBEhM';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const activeEmail = 'elcarton12345@gmail.com';
  const subData = {
    email: activeEmail,
    subscription_type: 'monthly',
    subscription_name: 'MONTHLY',
    subscription_expiry: new Date().toISOString(),
    subscription_status: 'active',
    amount_paid: '1000',
    currency: 'NGN',
    payment_reference: 'test_ref_123',
    gateway: 'paystack',
    timestamp: new Date().toISOString()
  };

  const { data: existingSubs, error: selError } = await supabase
    .from('user_subscriptions_v3')
    .select('id, email')
    .eq('email', activeEmail)
    .limit(1);

  console.log('Select:', { existingSubs, selError: selError?.message });

  if (existingSubs && existingSubs.length > 0) {
    const { error } = await supabase
      .from('user_subscriptions_v3')
      .update(subData)
      .eq('email', activeEmail);
    console.log('Update result:', error?.message);
  } else {
    const { error } = await supabase
      .from('user_subscriptions_v3')
      .insert([subData]);
    console.log('Insert result:', error?.message);
  }
}
test().catch(console.error);
