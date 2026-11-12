import React, { useEffect, useRef, useState } from 'react';
import { Icon, Logo, Button, Field, Modal, Countdown, Carousel, VideoStamp } from './ui.jsx';
import { KEY, uid, now, clock, date, digits, validPhone, profile, read, initial, place, session, event, summary, elapsed, providerTitle } from './domain.js';

const services = [
  ['Police', 'shield', '112'], ['Fire', 'flame', '112'], ['Medical', 'cross', '112'], ['Disaster', 'alert', '112'],
  ['Women', 'shield', 'women'], ['Child', 'people', 'child'], ['Elderly', 'access', 'elderly'], ['Report Bystander', 'report', 'bystander']
];

const profileFields = [
  ['name', 'Full name'], ['relation', 'Relationship'], ['age', 'Age'], ['blood', 'Blood group'],
  ['conditions', 'Reported conditions'], ['allergies', 'Reported allergies'], ['medicines', 'Current medicines'],
  ['procedures', 'Major procedures / implants'], ['needs', 'Communication or mobility needs'], ['address', 'Home address'],
  ['hospital', 'Preferred hospital'], ['insurance', 'Mediclaim provider'], ['policy', 'Policy reference'], ['tpa', 'TPA / insurance helpline']
];

const initials = p => (p?.name || 'Me').slice(0, 2).toUpperCase();

function Row({ label, value, action, onClick, icon }) {
  return (
    <div className="ruled-row">
      {icon && <Icon name={icon} />}
      <div className="row-content"><span>{label}</span><strong>{value || 'Not added'}</strong></div>
      {action && <button type="button" className="text-action" onClick={onClick}>{action}</button>}
    </div>
  );
}

