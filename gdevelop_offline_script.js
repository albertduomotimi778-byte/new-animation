
/**
 * ANIMATO STUDIO - GDEVELOP PROFESSIONAL EDITION
 * 
 * SYSTEM: OFFLINE SMART CACHE
 * 
 * 1. Checks IndexedDB for libraries.
 * 2. If missing, downloads from CDN (Requires Internet).
 * 3. Saves to IndexedDB.
 * 4. Executes App (Offline Capable forever after step 3).
 */

(function() {
    // --- 1. CONFIGURATION ---
    const DB_NAME = 'AnimatoEngine_Cache';
    const STORE_NAME = 'libraries';
    const LIBS = [
        { key: 'react', url: 'https://unpkg.com/react@18/umd/react.production.min.js' },
        { key: 'react-dom', url: 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js' },
        { key: 'htm', url: 'https://unpkg.com/htm@3.1.1/dist/htm.umd.js' },
        { key: 'tailwind', url: 'https://cdn.tailwindcss.com' },
        { key: 'html2canvas', url: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js' },
        { key: 'lucide', url: 'https://unpkg.com/lucide@latest' },
        { key: 'jszip', url: 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js' }
    ];

    // Prevent double injection
    if (document.getElementById('animato-root')) return;

    // --- 2. CACHING SYSTEM (INDEXED DB) ---
    const dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = (e) => {
            e.target.result.createObjectStore(STORE_NAME);
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });

    const getLib = async (key) => {
        const db = await dbPromise;
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const req = tx.objectStore(STORE_NAME).get(key);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(null);
        });
    };

    const saveLib = async (key, content) => {
        const db = await dbPromise;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(content, key);
    };

    // --- 3. LOADER UI ---
    const showLoader = () => {
        const div = document.createElement('div');
        div.id = 'animato-boot-loader';
        div.style.cssText = "position:fixed;inset:0;background:#050505;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#00f2ff;font-family:monospace;";
        div.innerHTML = `
            <div style="width:40px;height:40px;border:2px solid #333;border-top-color:#00f2ff;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:20px;"></div>
            <div id="animato-status" style="font-size:12px;letter-spacing:2px;">CHECKING SYSTEM...</div>
            <div id="animato-sub" style="font-size:10px;color:#666;margin-top:10px;"></div>
            <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
        `;
        document.body.appendChild(div);
    };

    const updateStatus = (main, sub) => {
        const m = document.getElementById('animato-status');
        const s = document.getElementById('animato-sub');
        if (m) m.innerText = main;
        if (s) s.innerText = sub || "";
    };

    // --- 4. BOOTSTRAPPER ---
    const boot = async () => {
        showLoader();
        
        for (const lib of LIBS) {
            updateStatus("LOADING CORE", lib.key.toUpperCase());
            
            try {
                // Try Cache First
                let content = await getLib(lib.key);
                
                if (!content) {
                    // Cache Miss
                    if (!navigator.onLine) {
                        updateStatus("CONNECTION ERROR", "First run requires Internet.");
                        throw new Error("Offline on first run");
                    }
                    
                    updateStatus("DOWNLOADING", `Fetching ${lib.key}...`);
                    const resp = await fetch(lib.url);
                    content = await resp.text();
                    
                    // Save for Offline use
                    await saveLib(lib.key, content);
                }
                
                // Inject
                const script = document.createElement('script');
                script.textContent = content;
                document.head.appendChild(script);
                
            } catch (e) {
                console.error(e);
                const btn = document.createElement('button');
                btn.innerText = "RETRY CONNECTION";
                btn.style.cssText = "margin-top:20px;padding:10px 20px;background:#00f2ff;border:none;font-weight:bold;cursor:pointer;";
                btn.onclick = () => location.reload();
                document.getElementById('animato-boot-loader').appendChild(btn);
                return; // Stop boot
            }
        }

        // Init Tailwind
        if(window.tailwind) {
            window.tailwind.config = {
                theme: { extend: { colors: { cyan: { DEFAULT: '#00f2ff', dim: 'rgba(0, 242, 255, 0.2)' }, amber: { DEFAULT: '#ffaa00' } } } }
            };
        }

        document.getElementById('animato-boot-loader').remove();
        launchApp();
    };

    // --- 5. THE MAIN APP (REACT) ---
    const launchApp = () => {
        const { useState, useEffect, useRef, useMemo, useCallback } = React;
        const html = htm.bind(React.createElement);
        const { createRoot } = ReactDOM;
        const Icons = window.lucide ? window.lucide.icons : {};

        // --- COMPONENTS ---

        const Icon = ({ name, size=16, className }) => {
            const I = Icons[name] || Icons.Circle;
            return html`<${I} size=${size} className=${className} />`;
        };

        const Waveform = ({ buffer, color }) => {
            const canvasRef = useRef(null);
            useEffect(() => {
                if(!canvasRef.current || !buffer) return;
                const ctx = canvasRef.current.getContext('2d');
                const w = canvasRef.current.width;
                const h = canvasRef.current.height;
                const data = buffer.getChannelData(0);
                const step = Math.ceil(data.length / w);
                const amp = h / 2;
                ctx.clearRect(0,0,w,h);
                ctx.fillStyle = color;
                ctx.beginPath();
                for(let i=0; i<w; i++) {
                    let min=1.0, max=-1.0;
                    for(let j=0; j<step; j++) {
                        const datum = data[i*step+j];
                        if(datum < min) min = datum;
                        if(datum > max) max = datum;
                    }
                    ctx.fillRect(i, (1+min)*amp, 1, Math.max(1, (max-min)*amp));
                }
            }, [buffer, color]);
            return html`<canvas ref=${canvasRef} width="600" height="64" className="w-full h-full opacity-80"/>`;
        };

        const PuppetStage = ({ character, viseme, showBones }) => {
            // Simplified Rigging Renderer
            return html`
                <div className="w-full h-full relative">
                    ${character ? Object.values(character).map(part => {
                        if (!part.isVisible) return null;
                        
                        // Physics / Viseme Deformation
                        let transform = `translate(${part.transform.x}px, ${part.transform.y}px) rotate(${part.transform.rotation}deg) scale(${part.transform.scaleX}, ${part.transform.scaleY})`;
                        
                        if (part.tags.includes('Mouth')) {
                            const sq = 1 + (viseme.intensity * 0.2);
                            if (viseme.shape === 'O') transform += ` scale(0.8, ${sq})`;
                            else if (viseme.shape === 'AI') transform += ` scale(1, ${sq})`;
                        }

                        return html`
                            <div key=${part.id} style=${{
                                position: 'absolute',
                                left: '50%', top: '50%',
                                width: part.width || 200, height: part.height || 200,
                                marginLeft: -(part.width||200)/2, marginTop: -(part.height||200)/2,
                                zIndex: part.zIndex,
                                transform: transform,
                                transformOrigin: '50% 50%'
                            }}>
                                <img src=${part.imageUrl} className="w-full h-full object-contain pointer-events-none"/>
                                ${showBones && part.bones && part.bones.map(b => html`
                                    <div style=${{
                                        position: 'absolute', left: b.startX, top: b.startY,
                                        width: Math.hypot(b.endX-b.startX, b.endY-b.startY), height: 2,
                                        background: '#00f2ff', transformOrigin: '0 50%',
                                        transform: `rotate(${Math.atan2(b.endY-b.startY, b.endX-b.startX)}rad)`
                                    }}>
                                        <div className="w-2 h-2 rounded-full bg-white absolute -top-1 -right-1"/>
                                    </div>
                                `)}
                            </div>
                        `;
                    }) : html`
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 opacity-20">
                            <${Icon} name="Ghost" size=${64} />
                            <span className="text-xs font-bold mt-2">NO CHARACTER</span>
                        </div>
                    `}
                </div>
            `;
        };

        const App = () => {
            const [aspectRatio, setAspectRatio] = useState("16/9");
            const [stageRect, setStageRect] = useState({x:0, y:0, w:0, h:0});
            const [character, setCharacter] = useState(null);
            const [audioCtx, setAudioCtx] = useState(null);
            const [vocalBuffer, setVocalBuffer] = useState(null);
            const [isPlaying, setIsPlaying] = useState(false);
            const [viseme, setViseme] = useState({ shape: 'REST', intensity: 0 });
            const [showRigging, setShowRigging] = useState(false);
            const analyserRef = useRef(null);

            // GDevelop Sync
            useEffect(() => {
                const sync = () => {
                    const runtime = typeof runtimeScene !== 'undefined' ? runtimeScene : null;
                    if (!runtime) return;

                    // 1. Resize GDevelop Object
                    const objs = runtime.getObjects("Canvas");
                    if (objs.length === 0) return;
                    const gdObj = objs[0];

                    const [rw, rh] = aspectRatio.split('/').map(Number);
                    const ratio = rw/rh;
                    const baseH = 600;
                    const targetW = baseH * ratio;

                    if (Math.abs(gdObj.getWidth() - targetW) > 1) {
                        gdObj.setWidth(targetW);
                        gdObj.setHeight(baseH);
                        gdObj.setX(runtime.getGame().getGameResolutionWidth()/2 - targetW/2);
                        gdObj.setY(runtime.getGame().getGameResolutionHeight()/2 - baseH/2);
                    }

                    // 2. Map DOM Overlay
                    const renderer = runtime.getGame().getRenderer();
                    const domRect = renderer.getCanvas().getBoundingClientRect();
                    const scaleX = domRect.width / runtime.getGame().getGameResolutionWidth();
                    const scaleY = domRect.height / runtime.getGame().getGameResolutionHeight();

                    setStageRect({
                        x: domRect.left + gdObj.getX() * scaleX,
                        y: domRect.top + gdObj.getY() * scaleY,
                        w: gdObj.getWidth() * scaleX,
                        h: gdObj.getHeight() * scaleY
                    });
                };
                const i = setInterval(sync, 1000/60);
                return () => clearInterval(i);
            }, [aspectRatio]);

            // Audio Engine
            const loadAudio = async (file) => {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                setAudioCtx(ctx);
                const buf = await ctx.decodeAudioData(await file.arrayBuffer());
                setVocalBuffer(buf);
            };

            const togglePlay = () => {
                if (isPlaying) {
                    setIsPlaying(false);
                } else {
                    if(!vocalBuffer || !audioCtx) return;
                    setIsPlaying(true);
                    const src = audioCtx.createBufferSource();
                    src.buffer = vocalBuffer;
                    const anl = audioCtx.createAnalyser();
                    anl.fftSize = 256;
                    src.connect(anl);
                    anl.connect(audioCtx.destination);
                    src.start(0);
                    analyserRef.current = anl;
                    src.onended = () => setIsPlaying(false);

                    const loop = () => {
                        if (!isPlaying) return;
                        const data = new Uint8Array(anl.frequencyBinCount);
                        anl.getByteFrequencyData(data);
                        const vol = data.reduce((a,b)=>a+b,0) / data.length;
                        setViseme({
                            shape: vol > 50 ? 'AI' : (vol > 20 ? 'O' : 'REST'),
                            intensity: Math.min(1, vol/100)
                        });
                        requestAnimationFrame(loop);
                    };
                    loop();
                }
            };

            const handleZip = async (e) => {
                const file = e.target.files[0];
                if(!file) return;
                const zip = new JSZip();
                const content = await zip.loadAsync(file);
                const newChar = { root: { id:'root', transform:{x:0,y:0,scaleX:1,scaleY:1,rotation:0}, children:[], isVisible:true, isGroup:true } };
                let z=1;
                content.forEach(async (path, entry) => {
                    if(path.match(/\.(png|jpg)$/i)) {
                        const blob = await entry.async('blob');
                        const url = URL.createObjectURL(blob);
                        const id = `part_${z}`;
                        newChar[id] = {
                            id, imageUrl: url,
                            transform: {x:0,y:0,scaleX:1,scaleY:1,rotation:0},
                            width: 300, height: 300, zIndex: z++,
                            parentId: 'root', children: [], isVisible: true,
                            tags: path.toLowerCase().includes('mouth') ? ['Mouth'] : []
                        };
                        newChar.root.children.push(id);
                    }
                });
                setTimeout(() => setCharacter(newChar), 1000);
            };

            const handleExport = async () => {
                const el = document.getElementById('animato-stage-overlay');
                if(!el) return;
                const canvas = await html2canvas(el, { backgroundColor: null });
                const a = document.createElement('a');
                a.download = 'animato-export.png';
                a.href = canvas.toDataURL();
                a.click();
            };

            return html`
                <div className="fixed inset-0 pointer-events-none flex flex-col font-sans text-gray-200">
                    
                    <!-- HEADER -->
                    <div className="h-12 bg-[#0a0a0a] border-b border-white/10 flex items-center justify-between px-4 pointer-events-auto z-50">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-cyan-500 rounded flex items-center justify-center text-black font-black text-xs">An</div>
                            <span className="font-bold tracking-tight">ANIMATO</span>
                            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-500">CACHED MODE</span>
                        </div>
                        <div className="flex gap-2">
                            <select value=${aspectRatio} onChange=${e=>setAspectRatio(e.target.value)} className="bg-black border border-white/20 text-xs rounded px-2 h-7">
                                <option value="16/9">16:9</option>
                                <option value="9/16">9:16</option>
                                <option value="1/1">1:1</option>
                            </select>
                            <button onClick=${()=>setShowRigging(!showRigging)} className=${`h-7 px-3 rounded text-xs font-bold ${showRigging?'bg-cyan-500 text-black':'bg-white/10'}`}>
                                RIGGING
                            </button>
                            <button onClick=${handleExport} className="h-7 px-3 bg-white/10 hover:bg-white/20 rounded text-xs font-bold">EXPORT</button>
                        </div>
                    </div>

                    <!-- WORKSPACE -->
                    <div className="flex-1 relative">
                        <div id="animato-stage-overlay" style=${{
                            position: 'absolute',
                            left: stageRect.x, top: stageRect.y, width: stageRect.w, height: stageRect.h,
                            border: '1px dashed rgba(0,242,255,0.3)',
                            pointerEvents: 'auto',
                            overflow: 'hidden'
                        }}>
                            <${PuppetStage} character=${character} viseme=${viseme} showBones=${showRigging} />
                            
                            ${!character && html`
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <label className="cursor-pointer bg-cyan-900/20 hover:bg-cyan-900/40 border border-cyan-500/50 p-6 rounded-xl flex flex-col items-center gap-2 transition-all">
                                        <${Icon} name="UploadCloud" size=${32} className="text-cyan-400"/>
                                        <span className="text-xs font-bold text-cyan-400">UPLOAD CHARACTER ZIP</span>
                                        <input type="file" accept=".zip" className="hidden" onChange=${handleZip} />
                                    </label>
                                </div>
                            `}
                        </div>
                    </div>

                    <!-- TIMELINE -->
                    <div className="h-48 bg-[#0a0a0a] border-t border-white/10 pointer-events-auto z-50 flex flex-col">
                        <div className="h-8 bg-[#080808] border-b border-white/5 flex items-center px-2 gap-2">
                            <button onClick=${togglePlay} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 text-cyan-400">
                                <${Icon} name=${isPlaying ? 'Pause' : 'Play'} size=${16} />
                            </button>
                            <span className="text-[10px] font-mono text-gray-500">
                                ${isPlaying ? 'PLAYING' : 'READY'} | VISEME: <span className="text-cyan-400">${viseme.shape}</span>
                            </span>
                        </div>
                        <div className="flex-1 p-2">
                            <div className="flex gap-2 h-16">
                                <div className="w-24 bg-[#111] border border-white/5 rounded flex flex-col justify-center items-center">
                                    <span className="text-[10px] font-bold text-amber-500">VOCAL</span>
                                    ${!vocalBuffer && html`
                                        <label className="cursor-pointer text-[9px] bg-white/10 px-2 py-1 rounded hover:bg-white/20 mt-1">
                                            LOAD
                                            <input type="file" accept="audio/*" className="hidden" onChange=${e => loadAudio(e.target.files[0])} />
                                        </label>
                                    `}
                                </div>
                                <div className="flex-1 bg-[#111] border border-white/5 rounded relative overflow-hidden">
                                    ${vocalBuffer && html`<${Waveform} buffer=${vocalBuffer} color="#ffaa00" />`}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        };

        const root = document.createElement('div');
        root.id = 'animato-root';
        document.body.appendChild(root);
        createRoot(root).render(html`<${App} />`);
    };

    // BOOT
    boot();
})();
