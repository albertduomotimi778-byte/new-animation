import fs from 'fs';

const files = [
  'App.tsx',
  'components/AiGeneratorModal.tsx',
  'components/CharacterPackImporter.tsx',
  'components/CharacterStage.tsx',
  'components/FrameByFrameEditor.tsx',
  'components/FrameRuler.tsx',
  'components/KeyframeTimeline.tsx',
  'components/PuppetWarp.tsx'
];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  console.log(`\n=== ${file} ===`);
  
  // Just print first few bad strings we might have created
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('={t(') && !lines[i].match(/\w+=\{t\(/)) {
       // e.g. `<div title={t('hello')}>`
    }
    if (lines[i].includes('> {t') || lines[i].includes('{t(')) {
        // let's just find syntax errors
    }
  }
}
