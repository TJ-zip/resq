export const KEY = 'resq.complete.v1';
export const uid = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const now = () => new Date().toISOString();
export const clock = t => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
export const date = t => new Date(t).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
export const digits = v => String(v || '').replace(/[^\d+]/g, '');
export const validPhone = v => /^\+?\d{3,15}$/.test(digits(v));
export const remaining = (deadline, t = Date.now()) => Math.max(0, Math.ceil((deadline - t) / 1000));

export function elapsed(start, t = Date.now()) {
  const s = Math.max(0, Math.floor((t - new Date(start).getTime()) / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function profile(relation = 'Self') {
  return { id: uid(), name: '', relation, age: '', blood: '', conditions: '', allergies: '', medicines: '', procedures: '', needs: '', address: '', hospital: '', insurance: '', policy: '', tpa: '', updatedAt: now(), source: 'Self / family reported' };
}

export function initial() {
  const p = profile();
  return { version: 1, profiles: [p], owner: p.id, selected: p.id, guest: null, contacts: [], invites: [], history: [], active: null, settings: { ambulance: '', family: '', women: '', child: '', elderly: '', shareMedical: false, largeText: false } };
}

export function restore(value) {
  const b = initial();
  if (!value || value.version !== 1 || !Array.isArray(value.profiles)) return b;
  const ps = value.profiles.filter(p => p && typeof p.id === 'string').map(p => ({ ...profile(), ...p }));
  if (!ps.length) return b;
  return {
    ...b, ...value, profiles: ps,
    owner: ps.some(p => p.id === value.owner) ? value.owner : ps[0].id,
    selected: ps.some(p => p.id === value.selected) ? value.selected : ps[0].id,
    contacts: Array.isArray(value.contacts) ? value.contacts : [],
    invites: Array.isArray(value.invites) ? value.invites : [],
    history: Array.isArray(value.history) ? value.history : [],
    settings: { ...b.settings, ...value.settings },
    active: value.active?.id && Array.isArray(value.active.events) ? value.active : null
  };
}

export function read() {
  try { return restore(JSON.parse(localStorage.getItem(KEY))); } catch { return initial(); }
}

export function place(loc) {
  if (!loc) return 'Location not added';
  if (loc.address) return loc.address;
  if (Number.isFinite(loc.lat) && Number.isFinite(loc.lng)) return `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`;
  return 'Location not added';
}

export function event(s, title, detail) {
  return { ...s, events: [...s.events, { id: uid(), at: now(), title, detail }] };
}

export function session(action, p, loc) {
  const bystander = action.mode === 'bystander';
  const patient = bystander
    ? { id: 'unknown', name: 'Unknown bystander', relation: 'Bystander', age: 'Unknown', conditions: 'Unknown', allergies: 'Unknown', medicines: 'Unknown', source: 'Not known' }
    : { ...p };
  const createdAt = now();
  return {
    id: uid(), title: action.title, mode: action.mode, number: digits(action.number), patient, location: loc || null,
    createdAt, details: '', onset: '', status: 'active',
    provider: { state: 'not_connected' }, callback: { state: 'not_connected' }, stamps: [],
    events: [{ id: uid(), at: createdAt, title: `${action.title} started`, detail: 'Saved on this device. No emergency service or contact has been notified.' }]
  };
}

export function summary(s) {
  const p = s.patient;
  return [
    `Patient: ${p.name || 'Name not supplied'}${p.age ? `, age ${p.age}` : ''}`,
    `Location: ${place(s.location)}`,
    `Location source: ${s.location?.source || 'Unavailable'}`,
    `What happened: ${s.details || 'Not reported'}`,
    `Approximate onset: ${s.onset || 'Unknown'}`,
    `Reported conditions: ${p.conditions || 'Unknown'}`,
    `Reported allergies: ${p.allergies || 'Unknown'}`,
    `Reported medicines: ${p.medicines || 'Unknown'}`,
    'Medical details are self / family reported, not clinically verified.'
  ].join('\n');
}

export function providerTitle(p) {
  return p?.state === 'en_route' && p.verified === true ? 'Emergency services are reaching you' : 'No emergency-service connection';
}
