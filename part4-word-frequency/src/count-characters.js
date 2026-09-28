// Cuenta los caracteres del texto sin contar los saltos de línea.
// Recibe el texto ya normalizado a NFC (lo hace readTextFile).
function countCharacters(text) {
  let count = 0;
  // for...of recorre por puntos de código: un emoji simple es 1 elemento.
  // Con text.length contaría 2 unidades para el mismo emoji.
  for (const ch of text) {
    // \n y \r no cuentan, así un archivo de Windows (\r\n) da lo mismo que uno de Linux (\n).
    if (ch !== '\n' && ch !== '\r') count++;
  }
  return count;
}

module.exports = { countCharacters };