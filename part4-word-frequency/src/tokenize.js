// Cada función clasifica UN solo carácter con propiedades de Unicode.
// Es el único lugar donde usamos expresiones regulares.

// \p{L}: cualquier letra (a, ñ, é, º, 北...).
function isLetter(ch) {
  return /^\p{L}$/u.test(ch);
}

// \p{Nd}: dígito decimal. No incluye ² ni ½, que por eso serán separadores.
function isDigit(ch) {
  return /^\p{Nd}$/u.test(ch);
}

// \p{M}: marca combinante (acento suelto, selector de emoji...).
function isMark(ch) {
  return /^\p{M}$/u.test(ch);
}

function isJoinChar(ch) {
  return ch === '-' || ch === "'";
}

// Una unión es válida si estamos dentro de una palabra (hay algo a la izquierda)
// y el siguiente carácter es letra o dígito (hay algo a la derecha).
function isValidJoin(chars, i, insideWord) {
  if (!isJoinChar(chars[i]) || !insideWord) return false;
  const next = chars[i + 1];
  return next !== undefined && (isLetter(next) || isDigit(next));
}

function tokenize(text) {
  // Array.from separa por puntos de código, así un emoji es 1 elemento y no 2.
  const chars = Array.from(text);
  const words = [];
  let current = '';      // palabra que se está armando
  let hasLetter = false; // ¿la palabra en curso ya tiene alguna letra?

  // Cierra la palabra: se guarda solo si tiene al menos una letra.
  function finishWord() {
    if (current !== '' && hasLetter) words.push(current.toLowerCase());
    current = '';
    hasLetter = false;
  }

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const insideWord = current !== '';

    if (isLetter(ch)) {
      current += ch;
      hasLetter = true;
    } else if (isDigit(ch)) {
      current += ch;
    } else if (isMark(ch) && insideWord) {
      current += ch;
    } else if (isValidJoin(chars, i, insideWord)) {
      current += ch;
    } else {
      finishWord(); // cualquier otro carácter separa
    }
  }
  finishWord(); // el texto puede terminar sin separador final

  return words;
}

module.exports = { tokenize, isLetter, isDigit, isMark, isValidJoin };

