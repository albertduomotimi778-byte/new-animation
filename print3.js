import fs from 'fs';

function printLines(file, lineStr) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const lineNums = lineStr.split(',').map(Number);
  console.log(`\n=== ${file} ===`);
  lineNums.forEach(l => {
    console.log(`${l-1}: ${lines[l-2]}`);
    console.log(`${l}: ${lines[l-1]}`);
    console.log(`${l+1}: ${lines[l]}`);
  });
}

printLines('components/FrameByFrameEditor.tsx', '3034,3045');
