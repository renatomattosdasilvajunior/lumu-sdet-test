const { readTextFile } = require('./src/read-text-file');
const { tokenize } = require('./src/tokenize');
const { countCharacters } = require('./src/count-characters');
const { countFrequencies } = require('./src/frequencies');
const { countingSortDescending } = require('./src/counting-sort');
const { formatDefault, formatBars } = require('./src/format-output');

const USAGE = 'Uso: node word-frequency.js <archivo.txt> [--bars]';

// Revisa los argumentos y devuelve { filePath, bars }.
// Si algo está mal, lanza un error con un mensaje claro (no imprime nada).
function parseArgs(argv) {
  let filePath = null;
  let bars = false;

  for (const arg of argv) {
    if (arg === '--bars') {
      bars = true; // puede ir antes o después de la ruta
    } else if (arg.startsWith('-')) {
      throw new Error(`Opción desconocida: "${arg}"\n${USAGE}`);
    } else if (filePath === null) {
      filePath = arg;
    } else {
      throw new Error(`Se recibió más de un archivo: "${filePath}" y "${arg}"\n${USAGE}`);
    }
  }

  if (filePath === null) {
    throw new Error(`Falta la ruta del archivo.\n${USAGE}`);
  }
  return { filePath, bars };
}

function main() {
  try {
    const { filePath, bars } = parseArgs(process.argv.slice(2));
    const text = readTextFile(filePath);
    const words = tokenize(text);
    const sorted = countingSortDescending(Array.from(countFrequencies(words)));

    // Un solo lugar decide el formato; el total sale de words.length.
    const format = bars ? formatBars : formatDefault;
    console.log(format(words.length, countCharacters(text), sorted));
  } catch (error) {
    // Los errores van al canal de errores, no a la salida normal.
    console.error(error.message);
    process.exitCode = 1;
  }
}

// main solo corre si ejecutas este archivo con node.
// Si otro archivo lo importa (las pruebas), no arranca solo.
if (require.main === module) main();

module.exports = { parseArgs, main };