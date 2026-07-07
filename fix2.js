import fs from 'fs';

function fixFile(file, replacements) {
    let content = fs.readFileSync(file, 'utf8');
    for (const [search, replacement] of replacements) {
        content = content.split(search).join(replacement);
    }
    fs.writeFileSync(file, content, 'utf8');
}

fixFile('components/FrameByFrameEditor.tsx', [
    [`>{t('= currentFrameIndex - onionSkinSettings.prev && frameIdx')}`, `>= currentFrameIndex - onionSkinSettings.prev && frameIdx`],
    [`{t(') : !isPlaying && isRiggingMode ? (')}`, `) : !isPlaying && isRiggingMode ? (`],
    [`{t(') : exportedFile.type === \\'gif\\' ? (')}`, `) : exportedFile.type === 'gif' ? (`]
]);

fixFile('components/FrameRuler.tsx', [
    [`> {t('selection.start && time')}`, `> selection.start && time`],
]);

fixFile('components/KeyframeTimeline.tsx', [
    [`{t('Math.abs(k.time - time)')}`, `Math.abs(k.time - time)`]
]);

console.log('Fixes applied.');
