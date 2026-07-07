import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'db_store', 'user_cloud_projects.json');
if (fs.existsSync(filePath)) {
  console.log("Found local user_cloud_projects.json");
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    console.log("Keys in user_cloud_projects.json:", Object.keys(data));
    for (const key of Object.keys(data)) {
      console.log(`- Key: ${key}`);
      console.log(`  Name: ${data[key].name}`);
      console.log(`  Email: ${data[key].email}`);
    }
  } catch (e) {
    console.error("Error parsing user_cloud_projects.json:", e);
  }
} else {
  console.log("Local user_cloud_projects.json does NOT exist.");
}
