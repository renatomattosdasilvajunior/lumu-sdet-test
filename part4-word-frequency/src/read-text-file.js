const fs = require('node:fs');

// El BOM es una marca invisible que algunos editores ponen al inicio del archivo.
// No es contenido del usuario, por eso no debe contarse como carácter.
const BOM = '\uFEFF';

function removeBom(text) {
  return text.startsWith(BOM) ? text.slice(1) : text;
}

// Unifica formas distintas de un mismo carácter, siempre de uno a uno,
// así que no cambia la cantidad de caracteres del texto.
function normalizeText(text) {
  // NFC: "e" + acento suelto pasa a ser "é" (un solo carácter).
  let result = text.normalize('NFC');
  // Apóstrofe tipográfico (') pasa a apóstrofe normal, para que don't y don't sean iguales.
  result = result.replaceAll('\u2019', "'");
  // Guiones que se ven igual al normal (U+2010 y U+2011) pasan a "-".
  result = result.replaceAll('\u2010', '-').replaceAll('\u2011', '-');
  return result;
}

// Traduce el código técnico del sistema a un mensaje que el usuario entienda.
function describeReadError(filePath, error) {
  switch (error.code) {
    case 'ENOENT':
      return `No se encontró el archivo: "${filePath}"`;
    case 'EISDIR':
      return `La ruta es una carpeta, no un archivo: "${filePath}"`;
    case 'EACCES':
    case 'EPERM':
      return `No hay permiso para leer el archivo: "${filePath}"`;
    default:
      return `No se pudo leer el archivo "${filePath}": ${error.message}`;
  }
}

function readTextFile(filePath) {
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    throw new Error(describeReadError(filePath, error));
  }
  return normalizeText(removeBom(raw));
}

module.exports = { readTextFile, normalizeText };