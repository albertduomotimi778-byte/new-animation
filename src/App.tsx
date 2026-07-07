import React, { useState, useEffect } from 'react';
import gameData from './game-data.json';

export default function GameRunner() {
  const [activeSceneId, setActiveSceneId] = useState(gameData.activeSceneId || 'scene_1');
  const [stageElements, setStageElements] = useState([]);
  
  useEffect(() => {
    const sceneEls = gameData.sceneElements[activeSceneId] || [];
    setStageElements(sceneEls);
  }, [activeSceneId]);

  return (
    <div style={{ backgroundColor: gameData.stageBgColor, width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: 640, height: 360, backgroundColor: gameData.stageBgColor }}>
        {stageElements.map(el => (
           <div key={el.id} style={{ position: 'absolute', left: el.x, top: el.y, width: el.width, height: el.height, backgroundImage: el.url ? `url(${el.url})` : undefined, backgroundSize: '100% 100%' }}>
             {el.type === 'btn' && <button style={{width:'100%',height:'100%',background:'transparent',border:'none'}}>{el.text}</button>}
           </div>
        ))}
      </div>
    </div>
  );
}