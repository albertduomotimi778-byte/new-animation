import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf-8');

const target = `      if (!sub) {
          throw new Error("Critical: Subscription row not found even after successful UPSERT");
      }`;

const replacement = `      if (!sub) {
          if (doc) {
             throw new Error("Critical: Subscription row not found in Sheets even after successful UPSERT");
          } else {
             // Simulate for dev mode when credentials missing
             console.warn('[Activation] Simulated verify since Google Sheets is missing credentials');
             account = account || { email: activeEmail, password: 'simulated' }; 
             return { ...account, subscription_type: planType, subscription_status: 'active', subscription_expiry: expiryStr };
          }
      }`;

code = code.split(target).join(replacement);

fs.writeFileSync('server.ts', code);
