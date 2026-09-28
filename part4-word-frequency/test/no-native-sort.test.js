const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');

// Detecta ".sort(" (con espacios opcionales) y "toSorted(".
const FORBIDDEN = new RegExp(String.raw`\.\s*sort\s*\(|toSorted\s*\(`);

const files = [
  path.join(ROOT, 'word-frequency.js'),
  ...fs.readdirSync(SRC).filter((name) => name.endsWith('.js')).map((name) => path.join(SRC, name)),
];

test('se están revisando word-frequency.js y todos los archivos de src/', () => {
  assert.equal(files.length, 7);
});

test('el detector sí reconoce lo prohibido (evita un test que nunca falla)', () => {
  assert.ok(FORBIDDEN.test(['lista', 'sort('].join('.') + ')'));
  assert.ok(FORBIDDEN.test('lista.' + 'toSorted()'));
  assert.ok(FORBIDDEN.test('lista . sort ( )'));
  assert.equal(FORBIDDEN.test('countingSortDescending(entries)'), false);
});

for (const file of files) {
  test(`sin funciones nativas de ordenamiento: ${path.relative(ROOT, file)}`, () => {
    const content = fs.readFileSync(file, 'utf8');
    assert.equal(FORBIDDEN.test(content), false);
  });
}