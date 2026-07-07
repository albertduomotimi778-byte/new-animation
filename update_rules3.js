import fs from 'fs';
let rules = fs.readFileSync('firestore.rules', 'utf8');
rules = rules.replace(
  /allow delete: if isAdmin\(\) \|\| \(isVerified\(\) && \([\s\S]*?\)\);/m,
  `allow delete: if isAdmin() || (isVerified() && resource.data.email == request.auth.token.email);`
);
fs.writeFileSync('firestore.rules', rules);
