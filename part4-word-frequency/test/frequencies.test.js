const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { readTextFile } = require('../src/read-text-file');
const { tokenize } = require('../src/tokenize');
const { countCharacters } = require('../src/count-characters');
const { countFrequencies } = require('../src/frequencies');
const { countingSortDescending } = require('../src/counting-sort');

// Lo mismo que hace main, pero devolviendo datos en vez de imprimir.
function analyze(text) {
  const words = tokenize(text);
  const pairs = Array.from(countFrequencies(words));
  return { total: words.length, chars: countCharacters(text), sorted: countingSortDescending(pairs), pairs };
}

const EJEMPLO_TEXT = 'lumu lumu lumu lumu lumu illuminates illuminates attacks and adversaries\nlumu illuminates all attacks and adversaries';
const EJEMPLO_FREQ = [['lumu', 6], ['illuminates', 3], ['attacks', 2], ['and', 2], ['adversaries', 2], ['all', 1]];

// [nombre, texto, palabras, caracteres, frecuencias en orden de salida]
const CASES = [
  ['#1 ejemplo del enunciado', EJEMPLO_TEXT, 16, 116, EJEMPLO_FREQ],
  ['#2 mayúsculas', 'Lumu lumu LUMU', 3, 14, [['lumu', 3]]],
  ['#3 puntuación', 'lumu, lumu. lumu!', 3, 17, [['lumu', 3]]],
  ['#4 guion y apóstrofe', "well-known don't stop", 3, 21, [['well-known', 1], ["don't", 1], ['stop', 1]]],
  ['#5 números solos', 'I have 2 cats and 3 dogs', 5, 24, [['i', 1], ['have', 1], ['cats', 1], ['and', 1], ['dogs', 1]]],
  ['#6 una letra es palabra', 'Voy a casa y como', 5, 17, [['voy', 1], ['a', 1], ['casa', 1], ['y', 1], ['como', 1]]],
  ['#7 acentos', 'Está esta ESTÁ Año año', 5, 22, [['está', 2], ['año', 2], ['esta', 1]]],
  ['#8 tab', 'uno\tdos', 2, 7, [['uno', 1], ['dos', 1]]],
  ['#9 emojis', 'Hola \u{1F600} mundo \u{1F600}', 2, 14, [['hola', 1], ['mundo', 1]]],
  ['#10 correo y URL', 'user@example.com https://lumu.io/docs', 7, 37,
    [['user', 1], ['example', 1], ['com', 1], ['https', 1], ['lumu', 1], ['io', 1], ['docs', 1]]],
  ['#11 archivo vacío', '', 0, 0, []],
  ['#12 tres espacios', '   ', 0, 3, []],
  ['#13 saltos de Windows', 'lumu\r\nlumu\r\n', 2, 8, [['lumu', 2]]],
  ['#14 guiones y apóstrofes sueltos', "co-op -hola adiós- 'hey'", 4, 24, [['co-op', 1], ['hola', 1], ['adiós', 1], ['hey', 1]]],
  ['#15 mp3 3D AT&T', 'mp3 3D AT&T', 4, 11, [['mp3', 1], ['3d', 1], ['at', 1], ['t', 1]]],
  ['nuevo: números solos', '2024 123 3.14', 0, 13, []],
  ['nuevo: letras con dígitos', 'covid-19 abc123def', 2, 18, [['covid-19', 1], ['abc123def', 1]]],
  ['m²', 'm²', 1, 2, [['m', 1]]],
  ['1º', '1º', 1, 2, [['1º', 1]]],
  ['10-year', '10-year', 1, 7, [['10-year', 1]]],
  ['2024-2025', '2024-2025', 0, 9, []],
  ['$5', '$5', 0, 2, []],
  ['palabras peligrosas', 'constructor toString hasOwnProperty constructor toString constructor', 6, 68,
    [['constructor', 3], ['tostring', 2], ['hasownproperty', 1]]],
  ['❤️ suelto no es palabra', '\u2764\uFE0F', 0, 2, []],
];

for (const [name, text, words, chars, freq] of CASES) {
  test(`caso ${name}`, () => {
    const result = analyze(text);
    assert.equal(result.total, words, 'total de palabras');
    assert.equal(result.chars, chars, 'total de caracteres');
    assert.deepEqual(result.sorted, freq, 'frecuencias en orden de salida');
  });
}

test('ejemplo.txt leído del disco da 16 palabras, 116 caracteres y las frecuencias', () => {
  const text = readTextFile(path.join(__dirname, '..', 'ejemplo.txt'));
  const result = analyze(text);
  assert.equal(result.total, 16);
  assert.equal(result.chars, 116);
  assert.deepEqual(result.sorted, EJEMPLO_FREQ);
});

test('la suma de frecuencias es igual al total de palabras en todos los casos', () => {
  for (const [name, text] of CASES) {
    const { total, sorted } = analyze(text);
    const sum = sorted.reduce((acc, [, count]) => acc + count, 0);
    assert.equal(sum, total, name);
  }
});

test('el resultado no cambia entre \\n y \\r\\n, ni con o sin salto final', () => {
  const samples = [EJEMPLO_TEXT, 'Hola mundo\nHola\n\nadiós 😀\nmundo'];
  for (const base of samples) {
    const expected = analyze(base);
    const crlf = base.replaceAll('\n', '\r\n');
    for (const variant of [crlf, base + '\n', crlf + '\r\n']) {
      const result = analyze(variant);
      assert.equal(result.total, expected.total);
      assert.equal(result.chars, expected.chars);
      assert.deepEqual(result.sorted, expected.sorted);
    }
  }
});

test('countFrequencies con nombres del prototipo: toString, hasOwnProperty, constructor', () => {
  const freq = countFrequencies(['toString', 'hasOwnProperty', 'constructor', 'toString']);
  assert.deepEqual(Array.from(freq), [['toString', 2], ['hasOwnProperty', 1], ['constructor', 1]]);
});

test('countFrequencies conserva el orden de primera aparición', () => {
  const freq = countFrequencies(['b', 'a', 'b', 'c', 'a', 'b']);
  assert.deepEqual(Array.from(freq), [['b', 3], ['a', 2], ['c', 1]]);
});