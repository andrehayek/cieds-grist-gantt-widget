import test from 'node:test';
import assert from 'node:assert/strict';
import { getRange, positionPercent, toGristDate } from '../src/utils/date.js';

test('toGristDate écrit une date civile à minuit UTC', () => {
  assert.equal(toGristDate('2026-06-24'), Date.UTC(2026, 5, 24) / 1000);
  assert.equal(toGristDate(''), null);
  assert.equal(toGristDate('24/06/2026'), null);
});

test('positionPercent place le milieu de la fenêtre autour de 50 %', () => {
  const { start, end } = getRange(2024, 2);
  const middle = new Date(2025, 0, 1);
  const value = positionPercent(middle, start, end);
  assert.ok(value > 49.9 && value < 50.1);
});
