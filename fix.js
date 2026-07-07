import fs from 'fs';

function fixFile(file, replacements) {
    let content = fs.readFileSync(file, 'utf8');
    for (const [search, replacement] of replacements) {
        content = content.split(search).join(replacement);
    }
    fs.writeFileSync(file, content, 'utf8');
}

fixFile('App.tsx', [
    [`{t('Math.abs(k.time - time)')}`, `Math.abs(k.time - time)`],
    [`{t('lipSyncTargetId === \\'ALL\\' || k.targetId === lipSyncTargetId).length === 0 ? (')}`, `lipSyncTargetId === 'ALL' || k.targetId === lipSyncTargetId).length === 0 ? (`]
]);

fixFile('components/AiGeneratorModal.tsx', [
    [`>{t('= 0 && nx')}`, `>= 0 && nx`],
    [`>{t('= 0 && ny')}`, `>= 0 && ny`],
    [`>{t('= width || y')}`, `>= width || y`],
]);

fixFile('components/CharacterPackImporter.tsx', [
    [`{t('s')}`, `s`],
    [`{t('v')}`, `v`],
]);

fixFile('components/CharacterStage.tsx', [
    [`> {t('0 && texture && texture !== "null" ? (')}`, `> 0 && texture && texture !== "null" ? (`]
]);

fixFile('components/FrameByFrameEditor.tsx', [
    [`>{t('= 0 && nx')}`, `>= 0 && nx`],
    [`>{t('= 0 && ny')}`, `>= 0 && ny`],
    [`{t('importImageFile(e as unknown as React.ChangeEvent')}<HTMLInputElement>);`, `importImageFile(e as unknown as React.ChangeEvent<HTMLInputElement>);`],
    [`{t('importAudioFile(e as unknown as React.ChangeEvent')}<HTMLInputElement>);`, `importAudioFile(e as unknown as React.ChangeEvent<HTMLInputElement>);`]
]);

fixFile('components/PuppetWarp.tsx', [
    [`{t('Record')}`, `Record`],
]);

console.log('Fixes applied.');
