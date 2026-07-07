import React, { useState, useEffect } from 'react';
import gameData from './game-data.json';

export default function GameRunner() {
  const [activeSceneId, setActiveSceneId] = useState(gameData.activeSceneId || 'scene_1');
  const [stageElements, setStageElements] = useState([]);
  
  useEffect(() => {
    const sceneEls = gameData.sceneElements[activeSceneId] || [];
    setStageElements(sceneEls);
  }, [activeSceneId]);

  const handleButtonClick = (elId) => {
    const events = gameData.sceneEvents[activeSceneId] || [];
    const ev = events.find(e => e.elementId === elId && e.trigger === 'onClick');
    if (ev) {
      if (ev.action === 'gotoScene' && ev.targetId) {
        setActiveSceneId(ev.targetId);
      } else if (ev.action === 'playSound' && ev.targetId) {
        const audio = new Audio(ev.targetId);
        audio.play().catch(console.error);
      }
    }
  };

  return (
    <div style={{ backgroundColor: gameData.stageBgColor || '#000', width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: 640, height: 360, backgroundColor: gameData.stageBgColor || '#000', overflow: 'hidden' }}>
        {stageElements.map((el, i) => {
           const isButton = el.type === 'btn' || el.type === 'obj';
           const isObj = el.type === 'obj' || el.type === 'enemy';
           const gameObject = isObj ? (gameData.gameObjects || []).find(g => g.id === el.data) : null;
           const isText = gameObject?.type === 'text';
           const bgUrl = el.url || (isObj ? (gameObject?.url || gameObject?.animations?.[0]) : el.data);
           return (
             <div 
               key={el.id || i} 
               onClick={(e) => {
                 if (isButton) {
                   e.stopPropagation();
                   handleButtonClick(el.id);
                 }
               }}
               style={{ 
                 position: 'absolute', 
                 left: el.type === 'bg' ? 0 : el.x, 
                 top: el.type === 'bg' ? 0 : el.y, 
                 width: el.type === 'bg' ? '100%' : el.width, 
                 height: el.type === 'bg' ? '100%' : el.height, 
                 backgroundImage: (!isText && bgUrl) ? `url(${bgUrl})` : undefined, 
                 backgroundSize: '100% 100%',
                 backgroundRepeat: 'no-repeat',
                 backgroundColor: (!bgUrl && el.type === 'btn') ? 'rgba(236,72,153,0.2)' : undefined,
                 opacity: el.opacity !== undefined ? el.opacity : 1,
                 transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                 cursor: isButton ? 'pointer' : 'default',
                 pointerEvents: isButton ? 'auto' : 'none',
                 zIndex: el.type === 'bg' ? 0 : (isText ? 2000 : (el.layerId ? 10 : 20))
               }}
             >
               {el.type === 'btn' && <button style={{width:'100%',height:'100%',background:'transparent',border:'none', cursor: 'pointer', color: 'white', fontWeight: 'bold'}}>{el.text}</button>}
               {isText && (
                 <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', fontWeight:'bold', color: gameObject.color || '#fff', fontSize: gameObject.fontSize ? `${gameObject.fontSize}px` : '24px'}}>
                   {gameObject.name}
                 </div>
               )}
             </div>
           );
        })}
      </div>
    </div>
  );
}