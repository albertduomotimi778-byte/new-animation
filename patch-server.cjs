const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const replacement = `
    let hasWorkflowScope = false;
    const scopesHeader = repoRes.headers?.get('x-oauth-scopes') || '';
    addLog(\`Token scopes: \${scopesHeader || 'none'}\`);
    if (scopesHeader.includes('workflow')) {
      hasWorkflowScope = true;
    } else {
      addLog(\`Token lacks 'workflow' scope. We will skip creating .github/workflows/deploy.yml to prevent 404 errors.\`, 'warn');
    }
    
    let latestCommitSha = null;
    let baseTreeSha = null;
    let isRepoEmpty = false;

    // 2. Get latest commit SHA from git/refs/heads/{branch}
    try {
      addLog(\`Fetching latest ref for branch \${defaultBranch}...\`);
      const refRes = await fetch(\`https://api.github.com/repos/\${repoFullName}/git/refs/heads/\${defaultBranch}\`, { headers });
      const refData = await refRes.json();
      
      if (refRes.status === 404) {
        addLog(\`Branch \${defaultBranch} not found (404). Assuming empty repo.\`);
        isRepoEmpty = true;
      } else if (refRes.ok && refData.object?.sha) {
        latestCommitSha = refData.object.sha;
        addLog(\`Found latest commit SHA for \${defaultBranch}: \${latestCommitSha}\`);
        
        // 3. Get tree SHA from git/commits/{sha}
        addLog(\`Fetching tree SHA for commit \${latestCommitSha}...\`);
        const commitRes = await fetch(\`https://api.github.com/repos/\${repoFullName}/git/commits/\${latestCommitSha}\`, { headers });
        const commitData = await commitRes.json();
        if (commitRes.ok && commitData.tree?.sha) {
          baseTreeSha = commitData.tree.sha;
          addLog(\`Found base tree SHA for \${latestCommitSha}: \${baseTreeSha}\`);
        } else {
          addLog(\`Could not fetch tree SHA for commit \${latestCommitSha}: \${JSON.stringify(commitData)}\`, 'warn');
        }
      } else {
        addLog(\`Failed to fetch ref for \${defaultBranch}: \${JSON.stringify(refData)}. Status: \${refRes.status}\`, 'warn');
        isRepoEmpty = true;
      }
    } catch (err) {
      addLog(\`Error fetching fresh ref/commit: \${err.message}\`, 'error');
      isRepoEmpty = true;
    }

    // 2. Prepare files to push
    addLog('Preparing files to push...');
    const files = [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: repoInfo.name,
          private: true,
          version: "1.0.0",
          type: "module",
          scripts: {
            "dev": "vite",
            "build": "tsc && vite build",
            "preview": "vite preview"
          },
          dependencies: {
            "react": "^18.2.0",
            "react-dom": "^18.2.0"
          },
          devDependencies: {
            "@types/react": "^18.2.66",
            "@types/react-dom": "^18.2.22",
            "@vitejs/plugin-react": "^4.2.1",
            "autoprefixer": "^10.4.19",
            "postcss": "^8.4.38",
            "tailwindcss": "^3.4.4",
            "typescript": "^5.2.2",
            "vite": "^5.2.0"
          }
        }, null, 2)
      },
      {
        path: 'index.html',
        content: \`<!doctype html>\\n<html lang="en">\\n  <head>\\n    <meta charset="UTF-8" />\\n    <link rel="icon" type="image/svg+xml" href="/vite.svg" />\\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\\n    <title>\${repoInfo.name}</title>\\n  </head>\\n  <body>\\n    <div id="root"></div>\\n    <script type="module" src="/src/main.tsx"></script>\\n  </body>\\n</html>\`
      },
      {
        path: 'vite.config.ts',
        content: \`import { defineConfig } from 'vite';\\nimport react from '@vitejs/plugin-react';\\nimport path from 'path';\\n\\nexport default defineConfig({\\n  plugins: [react()],\\n  base: '',\\n  resolve: {\\n    alias: {\\n      '@': path.resolve(__dirname, './src'),\\n    },\\n  },\\n});\`
      },
      {
        path: 'tailwind.config.js',
        content: \`/** @type {import('tailwindcss').Config} */\\nmodule.exports = {\\n  content: [\\n    './index.html',\\n    './src/**/*.{js,ts,jsx,tsx}',\\n  ],\\n  theme: {\\n    extend: {},\\n  },\\n  plugins: [],\\n};\n\`
      },
      {
        path: 'postcss.config.js',
        content: \`module.exports = {\\n  plugins: {\\n    tailwindcss: {},\\n    autoprefixer: {},\\n  },\\n}\n\`
      },
      {
        path: 'components.json',
        content: JSON.stringify({
          $schema: "https://ui.shadcn.com/schema.json",
          style: "new-york",
          rsc: false,
          tsx: true,
          tailwind: {
            config: "tailwind.config.js",
            css: "src/index.css",
            baseColor: "zinc",
            cssVariables: true,
            prefix: ""
          },
          aliases: {
            components: "@/components",
            utils: "@/lib/utils"
          }
        }, null, 2)
      },
      {
        path: 'tsconfig.json',
        content: \`{\\n  "files": [],\\n  "references": [\\n    { "path": "./tsconfig.app.json" },\\n    { "path": "./tsconfig.node.json" }\\n  ]\\n}\`
      },
      {
        path: 'tsconfig.app.json',
        content: \`{\\n  "compilerOptions": {\\n    "composite": true,\\n    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",\\n    "target": "ES2020",\\n    "useDefineForClassFields": true,\\n    "lib": ["ES2020", "DOM", "DOM.Iterable"],\\n    "module": "ESNext",\\n    "skipLibCheck": true,\\n    "moduleResolution": "bundler",\\n    "allowImportingTsExtensions": true,\\n    "resolveJsonModule": true,\\n    "isolatedModules": true,\\n    "moduleDetection": "force",\\n    "noEmit": true,\\n    "jsx": "react-jsx",\\n    "strict": true,\\n    "noUnusedLocals": true,\\n    "noUnusedParameters": true,\\n    "noFallthroughCasesInSwitch": true,\\n    "baseUrl": ".",\\n    "paths": {\\n      "@/*": ["./src/*"]\\n    }\\n  },\\n  "include": ["src"]\\n}\`
      },
      {
        path: 'tsconfig.node.json',
        content: \`{\\n  "compilerOptions": {\\n    "composite": true,\\n    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",\\n    "skipLibCheck": true,\\n    "module": "ESNext",\\n    "moduleResolution": "bundler",\\n    "allowSyntheticDefaultImports": true,\\n    "strict": true,\\n    "noEmit": true\\n  },\\n  "include": ["vite.config.ts"]\\n}\`
      },
      {
        path: 'src/vite-env.d.ts',
        content: \`/// <reference types="vite/client" />\`
      },
      {
        path: 'src/index.css',
        content: \`@tailwind base;\\n@tailwind components;\\n@tailwind utilities;\\n\\nhtml, body, #root {\\n  width: 100%;\\n  height: 100%;\\n  margin: 0;\\n  padding: 0;\\n  background-color: #000;\\n}\`
      },
      {
        path: 'src/main.tsx',
        content: \`import React from 'react';\\nimport ReactDOM from 'react-dom/client';\\nimport App from './App.tsx';\\nimport './index.css';\\n\\nReactDOM.createRoot(document.getElementById('root')!).render(\\n  <React.StrictMode>\\n    <App />\\n  </React.StrictMode>,\\n)\`
      },
      {
        path: 'src/lib/utils.ts',
        content: \`import { type ClassValue, clsx } from "clsx"\\nimport { twMerge } from "tailwind-merge"\\n\\nexport function cn(...inputs: ClassValue[]) {\\n  return twMerge(clsx(inputs))\\n}\`
      },
      {
        path: 'src/game-data.json',
        content: JSON.stringify(gameData, null, 2)
      },
      {
        path: 'src/App.tsx',
        content: \`import React, { useState, useEffect } from 'react';\\nimport gameData from './game-data.json';\\n\\nexport default function GameRunner() {\\n  const [activeSceneId, setActiveSceneId] = useState(gameData.activeSceneId || 'scene_1');\\n  const [stageElements, setStageElements] = useState([]);\\n  \\n  useEffect(() => {\\n    const sceneEls = gameData.sceneElements[activeSceneId] || [];\\n    setStageElements(sceneEls);\\n  }, [activeSceneId]);\\n\\n  const handleButtonClick = (elId) => {\\n    const events = gameData.sceneEvents[activeSceneId] || [];\\n    const ev = events.find(e => e.elementId === elId && e.trigger === 'onClick');\\n    if (ev) {\\n      if (ev.action === 'gotoScene' && ev.targetId) {\\n        setActiveSceneId(ev.targetId);\\n      } else if (ev.action === 'playSound' && ev.targetId) {\\n        const audio = new Audio(ev.targetId);\\n        audio.play().catch(console.error);\\n      }\\n    }\\n  };\\n\\n  return (\\n    <div style={{ backgroundColor: gameData.stageBgColor || '#000', width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>\\n      <div style={{ position: 'relative', width: 640, height: 360, backgroundColor: gameData.stageBgColor || '#000', overflow: 'hidden' }}>\\n        {stageElements.map((el, i) => {\\n           const isButton = el.type === 'btn' || el.type === 'obj';\\n           return (\\n             <div \\n               key={el.id || i} \\n               onClick={(e) => {\\n                 if (isButton) {\\n                   e.stopPropagation();\\n                   handleButtonClick(el.id);\\n                 }\\n               }}\\n               style={{ \\n                 position: 'absolute', \\n                 left: el.type === 'bg' ? 0 : el.x, \\n                 top: el.type === 'bg' ? 0 : el.y, \\n                 width: el.type === 'bg' ? '100%' : el.width, \\n                 height: el.type === 'bg' ? '100%' : el.height, \\n                 backgroundImage: (el.type !== 'obj' && (el.url || el.data)) ? \\\`url(\\\${el.url || el.data})\\\` : undefined, \\n                 backgroundSize: '100% 100%',\\n                 backgroundRepeat: 'no-repeat',\\n                 opacity: el.opacity !== undefined ? el.opacity : 1,\\n                 transform: el.rotation ? \\\`rotate(\\\${el.rotation}deg)\\\` : undefined,\\n                 cursor: isButton ? 'pointer' : 'default',\\n                 zIndex: el.type === 'bg' ? 0 : (el.layerId ? 10 : 20)\\n               }}\\n             >\\n               {el.type === 'btn' && <button style={{width:'100%',height:'100%',background:'transparent',border:'none', cursor: 'pointer', color: 'white', fontWeight: 'bold'}}>{el.text}</button>}\\n             </div>\\n           );\\n        })}\\n      </div>\\n    </div>\\n  );\\n}\`
      },
      {
        path: 'README.md',
        content: \`# \${repoInfo.name}\\n\\nProfessional game project created with Animato Studio.\\n\\n## Development\\n\\n\\\`\\\`\\\`bash\\nnpm install\\nnpm run dev\\n\\\`\\\`\\\`\\n\\n## Deployment\\n\\nThis project is automatically deployed to GitHub Pages via GitHub Actions.\`
      },
      {
        path: 'vercel.json',
        content: \`{\\n  "framework": "vite",\\n  "buildCommand": "npm run build",\\n  "outputDirectory": "dist"\\n}\`
      }
    ];
    
    if (hasWorkflowScope) {
      files.push({
        path: '.github/workflows/deploy.yml',
        content: \`name: Deploy to GitHub Pages\\non:\\n  push:\\n    branches: [ \${defaultBranch} ]\\npermissions:\\n  contents: read\\n  pages: write\\n  id-token: write\\njobs:\\n  build:\\n    runs-on: ubuntu-latest\\n    steps:\\n      - uses: actions/checkout@v4\\n      - uses: actions/setup-node@v4\\n        with:\\n          node-version: 20\\n          cache: 'npm'\\n      - run: npm install\\n      - run: npm run build\\n      - uses: actions/upload-pages-artifact@v3\\n        with:\\n          path: './dist'\\n  deploy:\\n    needs: build\\n    runs-on: ubuntu-latest\\n    environment:\\n      name: github-pages\\n      url: \\\${{ steps.deployment.outputs.page_url }}\\n    steps:\\n      - id: deployment\\n        uses: actions/deploy-pages@v4\`
      });
    } else {
      addLog("Skipping .github/workflows/deploy.yml because the GitHub token lacks the 'workflow' scope. Deployment to Pages will require manual setup.");
    }
    
    if (latestCommitSha) {
      addLog(\`Using GraphQL createCommitOnBranch to trigger webhooks. Head OID: \${latestCommitSha}\`);
      
      const graphqlQuery = {
        query: \`
          mutation ($input: CreateCommitOnBranchInput!) {
            createCommitOnBranch(input: $input) {
              commit {
                oid
                url
              }
            }
          }
        \`,
        variables: {
          input: {
            branch: {
              repositoryNameWithOwner: repoFullName,
              branchName: defaultBranch
            },
            message: {
              headline: commitMessage || 'Deploy game from Animato Studio'
            },
            expectedHeadOid: latestCommitSha,
            fileChanges: {
              additions: files.map(f => ({
                path: f.path,
                contents: Buffer.from(f.content).toString('base64')
              })),
              deletions: []
            }
          }
        }
      };

      const gqlRes = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers,
        body: JSON.stringify(graphqlQuery)
      });
      
      const gqlData = await gqlRes.json();
      if (gqlData.errors) {
        addLog(\`GraphQL Error: \${JSON.stringify(gqlData.errors)}\`, 'error');
        throw new Error(gqlData.errors[0]?.message || 'GraphQL Error during createCommitOnBranch');
      }
      
      const newCommitSha = gqlData.data?.createCommitOnBranch?.commit?.oid;
      addLog(\`Commit successful via GraphQL: \${newCommitSha}\`);
      
    } else {
      addLog(\`Repo appears empty. Using REST API fallback.\`);
      
      const treeItems = [];
      for (const file of files) {
        addLog(\`Creating blob for \${file.path}...\`);
        let blobSha = null;
        let blobAttempts = 0;
        while (blobAttempts < 3) {
          const blobRes = await fetch(\`https://api.github.com/repos/\${repoFullName}/git/blobs\`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              content: Buffer.from(file.content).toString('base64'),
              encoding: 'base64'
            })
          });
          const blobData = await blobRes.json();
          if (blobRes.ok) {
            blobSha = blobData.sha;
            addLog(\`Successfully created blob for \${file.path}: \${blobSha}\`);
            break;
          }
          addLog(\`Blob creation failed for \${file.path}, attempt \${blobAttempts + 1}: \${blobData.message} (Status: \${blobRes.status})\`, 'warn');
          await new Promise(resolve => setTimeout(resolve, 1000));
          blobAttempts++;
        }

        if (!blobSha) {
          addLog(\`Failed to create blob for \${file.path}\`, 'error');
          throw new Error(\`Failed to create blob for \${file.path}\`);
        }

        treeItems.push({
          path: file.path,
          mode: '100644',
          type: 'blob',
          sha: blobSha
        });
      }

      // Give GitHub a moment to index the blobs
      addLog('Waiting for GitHub indexing (3s)...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 4. Create a new Tree
      addLog(\`Creating tree for: \${repoFullName} | Base Tree: \${baseTreeSha || 'None (Initial)'}\`);
      
      let treeData = null;
      let attempts = 0;
      while (attempts < 5) {
        const treeBody = { tree: treeItems };
        if (baseTreeSha && !isRepoEmpty) {
          treeBody.base_tree = baseTreeSha;
        }

        const treeRes = await fetch(\`https://api.github.com/repos/\${repoFullName}/git/trees\`, {
          method: 'POST',
          headers,
          body: JSON.stringify(treeBody)
        });
        treeData = await treeRes.json();
        
        if (treeRes.ok) {
          addLog(\`Tree created successfully: \${treeData.sha}\`);
          break;
        }
        
        if (treeRes.status === 404 && treeBody.base_tree) {
           addLog(\`Tree creation failed with 404 (possibly invalid base_tree). Retrying WITHOUT base_tree...\`, 'warn');
           const retryRes = await fetch(\`https://api.github.com/repos/\${repoFullName}/git/trees\`, {
             method: 'POST',
             headers,
             body: JSON.stringify({ tree: treeItems })
           });
           const retryData = await retryRes.json();
           if (retryRes.ok) {
             treeData = retryData;
             addLog(\`Tree created successfully (after 404 fallback): \${treeData.sha}\`);
             break;
           }
        }

        addLog(\`Tree creation attempt \${attempts + 1} failed for \${repoFullName} on branch \${defaultBranch}: \${JSON.stringify(treeData)}. Retrying...\`, 'warn');
        await new Promise(resolve => setTimeout(resolve, 3000));
        attempts++;
      }

      if (!treeData || !treeData.sha) {
        addLog(\`Failed to create tree: \${treeData?.message || 'Unknown error'}\`, 'error');
        throw new Error(\`Failed to create tree: \${treeData?.message || 'Unknown error'}\`);
      }

      // 5. Create a new Commit
      addLog(\`Creating commit on tree: \${treeData.sha} | Parent: \${latestCommitSha || 'None'}\`);
      const commitBody = {
        message: commitMessage || 'Deploy game from Animato Studio',
        tree: treeData.sha,
        author: {
          name: username || 'Animato User',
          email: normalizedEmail
        },
        committer: {
          name: username || 'Animato User',
          email: normalizedEmail
        }
      };

      if (latestCommitSha) commitBody.parents = [latestCommitSha];

      const commitRes = await fetch(\`https://api.github.com/repos/\${repoFullName}/git/commits\`, {
        method: 'POST',
        headers,
        body: JSON.stringify(commitBody)
      });
      const commitData = await commitRes.json();
      if (!commitRes.ok) {
        addLog(\`Failed to create commit: \${JSON.stringify(commitData)}\`, 'error');
        throw new Error(commitData.message || 'Failed to create commit');
      }

      addLog(\`Commit created successfully: \${commitData.sha}\`);

      // 6. Update Branch Reference
      addLog(\`Updating ref for branch \${defaultBranch}...\`);
      const updateRefBody = {
        sha: commitData.sha,
        force: true
      };

      const updateRefRes = await fetch(\`https://api.github.com/repos/\${repoFullName}/git/refs/heads/\${defaultBranch}\`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updateRefBody)
      });
      
      const updateRefData = await updateRefRes.json();
      if (!updateRefRes.ok) {
        if (updateRefRes.status === 422 && updateRefData.message === 'Reference does not exist') {
          addLog(\`Reference does not exist (status 422). Trying POST to create ref...\`, 'warn');
          const createRefRes = await fetch(\`https://api.github.com/repos/\${repoFullName}/git/refs\`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              ref: \`refs/heads/\${defaultBranch}\`,
              sha: commitData.sha
            })
          });
          const createRefData = await createRefRes.json();
          if (!createRefRes.ok) {
            addLog(\`Failed to create ref: \${JSON.stringify(createRefData)}\`, 'error');
            throw new Error(createRefData.message || 'Failed to update/create branch reference');
          }
          addLog(\`Ref created successfully: \${createRefData.ref}\`);
        } else {
          addLog(\`Failed to update branch reference: \${JSON.stringify(updateRefData)}\`, 'error');
          throw new Error(updateRefData.message || 'Failed to update branch reference');
        }
      } else {
        addLog(\`Ref updated successfully to \${commitData.sha}\`);
      }
    }
`;

const searchString = `    let hasWorkflowScope = false;
    const scopesHeader = repoRes.headers?.get('x-oauth-scopes') || '';
    addLog(\`Token scopes: \${scopesHeader || 'none'}\`);
    if (scopesHeader.includes('workflow')) {
      hasWorkflowScope = true;
    } else {
      addLog(\`Token lacks 'workflow' scope. We will skip creating .github/workflows/deploy.yml to prevent 404 errors.\`, 'warn');
    }`;

const startIndex = content.indexOf(searchString);
if (startIndex === -1) {
    console.log("Could not find start index");
    process.exit(1);
}

const endString = `    res.json({ status: true, message: 'Deployment successful', logs });
  } catch (err: any) {
    addLog(\`Deployment failed: \${err.message}\`, 'error');`;

const endIndex = content.indexOf(endString);
if (endIndex === -1) {
    console.log("Could not find end index");
    process.exit(1);
}

const newContent = content.substring(0, startIndex) + replacement + "\n" + content.substring(endIndex);
fs.writeFileSync('server.ts', newContent, 'utf8');
console.log("Patched server.ts");
