import { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play, Pause, Volume2, Volume1, VolumeX,
  FolderOpen, Maximize, Minimize, Square,
  Film, SkipBack, SkipForward
} from 'lucide-react';

function fmt(totalSeconds) {
  const s = Math.floor(Math.max(0, totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  return `${m}:${String(sec).padStart(2,'0')}`;
}
function fmtFull(totalSeconds) {
  const s = Math.floor(Math.max(0, totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const IBtn = ({ onClick, children, title, style }) => (
  <button title={title} onClick={onClick} style={{
    background:'none', border:'none', color:'#fff', cursor:'pointer',
    lineHeight:1, padding:'3px 5px', display:'flex', alignItems:'center',
    ...style
  }}>{children}</button>
);

export default function VideoPlayer({ onMarkEnd, segmentStart, seekToSeconds, onVideoLoad }) {
  const videoRef   = useRef(null);
  const fileRef    = useRef(null);
  const theaterRef = useRef(null);
  const hideTimer  = useRef(null);
  const markEndRef = useRef(null);

  const [src, setSrc]             = useState(null);
  const [playing, setPlaying]     = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]   = useState(0);
  const [volume, setVolume]       = useState(1);
  const [muted, setMuted]         = useState(false);
  const [rate, setRate]           = useState(1);
  const [showCtrl, setShowCtrl]   = useState(true);
  const [flash, setFlash]         = useState(null);
  const [fileDrag, setFileDrag]   = useState(false);
  const [speedMenu, setSpeedMenu] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [hoverPct, setHoverPct]   = useState(null);

  const loadFile = (file) => {
    if (!file || !file.type.startsWith('video/')) return;
    if (src) URL.revokeObjectURL(src);
    setSrc(URL.createObjectURL(file));
    setCurrentTime(0); setDuration(0);
    if (onVideoLoad) onVideoLoad(file);
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    let raf = null;
    const onTime  = () => { if (raf) return; raf = requestAnimationFrame(() => { setCurrentTime(v.currentTime); raf = null; }); };
    const onMeta  = () => { setDuration(v.duration); v.playbackRate = rate; };
    const onPlay  = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onVol   = () => { setVolume(v.volume); setMuted(v.muted); };
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('volumechange', onVol);
    return () => {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('loadedmetadata', onMeta);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('volumechange', onVol);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [src]);

  useEffect(() => {
    const onFS = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFS);
    return () => document.removeEventListener('fullscreenchange', onFS);
  }, []);

  useEffect(() => {
    if (seekToSeconds != null && videoRef.current) videoRef.current.currentTime = seekToSeconds;
  }, [seekToSeconds]);

  const showControls = useCallback(() => {
    setShowCtrl(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowCtrl(false), 3000);
  }, []);

  const keepControls = useCallback(() => {
    setShowCtrl(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setFlash('play'); } else { v.pause(); setFlash('pause'); }
    setTimeout(() => setFlash(null), 400);
    showControls();
  }, [showControls]);

  const doMarkEnd = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    onMarkEnd(fmtFull(v.currentTime));
  }, [onMarkEnd]);

  markEndRef.current = doMarkEnd;

  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;
      if (e.key === 'e' || e.key === 'E') { markEndRef.current(); return; }
      if (e.key === ' ') { e.preventDefault(); togglePlay(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay]);

  const skip = (secs) => {
    const v = videoRef.current;
    if (!v) return;
    const t = Math.max(0, Math.min(v.duration || 0, v.currentTime + secs));
    if (v.fastSeek) v.fastSeek(t); else v.currentTime = t;
    showControls();
  };

  const seek = (e) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = ratio * duration;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const VolIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  /* ── Drop zone ── */
  if (!src) return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem', height:'100%' }}>
      <input ref={fileRef} type="file" accept="video/mp4,video/*" style={{display:'none'}} onChange={e=>loadFile(e.target.files[0])} />
      <div
        className={`drop-zone${fileDrag?' dragging':''}`}
        style={{ flex:1, aspectRatio:'unset' }}
        onDragOver={e=>{e.preventDefault();setFileDrag(true);}}
        onDragLeave={()=>setFileDrag(false)}
        onDrop={e=>{e.preventDefault();setFileDrag(false);loadFile(e.dataTransfer.files[0]);}}
        onClick={()=>fileRef.current?.click()}
      >
        <Film size={40} strokeWidth={1.5} style={{ marginBottom:'0.5rem', opacity:0.5 }} />
        <div className="dz-title">Drop video to begin</div>
        <div className="dz-hint">or click to browse</div>
        <button className="btn btn-primary" style={{marginTop:'0.75rem'}} onClick={e=>{e.stopPropagation();fileRef.current?.click();}}>
          <FolderOpen size={13} /> Load Video
        </button>
      </div>
    </div>
  );

  /* ── YouTube-style player ── */
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#000', borderRadius:8, overflow:'hidden' }}>
      <input ref={fileRef} type="file" accept="video/mp4,video/*" style={{display:'none'}} onChange={e=>loadFile(e.target.files[0])} />

      <div
        ref={theaterRef}
        style={{ flex:1, position:'relative', background:'#000', cursor: showCtrl?'default':'none' }}
        onMouseMove={showControls}
        onMouseLeave={() => playing && setShowCtrl(false)}
        onDragOver={e=>{e.preventDefault();setFileDrag(true);}}
        onDragLeave={()=>setFileDrag(false)}
        onDrop={e=>{e.preventDefault();setFileDrag(false);loadFile(e.dataTransfer.files[0]);}}
      >
        <video
          ref={videoRef} src={src} preload="auto" playsInline
          onClick={togglePlay}
          style={{ width:'100%', height:'100%', display:'block', objectFit:'contain', cursor:'pointer' }}
        />

        {/* Flash */}
        {flash && (
          <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none' }}>
            <div className="yt-flash">
              {flash === 'play' ? <Play size={28} fill="#fff" /> : <Pause size={28} fill="#fff" />}
            </div>
          </div>
        )}

        {/* File drag overlay */}
        {fileDrag && (
          <div style={{ position:'absolute',inset:0,background:'rgba(99,102,241,0.45)',display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none',fontWeight:600,color:'#fff',fontSize:'1rem' }}>
            Drop to replace video
          </div>
        )}

        {/* Controls overlay */}
        <div
          className="yt-controls"
          style={{ opacity: showCtrl ? 1 : 0, pointerEvents: showCtrl ? 'auto' : 'none' }}
          onMouseEnter={keepControls}
        >
          {/* Progress bar */}
          <div
            className="yt-progress-wrap"
            onClick={seek}
            onMouseMove={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              setHoverPct(Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width))*100);
            }}
            onMouseLeave={() => setHoverPct(null)}
          >
            <div className="yt-progress-track">
              <div className="yt-progress-fill" style={{ width:`${progress}%` }} />
              {hoverPct !== null && <div className="yt-progress-hover" style={{ width:`${hoverPct}%` }} />}
              <div className="yt-progress-thumb" style={{ left:`${progress}%` }} />
            </div>
          </div>

          {/* Bar */}
          <div className="yt-bar">
            <div style={{ display:'flex',alignItems:'center',gap:2 }}>
              <IBtn onClick={togglePlay} title={playing?'Pause (Space)':'Play (Space)'}>
                {playing ? <Pause size={20} fill="#fff" /> : <Play size={20} fill="#fff" />}
              </IBtn>
              <IBtn onClick={()=>skip(-10)} title="−10s" style={{fontSize:11,color:'rgba(255,255,255,0.75)',padding:'3px 5px'}}>
                <span style={{fontSize:11}}>−10s</span>
              </IBtn>
              <IBtn onClick={()=>skip(-5)} title="−5s" style={{fontSize:11,color:'rgba(255,255,255,0.75)',padding:'3px 4px'}}>
                <span style={{fontSize:11}}>−5s</span>
              </IBtn>
              <IBtn onClick={()=>skip(5)} title="+5s" style={{fontSize:11,color:'rgba(255,255,255,0.75)',padding:'3px 4px'}}>
                <span style={{fontSize:11}}>+5s</span>
              </IBtn>
              <IBtn onClick={()=>skip(10)} title="+10s" style={{fontSize:11,color:'rgba(255,255,255,0.75)',padding:'3px 5px'}}>
                <span style={{fontSize:11}}>+10s</span>
              </IBtn>
              <IBtn onClick={()=>{const v=videoRef.current;if(v)v.muted=!v.muted;}} title="Toggle mute">
                <VolIcon size={17} />
              </IBtn>
              <input
                type="range" min={0} max={1} step={0.02}
                value={muted ? 0 : volume}
                onChange={e=>{ const v=videoRef.current; const val=parseFloat(e.target.value); if(v){v.volume=val;v.muted=val===0;} }}
                className="yt-vol-slider"
              />
              <span className="yt-time">{fmt(currentTime)} / {fmt(duration)}</span>
            </div>

            <div style={{ display:'flex',alignItems:'center',gap:6 }}>
              <span className="yt-seg-badge">{segmentStart}</span>

              {/* Speed */}
              <div style={{ position:'relative' }}>
                <button className="yt-pill-btn" onClick={()=>{ setSpeedMenu(s=>!s); keepControls(); }}>
                  {rate}×
                </button>
                {speedMenu && (
                  <div className="yt-speed-menu" onMouseEnter={keepControls}>
                    <div className="yt-speed-label">Playback speed</div>
                    {SPEEDS.map(r=>(
                      <button key={r} className={`yt-speed-opt${r===rate?' active':''}`}
                        onClick={()=>{setRate(r);if(videoRef.current)videoRef.current.playbackRate=r;setSpeedMenu(false);}}>
                        {r === 1 ? 'Normal' : `${r}×`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <IBtn onClick={()=>fileRef.current?.click()} title="Load video">
                <FolderOpen size={16} />
              </IBtn>
              <IBtn onClick={()=>{ const el=theaterRef.current; if(!document.fullscreenElement)el?.requestFullscreen();else document.exitFullscreen(); }} title="Fullscreen">
                {fullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </IBtn>
            </div>
          </div>
        </div>
      </div>

      {/* Mark End */}
      <button className="yt-mark-end" onClick={doMarkEnd}>
        <Square size={15} fill="currentColor" />
        Mark End &amp; Annotate
        <kbd className="yt-kbd">E</kbd>
      </button>
    </div>
  );
}
