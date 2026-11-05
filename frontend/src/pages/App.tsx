import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Activity, AlertCircle, ArrowRight, BarChart3, BookOpen, Check, ChevronRight, CircleHelp, ClipboardList, Clock3, Download, FileImage, Github, ImagePlus, Info, Leaf, LoaderCircle, Menu, ScanSearch, Settings2, ShieldCheck, SlidersHorizontal, Trash2, UploadCloud, X } from 'lucide-react';
import { predict, ready } from '../services/api';
import type { Health, HistoryEntry, Result } from '../types/prediction';

type Page = 'workspace' | 'history' | 'guide' | 'responsible';
const MAX_BYTES = 10 * 1024 * 1024;
const COLOR = ['#d6a55e','#5c9a79','#b98fc2','#669ab6','#d87a67','#8eac53','#a8a1de','#d2aa83'];
const getColor = (id:number) => COLOR[id % COLOR.length];
const pct = (v:number) => `${(v * 100).toFixed(1)}%`;
const download = (name:string, content:string, mime:string) => {
  const a=document.createElement('a'); const url=URL.createObjectURL(new Blob([content],{type:mime})); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1500);
};
const loadHistory = ():HistoryEntry[] => { try { const data=JSON.parse(sessionStorage.getItem('ricepest-history')||'[]'); return Array.isArray(data)? data.slice(0,20):[]; } catch { return []; } };

function DetectionCanvas({imageUrl,result,enabled,selected,onSelect,canvasRef}:{imageUrl:string;result:Result|null;enabled:boolean;selected:number|null;onSelect:(n:number|null)=>void;canvasRef:React.RefObject<HTMLCanvasElement|null>}) {
  const imgRef=useRef<HTMLImageElement|null>(null);
  const redraw=useCallback(()=>{
    const canvas=canvasRef.current; const img=imgRef.current; if(!canvas||!img||!img.complete||img.naturalWidth===0)return;
    const w=img.naturalWidth,h=img.naturalHeight;canvas.width=w;canvas.height=h;
    const ctx=canvas.getContext('2d');if(!ctx)return;
    ctx.drawImage(img,0,0,w,h);
    if(!result||!enabled)return;
    const scale=Math.max(1,w/850);ctx.lineJoin='round';ctx.textBaseline='top';
    result.detections.forEach((det,i)=>{
      const [x1,y1,x2,y2]=det.bbox_xyxy; const color=getColor(det.model_class_id); const active=selected===null||i===selected;
      ctx.globalAlpha=active?1:.2;ctx.strokeStyle=color;ctx.lineWidth=(selected===i?4:2.4)*scale;
      ctx.strokeRect(x1,y1,Math.max(0,x2-x1),Math.max(0,y2-y1));
      const text=`${det.class_name} · ${pct(det.confidence)}`;
      ctx.font=`600 ${12*scale}px system-ui`;const maxWidth=w-x1-6*scale;
      const label=text.length>48?text.slice(0,45)+'…':text;
      const tw=Math.min(ctx.measureText(label).width+16*scale, Math.max(20,maxWidth));
      const th=23*scale,ly=y1-th>=0?y1-th:y1;
      ctx.fillStyle=color;ctx.fillRect(x1,ly,tw,th);ctx.fillStyle='#12242b';ctx.fillText(label,x1+6*scale,ly+5*scale,tw-10*scale);
    });ctx.globalAlpha=1;
  },[canvasRef,result,enabled,selected]);
  useEffect(()=>{redraw();},[redraw,imageUrl]);
  return <div className="preview-stage"><img ref={imgRef} src={imageUrl} alt="Selected pest photograph" onLoad={redraw} className="hidden-image"/><canvas ref={canvasRef} aria-label="Image with AI-detected pest bounding boxes" className="detection-canvas"/>
    {result && <div className="canvas-counter"><span className="live-dot"/>{enabled?`${result.total_count} objects detected`:'Bounding boxes hidden'}</div>}
    {result && enabled && <button className="canvas-reset" onClick={()=>onSelect(null)} title="Show all detections"><ScanSearch size={15}/> Show all</button>}
  </div>;
}

