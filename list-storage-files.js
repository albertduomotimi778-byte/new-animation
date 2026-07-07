import { createClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://tyqjnfoiooujylzijwtb.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5cWpuZm9pb291anlsemlqd3RiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzEwODUyOCwiZXhwIjoyMDkyNjg0NTI4fQ.idChwwk9yPaZtb1pCik3QmNXc2WcD1xTJu0GQtiBEhM';

const supabase = createClient(FALLBACK_URL, FALLBACK_KEY);

async function run() {
  console.log("Listing folders inside animato_uploads storage...");
  
  // List folders
  const { data: rootList, error: rootErr } = await supabase.storage
    .from('animato_uploads')
    .list('');
    
  if (rootErr) {
    console.error("Root list error:", rootErr);
    return;
  }
  
  console.log("Root files/folders:", rootList.map(f => f.name));
  
  for (const item of rootList) {
    if (item.id === undefined || item.id === null) {
      // It's a folder
      const { data: folderList, error: folderErr } = await supabase.storage
        .from('animato_uploads')
        .list(item.name);
        
      if (folderErr) {
        console.error(`Error listing folder ${item.name}:`, folderErr);
      } else {
        console.log(`Contents of folder '${item.name}':`, folderList.map(f => f.name));
      }
    }
  }
}
run();
