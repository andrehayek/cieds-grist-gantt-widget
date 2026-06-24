import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProject } from '../src/domain/project.js';

test('une prolongation valide devient la fin effective', () => {
  const project = normalizeProject({
    id: 1,
    Name: 'Projet A',
    StartDate: '2024-01-01',
    EndDate: '2025-01-01',
    Extended: true,
    ExtensionDate: '2025-06-01'
  });
  assert.equal(project.Extended, true);
  assert.equal(project.hasInvalidExtension, false);
  assert.equal(project.EffectiveEnd.getFullYear(), 2025);
  assert.equal(project.EffectiveEnd.getMonth(), 5);
});

test('un projet déclaré prolongé sans date reste détectable comme incohérent', () => {
  const project = normalizeProject({
    id: 2,
    Name: 'Projet B',
    StartDate: '2024-01-01',
    EndDate: '2025-01-01',
    Extended: true,
    ExtensionDate: null
  });
  assert.equal(project.Extended, true);
  assert.equal(project.hasInvalidExtension, true);
  assert.equal(project.EffectiveEnd.getTime(), project.EndDate.getTime());
});

test('la date de mi-temps Grist sert de jalon lorsque le jalon 2 est vide', () => {
  const project = normalizeProject({
    id: 3,
    Name: 'Projet C',
    StartDate: '2024-01-01',
    EndDate: '2026-01-01',
    HalfTime: '2024-11-15'
  });
  assert.equal(project.Milestone2Date.getFullYear(), 2024);
  assert.equal(project.Milestone2Date.getMonth(), 10);
  assert.equal(project.Milestone2Date.getDate(), 15);
});
