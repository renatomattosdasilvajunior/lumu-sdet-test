const test = require('node:test');
const assert = require('node:assert/strict');
const { countingSortDescending } = require('../src/counting-sort');

test('ejemplo de 5 palabras: zebra antes que mango, apple antes que pear', () => {
  const input = [['zebra', 3], ['apple', 1], ['mango', 3], ['kiwi', 2], ['pear', 1]];
  assert.deepEqual(countingSortDescending(input),
    [['zebra', 3], ['mango', 3], ['kiwi', 2], ['apple', 1], ['pear', 1]]);
});

test('empates: zebra apple zebra apple', () => {
  assert.deepEqual(countingSortDescending([['zebra', 2], ['apple', 2]]), [['zebra', 2], ['apple', 2]]);
});

test('lista vacía', () => {
  assert.deepEqual(countingSortDescending([]), []);
});

test('un solo elemento', () => {
  assert.deepEqual(countingSortDescending([['solo', 7]]), [['solo', 7]]);
});

test('todas las frecuencias iguales: el orden no cambia', () => {
  const input = [['c', 2], ['a', 2], ['b', 2], ['d', 2]];
  assert.deepEqual(countingSortDescending(input), input);
});

test('no modifica la lista de entrada', () => {
  const input = [['a', 1], ['b', 3], ['c', 2]];
  const copy = input.map((pair) => [...pair]);
  countingSortDescending(input);
  assert.deepEqual(input, copy);
});

test('5.000 entradas generadas: orden descendente, empates en orden original', () => {
  // Generador con semilla fija: mismo resultado en cualquier computadora.
  let seed = 42;
  const nextRandom = () => (seed = (seed * 16807) % 2147483647);
  const entries = [];
  for (let i = 0; i < 5000; i++) entries.push([`w${i}`, 1 + (nextRandom() % 40)]);

  const sorted = countingSortDescending(entries);
  const originalIndex = new Map(entries.map((e, i) => [e[0], i]));

  assert.equal(sorted.length, entries.length);
  for (let i = 1; i < sorted.length; i++) {
    const [prevWord, prevCount] = sorted[i - 1];
    const [word, count] = sorted[i];
    assert.ok(prevCount >= count, `frecuencias de mayor a menor en la posición ${i}`);
    if (prevCount === count) {
      assert.ok(originalIndex.get(prevWord) < originalIndex.get(word), `empate fuera de orden en la posición ${i}`);
    }
  }
  const sum = (list) => list.reduce((acc, e) => acc + e[1], 0);
  assert.equal(sum(sorted), sum(entries));
});