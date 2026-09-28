const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const SCRIPT = path.join(__dirname, '..', 'word-frequency.js');
const EJEMPLO = path.join(__dirname, '..', 'ejemplo.txt');
const USO = 'Uso: node word-frequency.js <archivo.txt> [--bars]';

// Ejecuta el programa real desde otra carpeta, para no depender del cwd.
function run(...args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8', cwd: os.tmpdir() });
}

// Carpeta temporal que siempre se borra al terminar.
function withTempDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wf-cli-'));
  try {
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const SALIDA_NORMAL = ['16 words', '116 characters', 'lumu: 6', 'illuminates: 3', 'attacks: 2', 'and: 2', 'adversaries: 2', 'all: 1'].join('\n') + '\n';
const SALIDA_BARS = ['16 words', '116 characters', 'lumu        ###### 6', 'illuminates ### 3', 'attacks     ## 2', 'and         ## 2', 'adversaries ## 2', 'all         # 1'].join('\n') + '\n';

test('ejecución normal: salida exacta, código 0 y nada en el canal de errores', () => {
  const r = run(EJEMPLO);
  assert.equal(r.status, 0);
  assert.equal(r.stdout, SALIDA_NORMAL);
  assert.equal(r.stderr, '');
});

test('--bars después de la ruta', () => {
  const r = run(EJEMPLO, '--bars');
  assert.equal(r.status, 0);
  assert.equal(r.stdout, SALIDA_BARS);
  assert.equal(r.stderr, '');
});

test('--bars antes de la ruta da lo mismo', () => {
  assert.equal(run('--bars', EJEMPLO).stdout, SALIDA_BARS);
});

test('archivo vacío: 0 words, 0 characters, sin errores', () => {
  withTempDir((dir) => {
    const file = path.join(dir, 'vacio.txt');
    fs.writeFileSync(file, '');
    const r = run(file);
    assert.equal(r.status, 0);
    assert.equal(r.stdout, '0 words\n0 characters\n');
    assert.equal(r.stderr, '');
  });
});

test('sin argumentos: mensaje de uso por stderr y código 1', () => {
  const r = run();
  assert.equal(r.status, 1);
  assert.equal(r.stdout, '');
  assert.equal(r.stderr, `Falta la ruta del archivo.\n${USO}\n`);
});

test('opción desconocida --foo: mensaje y código 1', () => {
  const r = run(EJEMPLO, '--foo');
  assert.equal(r.status, 1);
  assert.equal(r.stdout, '');
  assert.equal(r.stderr, `Opción desconocida: "--foo"\n${USO}\n`);
});

test('dos rutas: mensaje y código 1', () => {
  const r = run(EJEMPLO, 'otro.txt');
  assert.equal(r.status, 1);
  assert.equal(r.stdout, '');
  assert.match(r.stderr, /Se recibió más de un archivo/);
  assert.match(r.stderr, /Uso: node word-frequency\.js/);
});

test('archivo inexistente: mensaje claro y código 1', () => {
  withTempDir((dir) => {
    const missing = path.join(dir, 'noexiste.txt');
    const r = run(missing);
    assert.equal(r.status, 1);
    assert.equal(r.stdout, '');
    assert.equal(r.stderr, `No se encontró el archivo: "${missing}"\n`);
  });
});

test('una carpeta en lugar de un archivo: mensaje claro y código 1', () => {
  withTempDir((dir) => {
    const r = run(dir);
    assert.equal(r.status, 1);
    assert.equal(r.stdout, '');
    assert.equal(r.stderr, `La ruta es una carpeta, no un archivo: "${dir}"\n`);
  });
});