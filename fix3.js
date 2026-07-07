import fs from 'fs';

function fixFile(file, replacements) {
    let content = fs.readFileSync(file, 'utf8');
    for (const [search, replacement] of replacements) {
        content = content.split(search).join(replacement);
    }
    fs.writeFileSync(file, content, 'utf8');
}

fixFile('components/FrameByFrameEditor.tsx', [
    [`{t(') : !isPlaying ? (')}`, `) : !isPlaying ? (`]
]);

console.log('Fixes applied.');
