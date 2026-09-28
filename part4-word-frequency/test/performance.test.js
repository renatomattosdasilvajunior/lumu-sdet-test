//      Cómo evitar que falle de forma intermitente cuando rodar en otra maquina
//      No pongas un límite ajustado, como 100 ms. Un antivirus en Windows, otro programa usando el procesador o una computadora lenta lo harían fallar a veces sin que haya un error real.
//      La comprobación principal es el resultado correcto: 50.000 palabras, suma de frecuencias igual y orden descendente. Eso nunca depende de la velocidad.
//      El tiempo del programa completo (incluye arrancar Node) solo se imprime y no tiene límite.
//      Comparar contra el doble de tamaño tampoco es buena idea, porque también es sensible al ruido.

const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { readTextFile } = require('../src/read-text-file');
const { tokenize } = require('../src/tokenize');
const { countCharacters } = require('../src/count-characters');
const { countFrequencies } = require('../src/frequencies');
const { countingSortDescending } = require('../src/counting-sort');
const { formatDefault } = require('../src/format-output');

const TOTAL_WORDS = 50000;
// Límite muy generoso: no mide velocidad, solo detecta una degradación grave
// (por ejemplo, si alguien cambiara el ordenamiento por uno cuadrático).
const LIMIT_MS = 5000;

// Genera 50.000 palabras con semilla fija; unas pocas son muy frecuentes (como en un texto real).
function buildText() {
  let seed = 7;
  const nextRandom = () => (seed = (seed * 16807) % 2147483647);
  const words = [];
  for (let i = 0; i < TOTAL_WORDS; i++) {
    const r = nextRandom() / 2147483647;
    words.push('w' + Math.floor(8000 * r * r * r)); // más peso en los primeros números
  }
  // Un salto de línea cada 10 palabras.
  const lines = [];
  for (let i = 0; i < words.length; i += 10) lines.push(words.slice(i, i + 10).join(' '));
  return lines.join('\n');
}

const ms = (start) => Number(process.hrtime.bigint() - start) / 1e6;

test('50.000 palabras: resultado correcto y tiempo por etapa', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wf-perf-'));
  try {
    const file = path.join(dir, 'grande.txt');
    fs.writeFileSync(file, buildText());

    const times = {};
    let mark = process.hrtime.bigint();
    const text = readTextFile(file);
    times.leer = ms(mark);
    mark = process.hrtime.bigint();
    const words = tokenize(text);
    times.separar = ms(mark);
    mark = process.hrtime.bigint();
    const chars = countCharacters(text);
    times.caracteres = ms(mark);
    mark = process.hrtime.bigint();
    const pairs = Array.from(countFrequencies(words));
    times.frecuencias = ms(mark);
    mark = process.hrtime.bigint();
    const sorted = countingSortDescending(pairs);
    times.ordenar = ms(mark);
    mark = process.hrtime.bigint();
    formatDefault(words.length, chars, sorted);
    times.salida = ms(mark);
    const total = Object.values(times).reduce((a, b) => a + b, 0);

    const detalle = Object.entries(times).map(([k, v]) => `${k} ${v.toFixed(1)} ms`).join(' | ');
    t.diagnostic(`50.000 palabras (${pairs.length} distintas): total ${total.toFixed(1)} ms -> ${detalle}`);

    // Lo que importa de verdad: que el resultado sea correcto.
    assert.equal(words.length, TOTAL_WORDS);
    assert.equal(sorted.reduce((acc, [, c]) => acc + c, 0), TOTAL_WORDS);
    for (let i = 1; i < sorted.length; i++) assert.ok(sorted[i - 1][1] >= sorted[i][1]);
    // Y solo un límite muy amplio de tiempo.
    assert.ok(total < LIMIT_MS, `tardó ${total.toFixed(0)} ms, límite ${LIMIT_MS} ms`);

    // El programa real, de punta a punta (incluye el arranque de Node).
    mark = process.hrtime.bigint();
    const r = spawnSync(process.execPath, [path.join(__dirname, '..', 'word-frequency.js'), file], { encoding: 'utf8', cwd: os.tmpdir() });
    t.diagnostic(`programa completo con node: ${ms(mark).toFixed(1)} ms`);
    assert.equal(r.status, 0);
    assert.equal(r.stdout.split('\n')[0], '50000 words');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});