
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tyqjnfoiooujylzijwtb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5cWpuZm9pb291anlsemlqd3RiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzEwODUyOCwiZXhwIjoyMDkyNjg0NTI4fQ.idChwwk9yPaZtb1pCik3QmNXc2WcD1xTJu0GQtiBEhM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectProjects() {
    console.log("Downloading user_cloud_projects.json...");
    const { data, error } = await supabase.storage.from('animato_uploads').download('db_store/user_cloud_projects.json');
    if (error) {
        console.error("Error downloading:", error.message);
        return;
    }
    const text = await data.text();
    const projects = JSON.parse(text || '{}');
    const emails = new Set();
    Object.values(projects).forEach(p => {
        if (p.email) emails.add(p.email);
    });
    console.log("Emails found in Supabase projects:", Array.from(emails));
    
    // Also check backend_syncs folder
    console.log("Listing backend_syncs...");
    const { data: files, error: listError } = await supabase.storage.from('animato_uploads').list('backend_syncs');
    if (listError) {
        console.error("Error listing backend_syncs:", listError.message);
    } else {
        const syncEmails = new Set();
        files.forEach(f => {
            if (f.name.includes('_proj_')) {
                const parts = f.name.split('_proj_');
                syncEmails.add(parts[0].replace(/_/g, '@'));
            }
        });
        console.log("Emails found in backend_syncs files:", Array.from(syncEmails));
    }
}

inspectProjects();
