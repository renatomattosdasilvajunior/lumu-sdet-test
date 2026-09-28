// Ordena pares [palabra, cantidad] de mayor a menor cantidad.
// Es estable: con la misma cantidad, se conserva el orden de entrada.
// Supone cantidades enteras mayores o iguales a 1.
function countingSortDescending(entries) {
  if (entries.length === 0) return [];

  // Paso 1: la frecuencia más alta define el tamaño de la tabla.
  let maxFreq = 0;
  for (const [, freq] of entries) {
    if (freq > maxFreq) maxFreq = freq;
  }

    // Paso 2: groupSize[f] = cuántas palabras tienen frecuencia f.
  // Se usa la frecuencia como índice; la posición 0 no se usa.
  const groupSize = new Array(maxFreq + 1).fill(0);
  for (const [, freq] of entries) {
    groupSize[freq]++;
  }

    // Paso 3: startPosition[f] = dónde empieza el grupo de frecuencia f.
  // Se recorre de la frecuencia más alta a la más baja para que el
  // resultado quede de mayor a menor.
  const startPosition = new Array(maxFreq + 1).fill(0);
  let next = 0;
  for (let freq = maxFreq; freq >= 1; freq--) {
    startPosition[freq] = next;
    next += groupSize[freq];
  }

    // Paso 4: recorrer en el orden original (clave de la estabilidad) y
  // poner cada par en la posición libre más baja de su grupo.
  const result = new Array(entries.length);
  for (const entry of entries) {
    const freq = entry[1];
    result[startPosition[freq]] = entry;
    startPosition[freq]++;
  }
  return result;
}

module.exports = { countingSortDescending };