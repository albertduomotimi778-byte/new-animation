
/**
 * ANIMATO STUDIO - OFFLINE-READY GDEVELOP INTEGRATION
 * 
 * Features:
 * - Smart Caching: Downloads libraries once, stores in IndexedDB.
 * - Offline Mode: Loads from local storage on subsequent runs.
 * - GDevelop Sync: Anchors UI to "Canvas" sprite object.
 */

(function() {
    // Safety: Prevent multiple injections
    if (document.getElementById('animato-root')) return;

    // --- CONFIGURATION ---
    const DB_NAME = 'AnimatoDependencyCache';
    const DB_VERSION = 1;
    const STORE_NAME = 'libraries';
    
    // Library Manifest
    const LIBS = [
        { key: 'react', url: 'https://unpkg.com/react@18/umd/react.production.min.js' },
        { key: 'react-dom', url: 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js' },
        { key: 'htm', url: 'https://unpkg.com/htm@3.1.1/dist/htm.umd.js' },
        { key: 'tailwind', url: 'https://cdn.tailwindcss.com' }, // Note: Tailwind CDN is large, caching is essential
        { key: 'html2canvas', url: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js' },
        { key: 'lucide', url: 'https://unpkg.com/lucide@latest' },
        { key: 'jszip', url: 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js' }
    ];

    // --- UI HELPERS (LOADER) ---
    const showLoader = () => {
        const d = document.createElement('div');
        d.id = 'animato-loader';
        d.innerHTML = `
            <div style="position:fixed;inset:0;background:#050505;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:monospace;color:#00f2ff;">
                <div style="width:50px;height:50px;border:2px solid #333;border-top:2px solid #00f2ff;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:20px;"></div>
                <div id="animato-loader-text" style="font-size:12px;letter-spacing:2px;">INITIALIZING...</div>
                <div id="animato-loader-sub" style="font-size:10px;color:#666;margin-top:10px;"></div>
                <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
            </div>
        `;
        document.body.appendChild(d);
    };

    const updateLoader = (text, sub) => {
        const el = document.getElementById('animato-loader-text');
        const subEl = document.getElementById('animato-loader-sub');
        if (el) el.innerText = text;
        if (subEl) subEl.innerText = sub || "";
    };

    const removeLoader = () => {
        const el = document.getElementById('animato-loader');
        if (el) el.remove();
    };

    const showOfflineError = () => {
        updateLoader("CONNECTION REQUIRED", "First launch requires internet to download resources.");
        const btn = document.createElement('button');
        btn.innerText = "RETRY";
        btn.style.cssText = "margin-top:20px;padding:10px 20px;background:#00f2ff;color:black;border:none;font-weight:bold;cursor:pointer;";
        btn.onclick = () => location.reload();
        document.getElementById('animato-loader').appendChild(btn);
    };

    // --- INDEXED DB WRAPPER ---
    const openDB = () => new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

    const getFromCache = async (db, key) => new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result); // Returns content string or undefined
        req.onerror = () => resolve(null);
    });

    const saveToCache = async (db, key, content) => new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(content, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });

    // --- DEPENDENCY MANAGER ---
    const loadDependencies = async () => {
        showLoader();
        
        let db;
        try {
            db = await openDB();
        } catch (e) {
            console.error("DB Error", e);
            // Fallback: Proceed without caching if DB fails
        }

        for (const lib of LIBS) {
            updateLoader(`LOADING CORE...`, lib.key.toUpperCase());
            
            let content = db ? await getFromCache(db, lib.key) : null;

            if (!content) {
                // Not in cache, need to fetch
                if (!navigator.onLine) {
                    showOfflineError();
                    throw new Error("Offline and missing dependencies");
                }

                updateLoader("DOWNLOADING...", `Fetching ${lib.key} for offline use`);
                try {
                    const resp = await fetch(lib.url);
                    if (!resp.ok) throw new Error(`Failed to fetch ${lib.url}`);
                    content = await resp.text();
                    
                    if (db) {
                        await saveToCache(db, lib.key, content);
                        console.log(`[Animato] Cached ${lib.key}`);
                    }
                } catch (err) {
                    updateLoader("DOWNLOAD FAILED", "Check internet connection");
                    throw err;
                }
            } else {
                console.log(`[Animato] Loaded ${lib.key} from cache`);
            }

            // Inject Script
            const script = document.createElement('script');
            script.text = content;
            document.head.appendChild(script);
        }

        // Wait for scripts to parse
        await new Promise(r => setTimeout(r, 100));
        
        // Initialize Tailwind
        if (window.tailwind) {
            window.tailwind.config = {
                theme: { extend: { colors: { cyan: { DEFAULT: '#00f2ff', dim: 'rgba(0, 242, 255, 0.2)' }, amber: { DEFAULT: '#ffaa00', dim: 'rgba(255, 170, 0, 0.2)' } } } }
            };
        }

        removeLoader();
        startApp();
    };

    // --- MAIN APP LOGIC ---
    const startApp = () => {
        const { useState, useEffect, useRef, useMemo, useCallback } = React;
        const html = htm.bind(React.createElement);
        const { createRoot } = ReactDOM;
        
        // Runtime Scene Helper
        const getRuntimeScene = () => (typeof runtimeScene !== 'undefined' ? runtimeScene : null);

        // --- COMPONENTS ---

        // 1. Icon Helper
        const Icon = ({ name, size = 16, className, ...props }) => {
            const Lucide = window.lucide;
            if (!Lucide) return null;
            const IconComp = Lucide.icons[name] || Lucide.icons.Circle;
            return html`<${IconComp} size=${size} className=${className} ...${props} />`;
        };

        // 2. Waveform Visualizer
        const Waveform = ({ buffer, color }) => {
            const ref = useRef();
            useEffect(() => {
                if (!ref.current || !buffer) return;
                const ctx = ref.current.getContext('2d');
                const w = ref.current.width;
                const h = ref.current.height;
                const data = buffer.getChannelData(0);
                const step = Math.ceil(data.length / w);
                const amp = h / 2;
                ctx.clearRect(0,0,w,h);
                ctx.fillStyle = color;
                ctx.beginPath();
                for (let i = 0; i < w; i++) {
                    let min = 1.0, max = -1.0;
                    for (let j = 0; j < step; j++) {
                        const datum = data[i * step + j];
                        if (datum < min) min = datum;
                        if (datum > max) max = datum;
                    }
                    ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
                }
            }, [buffer, color]);
            return html`<canvas ref=${ref} width="600" height="64" className="w-full h-full opacity-80" />`;
        };

        // 3. Stage (Canvas Synced)
        const Stage = ({ character, viseme, showBones }) => {
            return html`
                <div className="w-full h-full relative flex items-center justify-center">
                    ${character ? html`
                        ${Object.values(character).map(part => {
                            if (!part.isVisible) return null;
                            const isMouth = part.tags.includes('Mouth');
                            
                            // Physics
                            let transform = `translate(${part.transform.x}px, ${part.transform.y}px) rotate(${part.transform.rotation}deg) scale(${part.transform.scaleX}, ${part.transform.scaleY})`;
                            
                            if (isMouth) {
                                // Simple Viseme Warp
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
                                    <img src=${part.imageUrl} className="w-full h-full object-contain pointer-events-none" />
                                    ${showBones && part.bones && part.bones.map(b => html`
                                        <div style=${{
                                            position: 'absolute', left: b.startX, top: b.startY,
                                            width: Math.hypot(b.endX-b.startX, b.endY-b.startY), height: 4,
                                            background: 'cyan', transformOrigin: '0 50%',
                                            transform: `rotate(${Math.atan2(b.endY-b.startY, b.endX-b.startX)}rad)`
                                        }}/>
                                    `)}
                                </div>
                            `;
                        })}
                    ` : html`
                        <div className="text-cyan-500/50 font-bold text-2xl tracking-widest">ANIMATO STAGE</div>
                    `}
                </div>
            `;
        };

        // --- MAIN APP COMPONENT ---
        const App = () => {
            const [aspectRatio, setAspectRatio] = useState("16/9");
            const [canvasRect, setCanvasRect] = useState({ x: 0, y: 0, w: 0, h: 0 });
            const [character, setCharacter] = useState(null);
            const [audioCtx, setAudioCtx] = useState(null);
            const [vocalBuffer, setVocalBuffer] = useState(null);
            const [isPlaying, setIsPlaying] = useState(false);
            const [viseme, setViseme] = useState({ shape: 'REST', intensity: 0 });
            const [showRigging, setShowRigging] = useState(false);

            const analyserRef = useRef(null);

            // GDevelop Sync Loop
            useEffect(() => {
                const sync = () => {
                    const runtime = getRuntimeScene();
                    if (!runtime) return;

                    // 1. Manage GDevelop Object
                    const objs = runtime.getObjects("Canvas");
                    if (objs.length === 0) return;
                    const gdObj = objs[0];

                    const [rw, rh] = aspectRatio.split('/').map(Number);
                    const ratio = rw / rh;
                    const baseH = 600;
                    const targetW = baseH * ratio;

                    if (Math.abs(gdObj.getWidth() - targetW) > 1) {
                        gdObj.setWidth(targetW);
                        gdObj.setHeight(baseH);
                        // Center
                        const gameW = runtime.getGame().getGameResolutionWidth();
                        const gameH = runtime.getGame().getGameResolutionHeight();
                        gdObj.setX(gameW/2 - targetW/2);
                        gdObj.setY(gameH/2 - baseH/2);
                    }

                    // 2. Map to Screen
                    const game = runtime.getGame();
                    const renderer = game.getRenderer();
                    const domRect = renderer.getCanvas().getBoundingClientRect();
                    const scaleX = domRect.width / game.getGameResolutionWidth();
                    const scaleY = domRect.height / game.getGameResolutionHeight();

                    setCanvasRect({
                        x: domRect.left + gdObj.getX() * scaleX,
                        y: domRect.top + gdObj.getY() * scaleY,
                        w: gdObj.getWidth() * scaleX,
                        h: gdObj.getHeight() * scaleY
                    });
                };
                const interval = setInterval(sync, 1000/60);
                return () => clearInterval(interval);
            }, [aspectRatio]);

            // Audio Logic
            const loadAudio = async (file) => {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                setAudioCtx(ctx);
                const buf = await ctx.decodeAudioData(await file.arrayBuffer());
                setVocalBuffer(buf);
            };

            const togglePlay = () => {
                if (isPlaying) {
                    setIsPlaying(false);
                    // Stop logic omitted for brevity in GDevelop
                } else {
                    if (!vocalBuffer || !audioCtx) return;
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
                        // Simple energy detection
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

            // Zip Import
            const handleZip = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const zip = new JSZip();
                const content = await zip.loadAsync(file);
                
                const newChar = {
                    root: { id: 'root', transform: {x:0,y:0,scaleX:1,scaleY:1,rotation:0}, children:[], isVisible:true, isGroup:true }
                };
                let z = 1;
                
                // Simple flatten import
                content.forEach(async (path, entry) => {
                    if (path.match(/\.(png|jpg)$/i)) {
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
                const cvs = await html2canvas(el, { backgroundColor: null });
                const link = document.createElement('a');
                link.download = 'animato-frame.png';
                link.href = cvs.toDataURL();
                link.click();
            };

            return html`
                <div className="fixed inset-0 pointer-events-none font-sans text-gray-200 flex flex-col">
                    <!-- HEADER -->
                    <div className="h-12 bg-[#0a0a0a] border-b border-white/10 flex items-center justify-between px-4 pointer-events-auto z-50">
                        <div className="flex items-center gap-2">
                            <span className="text-cyan-500 font-black tracking-widest">ANIMATO</span>
                            <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded">CACHED MODE</span>
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
                        <!-- SYNCED STAGE -->
                        <div id="animato-stage-overlay" style=${{
                            position: 'absolute',
                            left: canvasRect.x, top: canvasRect.y, width: canvasRect.w, height: canvasRect.h,
                            border: '1px dashed rgba(0,242,255,0.3)',
                            pointerEvents: 'auto',
                            overflow: 'hidden'
                        }}>
                            <${Stage} character=${character} viseme=${viseme} showBones=${showRigging} />
                            
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
                        <div className="flex-1 p-2 overflow-y-auto">
                            <div className="flex gap-2 mb-2 h-20">
                                <div className="w-24 bg-[#111] border border-white/5 rounded p-2 flex flex-col justify-center items-center gap-2">
                                    <span className="text-[10px] font-bold text-amber-500">VOCAL</span>
                                    ${!vocalBuffer && html`
                                        <label className="cursor-pointer text-[9px] bg-white/10 px-2 py-1 rounded hover:bg-white/20">
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

        const rootDiv = document.createElement('div');
        rootDiv.id = 'animato-root';
        document.body.appendChild(rootDiv);
        createRoot(rootDiv).render(html`<${App} />`);
    };

    // Start Process
    loadDependencies();

})();
