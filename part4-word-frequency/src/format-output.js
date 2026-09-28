// Largo máximo de una barra cuando hay que escalar.
const MAX_BAR_LENGTH = 40;

// Largo visible de una palabra, contado por puntos de código.
// Con .length, una letra fuera del plano básico de Unicode contaría 2.
function displayLength(word) {
  return Array.from(word).length;
}

// Las dos primeras líneas son iguales en la salida normal y en --bars.
// Siempre "words" y "characters", sin pluralizar, como en el enunciado.
function formatHeader(totalWords, totalCharacters) {
  return [`${totalWords} words`, `${totalCharacters} characters`];
}

// Salida normal: el encabezado y una línea "palabra: cantidad" por palabra.
function formatDefault(totalWords, totalCharacters, entries) {
  const lines = formatHeader(totalWords, totalCharacters);
  for (const [word, count] of entries) {
    lines.push(`${word}: ${count}`);
  }
  return lines.join('\n');
}

// Si la frecuencia más alta cabe en 40, la barra es exacta.
// Si no, se escala proporcionalmente y nunca baja de 1.
function barLength(count, maxCount) {
  if (maxCount <= MAX_BAR_LENGTH) return count;
  return Math.max(1, Math.round((count * MAX_BAR_LENGTH) / maxCount));
}

// Salida con histograma: "palabra   ###### cantidad", con la columna alineada.
function formatBars(totalWords, totalCharacters, entries) {
  const lines = formatHeader(totalWords, totalCharacters);

  // Una pasada para conocer la frecuencia más alta y la palabra más larga.
  let maxCount = 0;
  let widest = 0;
  for (const [word, count] of entries) {
    if (count > maxCount) maxCount = count;
    const width = displayLength(word);
    if (width > widest) widest = width;
  }

  for (const [word, count] of entries) {
    const padding = ' '.repeat(widest - displayLength(word));
    const bar = '#'.repeat(barLength(count, maxCount));
    lines.push(`${word}${padding} ${bar} ${count}`);
  }
  return lines.join('\n');
}

module.exports = { formatDefault, formatBars, barLength };