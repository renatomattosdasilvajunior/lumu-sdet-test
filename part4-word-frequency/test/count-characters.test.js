const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { countCharacters } = require('../src/count-characters');
const { tokenize } = require('../src/tokenize');
const { readTextFile, normalizeText } = require('../src/read-text-file');

const EJEMPLO = path.join(__dirname, '..', 'ejemplo.txt');

// Crea un archivo temporal, corre la prueba y siempre borra la carpeta.
function withTempFile(content, fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wf-test-'));
  const file = path.join(dir, 'entrada.txt');
  try {
    fs.writeFileSync(file, content);
    return fn(file);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// [nombre, texto, caracteres esperados]
const CASES = [
  ['😀 cuenta 1', '\u{1F600}', 1],
  ['❤️ (corazón + selector) cuenta 2', '\u2764\uFE0F', 2],
  ['👨‍👩‍👧 (familia) cuenta 5', '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}', 5],
  ['é compuesta cuenta 1', '\u00E9', 1],
  ['e + acento suelto sin normalizar cuenta 2', 'e\u0301', 2],
  ['e + acento suelto normalizada cuenta 1', normalizeText('e\u0301'), 1],
  ['saltos de Windows no cuentan', 'hola\r\nmundo\r\n', 9],
  ['tres espacios', '   ', 3],
  ['un tab cuenta 1', 'a\tb', 3],
  ['vacío', '', 0],
  ['m²', 'm²', 2],
  ['1º', '1º', 2],
  ['2024 123 3.14', '2024 123 3.14', 13],
  ['covid-19 abc123def', 'covid-19 abc123def', 18],
];

for (const [name, text, expected] of CASES) {
  test(`countCharacters: ${name}`, () => {
    assert.equal(countCharacters(text), expected);
  });
}

test('ejemplo.txt (saltos de Windows) tiene 116 caracteres', () => {
  assert.equal(countCharacters(readTextFile(EJEMPLO)), 116);
});

test('el conteo no cambia entre \\n y \\r\\n, ni con o sin salto final', () => {
  const base = 'uno dos\ntres 😀\n\ncuatro';
  const variants = [base, base.replaceAll('\n', '\r\n'), base + '\n', base.replaceAll('\n', '\r\n') + '\r\n'];
  for (const v of variants) assert.equal(countCharacters(v), countCharacters(base));
});

test('readTextFile quita el BOM: no cuenta como carácter', () => {
  const bytes = Buffer.concat([Buffer.from([0xEF, 0xBB, 0xBF]), Buffer.from('hola', 'utf8')]);
  withTempFile(bytes, (file) => {
    const text = readTextFile(file);
    assert.equal(text, 'hola');
    assert.equal(countCharacters(text), 4);
  });
});

test('readTextFile normaliza a NFC: e + acento suelto cuenta 1', () => {
  withTempFile(Buffer.from('cafe\u0301', 'utf8'), (file) => {
    assert.equal(countCharacters(readTextFile(file)), 4);
  });
});

test('readTextFile convierte el apóstrofe tipográfico en normal', () => {
  withTempFile(Buffer.from('don\u2019t', 'utf8'), (file) => {
    const text = readTextFile(file);
    assert.equal(text, "don't");
    assert.deepEqual(tokenize(text), ["don't"]);
  });
});

test('bytes inválidos salen como U+FFFD: cuentan como carácter y separan', () => {
  withTempFile(Buffer.from([0x68, 0xFF, 0x69]), (file) => {
    const text = readTextFile(file);
    assert.equal(text, 'h\uFFFDi');
    assert.equal(countCharacters(text), 3);
    assert.deepEqual(tokenize(text), ['h', 'i']);
  });
});