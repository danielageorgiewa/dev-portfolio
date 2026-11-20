import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  addDays,
  dayOf,
  inWindow,
  parseSlots,
  slotWindow,
  sofiaDate,
  toIso,
  upcoming,
} from '../functions/_lib/slots.ts';

const at = (iso: string) => Date.parse(iso);

test('the Sofia date follows the Sofia clock, not UTC', () => {
  // 23:30 UTC is already the next day in Sofia, in winter (UTC+2) and in summer (UTC+3).
  assert.equal(sofiaDate(at('2026-11-20T23:30:00Z')), '2026-11-21');
  assert.equal(sofiaDate(at('2026-07-01T21:30:00Z')), '2026-07-02');
  assert.equal(sofiaDate(at('2026-07-01T20:30:00Z')), '2026-07-01');
});

test('date arithmetic crosses months and years', () => {
  assert.equal(addDays('2026-11-27', 7), '2026-12-04');
  assert.equal(addDays('2026-12-28', 7), '2027-01-04');
  assert.equal(addDays('2028-02-28', 1), '2028-02-29');
});

test('the window is today in Sofia and the seven days after it', () => {
  assert.deepEqual(slotWindow(at('2026-11-21T06:00:00Z')), { start: '2026-11-21', end: '2026-11-28' });
  assert.deepEqual(slotWindow(at('2026-11-20T23:30:00Z')), { start: '2026-11-21', end: '2026-11-28' });
  assert.deepEqual(dayOf(at('2026-11-23T09:00:00Z')), { start: '2026-11-23', end: '2026-11-23' });
});

test('a start is bookable only in the future and inside the window', () => {
  const now = at('2026-11-21T06:00:00Z');
  assert.equal(inWindow(at('2026-11-23T09:00:00Z'), now), true);
  assert.equal(inWindow(at('2026-11-27T13:30:00Z'), now), true);
  assert.equal(inWindow(now, now), false);
  assert.equal(inWindow(at('2026-11-20T09:00:00Z'), now), false);
  assert.equal(inWindow(at('2026-11-30T09:00:00Z'), now), false);
});

test('a Cal.com slots answer is flattened to instants in ascending order', () => {
  // The shape the live API returns: days as keys, objects with "start" carrying the Sofia offset.
  const slots = parseSlots({
    data: {
      '2026-11-24': [{ start: '2026-11-24T11:30:00.000+02:00' }, { start: '2026-11-24T11:00:00.000+02:00' }],
      '2026-11-23': [{ start: '2026-11-23T15:30:00.000+02:00' }, { start: '2026-11-23T11:00:00.000+02:00' }],
    },
    status: 'success',
  });
  assert.deepEqual(slots?.map(toIso), [
    '2026-11-23T09:00:00.000Z',
    '2026-11-23T13:30:00.000Z',
    '2026-11-24T09:00:00.000Z',
    '2026-11-24T09:30:00.000Z',
  ]);
});

test('summer offsets, plain strings and duplicates are handled; unreadable entries are skipped', () => {
  const slots = parseSlots({
    status: 'success',
    data: {
      '2026-07-01': [
        { start: '2026-07-01T11:00:00.000+03:00' },
        '2026-07-01T11:30:00.000+03:00',
        { start: '2026-07-01T08:00:00.000Z' },
        { start: 'soon' },
        { end: '2026-07-01T12:00:00.000+03:00' },
        null,
        7,
      ],
    },
  });
  assert.deepEqual(slots?.map(toIso), ['2026-07-01T08:00:00.000Z', '2026-07-01T08:30:00.000Z']);
});

test('an empty calendar is an empty list', () => {
  assert.deepEqual(parseSlots({ data: {}, status: 'success' }), []);
});

test('an answer in another shape is null, never an empty list', () => {
  for (const bad of [
    null,
    'text',
    [],
    {},
    { status: 'error', error: { code: 'NotFoundException', message: 'Event Type not found' } },
    { status: 'success' },
    { status: 'success', data: null },
    { status: 'success', data: [] },
    { status: 'success', data: { '2026-11-23': 'none' } },
  ]) {
    assert.equal(parseSlots(bad), null, JSON.stringify(bad));
  }
});

test('only the first six slots that have not started are kept', () => {
  const day = Array.from({ length: 10 }, (_, i) => at('2026-11-23T09:00:00Z') + i * 30 * 60_000);
  assert.deepEqual(upcoming(day, at('2026-11-21T06:00:00Z')).map(toIso), [
    '2026-11-23T09:00:00.000Z',
    '2026-11-23T09:30:00.000Z',
    '2026-11-23T10:00:00.000Z',
    '2026-11-23T10:30:00.000Z',
    '2026-11-23T11:00:00.000Z',
    '2026-11-23T11:30:00.000Z',
  ]);
  // At 10:00 UTC the 09:00, 09:30 and 10:00 slots have started.
  const later = upcoming(day, at('2026-11-23T10:00:00Z'));
  assert.equal(toIso(later[0]), '2026-11-23T10:30:00.000Z');
  assert.equal(later.length, 6);
  assert.deepEqual(upcoming(day, at('2026-11-24T00:00:00Z')), []);
});