function Page({ title, subtitle, children, back }) {
  return (
    <div className="page">
      {back && <button type="button" className="back-link" onClick={back}><Icon name="left" size={18} />Back</button>}
      <span className="eyebrow">MY RESQ</span>
      <h1>{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
      {children}
    </div>
  );
}

function ProfileForm({ value, save, remove }) {
  const [draft, setDraft] = useState({ ...value });
  return (
    <form onSubmit={e => { e.preventDefault(); save({ ...draft, name: draft.name.trim(), updatedAt: now() }); }}>
      <p className="small muted">Use fictional information while evaluating this prototype. Details are self / family reported.</p>
      {profileFields.map(([key, label]) => (
        <Field key={key} label={label} value={draft[key]} type={key === 'age' ? 'number' : 'text'}
          min={key === 'age' ? 0 : undefined} max={key === 'age' ? 120 : undefined} required={key === 'name'}
          onChange={v => setDraft(p => ({ ...p, [key]: v }))} />
      ))}
      <button type="submit" className="btn green">Save MediCard</button>
      {remove && <Button tone="red-outline" onClick={remove}>Remove family profile</Button>}
    </form>
  );
}

function ContactForm({ value, save, remove }) {
  const [draft, setDraft] = useState(value || { id: uid(), name: '', number: '' });
  const [error, setError] = useState('');
  return (
    <form onSubmit={e => { e.preventDefault(); if (!validPhone(draft.number)) { setError('Enter a valid contact number.'); return; } save({ ...draft, name: draft.name.trim(), number: digits(draft.number) }); }}>
      <Field label="Contact name" value={draft.name} required onChange={v => setDraft(p => ({ ...p, name: v }))} />
      <Field label="Phone number" type="tel" value={draft.number} required onChange={v => setDraft(p => ({ ...p, number: v }))} />
      {error && <p className="error">{error}</p>}
      <button type="submit" className="btn green">Save contact</button>
      {remove && <Button tone="red-outline" onClick={remove}>Remove contact</Button>}
    </form>
  );
}

function LocationForm({ value, save, locate, status }) {
  const [address, setAddress] = useState(value?.address || '');
  return (
    <>
      <p className="muted">Device GPS describes your phone, not necessarily the patient. Correct it if the patient is elsewhere.</p>
      <Button tone="outline" onClick={locate}><Icon name="pin" />Use device location</Button>
      <p className="small muted">{status === 'loading' ? 'Getting device location…' : place(value)}</p>
      <form onSubmit={e => { e.preventDefault(); if (address.trim()) save({ address: address.trim(), source: 'Manually entered', at: now() }); }}>
        <Field label="Patient address or landmark" value={address} required onChange={setAddress} placeholder="Building, street, village or landmark" />
        <button type="submit" className="btn green">Save patient location</button>
      </form>
    </>
  );
}

function DetailForm({ active, save }) {
  const [text, setText] = useState(active.details || '');
  const [onset, setOnset] = useState(active.onset || '');
  return (
    <form onSubmit={e => { e.preventDefault(); save(text.trim(), onset.trim()); }}>
      <p className="muted">Report only what you observed. Unknown is a valid answer.</p>
      <Field label="What is happening?" type="textarea" value={text} onChange={setText} />
      <div className="quick-choices">
        {['Unknown', 'Not responding', 'Breathing concern', 'Accident or fall'].map(t => <button type="button" key={t} onClick={() => setText(t)}>{t}</button>)}
      </div>
      <Field label="Approximate start time" value={onset} onChange={setOnset} placeholder="Unknown or approximate time" />
      <button type="submit" className="btn green">Save reported update</button>
    </form>
  );
}

function SettingsForm({ settings, save }) {
  const [draft, setDraft] = useState({ ...settings });
  const [error, setError] = useState('');
  const numbers = [['ambulance', 'Ambulance helpline'], ['family', 'Family assistance number'], ['women', 'Women support number'], ['child', 'Child support number'], ['elderly', 'Elderly support number']];
  return (
    <form onSubmit={e => { e.preventDefault(); if (numbers.some(([k]) => draft[k] && !validPhone(draft[k]))) { setError('Check the configured phone numbers.'); return; } save(draft); }}>
      <p className="muted">Verify each number for your region before use. No support number is assumed for Women, Child or Elderly.</p>
      {numbers.map(([k, l]) => <Field key={k} label={l} type="tel" value={draft[k]} onChange={v => setDraft(p => ({ ...p, [k]: v }))} />)}
      <label className="toggle"><span>Include medical details when I manually share an incident</span><input type="checkbox" checked={draft.shareMedical} onChange={e => setDraft(p => ({ ...p, shareMedical: e.target.checked }))} /></label>
      <label className="toggle"><span>Larger text</span><input type="checkbox" checked={draft.largeText} onChange={e => setDraft(p => ({ ...p, largeText: e.target.checked }))} /></label>
      {error && <p className="error">{error}</p>}
      <button type="submit" className="btn green">Save settings</button>
    </form>
  );
}

function InviteForm({ create }) {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [error, setError] = useState('');
  return (
    <form onSubmit={e => { e.preventDefault(); if (!validPhone(number)) { setError('Enter a valid phone number.'); return; } create({ id: uid(), name: name.trim(), number: digits(number), at: now(), status: 'draft' }); }}>
      <p className="muted">Prepare an invitation to another ResQ user. Account linking needs a connected backend; this creates a local draft only.</p>
      <Field label="Family member name" value={name} required onChange={setName} />
      <Field label="Phone number" type="tel" value={number} required onChange={setNumber} />
      {error && <p className="error">{error}</p>}
      <button type="submit" className="btn green">Create invitation draft</button>
    </form>
  );
}

export default function App() {
  const [data, setData] = useState(read);
  const [page, setPage] = useState('home');
  const [drawer, setDrawer] = useState(false);
  const [modal, setModal] = useState(null);
  const [pending, setPending] = useState(null);
  const [location, setLocation] = useState(null);
  const [locStatus, setLocStatus] = useState('idle');
  const [toast, setToast] = useState('');
  const [online, setOnline] = useState(navigator.onLine);
  const [time, setTime] = useState(Date.now());
  const [storageError, setStorageError] = useState(false);
  const [videoUrls, setVideoUrls] = useState({});
  const mounted = useRef(true);
  const locationEpoch = useRef(0);
  const swipe = useRef(null);
  const drawerRef = useRef(null);
  const urlPool = useRef(new Set());

  const active = data.active;
  const selected = data.guest || data.profiles.find(p => p.id === data.selected) || data.profiles[0];
  const owner = data.profiles.find(p => p.id === data.owner) || data.profiles[0];

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(data)); setStorageError(false); } catch { setStorageError(true); }
  }, [data]);

  useEffect(() => {
    mounted.current = true;
    const up = () => setOnline(navigator.onLine);
    window.addEventListener('online', up);
    window.addEventListener('offline', up);
    const pool = urlPool.current;
    return () => {
      mounted.current = false;
      locationEpoch.current++;
      window.removeEventListener('online', up);
      window.removeEventListener('offline', up);
      pool.forEach(u => URL.revokeObjectURL(u));
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setTime(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active?.id]);

  useEffect(() => { if (drawer) drawerRef.current?.focus(); }, [drawer]);

  useEffect(() => {
    function key(e) { if (e.key === 'Escape' && drawer) setDrawer(false); }
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [drawer]);

  function navigate(p) { setPage(p); setDrawer(false); setModal(null); }
  function updateActive(fn) { setData(d => (d.active ? { ...d, active: fn(d.active) } : d)); }

  function applyLocation(loc) {
    locationEpoch.current++;
    setLocation(loc);
    setLocStatus('ready');
    updateActive(s => event({ ...s, location: loc }, 'Location updated', `${place(loc)}. Source: ${loc.source}.`));
  }

  function locate() {
    if (!navigator.geolocation) { setLocStatus('unavailable'); setToast('Device location is unavailable. Enter an address.'); return; }
    setLocStatus('loading');
    const token = ++locationEpoch.current;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (!mounted.current || token !== locationEpoch.current) return;
        applyLocation({ lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy, at: now(), source: 'Device GPS' });
      },
      err => {
        if (!mounted.current || token !== locationEpoch.current) return;
        setLocStatus(err.code === 1 ? 'denied' : 'unavailable');
        setToast('Location could not be obtained. Add the patient address manually.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 }
    );
  }

  function start(id) {
    if (active) { setToast('End the current session before starting another.'); return; }
    const actions = {
      resq: { title: 'Get ResQ', mode: 'resq' },
      reach: { title: 'Reach Me', mode: 'reach' },
      ambulance: { title: 'Ambulance helpline', mode: 'call', number: data.settings.ambulance },
      family: { title: 'Family assistance', mode: 'call', number: data.settings.family || data.contacts[0]?.number },
      bystander: { title: 'Bystander SOS', mode: 'bystander' }
    };
    const a = typeof id === 'string' ? actions[id] : id;
    if (!a) return;
    if (a.mode === 'call' && !validPhone(a.number)) { setModal({ type: 'missing', title: a.title }); return; }
    setDrawer(false);
    setModal(null);
    setPending({ ...a, id: uid() });
  }

  function complete() {
    if (!pending) return;
    const action = pending;
    setPending(null);
    setData(d => ({ ...d, active: session(action, selected, location) }));
    setPage('home');
    locate();
    navigator.vibrate?.(70);
  }

  function finish() {
    locationEpoch.current++;
    setData(d => {
      if (!d.active) return d;
      const closed = event({ ...d.active, status: 'closed', closedAt: now() }, 'Session ended', 'Ended on this device. This does not cancel an external emergency call or provider request.');
      return { ...d, active: null, history: [closed, ...d.history].slice(0, 100) };
    });
    setModal(null);
    setPage('home');
    setToast('Session ended. External calls are not cancelled.');
  }

  function choose(p) {
    if (active?.mode === 'bystander') {
      updateActive(s => event({ ...s, patient: p }, 'Patient description corrected', 'Bystander identity was updated locally.'));
    } else {
      if (data.profiles.some(x => x.id === p.id)) setData(d => ({ ...d, selected: p.id, guest: null }));
      else setData(d => ({ ...d, guest: p }));
      updateActive(s => event({ ...s, patient: { ...p } }, 'Patient corrected', `Selected ${p.name || 'unnamed patient'}. No correction was transmitted.`));
    }
    setModal(null);
  }

  function saveProfile(p) {
    setData(d => ({ ...d, profiles: d.profiles.some(x => x.id === p.id) ? d.profiles.map(x => (x.id === p.id ? p : x)) : [...d.profiles, p] }));
    setModal(null);
    setToast('MediCard saved on this device.');
  }

  function removeProfile(p) {
    setData(d => ({ ...d, profiles: d.profiles.filter(x => x.id !== p.id), selected: d.selected === p.id ? d.owner : d.selected }));
    setModal(null);
  }

  function saveContact(c) {
    setData(d => ({ ...d, contacts: d.contacts.some(x => x.id === c.id) ? d.contacts.map(x => (x.id === c.id ? c : x)) : [...d.contacts, c] }));
    setModal(null);
    setToast('Contact saved.');
  }

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); setToast('Copied.'); } catch { setModal({ type: 'copy', text }); }
  }

  async function share(text) {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'ResQ incident', text });
        updateActive(s => event(s, 'Share sheet opened', 'Delivery and recipient acknowledgement are not verified.'));
      } else await copy(text);
    } catch (e) {
      if (e.name !== 'AbortError') setToast('Sharing failed. Try copying the summary.');
    }
  }

  function shareText() {
    if (!active) return '';
    return data.settings.shareMedical
      ? summary(active)
      : `ResQ assistance request\nPatient: ${active.patient.name || 'Not named'}\nLocation: ${place(active.location)}\nReported details: ${active.details || 'Not supplied'}\nCreated: ${clock(active.createdAt)}\nNo emergency service is connected through this app.`;
  }

  function attachVideo(meta, blob) {
    const url = URL.createObjectURL(blob);
    urlPool.current.add(url);
    setVideoUrls(v => ({ ...v, [meta.id]: url }));
    updateActive(s => event({ ...s, stamps: [...s.stamps, meta] }, 'Video Stamp attached', `${meta.duration}s recorded locally. Not uploaded.`));
    setModal(null);
    setToast('Video attached locally. Download it before refreshing.');
  }

  function gestureStart(e) {
    if (active || pending || modal || drawer || e.target.closest('.preset-section,button,a,input,textarea')) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    if (x >= 24 && x <= 72) swipe.current = { x: e.clientX, y: e.clientY };
  }
  function gestureEnd(e) {
    const g = swipe.current;
    swipe.current = null;
    if (g && e.clientX - g.x > 65 && Math.abs(e.clientY - g.y) < 30) setDrawer(true);
  }

  function logDial() {
    updateActive(s => event(s, 'Phone calling interface requested', `Requested ${s.number}. Call connection is not verified.`));
  }

  function resetAll() {
    locationEpoch.current++;
    urlPool.current.forEach(u => URL.revokeObjectURL(u));
    urlPool.current.clear();
    setVideoUrls({});
    setData(initial());
    setLocation(null);
    setLocStatus('idle');
    setModal(null);
    navigate('home');
    setToast('Local data cleared.');
  }

  function modalContent() {
    if (!modal) return null;
    const close = () => setModal(null);
    if (modal.type === 'video') return <VideoStamp close={close} location={active?.location} attach={attachVideo} />;
    let title = '';
    let body = null;

    if (modal.type === 'patient') {
      title = 'Who needs help?';
      body = (
        <>
          <div className="picker-list">
            {(active?.mode === 'bystander' ? [] : data.profiles).map(p => (
              <button key={p.id} onClick={() => choose(p)}>
                <span className="initials">{initials(p)}</span>
                <span><strong>{p.name || 'My profile'}</strong><small>{p.relation} {p.age ? `· ${p.age} years` : ''}</small></span>
                <Icon name="right" size={18} />
              </button>
            ))}
          </div>
          {['Someone else', 'Unknown bystander'].map(name => (
            <Button key={name} tone="outline" onClick={() => choose({ id: 'unknown', name, age: 'Unknown', relation: 'Unknown', conditions: 'Unknown', allergies: 'Unknown', medicines: 'Unknown' })}>{name}</Button>
          ))}
        </>
      );
    }
    if (modal.type === 'profile') {
      title = modal.value.id === data.owner ? 'My MediCard' : 'Family MediCard';
      const canRemove = modal.value.id !== data.owner && data.profiles.some(p => p.id === modal.value.id);
      body = <ProfileForm value={modal.value} save={saveProfile} remove={canRemove ? () => removeProfile(modal.value) : undefined} />;
    }
    if (modal.type === 'contact') {
      title = 'Emergency contact';
      body = <ContactForm value={modal.value} save={saveContact} remove={modal.value ? () => { setData(d => ({ ...d, contacts: d.contacts.filter(c => c.id !== modal.value.id) })); close(); } : undefined} />;
    }
    if (modal.type === 'location') {
      title = 'Patient location';
      body = <LocationForm value={active?.location || location} status={locStatus} locate={locate} save={loc => { applyLocation(loc); close(); }} />;
    }
    if (modal.type === 'detail') {
      title = 'Describe what is happening';
      body = <DetailForm active={active} save={(details, onset) => { updateActive(s => event({ ...s, details, onset }, 'Reported update', `You reported: ${details || 'Unknown'}. Approximate onset: ${onset || 'Unknown'}.`)); close(); }} />;
    }
    if (modal.type === 'settings') {
      title = 'Numbers & preferences';
      body = <SettingsForm settings={data.settings} save={settings => { setData(d => ({ ...d, settings })); close(); setToast('Preferences saved.'); }} />;
    }
    if (modal.type === 'invite') {
      title = 'Link a family member';
      body = <InviteForm create={invite => { setData(d => ({ ...d, invites: [...d.invites, invite] })); close(); setToast('Invitation draft saved. No account has been linked.'); }} />;
    }
    if (modal.type === 'missing') {
      title = modal.title;
      body = (
        <>
          <p>No valid number is configured. Add a verified number for your region in settings.</p>
          <Button onClick={() => { close(); navigate('settings'); }}>Configure numbers</Button>
          <Button tone="outline" onClick={close}>Back</Button>
        </>
      );
    }
    if (modal.type === 'end') {
      title = 'End this session?';
      body = (
        <>
          <p>This ends the ResQ record on this device. It does not cancel calls or assistance requested elsewhere.</p>
          <p className="muted">Download any Video Stamps you want to keep.</p>
          <Button tone="red" onClick={finish}>End session</Button>
          <Button tone="outline" onClick={close}>Keep session active</Button>
        </>
      );
    }
    if (modal.type === 'summary') {
      title = 'Patient summary';
      body = (
        <>
          <pre className="summary">{summary(active)}</pre>
          <Button onClick={() => copy(summary(active))}>Copy summary</Button>
          <Button tone="outline" onClick={() => share(summary(active))}>Share summary manually</Button>
        </>
      );
    }
    if (modal.type === 'copy') {
      title = 'Copy this text';
      body = <textarea className="copy-text" readOnly value={modal.text} onFocus={e => e.target.select()} aria-label="Text to copy" />;
    }
    if (modal.type === 'history') {
      title = modal.value.title;
      body = (
        <>
          <p>{date(modal.value.createdAt)} · {clock(modal.value.createdAt)}</p>
          <pre className="summary">{summary(modal.value)}</pre>
          <div className="timeline">{modal.value.events.map(e => <div key={e.id}><time>{clock(e.at)}</time><strong>{e.title}</strong><p>{e.detail}</p></div>)}</div>
          <Button tone="outline" onClick={() => copy(summary(modal.value))}>Copy record</Button>
        </>
      );
    }
    if (modal.type === 'reset') {
      title = 'Delete local data?';
      body = (
        <>
          <p>This deletes all MediCards, contacts and history from this browser. Use only fictional data in this prototype.</p>
          <Button tone="red" onClick={resetAll}>Delete all local data</Button>
          <Button tone="outline" onClick={close}>Keep data</Button>
        </>
      );
    }
    if (modal.type === 'help') {
      title = 'About ResQ';
      body = (
        <>
          <p>ResQ keeps a local emergency record, patient information and location together. This build has no ambulance network, automated callback or automatic family-alert service.</p>
          <p>It does not replace established emergency services. Use the independent emergency-call action on Home when needed.</p>
          <p>Video Stamps are local recordings, not consultations or AI assessments.</p>
          <p className="muted">MediCards are stored unencrypted in this browser. Use fictional data until a secure backend and clinical/privacy review are in place.</p>
        </>
      );
    }
    if (modal.type === 'share') {
      title = 'Share with your circle';
      body = (
        <>
          <p className="muted">Opening SMS or a share sheet does not prove delivery. No alert is sent automatically.</p>
          {data.contacts.map(c => (
            <a key={c.id} className="contact-share" href={`sms:${c.number}?body=${encodeURIComponent(shareText())}`}
              onClick={() => updateActive(s => event(s, 'SMS composer requested', `Prepared a message for ${c.name}. Delivery is not verified.`))}>
              <span><strong>{c.name}</strong><small>{c.number}</small></span><Icon name="send" />
            </a>
          ))}
          <Button onClick={() => share(shareText())}>Open share sheet</Button>
          {!data.contacts.length && <p className="small muted">Add contacts from the menu after ending the session.</p>}
        </>
      );
    }
    return <Modal title={title} close={close}>{body}</Modal>;
  }

  function homePage() {
    return (
      <div className="home-content">
        <div className="location-strip">
          <Icon name="pin" />
          <div>
            <strong>{locStatus === 'loading' ? 'Getting your location…' : place(location)}</strong>
            <small>{location ? `${location.source}${location.accuracy ? ` · ±${Math.round(location.accuracy)} m` : ''}` : 'Your phone location · not shared'}</small>
          </div>
          <button className="text-action" onClick={() => setModal({ type: 'location' })}>Edit</button>
        </div>
        <Carousel start={start} />
        <a className="home-call" href="tel:112"><Icon name="phone" />Call 112</a>
        <div className="section-title"><h2>Contact emergency services</h2><span>Choose a service</span></div>
        <div className="service-grid">
          {services.map(([label, icon, key]) => (
            <button key={label} onClick={() => (key === 'bystander' ? start('bystander') : start({ title: label, mode: 'call', number: key === '112' ? '112' : data.settings[key] }))}>
              <Icon name={icon} /><strong>{label}</strong>
            </button>
          ))}
        </div>
        <div className="home-patient">
          <span className="initials">{initials(selected)}</span>
          <div><small>Selected patient</small><strong>{selected.name || 'My MediCard'}{selected.age ? ` · ${selected.age}` : ''}</strong></div>
          <button className="text-action" onClick={() => setModal({ type: 'patient' })}>Change</button>
        </div>
        <p className="home-note">No setup is required to start. Swipe right or use the menu for your MediCard.</p>
      </div>
    );
  }

  function calmPage() {
    if (page === 'home') return homePage();
    if (page === 'medicard') {
      return (
        <Page title="My MediCard" subtitle="Essential information for a medical situation." back={() => navigate('home')}>
          <div className="profile-band">
            <span className="initials">{initials(owner)}</span>
            <div><h2>{owner.name || 'Your profile'}</h2><p>Updated {date(owner.updatedAt)}</p></div>
          </div>
          <div className="ruled-list">
            {profileFields.filter(([k]) => !['relation', 'name'].includes(k)).map(([k, l]) => (
              <Row key={k} label={l} value={k === 'policy' && owner[k] ? `•••• ${owner[k].slice(-4)}` : owner[k]} action="Edit" onClick={() => setModal({ type: 'profile', value: owner })} />
            ))}
          </div>
          <p className="small muted">Source: {owner.source}. Not clinically verified.</p>
          <Button onClick={() => setModal({ type: 'profile', value: owner })}>Edit MediCard</Button>
        </Page>
      );
    }
    if (page === 'family') {
      return (
        <Page title="Family profiles" subtitle="Manage a dependant’s profile or prepare an invitation to another account." back={() => navigate('home')}>
          <div className="ruled-list">
            {data.profiles.map(p => <Row key={p.id} label={`${p.relation}${p.age ? ` · ${p.age} years` : ''}`} value={p.name || 'Unnamed profile'} action="Edit" icon="person" onClick={() => setModal({ type: 'profile', value: p })} />)}
          </div>
          <div className="button-stack">
            <Button onClick={() => setModal({ type: 'profile', value: profile('Family member') })}><Icon name="plus" />Add managed profile</Button>
            <Button tone="outline" onClick={() => setModal({ type: 'invite' })}>Link another ResQ account</Button>
          </div>
          {data.invites.length > 0 && (
            <>
              <h2 className="section-heading">Invitation drafts</h2>
              {data.invites.map(inv => <Row key={inv.id} label="Not sent · not linked" value={inv.name} action="Share" onClick={() => share(`Invitation for ${inv.name}: please join my ResQ family circle.`)} />)}
            </>
          )}
        </Page>
      );
    }
    if (page === 'contacts') {
      return (
        <Page title="Emergency contacts" subtitle="Contacts are saved locally. Sharing is manual until an alert service is connected." back={() => navigate('home')}>
          {data.contacts.length
            ? data.contacts.map(c => <Row key={c.id} label={c.number} value={c.name} action="Edit" icon="phone" onClick={() => setModal({ type: 'contact', value: c })} />)
            : <div className="empty"><Icon name="people" size={32} /><h2>Your trusted circle</h2><p>Add people you would contact during an emergency.</p></div>}
          <Button onClick={() => setModal({ type: 'contact' })}><Icon name="plus" />Add emergency contact</Button>
        </Page>
      );
    }
    if (page === 'cover') {
      return (
        <Page title="Mediclaim & hospitals" subtitle="Preferences and policy references, not approval or guaranteed admission." back={() => navigate('home')}>
          {data.profiles.map(p => (
            <section className="cover-section" key={p.id}>
              <h2>{p.name || 'My profile'}</h2>
              <Row label="Preferred hospital" value={p.hospital} action="Edit" onClick={() => setModal({ type: 'profile', value: p })} />
              <Row label="Mediclaim provider" value={p.insurance} action="Edit" onClick={() => setModal({ type: 'profile', value: p })} />
              <Row label="Policy reference" value={p.policy ? `•••• ${p.policy.slice(-4)}` : ''} action="Edit" onClick={() => setModal({ type: 'profile', value: p })} />
            </section>
          ))}
        </Page>
      );
    }
    if (page === 'history') {
      return (
        <Page title="Emergency history" subtitle="A record of what actually happened on this device." back={() => navigate('home')}>
          {data.history.length
            ? data.history.map(s => <Row key={s.id} label={`${date(s.createdAt)} · ${clock(s.createdAt)} · ended locally`} value={`${s.title} · ${s.patient.name || 'Unnamed'}`} action="Open" icon="clock" onClick={() => setModal({ type: 'history', value: s })} />)
            : <div className="empty"><Icon name="clock" size={32} /><h2>No past sessions</h2><p>Ended sessions appear here.</p></div>}
        </Page>
      );
    }
    return (
      <Page title="Settings & privacy" subtitle="Keep ResQ simple, and control what you share." back={() => navigate('home')}>
        <Row label="Numbers and preferences" value="Configure saved helplines" action="Edit" icon="settings" onClick={() => setModal({ type: 'settings' })} />
        <Row label="Location" value={locStatus === 'denied' ? 'Permission denied' : locStatus === 'ready' ? 'Location available' : 'Not requested'} action="Request" icon="pin" onClick={locate} />
        <Row label="Account linking" value="Backend not connected" action="Details" onClick={() => setModal({ type: 'help' })} />
        <Row label="Privacy and support" value="How this prototype works" action="Open" onClick={() => setModal({ type: 'help' })} />
        <div className="privacy-note"><Icon name="shield" /><p>Profiles are stored unencrypted in this browser. Use fictional data. No recording is uploaded automatically.</p></div>
        <Button tone="red-outline" onClick={() => setModal({ type: 'reset' })}>Delete local data</Button>
      </Page>
    );
  }

  function activePage() {
    const loc = active.location;
    const reach = active.mode === 'reach';
    const headline = active.mode === 'call' ? 'Your calling option is ready' : reach ? 'Your Reach Me incident is ready' : active.mode === 'bystander' ? 'Bystander incident started' : 'Get ResQ started';
    const support = active.mode === 'call' ? 'Opening the phone does not verify a connected call.' : reach ? 'Location, text and Video Stamps stay together here.' : 'Your location and patient information are being prepared.';
    const truth = reach ? providerTitle(active.provider) + '.' : active.mode === 'call' ? 'No call has been placed by this app.' : 'Callback service is not connected. No call has been requested.';
    return (
      <div className="active-layout">
        <header className="app-header"><Logo /><button className="text-action danger-text" onClick={() => setModal({ type: 'end' })}>End session</button></header>
        <section className="active-band">
          <div className="status-line"><span className="status-dot" /><span>{active.title.toUpperCase()} · {elapsed(active.createdAt, time)}</span></div>
          <h1>{headline}</h1>
          <p>{support}</p>
        </section>
        <div className="active-scroll">
          <div className="truth-note" role="status"><Icon name="alert" size={20} /><p>{truth} No automatic family alerts have been sent.</p></div>
          {active.mode === 'call' && <a className="btn green" href={`tel:${active.number}`} onClick={logDial}><Icon name="phone" />Open phone to call {active.number}</a>}
          <section className="location-surface">
            <div className="location-symbol"><Icon name="pin" size={30} /></div>
            <span className="eyebrow">PATIENT LOCATION</span>
            <h2>{locStatus === 'loading' ? 'Getting device location…' : place(loc)}</h2>
            <p>{loc ? `${loc.source}${loc.accuracy ? ` · accurate to approximately ${Math.round(loc.accuracy)} m` : ''}` : 'No GPS fix or patient address yet.'}</p>
            <div className="location-actions">
              <button className="text-action" onClick={() => setModal({ type: 'location' })}>Correct location</button>
              {loc?.lat != null && <a href={`https://<scrubbed-url-domain>?mlat=$%7Bloc.lat%7D&mlon=$%7Bloc.lng%7D#map=16/$%7Bloc.lat%7D/$%7Bloc.lng%7D%60} target="_blank" rel="noreferrer">Open map</a>}
            </div>
            <span className="small muted">No provider position or route is available.</span>
          </section>
          <div className="ruled-list">
            <Row label="Patient" value={`${active.patient.name || 'Not named'}${active.patient.age ? ` · ${active.patient.age}` : ''}`} action="Change" icon="person" onClick={() => setModal({ type: 'patient' })} />
            <Row label="Reported allergies" value={active.patient.allergies || 'Unknown'} icon="cross" />
            <Row label="Emergency contacts" value={`${data.contacts.length} saved · none notified automatically`} action="Share" icon="people" onClick={() => setModal({ type: 'share' })} />
            <Row label="Patient summary" value="Read or share the reported facts" action="Open" icon="file" onClick={() => setModal({ type: 'summary' })} />
          </div>
          <div className="section-title"><h2>Incident updates</h2><span>Local record</span></div>
          <div className="action-grid">
            <Button onClick={() => setModal({ type: 'detail' })}><Icon name="report" />Add text update</Button>
            <Button tone="outline" onClick={() => setModal({ type: 'video' })}><Icon name="video" />Video Stamp</Button>
          </div>
          {active.details && <div className="reported-note"><span>You reported · {active.onset || 'Onset unknown'}</span><p>{active.details}</p></div>}
          {active.stamps.map(v => (
            <div className="stamp-entry" key={v.id}>
              <Icon name="video" />
              <div>
                <strong>Video Stamp · {v.duration}s</strong>
                <small>{clock(v.at)} · {v.location ? 'Location attached' : 'No location'} · not uploaded</small>
                {videoUrls[v.id] ? <a href={videoUrls[v.id]} download={`ResQ-${v.id}.${v.type.includes('mp4') ? 'mp4' : 'webm'}`}>Download recording</a> : <small>Recording is no longer in memory.</small>}
              </div>
            </div>
          ))}
          <h2 className="section-heading">What has happened</h2>
          <div className="timeline">{active.events.map(e => <div key={e.id}><time>{clock(e.at)}</time><strong>{e.title}</strong><p>{e.detail}</p></div>)}</div>
        </div>
        <footer className="active-footer"><Button tone="outline" onClick={() => share(shareText())}><Icon name="send" />Share incident manually</Button></footer>
      </div>
    );
  }

  const menuItems = [['home', 'Home', 'home'], ['medicard', 'My MediCard', 'file'], ['family', 'Family profiles', 'people'], ['contacts', 'Emergency contacts', 'phone'], ['cover', 'Mediclaim & hospitals', 'shield'], ['history', 'Emergency history', 'clock'], ['settings', 'Settings & privacy', 'settings']];

  function drawerKeys(e) {
    if (e.key !== 'Tab') return;
    const items = [...drawerRef.current.querySelectorAll('button')];
    if (e.shiftKey && (document.activeElement === items[0] || document.activeElement === drawerRef.current)) { e.preventDefault(); items.at(-1).focus(); }
    else if (!e.shiftKey && document.activeElement === items.at(-1)) { e.preventDefault(); items[0].focus(); }
  }

  return (
    <div className={`app ${data.settings.largeText ? 'large-text' : ''}`} onPointerDown={gestureStart} onPointerUp={gestureEnd} onPointerCancel={() => { swipe.current = null; }}>
      {!active ? (
        <>
          <header className="app-header">
            <button type="button" className="icon-button" aria-label="Open menu" onClick={() => setDrawer(true)}><Icon name="menu" /></button>
            <Logo />
            <button className="header-location" onClick={() => setModal({ type: 'location' })}><Icon name="pin" size={16} /><span>{locStatus === 'ready' ? 'Location ready' : 'Location'}</span></button>
          </header>
          <main className="calm-scroll">{calmPage()}</main>
        </>
      ) : activePage()}

      {!online && <div className="offline-bar" role="status">Offline · local information remains available</div>}
      {storageError && <div className="storage-warning" role="alert">Browser storage is unavailable. Changes will not survive refresh.</div>}
      {toast && <div className="toast" role="status">{toast}<button onClick={() => setToast('')} aria-label="Dismiss"><Icon name="close" size={16} /></button></div>}

      {drawer && !active && !pending && (
        <div className="drawer-overlay" onClick={() => setDrawer(false)}>
          <aside className="drawer" role="dialog" aria-modal="true" aria-label="ResQ menu" tabIndex={-1} ref={drawerRef}
            onClick={e => e.stopPropagation()} onKeyDown={drawerKeys}
            onPointerDown={e => { e.stopPropagation(); swipe.current = { x: e.clientX, y: e.clientY }; }}
            onPointerUp={e => { e.stopPropagation(); const g = swipe.current; if (g && e.clientX - g.x < -60 && Math.abs(e.clientY - g.y) < 30) setDrawer(false); swipe.current = null; }}>
            <header><Logo /><button className="icon-button" onClick={() => setDrawer(false)} aria-label="Close menu"><Icon name="close" /></button></header>
            <button className="drawer-profile" onClick={() => navigate('medicard')}>
              <span className="initials">{initials(owner)}</span>
              <span><strong>{owner.name || 'My profile'}</strong><small>My MediCard</small></span>
              <Icon name="right" size={18} />
            </button>
            <span className="drawer-caption">YOUR RESQ</span>
            {menuItems.map(([key, label, icon]) => (
              <button key={key} className={`drawer-link ${page === key ? 'selected' : ''}`} onClick={() => navigate(key)}><Icon name={icon} />{label}</button>
            ))}
            <div className="drawer-bottom"><p>Essential information.<br />One clear place.</p><span>ResQ · mobile prototype</span></div>
          </aside>
        </div>
      )}

      {pending && <Countdown key={pending.id} action={pending} cancel={() => setPending(null)} complete={complete} />}
      {modalContent()}
    </div>
  );
}
