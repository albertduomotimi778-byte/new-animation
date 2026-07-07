const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

rules = rules.replace(
  /allow read: if isAdmin\(\) \|\| \(isVerified\(\) && \(sellerId == request.auth.uid \|\| sellerId == request.auth.token.email\)\);/g,
  "allow read: if isAdmin() || (isVerified() && (sellerId == request.auth.uid || sellerId == request.auth.token.email || resource.data.email == request.auth.token.email || resource.data.sellerId == request.auth.uid));"
);

rules = rules.replace(
  /allow read: if isAdmin\(\) \|\| \(isVerified\(\) && \(referralId == request.auth.uid \|\| referralId == request.auth.token.email\)\);/g,
  "allow read: if isAdmin() || (isVerified() && (referralId == request.auth.uid || referralId == request.auth.token.email || resource.data.email == request.auth.token.email || resource.data.referralId == request.auth.uid));"
);

fs.writeFileSync('firestore.rules', rules);
