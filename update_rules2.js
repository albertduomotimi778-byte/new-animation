import fs from 'fs';
let rules = fs.readFileSync('firestore.rules', 'utf8');
rules = rules.replace(
  /match \/user_cloud_projects\/\{projectId\} \{[\s\S]*?allow create/m,
  `match /user_cloud_projects/{projectId} {\n      allow read: if isAdmin() || (isVerified() && resource.data.email == request.auth.token.email);\n      allow create`
);
fs.writeFileSync('firestore.rules', rules);
