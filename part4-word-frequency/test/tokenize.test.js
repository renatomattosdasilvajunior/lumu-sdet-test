const test = require('node:test');
const assert = require('node:assert/strict');
const { tokenize } = require('../src/tokenize');
const { normalizeText } = require('../src/read-text-file');

// [entrada, palabras esperadas]
const CASES = [
  ["don't 3D-model", ["don't", '3d-model']],
  ['mp3', ['mp3']],
  ['3D', ['3d']],
  ['covid-19', ['covid-19']],
  ['10-year', ['10-year']],
  ['2024-2025', []],
  ['3.14', []],
  ['$5', []],
  ['2024 123 3.14', []],
  ['AT&T', ['at', 't']],
  ['m²', ['m']],
  ['1º', ['1º']],
  ['-hola adiós-', ['hola', 'adiós']],
  ["co-op -hola adiós- 'hey'", ['co-op', 'hola', 'adiós', 'hey']],
  ['a--b', ['a', 'b']],
  ['covid-19 abc123def', ['covid-19', 'abc123def']],
  ['Lumu lumu LUMU', ['lumu', 'lumu', 'lumu']],
  ['well_known __proto__', ['well', 'known', 'proto']],
  ['user@example.com', ['user', 'example', 'com']],
  ['q\u0303', ['q\u0303']],               // marca pegada a la letra: se conserva
  ['\u0301hola', ['hola']],               // marca suelta al inicio: separa
  ['\u2764\uFE0Fhola', ['hola']],         // ❤️ no deja restos pegados a la palabra
  ['', []],
  ['   ', []],
  ['constructor toString', ['constructor', 'tostring']],
];

for (const [input, expected] of CASES) {
  test(`tokenize ${JSON.stringify(input)}`, () => {
    assert.deepEqual(tokenize(input), expected);
  });
}

// tokenize recibe el texto ya normalizado: solo conoce ' y - normales.
test('tokenize directo no une el apóstrofe tipográfico (U+2019)', () => {
  assert.deepEqual(tokenize('don\u2019t'), ['don', 't']);
});

test('con normalizeText, el apóstrofe tipográfico une la palabra', () => {
  assert.deepEqual(tokenize(normalizeText('don\u2019t')), ["don't"]);
});

test('con normalizeText, los guiones U+2010 y U+2011 unen la palabra', () => {
  assert.deepEqual(tokenize(normalizeText('well\u2010known co\u2011op')), ['well-known', 'co-op']);
});

test('el guion largo y el semicuadratín separan', () => {
  assert.deepEqual(tokenize(normalizeText('uno\u2014dos tres\u2013cuatro')), ['uno', 'dos', 'tres', 'cuatro']);
});

test('e + acento suelto se normaliza a una sola palabra con é', () => {
  assert.deepEqual(tokenize(normalizeText('cafe\u0301')), ['caf\u00E9']);
});