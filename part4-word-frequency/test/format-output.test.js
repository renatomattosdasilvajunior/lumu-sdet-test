const test = require('node:test');
const assert = require('node:assert/strict');
const { tokenize } = require('../src/tokenize');
const { countCharacters } = require('../src/count-characters');
const { countFrequencies } = require('../src/frequencies');
const { countingSortDescending } = require('../src/counting-sort');
const { formatDefault, formatBars, barLength } = require('../src/format-output');

// Arma lo que main le pasa a las funciones de salida.
function analyze(text) {
  const words = tokenize(text);
  return [words.length, countCharacters(text), countingSortDescending(Array.from(countFrequencies(words)))];
}

const EJEMPLO = 'lumu lumu lumu lumu lumu illuminates illuminates attacks and adversaries\nlumu illuminates all attacks and adversaries';

test('salida normal del ejemplo del enunciado', () => {
  const expected = ['16 words', '116 characters', 'lumu: 6', 'illuminates: 3', 'attacks: 2', 'and: 2', 'adversaries: 2', 'all: 1'].join('\n');
  assert.equal(formatDefault(...analyze(EJEMPLO)), expected);
});

test('salida --bars del ejemplo del enunciado', () => {
  const expected = [
    '16 words', '116 characters',
    'lumu        ###### 6',
    'illuminates ### 3',
    'attacks     ## 2',
    'and         ## 2',
    'adversaries ## 2',
    'all         # 1',
  ].join('\n');
  assert.equal(formatBars(...analyze(EJEMPLO)), expected);
});

test('archivo vacío: solo las dos primeras líneas, en las dos salidas', () => {
  assert.equal(formatDefault(...analyze('')), '0 words\n0 characters');
  assert.equal(formatBars(...analyze('')), '0 words\n0 characters');
});

test('las funciones devuelven texto y no imprimen', () => {
  const original = console.log;
  let printed = false;
  console.log = () => { printed = true; };
  try {
    assert.equal(typeof formatDefault(...analyze(EJEMPLO)), 'string');
    assert.equal(typeof formatBars(...analyze(EJEMPLO)), 'string');
  } finally {
    console.log = original;
  }
  assert.equal(printed, false);
});

test('escala: la palabra más frecuente mide 40 y la de 1 aparición mide 1', () => {
  const text = 'hola '.repeat(3000) + 'adios';
  const expected = ['3001 words', '15005 characters', `hola  ${'#'.repeat(40)} 3000`, 'adios # 1'].join('\n');
  assert.equal(formatBars(...analyze(text)), expected);
});

test('alineación con acentos y ñ', () => {
  const text = 'canción canción ñandú él él él';
  const expected = ['6 words', '30 characters', 'él      ### 3', 'canción ## 2', 'ñandú   # 1'].join('\n');
  assert.equal(formatBars(...analyze(text)), expected);
});

// [frecuencia, frecuencia más alta, largo esperado]
const BAR_CASES = [
  [100, 100, 40], [50, 100, 20], [7, 100, 3], [3, 100, 1], [1, 100, 1],
  [6, 6, 6], [1, 6, 1], [40, 40, 40], [41, 41, 40], [1, 41, 1],
];
for (const [count, max, expected] of BAR_CASES) {
  test(`barLength(${count}, ${max}) = ${expected}`, () => {
    assert.equal(barLength(count, max), expected);
  });
}