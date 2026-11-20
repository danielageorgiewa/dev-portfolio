import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  candidateSlots,
  freeSlots,
  overlaps,
  sofiaTimeToUtc,
  sofiaWallClock,
  toIso,
} from '../functions/_lib/slots.ts';

const at = (iso: string) => Date.parse(iso);
const sofiaDay = (ms: number) => {
  const w = sofiaWallClock(ms);
  return `${w.year}-${String(w.month).padStart(2, '0')}-${String(w.day).padStart(2, '0')}`;
};
const sofiaTime = (ms: number) => {
  const w = sofiaWallClock(ms);
  return `${String(w.hour).padStart(2, '0')}:${String(w.minute).padStart(2, '0')}`;
};

test('wall clock conversion follows the Sofia offset in winter and summer', () => {
  assert.equal(toIso(sofiaTimeToUtc(2026, 11, 25, 11 * 60)), '2026-11-25T09:00:00.000Z'); // EET, UTC+2
  assert.equal(toIso(sofiaTimeToUtc(2026, 7, 1, 11 * 60)), '2026-07-01T08:00:00.000Z'); // EEST, UTC+3
});

test('a week has ten slots a day, Monday to Friday, 11:00 to 15:30 Sofia time', () => {
  // Saturday 21 Nov 2026, 08:00 in Sofia.
  const slots = candidateSlots(at('2026-11-21T06:00:00Z'));
  assert.equal(slots.length, 50);

  const days = [...new Set(slots.map(sofiaDay))];
  assert.deepEqual(days, ['2026-11-23', '2026-11-24', '2026-11-25', '2026-11-26', '2026-11-27']);

  const monday = slots.filter((s) => sofiaDay(s) === '2026-11-23').map(sofiaTime);
  assert.deepEqual(monday, [
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  ]);
  assert.equal(toIso(slots[0]), '2026-11-23T09:00:00.000Z');
});

test('weekends never appear', () => {
  for (const now of ['2026-11-20T06:00:00Z', '2026-11-21T06:00:00Z', '2026-11-22T20:00:00Z']) {
    for (const slot of candidateSlots(at(now))) {
      const weekday = new Date(sofiaTimeToUtc(...ymd(slot), 12 * 60)).getUTCDay();
      assert.ok(weekday >= 1 && weekday <= 5, `${toIso(slot)} is on a weekend`);
    }
  }
});

function ymd(ms: number): [number, number, number] {
  const w = sofiaWallClock(ms);
  return [w.year, w.month, w.day];
}

test('the last slot of a day starts at 15:30 and ends at 16:00', () => {
  const slots = candidateSlots(at('2026-11-21T06:00:00Z'));
  const friday = slots.filter((s) => sofiaDay(s) === '2026-11-27');
  assert.equal(sofiaTime(friday.at(-1)!), '15:30');
  assert.ok(slots.every((s) => sofiaTime(s) >= '11:00' && sofiaTime(s) <= '15:30'));
});

test('slots are in ascending order with no duplicates', () => {
  const slots = candidateSlots(at('2026-11-18T13:20:00Z'));
  assert.deepEqual(slots, [...new Set(slots)].sort((a, b) => a - b));
});

test('autumn clock change: 11:00 Sofia moves from 08:00 UTC to 09:00 UTC', () => {
  // Thursday 22 Oct 2026. Clocks go back on Sunday 25 Oct.
  const slots = candidateSlots(at('2026-10-22T00:00:00Z'));
  const first = (day: string) => toIso(slots.find((s) => sofiaDay(s) === day)!);
  assert.equal(first('2026-10-23'), '2026-10-23T08:00:00.000Z');
  assert.equal(first('2026-10-26'), '2026-10-26T09:00:00.000Z');
  assert.ok(slots.every((s) => sofiaTime(s) >= '11:00' && sofiaTime(s) <= '15:30'));
  assert.equal(slots.length, 50);
});

test('spring clock change: 11:00 Sofia moves from 09:00 UTC to 08:00 UTC', () => {
  // Thursday 26 Mar 2026. Clocks go forward on Sunday 29 Mar.
  const slots = candidateSlots(at('2026-03-26T00:00:00Z'));
  const first = (day: string) => toIso(slots.find((s) => sofiaDay(s) === day)!);
  assert.equal(first('2026-03-27'), '2026-03-27T09:00:00.000Z');
  assert.equal(first('2026-03-30'), '2026-03-30T08:00:00.000Z');
  assert.ok(slots.every((s) => sofiaTime(s) >= '11:00' && sofiaTime(s) <= '15:30'));
  assert.equal(slots.length, 50);
});

test('lead time: nothing starts within two hours of now', () => {
  // Monday 23 Nov 2026, 10:10 in Sofia. Earliest allowed start is 12:10, so 12:30 is first.
  const slots = candidateSlots(at('2026-11-23T08:10:00Z'));
  assert.equal(toIso(slots[0]), '2026-11-23T10:30:00.000Z');
  // Exactly two hours ahead is allowed.
  assert.equal(toIso(candidateSlots(at('2026-11-23T07:00:00Z'))[0]), '2026-11-23T09:00:00.000Z');
  // One second later it is not.
  assert.equal(toIso(candidateSlots(at('2026-11-23T07:00:01Z'))[0]), '2026-11-23T09:30:00.000Z');
});

test('the window closes seven days from now', () => {
  // Monday 23 Nov 2026, 12:00 in Sofia.
  const slots = candidateSlots(at('2026-11-23T10:00:00Z'));
  assert.equal(toIso(slots.at(-1)!), '2026-11-30T09:30:00.000Z');
});

test('busy time removes every slot it touches, and only those', () => {
  const nine = at('2026-11-23T09:00:00Z');
  const half = at('2026-11-23T09:30:00Z');
  const ten = at('2026-11-23T10:00:00Z');

  // 09:15 to 09:45 touches both the 09:00 and the 09:30 slot.
  const busy = [{ start: at('2026-11-23T09:15:00Z'), end: at('2026-11-23T09:45:00Z') }];
  assert.equal(overlaps(nine, busy), true);
  assert.equal(overlaps(half, busy), true);
  assert.equal(overlaps(ten, busy), false);

  // Back to back is not an overlap.
  assert.equal(overlaps(half, [{ start: nine, end: half }]), false);
  assert.equal(overlaps(nine, [{ start: half, end: ten }]), false);

  assert.deepEqual(freeSlots([nine, half, ten], busy), [ten]);
});

test('only the first six free slots are returned', () => {
  const candidates = candidateSlots(at('2026-11-21T06:00:00Z'));
  const free = freeSlots(candidates, []);
  assert.equal(free.length, 6);
  assert.deepEqual(free, candidates.slice(0, 6));

  // With the whole of Monday busy, the six come from Tuesday.
  const monday = [{ start: at('2026-11-23T00:00:00Z'), end: at('2026-11-24T00:00:00Z') }];
  const later = freeSlots(candidates, monday);
  assert.equal(later.length, 6);
  assert.equal(toIso(later[0]), '2026-11-24T09:00:00.000Z');
});

test('a fully busy week gives no slots', () => {
  const candidates = candidateSlots(at('2026-11-21T06:00:00Z'));
  const week = [{ start: at('2026-11-21T00:00:00Z'), end: at('2026-12-01T00:00:00Z') }];
  assert.deepEqual(freeSlots(candidates, week), []);
});
