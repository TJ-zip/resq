import React, { useEffect, useRef, useState } from 'react';
import { remaining, uid, now } from './domain.js';

const paths = {
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'M6 6l12 12M18 6 6 18',
  left: 'm14 5-7 7 7 7',
  right: 'm10 5 7 7-7 7',
  phone: 'M7 3h3l1 5-2 2a15 15 0 0 0 5 5l2-2 5 1v3a3 3 0 0 1-3 3A15 15 0 0 1 4 7a3 3 0 0 1 3-4Z',
  pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
  heart: 'M20 5c-3-3-6-1-8 1-2-2-5-4-8-1-4 4 1 9 8 15 7-6 12-11 8-15ZM3 12h5l2-4 3 8 2-4h6',
  shield: 'm12 3 8 3v6c0 5-4 8-8 10-4-2-8-5-8-10V6l8-3ZM8 12l3 3 5-6',
  flame: 'M12 3c2 5 6 6 6 11a6 6 0 0 1-12 0c0-3 2-5 3-6 0 3 2 4 3 4 2-2 1-5 0-9Z',
  cross: 'M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3Z',
  alert: 'm12 3 10 18H2L12 3ZM12 9v5M12 17v1',
  people: 'M9 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM2 21v-5a6 6 0 0 1 12 0v5M17 4a3 3 0 0 1 0 6M17 12c4 0 5 3 5 5v4',
  person: 'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM4 21v-2a8 8 0 0 1 16 0v2',
  access: 'M12 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM4 8h16M12 8v7M12 15l-5 7M12 15l5 7',
  report: 'M4 3h16v14H9l-5 4V3ZM8 7h8M8 11h5',
  video: 'M3 5h12v14H3V5ZM15 10l6-3v10l-6-3',
  file: 'M5 2h9l5 5v15H5V2ZM14 2v6h5M8 12h8M8 16h6',
  clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM12 6v6l4 2',
  plus: 'M12 4v16M4 12h16',
  check: 'm4 12 5 5L20 6',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2',
  home: 'm3 11 9-8 9 8M5 10v11h14V10M9 21v-7h6v7',
  send: 'm3 3 18 9-18 9 4-9-4-9ZM7 12h14',
  camera: 'M3 6h5l2-3h4l2 3h5v15H3V6ZM12 9a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
  stop: 'M5 5h14v14H5V5Z',
  navigation: 'm3 10 18-7-7 18-3-10-8-1Z'
};

export function Icon({ name, size = 22, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d={paths[name] || paths.heart} />
    </svg>
  );
}

export function Logo() {
  return <span className="logo" aria-label="ResQ">Res<span>Q</span><i /></span>;
}

export function Button({ children, tone = 'green', className = '', ...props }) {
  return <button type="button" className={`btn ${tone} ${className}`} {...props}>{children}</button>;
}

export function Field({ label, value, onChange, type = 'text', ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      {type === 'textarea'
        ? <textarea rows={3} value={value ?? ''} onChange={e => onChange(e.target.value)} {...props} />
        : <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} {...props} />}
    </label>
  );
}

export function Modal({ title, close, children }) {
  const ref = useRef(null);
  const callback = useRef(close);
  callback.current = close;
  useEffect(() => {
    const previous = document.activeElement;
    ref.current?.focus();
    function key(e) {
      if (e.key === 'Escape') callback.current();
      if (e.key === 'Tab') {
        const a = [...ref.current.querySelectorAll('button:not([disabled]),a[href],input,select,textarea')];
        if (!a.length) { e.preventDefault(); return; }
        if (e.shiftKey && (document.activeElement === a[0] || document.activeElement === ref.current)) { e.preventDefault(); a.at(-1).focus(); }
        else if (!e.shiftKey && document.activeElement === a.at(-1)) { e.preventDefault(); a[0].focus(); }
      }
    }
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('keydown', key); previous?.focus?.(); };
  }, []);
  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <section className="sheet" ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}>
        <header className="sheet-head">
          <h2>{title}</h2>
          <button type="button" className="icon-button" aria-label="Close" onClick={close}><Icon name="close" /></button>
        </header>
        <div className="sheet-body">{children}</div>
      </section>
    </div>
  );
}

