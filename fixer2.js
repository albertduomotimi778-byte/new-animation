const fs=require('fs');let code=fs.readFileSync('App.tsx','utf8');
code = code.replace(/ \) : activeLeftTab === "KINEMATICS" \? \([\s\S]*?\) : null\}/, ') : null}');
fs.writeFileSync('App.tsx',code);
