// Cuenta cuántas veces aparece cada palabra distinta.
// Devuelve un Map palabra -> cantidad, en orden de primera aparición.
function countFrequencies(words) {
  // Se usa Map y no un objeto: un objeto hereda claves como "constructor"
  // y mezclaría esas claves con las palabras del usuario.
  const counts = new Map();
  for (const word of words) {
    // Si la palabra no está todavía, get devuelve undefined y se parte de 0.
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return counts;
}

module.exports = { countFrequencies };