export function Countdown({ action, cancel, complete }) {
  const [left, setLeft] = useState(5);
  const deadline = useRef(Date.now() + 5000);
  const done = useRef(false);
  const callback = useRef(complete);
  callback.current = complete;
  useEffect(() => {
    const timer = setInterval(() => {
      const n = remaining(deadline.current);
      setLeft(n);
      if (n === 0 && !done.current) { done.current = true; callback.current(); }
    }, 100);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="countdown" role="dialog" aria-modal="true" aria-label={`${action.title} countdown`}
      onKeyDown={e => { if (e.key === 'Tab') e.preventDefault(); if (e.key === 'Escape') { done.current = true; cancel(); } }}>
      <header><Logo /><span>CONFIRMING ACTION</span></header>
      <main>
        <span className="eyebrow">{action.title}</span>
        <div className="countdown-number" aria-live="polite">{left}</div>
        <h1>Starting in {left} seconds</h1>
        <p>{action.mode === 'call' ? `The calling option for ${action.number} will open.` : 'Your session, location and patient information will initialize.'}</p>
        <p className="muted">Nothing is sent to contacts or services during this countdown.</p>
      </main>
      <Button tone="red-outline" autoFocus onClick={() => { done.current = true; cancel(); }}><Icon name="close" />Cancel activation</Button>
    </div>
  );
}

const cards = [
  { id: 'resq', title: 'Get ResQ', label: 'YOUR EMERGENCY STARTING POINT', description: 'Location, MediCard and a clear incident record. Ready when you need them.', button: 'Get ResQ', icon: 'heart' },
  { id: 'reach', title: 'Reach Me', label: 'LOCATION & INCIDENT UPDATES', description: 'Keep your location together with text updates and Video Stamps.', button: 'Start Reach Me', icon: 'navigation' },
  { id: 'ambulance', title: 'Ambulance helpline', label: 'YOUR SAVED ASSISTANCE NUMBER', description: 'Open a call to the ambulance helpline you have configured.', button: 'Call saved helpline', icon: 'cross' },
  { id: 'family', title: 'Family assistance', label: 'YOUR TRUSTED CIRCLE', description: 'Open a call to your saved family contact. Keep the incident together.', button: 'Contact family', icon: 'people' }
];

export function Carousel({ start }) {
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const [moving, setMoving] = useState(false);
  const gesture = useRef(null);
  const suppress = useRef(false);

  function down(e) {
    if (e.target.closest('button')) return;
    gesture.current = { x: e.clientX, y: e.clientY, locked: false };
    suppress.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function move(e) {
    const g = gesture.current;
    if (!g) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (!g.locked && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) { gesture.current = null; return; }
    if (Math.abs(dx) > 12) { g.locked = true; suppress.current = true; setMoving(true); setDrag(Math.max(-120, Math.min(120, dx))); }
  }
  function end(e) {
    const g = gesture.current;
    if (g?.locked) {
      const dx = e.clientX - g.x;
      if (Math.abs(dx) > 65) setIndex(i => Math.max(0, Math.min(cards.length - 1, i + (dx < 0 ? 1 : -1))));
    }
    gesture.current = null;
    setMoving(false);
    setDrag(0);
    setTimeout(() => { suppress.current = false; }, 50);
  }

  return (
    <section className="preset-section" aria-label="SOS presets">
      <div className="carousel-window" onPointerDown={down} onPointerMove={move} onPointerUp={end}
        onPointerCancel={() => { gesture.current = null; setMoving(false); setDrag(0); }}>
        <div className={`carousel-track ${moving ? 'dragging' : ''}`} style={{ transform: `translateX(calc(-${index * 100}% + ${drag}px))` }}>
          {cards.map((c, i) => (
            <article key={c.id} className={`preset ${c.id}`} aria-hidden={index !== i}>
              <div className="preset-top"><span>{c.label}</span><Icon name={c.icon} size={27} /></div>
              <h1>{c.title}</h1>
              <p>{c.description}</p>
              <button type="button" className="preset-action" tabIndex={index === i ? 0 : -1} onClick={() => { if (!suppress.current) start(c.id); }}>
                {c.button}<Icon name="right" size={19} />
              </button>
              <span className="preset-foot">5 seconds to cancel before activation</span>
            </article>
          ))}
        </div>
      </div>
      <div className="carousel-controls">
        <button className="icon-button" onClick={() => setIndex(i => Math.max(0, i - 1))} disabled={index === 0} aria-label="Previous SOS preset"><Icon name="left" size={18} /></button>
        <div className="carousel-dots">
          {cards.map((c, i) => (
            <button key={c.id} onClick={() => setIndex(i)} className={index === i ? 'selected' : ''} aria-label={`Select ${c.title}`} aria-current={index === i ? 'true' : undefined} />
          ))}
        </div>
        <span>Swipe to choose</span>
        <button className="icon-button" onClick={() => setIndex(i => Math.min(cards.length - 1, i + 1))} disabled={index === cards.length - 1} aria-label="Next SOS preset"><Icon name="right" size={18} /></button>
      </div>
    </section>
  );
}

export function VideoStamp({ close, attach, location }) {
  const video = useRef(null);
  const stream = useRef(null);
  const recorder = useRef(null);
  const chunks = useRef([]);
  const alive = useRef(true);
  const stopTimer = useRef(null);
  const startTime = useRef(0);
  const blobRef = useRef(null);
  const urlRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [url, setUrl] = useState('');
  const [duration, setDuration] = useState(0);

  function release() {
    stream.current?.getTracks().forEach(t => t.stop());
    stream.current = null;
    if (video.current) video.current.srcObject = null;
    clearTimeout(stopTimer.current);
  }

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (recorder.current?.state === 'recording') recorder.current.stop();
      release();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  useEffect(() => {
    if (status !== 'recording') return;
    const timer = setInterval(() => setDuration(Math.min(30, Math.floor((Date.now() - startTime.current) / 1000))), 200);
    return () => clearInterval(timer);
  }, [status]);

  async function preview() {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia || !globalThis.MediaRecorder) {
      setError('Recording is unavailable here. Use a supported browser on HTTPS or localhost.');
      return;
    }
    setStatus('loading');
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: true });
      if (!alive.current) { media.getTracks().forEach(t => t.stop()); return; }
      stream.current = media;
      setStatus('preview');
      requestAnimationFrame(() => {
        if (video.current) { video.current.srcObject = media; video.current.play().catch(() => {}); }
      });
    } catch {
      if (alive.current) { setStatus('idle'); setError('Camera or microphone access was denied or unavailable. You can still add text.'); }
    }
  }

  function record() {
    if (!stream.current) return;
    try {
      const mime = ['video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'].find(t => MediaRecorder.isTypeSupported(t));
      const r = new MediaRecorder(stream.current, mime ? { mimeType: mime } : undefined);
      recorder.current = r;
      chunks.current = [];
      r.ondataavailable = e => { if (e.data.size) chunks.current.push(e.data); };
      r.onerror = () => { release(); if (alive.current) { setError('Recording failed. Please retry or use text.'); setStatus('idle'); } };
      r.onstop = () => {
        const seconds = Math.max(1, Math.min(30, Math.round((Date.now() - startTime.current) / 1000)));
        const blob = new Blob(chunks.current, { type: r.mimeType || 'video/webm' });
        release();
        if (!alive.current) return;
        if (!blob.size) { setError('No video was captured.'); setStatus('idle'); return; }
        blobRef.current = blob;
        const next = URL.createObjectURL(blob);
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = next;
        setUrl(next);
        setDuration(seconds);
        setStatus('review');
      };
      startTime.current = Date.now();
      setDuration(0);
      setStatus('recording');
      r.start(250);
      stopTimer.current = setTimeout(() => { if (r.state === 'recording') r.stop(); }, 30000);
    } catch {
      release();
      setStatus('idle');
      setError('This browser could not start recording.');
    }
  }

  function retake() {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    blobRef.current = null;
    setUrl('');
    setStatus('idle');
    setDuration(0);
  }

  return (
    <Modal title="Video Stamp" close={close}>
      <p className="muted">Record up to 30 seconds. Nothing is uploaded or analysed.</p>
      <div className="video-surface">
        {status === 'review' ? <video src={url} controls playsInline /> : <video ref={video} muted playsInline />}
        {status === 'idle' && <div className="video-empty"><Icon name="camera" size={34} /><span>Camera is off</span></div>}
      </div>
      <div className="video-meta">
        <span>{status === 'recording' ? 'Recording' : 'Local capture'} · {duration}s / 30s</span>
        <span>{location ? 'Location attached' : 'Location unavailable'}</span>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="button-stack">
        {status === 'idle' && <Button onClick={preview}><Icon name="camera" />Enable camera & microphone</Button>}
        {status === 'loading' && <p>Requesting permission…</p>}
        {status === 'preview' && <Button tone="red" onClick={record}><Icon name="video" />Start recording</Button>}
        {status === 'recording' && <Button tone="red" onClick={() => recorder.current?.stop()}><Icon name="stop" />Stop recording</Button>}
        {status === 'review' && (
          <>
            <Button onClick={() => attach({ id: uid(), at: now(), duration, location: location ? { ...location } : null, type: blobRef.current.type }, blobRef.current)}>Attach Video Stamp</Button>
            <Button tone="outline" onClick={retake}>Retake</Button>
          </>
        )}
      </div>
      <p className="small muted">Video stays in temporary browser memory. Download it before closing or refreshing.</p>
    </Modal>
  );
}
