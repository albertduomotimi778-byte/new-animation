
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export const generateProjectZip = async (gameData: any) => {
  const zip = new JSZip();
  
  // Project Metadata
  const metadata = {
    name: "Animato Game Project",
    exportedAt: new Date().toISOString(),
    version: "1.0.0"
  };
  zip.file("animato-metadata.json", JSON.stringify(metadata, null, 2));

  // Game Data
  zip.file("src/game-data.json", JSON.stringify(gameData, null, 2));

  // package.json
  zip.file("package.json", JSON.stringify({
    name: "animato-game",
    private: true,
    version: "0.0.0",
    type: "module",
    scripts: {
      "dev": "vite",
      "build": "vite build",
      "preview": "vite preview"
    },
    dependencies: {
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "lucide-react": "^0.284.0",
      "motion": "^12.0.0-alpha.0"
    },
    devDependencies: {
      "@types/react": "^18.2.15",
      "@types/react-dom": "^18.2.7",
      "@vitejs/plugin-react": "^4.0.3",
      "autoprefixer": "^10.4.14",
      "postcss": "^8.4.27",
      "tailwindcss": "^3.3.3",
      "typescript": "^5.0.2",
      "vite": "^4.4.5"
    }
  }, null, 2));

  // Vite config
  zip.file("vite.config.ts", `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`);

  // Index.html
  zip.file("index.html", `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Animato Game</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`);

  // main.tsx
  zip.file("src/main.tsx", `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`);

  // index.css
  zip.file("src/index.css", `
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  background-color: #000;
  color: #fff;
  overflow: hidden;
}
`);

  // App.tsx (The Game Runner)
  zip.file("src/App.tsx", `
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gameData from './game-data.json';

export default function GameRunner() {
  const [activeSceneId, setActiveSceneId] = useState(gameData.activeSceneId || 'scene_1');
  const [stageElements, setStageElements] = useState([]);
  
  useEffect(() => {
    // Initialization logic for scenes...
    const sceneEls = gameData.sceneElements[activeSceneId] || [];
    setStageElements(sceneEls);
  }, [activeSceneId]);

  return (
    <div style={{ backgroundColor: gameData.stageBgColor, width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
      <div style={{ position: 'relative', width: gameData.VIRTUAL_WIDTH, height: gameData.VIRTUAL_HEIGHT, backgroundColor: gameData.stageBgColor }}>
        {stageElements.map(el => (
           <div key={el.id} style={{ position: 'absolute', left: el.x, top: el.y, width: el.width, height: el.height, backgroundImage: el.url ? \`url(\${el.url})\` : undefined, backgroundSize: '100% 100%' }}>
             {/* ... simplified renderer ... */}
           </div>
        ))}
      </div>
    </div>
  );
}
`);

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "animato-project.zip");
};
