import fs from 'fs';
let code = fs.readFileSync('App.tsx', 'utf8');
code = code.replaceAll("{ l: '2.5D LEFT', v: 1", "{ l: '2.5D LEFT', v: -1");
code = code.replaceAll("{ l: '2.5D RIGHT', v: -1", "{ l: '2.5D RIGHT', v: 1");
fs.writeFileSync('App.tsx', code);
