import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const FALLBACK_URL = 'https://tyqjnfoiooujylzijwtb.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5cWpuZm9pb291anlsemlqd3RiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzEwODUyOCwiZXhwIjoyMDkyNjg0NTI4fQ.idChwwk9yPaZtb1pCik3QmNXc2WcD1xTJu0GQtiBEhM';

const supabase = createClient(FALLBACK_URL, FALLBACK_KEY);

async function run() {
  const content = JSON.stringify({ hello: 'world', timestamp: Date.now() });
  const buffer = Buffer.from(content, 'utf-8');
  
  console.log("Uploading test file to animato_uploads storage...");
  const { data, error } = await supabase.storage
    .from('animato_uploads')
    .upload('test_check.json', buffer, {
      contentType: 'application/json',
      upsert: true
    });
    
  if (error) {
    console.error("Upload failed:", error);
  } else {
    console.log("Upload success:", data);
    const { data: pv } = supabase.storage.from('animato_uploads').getPublicUrl('test_check.json');
    console.log("Public URL:", pv.publicUrl);
    
    try {
      console.log("Attempting to fetch public URL...");
      const res = await fetch(pv.publicUrl);
      console.log("Fetch status:", res.status);
      const text = await res.text();
      console.log("Fetch content:", text);
    } catch (e) {
      console.error("Fetch exception:", e.message);
    }
  }
}
run();
