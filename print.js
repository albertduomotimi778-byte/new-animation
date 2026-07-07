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

printLines('App.tsx', '679,2523,2527');
printLines('components/AiGeneratorModal.tsx', '71,94,128');
printLines('components/CharacterPackImporter.tsx', '198');
printLines('components/CharacterStage.tsx', '398,421,438');
printLines('components/FrameByFrameEditor.tsx', '1193,2399,2401,2404,3072');
printLines('components/PuppetWarp.tsx', '69');
