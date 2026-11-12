import test from 'node:test';
import assert from 'node:assert/strict';
import { remaining, elapsed, validPhone, initial, restore, session, event, summary, providerTitle } from '../src/domain.js';

test('countdown uses wall clock', () => {
  assert.equal(remaining(5000, 0), 5);
  assert.equal(remaining(5000, 4999), 1);
  assert.equal(remaining(5000, 5001), 0);
});
test('elapsed survives reload', () => assert.equal(elapsed('2026-01-01T00:00:00Z', Date.parse('2026-01-01T00:02:14Z')), '02:14'));
test('number validation', () => {
  assert.equal(validPhone(''), false);
  assert.equal(validPhone('112'), true);
  assert.equal(validPhone('+91 90000 00000'), true);
  assert.equal(validPhone('ab'), false);
});
test('restore missing selection', () => { const s = initial(); s.selected = 'missing'; assert.equal(restore(s).selected, s.profiles[0].id); });
test('bystander has no owner history', () => {
  const s = session({ title: 'Bystander SOS', mode: 'bystander' }, { ...initial().profiles[0], allergies: 'Private allergy' });
  assert.equal(s.patient.allergies, 'Unknown');
  assert.ok(!summary(s).includes('Private allergy'));
});
test('no false dispatch or callback', () => {
  const s = session({ title: 'Get ResQ', mode: 'resq' }, initial().profiles[0]);
  assert.equal(s.provider.state, 'not_connected');
  assert.equal(s.callback.state, 'not_connected');
});
test('corrections append events', () => {
  const s = session({ title: 'Get ResQ', mode: 'resq' }, initial().profiles[0]);
  const n = event(s, 'Correction', 'Changed patient');
  assert.equal(n.events.length, 2);
  assert.equal(s.events.length, 1);
});
test('en route copy needs verification', () => {
  assert.equal(providerTitle({ state: 'en_route' }), 'No emergency-service connection');
  assert.equal(providerTitle({ state: 'en_route', verified: true }), 'Emergency services are reaching you');
});