export default function App(){
  const [page,setPage]=useState<Page>('workspace');const [mobile,setMobile]=useState(false);
  const [health,setHealth]=useState<Health|null>(null);const [healthError,setHealthError]=useState('');
  const [file,setFile]=useState<File|null>(null);const [url,setUrl]=useState('');const [result,setResult]=useState<Result|null>(null);
  const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [conf,setConf]=useState(.25);const [iou,setIou]=useState(.65);
  const [showBoxes,setShowBoxes]=useState(true);const [selected,setSelected]=useState<number|null>(null);
  const [history,setHistory]=useState<HistoryEntry[]>(loadHistory);const [drag,setDrag]=useState(false);
  const fileInput=useRef<HTMLInputElement|null>(null);const canvasRef=useRef<HTMLCanvasElement|null>(null);
  const req=useRef<AbortController|null>(null);
  useEffect(()=>{const ctl=new AbortController();ready(ctl.signal).then(setHealth).catch(e=>{if(!ctl.signal.aborted)setHealthError(e.message||'Backend unavailable');});return()=>ctl.abort();},[]);
  useEffect(()=>{try{sessionStorage.setItem('ricepest-history',JSON.stringify(history));}catch{}},[history]);
  useEffect(()=>()=>{if(url)URL.revokeObjectURL(url);},[url]);
  const choose=useCallback((candidate?:File)=>{
    if(!candidate)return;
    if(!['image/jpeg','image/png','image/webp'].includes(candidate.type)){setError('Please choose a JPG, PNG or WebP image.');return;}
    if(candidate.size>MAX_BYTES){setError('File exceeds 10 MB maximum.');return;}
    if(candidate.size===0){setError('The selected image is empty.');return;}
    req.current?.abort();setBusy(false);setError('');setFile(candidate);setResult(null);setSelected(null);setUrl(URL.createObjectURL(candidate));setPage('workspace');
  },[]);
  const analyze=async()=>{
    if(!file)return;
    req.current?.abort();const ctl=new AbortController();req.current=ctl;setBusy(true);setError('');setResult(null);setSelected(null);
    try{const data=await predict(file,conf,iou,ctl.signal);if(ctl.signal.aborted)return;setResult(data);
      const item:HistoryEntry={id:typeof crypto!=='undefined'&&'randomUUID'in crypto?crypto.randomUUID():String(Date.now()),name:file.name,date:new Date().toISOString(),count:data.total_count,classes:data.counts.length,result:data};
      setHistory(old=>[item,...old].slice(0,20));
    }catch(e){if(!ctl.signal.aborted)setError(e instanceof Error?e.message:'Prediction failed');}finally{if(!ctl.signal.aborted)setBusy(false);}
  };
  const nav=(p:Page)=>{setPage(p);setMobile(false);window.scrollTo({top:0,behavior:'smooth'});};
  const totalGroups=result?.counts.length||0;
  const sorted=useMemo(()=>result?.detections.map((d,i)=>({d,i})).sort((a,b)=>b.d.confidence-a.d.confidence)||[],[result]);
  const exportJSON=()=>{if(result)download(`ricepest-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify({file:file?.name,generated_at:new Date().toISOString(),...result},null,2),'application/json');};
  const exportPNG=()=>{const c=canvasRef.current;if(!c)return;const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='ricepest-annotated.png';a.click();};
  const clear=()=>{req.current?.abort();setFile(null);setUrl('');setResult(null);setError('');setBusy(false);setSelected(null);if(fileInput.current)fileInput.current.value='';};
  const NavButton=({p,icon:Icon,label}:{p:Page,icon:typeof ScanSearch,label:string})=><button className={`side-link ${page===p?'selected':''}`} onClick={()=>nav(p)}><Icon size={17}/><span>{label}</span>{page===p&&<i/>}</button>;
  return <div className="app-shell">
    <aside className={`sidebar ${mobile?'show':''}`}>
      <button className="brand" onClick={()=>nav('workspace')}><span className="brand-mark"><ScanSearch size={20}/></span><span>ricepest<span className="brand-light">.spotter</span></span></button>
      <div className="sidebar-group"><p className="section-label">WORKSPACE</p><NavButton p="workspace" icon={ScanSearch} label="Pest detection"/><NavButton p="history" icon={Clock3} label="Recent activity"/><NavButton p="guide" icon={BookOpen} label="How it works"/></div>
      <div className="sidebar-group"><p className="section-label">RESOURCES</p><NavButton p="responsible" icon={ShieldCheck} label="Responsible AI"/><a className="side-link" href="https://github.com/MENSTRUE/RicePest-Spotter" target="_blank" rel="noopener noreferrer"><Github size={17}/>GitHub repository<ArrowRight size={13} className="side-end"/></a></div>
      <div className="sidebar-bottom"><div className="side-note"><Leaf size={18}/><strong>Better monitoring starts with visibility.</strong><p>Spot visible pest objects early and keep the expert in the loop.</p><span>DAY 32 / 100</span></div><div className="side-profile"><div className="avatar">RP</div><div><strong>RicePest Research</strong><small>Computer vision project</small></div><span className="small-status"/></div></div>
    </aside>
    {mobile&&<button className="mobile-overlay" onClick={()=>setMobile(false)} aria-label="Close navigation"/>}
    <div className="main-shell"><header className="topbar"><button className="mobile-menu" onClick={()=>setMobile(true)} aria-label="Open menu"><Menu size={19}/></button><div className="breadcrumbs">Workspace <ChevronRight size={14}/> <strong>{page==='workspace'?'Pest detection':page==='history'?'Recent activity':page==='guide'?'How it works':'Responsible AI'}</strong></div><div className="topbar-right"><span className={`ready-pill ${health?.model_ready?'ready':'not-ready'}`}><span/>{health?.model_ready?'Model ready':healthError?'Model offline':'Checking model'}</span><span className="top-divider"/><span className="research-tag"><Activity size={14}/>Research preview</span></div></header>
      <main className="content">
      {page==='workspace'&&<>
        <section className="hero"><div className="hero-kicker"><span className="live-dot"/>AGRICULTURAL INTELLIGENCE <b>/</b> DAY 32 OF 100</div><h1>See the small details.<br/><span>Protect the bigger harvest.</span></h1><p>Analyze field photographs for visible pest objects, map their locations, and understand estimated counts with a research-trained detector.</p><div className="hero-tags"><span><Check size={15}/>30 source class IDs</span><span><ScanSearch size={15}/>YOLO11n detection</span><span><ShieldCheck size={15}/>Responsible screening</span></div><div className="hero-art"><span className="orbit orbit-one"/><span className="orbit orbit-two"/><Leaf size={92} strokeWidth={1.15}/></div></section>
        <div className="section-heading"><div><div className="section-count">01 / DETECT</div><h2>Analyze your field image</h2><p>Upload a clear image. Only real checkpoint predictions are shown.</p></div><span className="privacy-note"><ShieldCheck size={14}/> In-memory image processing</span></div>
        <div className="workspace-grid"><section className="panel upload-panel"><div className="panel-head"><div className="head-icon"><FileImage size={18}/></div><strong>Input image</strong><small>STEP 01</small></div>
          {!url?<div className={`drop-zone ${drag?'dragging':''}`} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);choose(e.dataTransfer.files[0]);}}><div className="upload-symbol"><UploadCloud size={28}/></div><strong>Drop a pest photograph here</strong><p>or <button className="inline-link" onClick={()=>fileInput.current?.click()}>browse from your device</button></p><small>JPG, PNG, WEBP · MAX 10 MB</small></div>:<><div className="preview-container"><DetectionCanvas imageUrl={url} result={result} enabled={showBoxes} selected={selected} onSelect={setSelected} canvasRef={canvasRef}/><button className="remove-file" onClick={clear} title="Remove image"><X size={17}/></button></div><div className="file-row"><FileImage size={14}/><span title={file?.name}>{file?.name}</span><small>{((file?.size||0)/1024/1024).toFixed(2)} MB</small></div></>}
          <input ref={fileInput} type="file" hidden accept="image/png,image/jpeg,image/webp" onChange={e=>choose(e.target.files?.[0])}/>
          <div className="control-header"><Settings2 size={16}/><strong>Detection settings</strong><small>ADJUSTABLE</small></div>
          <div className="slider-grid"><label><span>Confidence threshold <strong>{pct(conf)}</strong></span><input aria-label="Confidence threshold" type="range" min="0.05" max="0.95" step="0.05" value={conf} onChange={e=>setConf(Number(e.target.value))}/></label><label><span>IoU threshold <strong>{pct(iou)}</strong></span><input aria-label="IoU threshold" type="range" min="0.1" max="0.95" step="0.05" value={iou} onChange={e=>setIou(Number(e.target.value))}/></label></div>
          {result&&<label className="toggle-row"><input type="checkbox" checked={showBoxes} onChange={e=>setShowBoxes(e.target.checked)}/> Show bounding boxes <span>{result.detections.length} boxes</span></label>}
          {error&&<div role="alert" className="error-box"><AlertCircle size={17}/>{error}</div>}
          {!health?.model_ready&&<div className="warning-box"><Info size={16}/>{healthError||'Checking backend model readiness…'}</div>}
          <button className="primary-button" disabled={!file||busy||!health?.model_ready} onClick={analyze}>{busy?<><LoaderCircle size={17} className="spin"/> Analyzing image…</>:<>Analyze image <ArrowRight size={17}/></>}</button><p className="helper-note"><ShieldCheck size={13}/> Analysis results are not a comprehensive field census.</p>
        </section><section className="panel results-panel"><div className="panel-head"><div className="head-icon"><BarChart3 size={18}/></div><strong>Detection insights</strong><small>STEP 02</small></div>
          {!result?<div className="empty-results"><div className="radar-icon"><ScanSearch size={39}/></div><strong>Your insights appear here</strong><p>Upload and analyze a photograph to see bounding boxes, confidence scores and estimated pest counts.</p><small><span className="live-dot"/>WAITING FOR IMAGE</small></div>:<><div className="result-overview"><span>VISIBLE OBJECT ESTIMATE</span><div className="result-total">{result.total_count}<span>objects</span></div><div className="metric-strip"><div><strong>{totalGroups}</strong><span>Detected classes</span></div><div><strong>{result.inference_ms.toFixed(0)} ms</strong><span>Inference time</span></div><div><strong>{pct(result.confidence_threshold)}</strong><span>Confidence filter</span></div></div></div><div className="result-divider"/><div className="result-section-label">CLASS DISTRIBUTION</div>
          {result.counts.length===0?<div className="no-detections"><Info size={17}/> No objects above threshold. This does not prove that the image is pest-free.</div>:<div className="count-list">{result.counts.map(c=><div className="count-item" key={c.model_class_id}><span className="color-dot" style={{background:getColor(c.model_class_id)}}/><span title={c.class_name}>{c.class_name}</span><strong>{c.count}</strong></div>)}</div>}
          <div className="result-divider"/><div className="result-section-label">DETECTION DETAILS <small>{result.detections.length} OBJECTS</small></div><div className="detection-list">{sorted.slice(0,50).map(({d,i})=><button key={i} onClick={()=>setSelected(selected===i?null:i)} className={`detection-item ${selected===i?'active':''}`}><span className="number-tag">{String(i+1).padStart(2,'0')}</span><span className="det-name">{d.class_name}<small>Source ID {d.source_category_id ?? 'unknown'} · Model ID {d.model_class_id}</small></span><strong>{pct(d.confidence)}</strong></button>)}</div>
          <div className="result-footnote"><AlertCircle size={16}/> {result.disclaimer}</div><div className="export-row"><button onClick={exportJSON}><Download size={15}/> Export JSON</button><button onClick={exportPNG}><Download size={15}/> Export image</button></div></>}
        </section></div>
        <div className="section-heading lower-heading"><div><div className="section-count">02 / UNDERSTAND</div><h2>From photograph to informed decision</h2><p>A transparent workflow for research-based agricultural monitoring.</p></div></div><div className="steps-grid"><div><span>01</span><ImagePlus size={22}/><h3>Upload an image</h3><p>Use a clear field photograph in JPG, PNG, or WebP format.</p></div><div><span>02</span><ScanSearch size={22}/><h3>Detect visible objects</h3><p>Original YOLO11n weights return bounding boxes and scores.</p></div><div><span>03</span><ClipboardList size={22}/><h3>Review & export</h3><p>Explore detections, estimated counts and downloadable evidence.</p></div></div>
      </>}
      {page==='history'&&<section className="info-page"><div className="section-count">ACTIVITY / SESSION</div><h1>Recent activity</h1><p>Last 20 successful analyses are stored in this browser tab's session. Images are not saved; reopening an old result shows its summary only.</p><div className="info-toolbar"><span>{history.length} analyses in this session</span><button disabled={!history.length} onClick={()=>{setHistory([]);sessionStorage.removeItem('ricepest-history');}}><Trash2 size={16}/> Clear history</button></div>{history.length?history.map(item=><div className="history-row" key={item.id}><span className="history-icon"><ScanSearch size={19}/></span><div><strong>{item.name}</strong><small>{new Date(item.date).toLocaleString()} · {item.classes} classes found</small></div><span className="history-count">{item.count} objects</span><button onClick={()=>download(`ricepest-history-${item.id}.json`,JSON.stringify(item.result,null,2),'application/json')}><Download size={16}/></button></div>):<div className="blank-page"><Clock3 size={35}/><h3>No analyses yet</h3><p>Analyze an image to populate your session history.</p><button className="secondary-button" onClick={()=>nav('workspace')}>Start analysis <ArrowRight size={16}/></button></div>}</section>}
      {page==='guide'&&<section className="info-page"><div className="section-count">DOCUMENTATION / WORKFLOW</div><h1>How RicePest Spotter works</h1><p>Every detection originates from the actual YOLO11n model exported from the Day 32 Kaggle research experiment.</p><div className="info-cards"><article><UploadCloud/><h3>01 · Select a photograph</h3><p>Choose a clear image showing visible agricultural pests. Images are validated in the browser and decoded by the API.</p></article><article><SlidersHorizontal/><h3>02 · Adjust thresholds</h3><p>Confidence filters low-scoring predictions. IoU controls non-maximum suppression. Changes require a new analysis.</p></article><article><ScanSearch/><h3>03 · Inspect detections</h3><p>The backend returns pixel-space bounding boxes, confidence, 30 distinct model IDs and original source category IDs.</p></article><article><Download/><h3>04 · Export your evidence</h3><p>Download the annotated image or JSON response. Session history records analysis metadata, not uploaded images.</p></article></div><div className="info-note"><CircleHelp size={22}/><div><strong>Understanding the numbers</strong><p>Object count = number of surviving predicted bounding boxes. It is not a population census, species confirmation, or treatment recommendation.</p></div></div><button className="secondary-button" onClick={()=>nav('workspace')}>Open detection workspace <ArrowRight size={16}/></button></section>}
      {page==='responsible'&&<section className="info-page"><div className="section-count">RESEARCH / RESPONSIBILITY</div><h1>Responsible agricultural AI</h1><p>RicePest Spotter is a research prototype built for preliminary screening, with explicit scientific and practical limitations.</p><div className="info-cards"><article><ShieldCheck/><h3>Not a confirmed diagnosis</h3><p>Predictions require professional verification before pesticide use or other significant field decisions.</p></article><article><BarChart3/><h3>Validation is not independent testing</h3><p>The supplied RicePest-30 cleaned dataset has train and validation splits, but no independent held-out test set in this research run.</p></article><article><Info/><h3>Incomplete coverage</h3><p>Small, occluded, novel or domain-shifted pests may be missed. Near-duplicate auditing was incomplete.</p></article><article><Leaf/><h3>Taxonomy integrity</h3><p>Two source category IDs share the label Anomala corpulenta; model IDs remain separate rather than being merged without evidence.</p></article></div><div className="info-note"><AlertCircle size={22}/><div><strong>Privacy and deployment</strong><p>The local API processes images in memory. This prototype does not include authentication, rate limiting, or public-service operational guarantees.</p></div></div><button className="secondary-button" onClick={()=>nav('workspace')}>Back to workspace <ArrowRight size={16}/></button></section>}
      </main><footer className="footer"><span>© 2026 RicePest Spotter · Day 32 of 100</span><span>Research prototype · Not an exhaustive pest census</span></footer>
    </div>
  </div>;
}
