import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/CREATE TABLE IF NOT EXISTS user_subscriptions_v3[\s\S]*?\);/, '');
code = code.replace(/CREATE TABLE IF NOT EXISTS user_subscriptions_v3[\s\S]*?\);/, '');

fs.writeFileSync('server.ts', code);
console.log('Removed table creation scripts');
