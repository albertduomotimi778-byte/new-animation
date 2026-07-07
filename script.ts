import fs from 'fs';
import path from 'path';

function processFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf8');

  // We need to carefully inject `useLanguage` into files that have JSX text.
  // First, let's find if the file needs translation wrapper.
  const jsxTextRegex = />([^<>{}\n\r]+?)</g;
  
  if (!content.includes('useLanguage') && jsxTextRegex.test(content)) {
    // Add import statement for useLanguage
    // Check if it's in components or root
    const importPath = filePath.includes('components') ? '../utils/LanguageContext' : './utils/LanguageContext';
    
    // add import statement
    const importMatch = content.match(/import .* from 'react';?/);
    if (importMatch) {
      content = content.replace(importMatch[0], `${importMatch[0]}\nimport { useLanguage } from '${importPath}';`);
    } else {
       content = `import { useLanguage } from '${importPath}';\n` + content;
    }

    // add const { t } = useLanguage(); into all exported/standard components
    // A quick hack: find component declarations
    const componentRegex = /(const [A-Z][a-zA-Z0-9]*\s*(:\s*React\.FC<[^>]+>)?\s*=\s*(async\s*)?\([^)]*\)\s*(=>)?\s*\{|export\s+(default\s+)?function\s+[A-Z][a-zA-Z0-9]*\s*\([^)]*\)\s*\{)/g;
    
    content = content.replace(componentRegex, (match) => {
        return match + '\n  const { t } = useLanguage();\n';
    });
  }

  // Now replace text nodes
  // > Hello < -> >{t("Hello")}<
  
  let modifiedContent = content.replace(/>([\s]*)([^<>{}\n\r]+?)([\s]*)</g, (match, prefix, textContent, suffix) => {
    // textContent is raw text
    const txt = textContent.trim();
    if (txt && !txt.match(/^[0-9\W]+$/)) {
      // It's a translatable string
      // escape quotes inside the string
      const escaped = txt.replace(/'/g, "\\'");
      return `>${prefix}{t('${escaped}')}${suffix}<`;
    }
    return match;
  });

  modifiedContent = modifiedContent.replace(/(placeholder|title|label)="([^"]+?)"/g, (match, attrName, txt) => {
    if (txt && !txt.match(/^[0-9\W]+$/)) {
      const escaped = txt.replace(/'/g, "\\'");
      return `${attrName}={t('${escaped}')}`;
    }
    return match;
  });

  if (content !== modifiedContent) {
    fs.writeFileSync(filePath, modifiedContent, 'utf8');
    console.log(`Transformed ${filePath}`);
  }
}

function processDirectory(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.tsx')) {
       // Skip LanguageContext itself
       if (!fullPath.includes('LanguageContext')) {
          processFile(fullPath);
       }
    }
  }
}

processDirectory('./components');
processFile('./App.tsx');
processFile('./index.tsx');

