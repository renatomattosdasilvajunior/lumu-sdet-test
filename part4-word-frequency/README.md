# Parte 4: Word Frequency Counter (frecuencia de palabras)

Programa en Node.js que lee un archivo de texto, cuenta cuántas veces aparece cada palabra y muestra las palabras ordenadas de la más frecuente a la menos frecuente. Cuando dos palabras aparecen la misma cantidad de veces, salen en el orden en que aparecieron por primera vez en el archivo.

El ordenamiento está escrito desde cero (counting sort). El programa no usa ninguna función de ordenamiento de JavaScript ni librerías externas.

## Qué muestra el programa

1. La cantidad total de palabras (`words`).
2. La cantidad total de caracteres (`characters`), sin contar los saltos de línea.
3. Una línea por cada palabra distinta con su cantidad, de mayor a menor.

Con la opción `--bars`, cada palabra se muestra con una barra de símbolos `#`, como un histograma.

## Requisitos

* Node.js versión 20 o superior. Para revisar la versión instalada, ejecute en una terminal:

```
node --version
```

Debe aparecer algo como `v18.19.0`, `v20.11.0` o un número mayor.

* No hay que instalar nada más. El programa no tiene dependencias, así que no se necesita `npm install` ni conexión a internet.

## Cómo correrlo

Los comandos son los mismos en Windows (PowerShell o cmd), Mac y Linux.

1. Abra una terminal dentro de la carpeta `part4-word-frequency`.
2. Ejecute el programa con la ruta del archivo de texto:

```
node word-frequency.js ejemplo.txt
```

Para ver el histograma, agregue `--bars`. Puede ir antes o después de la ruta, el resultado es el mismo:

```
node word-frequency.js ejemplo.txt --bars
```

Si la ruta tiene espacios, escríbala entre comillas:

```
node word-frequency.js "mis documentos/texto.txt"
```

### Archivo de ejemplo

La carpeta incluye `ejemplo.txt`, con estas dos líneas:

```
lumu lumu lumu lumu lumu illuminates illuminates attacks and adversaries
lumu illuminates all attacks and adversaries
```

### Salida normal

```
16 words
116 characters
lumu: 6
illuminates: 3
attacks: 2
and: 2
adversaries: 2
all: 1
```

Las palabras `attacks`, `and` y `adversaries` aparecen 2 veces cada una. Salen en ese orden porque en el archivo aparecen en ese orden.

### Salida con `--bars`

```
16 words
116 characters
lumu        ###### 6
illuminates ### 3
attacks     ## 2
and         ## 2
adversaries ## 2
all         # 1
```

Cómo leer el histograma:

* Las barras empiezan todas en la misma columna. El ancho lo marca la palabra más larga.
* Cuando la palabra más frecuente aparece 40 veces o menos, cada `#` es una aparición.
* Cuando aparece más de 40 veces, las barras se escalan para que la más larga mida 40 símbolos. Ninguna palabra queda sin barra: la mínima es un `#`.

## Errores de uso

Los mensajes de error salen por el canal de errores y el programa termina con código de salida 1. Cuando todo sale bien, el código es 0.

| Qué se hizo | Mensaje |
|---|---|
| No escribir ninguna ruta | `Falta la ruta del archivo.` y la línea de uso |
| Escribir una opción que no existe, como `--foo` | `Opción desconocida: "--foo"` y la línea de uso |
| Escribir dos rutas | `Se recibió más de un archivo: "a.txt" y "b.txt"` y la línea de uso |
| Escribir una ruta que no existe | `No se encontró el archivo: "noexiste.txt"` |
| Escribir la ruta de una carpeta | `La ruta es una carpeta, no un archivo: "src"` |

La línea de uso dice: `Uso: node word-frequency.js <archivo.txt> [--bars]`.

Para ver el código de salida del último comando:

| Sistema | Comando |
|---|---|
| Windows PowerShell | `$LASTEXITCODE` |
| Windows cmd | `echo %errorlevel%` |
| Mac y Linux | `echo $?` |

Un archivo vacío no es un error. El resultado es `0 words` y `0 characters`, sin líneas de palabras.

## Cómo correr las pruebas

El proyecto usa el ejecutor de pruebas que ya trae Node, así que tampoco hay que instalar nada. Desde la carpeta `part4-word-frequency`:

```
npm test
```

Debe aparecer una línea con una marca de aprobado por cada prueba y, al final, un resumen con estos números:

```
tests 121
pass 121
fail 0
```

El formato exacto del resumen cambia un poco según la versión de Node, pero los tres números deben ser esos. Si alguna prueba falla, aparece marcada con una equis y se muestra la diferencia entre lo esperado y lo obtenido.

Las pruebas incluyen:

* Los casos de lectura de palabras (puntuación, mayúsculas, guiones, números, emojis, acentos, correos y direcciones web).
* El conteo de caracteres, con archivos de Windows y de Linux.
* El ordenamiento, con empates y con una lista generada de 5.000 entradas.
* La salida exacta, con y sin `--bars`.
* El programa real ejecutado desde la terminal, incluidos los errores de uso.
* Una revisión de que ningún archivo del programa usa funciones de ordenamiento de JavaScript.
* Una prueba de rendimiento que genera un archivo de 50.000 palabras y muestra cuánto tarda cada etapa.

Las pruebas crean sus archivos temporales en la carpeta temporal del sistema y los borran solas. Se pueden correr desde cualquier carpeta con `npm test --prefix ruta/a/part4-word-frequency`.

Si prefiere no usar npm, este comando hace lo mismo:

```
node --test
```

## Estructura de archivos

```
part4-word-frequency/
├── word-frequency.js          Punto de entrada: lee los argumentos y une todas las piezas
├── package.json               Nombre del proyecto y el comando "npm test" (sin dependencias)
├── ejemplo.txt                Texto de ejemplo del enunciado
├── README.md                  Este documento
├── src/
│   ├── read-text-file.js      Lee el archivo, quita la marca BOM y unifica formas de un mismo carácter
│   ├── tokenize.js            Separa el texto en palabras, carácter por carácter
│   ├── count-characters.js    Cuenta los caracteres del texto
│   ├── frequencies.js         Cuenta cuántas veces aparece cada palabra distinta
│   ├── counting-sort.js       Ordena de mayor a menor frecuencia, desde cero
│   └── format-output.js       Arma el texto de salida, normal y con barras
└── test/
    ├── tokenize.test.js       Pruebas de la separación de palabras
    ├── count-characters.test.js  Pruebas del conteo de caracteres y la lectura
    ├── frequencies.test.js    Los 15 casos de la tabla, casos nuevos y propiedades
    ├── counting-sort.test.js  Pruebas del ordenamiento
    ├── format-output.test.js  Pruebas de la salida exacta
    ├── cli.test.js            Pruebas del programa real y sus errores de uso
    ├── no-native-sort.test.js Revisa que no se usen funciones de ordenamiento nativas
    └── performance.test.js    Prueba con 50.000 palabras y medición de tiempo
```

## Asunciones y reglas de lectura

Estas reglas definen qué cuenta como palabra y qué cuenta como carácter. Se aplican igual al total de palabras, al conteo de caracteres y a las frecuencias, para que los tres resultados siempre sean coherentes entre sí. Cada regla lleva su motivo.

1. **Codificación.** El archivo se lee como UTF-8 y se ignora la marca BOM del inicio. Los bytes que no son UTF-8 válido se convierten en el carácter de reemplazo U+FFFD, que cuenta como carácter, no es letra y separa palabras. UTF-16 no está soportado. Motivo: UTF-8 es el estándar actual y el BOM es una marca del editor, no contenido del usuario.

2. **Normalización.** El texto se normaliza a NFC antes de procesarlo. Además, el apóstrofe tipográfico (U+2019) se cambia por el apóstrofe normal, y los guiones U+2010 y U+2011 por el guion normal. Motivo: son formas distintas de escribir el mismo carácter, y así una letra con acento escrita en dos partes cuenta como un solo carácter y como la misma palabra.

3. **Palabra.** Una palabra es una secuencia de letras y dígitos Unicode que tiene al menos una letra. Todo lo demás (espacios, tabs, saltos de línea, puntuación, emojis y símbolos) la separa. Una marca combinante (por ejemplo, un acento suelto) se acepta solo si viene pegada a una letra o dígito anterior. Motivo: una sola regla sin excepciones es más fácil de explicar, probar y aplicar de forma consistente.

4. **Guiones y apóstrofes.** Un `-` o un `'` es parte de la palabra solo si es único y tiene una letra o un dígito a cada lado, como en `well-known`, `don't`, `covid-19` y `10-year`. Si está al inicio, al final o repetido, separa. El guion largo y el semicuadratín separan siempre. Motivo: así se conservan las palabras compuestas y las contracciones sin arrastrar signos sueltos como `-hola` o `hey'`.

5. **Mayúsculas y minúsculas.** `Lumu`, `lumu` y `LUMU` son la misma palabra. Se pasa a minúscula con la conversión estándar de JavaScript, sin reglas de ningún idioma, y las palabras se muestran en minúscula. Motivo: la mayúscula depende de la posición en la frase y no cambia el significado de la palabra.

6. **Acentos y ñ.** Los acentos y la ñ se conservan, así que `está` y `esta` son palabras distintas. Motivo: en español el acento cambia el significado.

7. **Sin longitud mínima.** Una sola letra es una palabra (`a`, `y`, `I`). En otra parte de esta prueba se usó una regla hipotética de mínimo 2 letras para validar otro sitio. Este programa es general y no aplica ese mínimo. Motivo: `a`, `y`, `o` e `I` son palabras reales, y un mínimo arbitrario alteraría el total y las frecuencias.

8. **Números.** Un número solo (`123`, `2024`, `3.14`) no es una palabra, pero sus caracteres sí cuentan en el total de caracteres. Un número pegado a letras forma parte de la palabra (`mp3`, `3D`, `covid19`, `abc123def`). Dos números unidos por un guion (`2024-2025`) tampoco son palabra, porque no tienen ninguna letra. `1º` es una palabra, porque `º` es una letra en Unicode. En `m²`, el `²` no es un dígito decimal, así que separa y queda solo `m`. Motivo: exigir al menos una letra deja claro qué es una palabra y qué es solo una cifra.

9. **Emojis y símbolos.** Los emojis y los símbolos (`$`, `&`, `@`, `%`) no son palabras y actúan como separadores, así que `AT&T` se cuenta como `at` y `t`. Sí cuentan como caracteres. Motivo: es lo mismo que se hace con la puntuación, y evita reglas especiales por símbolo.

10. **Correos, direcciones web y rutas.** Se separan por sus símbolos: `user@example.com` da `user`, `example` y `com`. Motivo: reconocerlos con fiabilidad exige reglas frágiles que fallan con casos reales.

11. **Caracteres.** Se cuentan todos los caracteres del texto (puntos de código Unicode, después de la normalización NFC) menos los saltos de línea `\n` y `\r`. Espacios, tabs, puntuación, dígitos y símbolos cuentan 1 cada uno. Un emoji simple (😀) cuenta 1, y un emoji compuesto cuenta uno por cada punto de código que lo forma: ❤️ cuenta 2 y 👨‍👩‍👧 cuenta 5. Motivo: es una medida exacta, verificable, independiente de la definición de palabra y del tipo de salto de línea (Windows o Linux), y no depende de la versión de Unicode de Node.

12. **Coherencia del total.** El total de palabras es la suma de todas las frecuencias, porque ambos salen del mismo separador de palabras. Motivo: así el total nunca puede contradecir la lista.

13. **Orden de salida.** Las palabras salen de mayor a menor frecuencia. Cuando dos palabras tienen la misma frecuencia, salen en el orden en que aparecieron por primera vez en el archivo. El ordenamiento es un counting sort estable escrito desde cero, sin `sort` ni `toSorted` ni librerías, y una prueba automática lo verifica. Motivo: el counting sort no compara palabras entre sí y, recorriendo las palabras en orden de aparición, conserva ese orden en los empates.

14. **Histograma (`--bars`).** Si la frecuencia más alta es 40 o menos, cada `#` equivale a una aparición. Si es mayor, las barras se escalan para que la más larga mida 40, y ninguna baja de un `#`. Las palabras se alinean con la más larga. Motivo: sin escala, una palabra con 3.000 apariciones produciría una línea de 3.000 símbolos.

15. **Archivos vacíos y errores.** Un archivo vacío o con solo espacios da 0 palabras y no es un error. Una ruta que no existe, una carpeta, un archivo sin permiso de lectura, una opción desconocida, dos rutas o ninguna ruta muestran un mensaje claro por el canal de errores y terminan con código de salida 1. Motivo: un archivo vacío es una entrada válida, y un error de uso debe poder detectarse desde otros programas.

### Ejemplos de las reglas

| Texto | Palabras | Caracteres | Resultado |
|---|---|---|---|
| `mp3 3D AT&T` | 4 | 11 | `mp3`, `3d`, `at`, `t` |
| `2024 123 3.14` | 0 | 13 | ninguna palabra |
| `covid-19 abc123def` | 2 | 18 | `covid-19`, `abc123def` |
| `Voy a casa y como` | 5 | 17 | `voy`, `a`, `casa`, `y`, `como` |
| `Hola 😀 mundo 😀` | 2 | 14 | `hola`, `mundo` |
| `user@example.com https://lumu.io/docs` | 7 | 37 | `user`, `example`, `com`, `https`, `lumu`, `io`, `docs` |
| `m²` | 1 | 2 | `m` |
| `1º` | 1 | 2 | `1º` |
| `2024-2025` | 0 | 9 | ninguna palabra |
| `❤️` | 0 | 2 | ninguna palabra |

## Limitaciones conocidas

* **Idiomas sin espacios entre palabras.** En chino, japonés o tailandés, una frase completa sale como una sola palabra, porque el programa separa por espacios y símbolos, no por significado.
* **Números solos.** Los años y las cantidades (`2024`, `3.14`) no se cuentan como palabras aunque sean importantes en el texto. Sus caracteres sí cuentan.
* **Palabras partidas por símbolos.** `AT&T` se cuenta como `at` y `t`, `e.g.` como `e` y `g`, y `m²` pierde el exponente. Es el costo de tener una sola regla simple.
* **Correos y direcciones web.** Se dividen en varias palabras (`user`, `example`, `com`).
* **Apóstrofes al inicio o al final.** En `dogs'` o en `'tis`, el apóstrofe se descarta, porque no tiene una letra o un dígito a cada lado.
* **Emojis compuestos.** Un emoji con varias partes suma varios caracteres (❤️ suma 2), porque se cuentan puntos de código y no símbolos que ve el ojo humano.
* **Alineación de `--bars`.** Se calcula por puntos de código, así que los caracteres anchos (como los chinos) o las marcas combinantes sueltas pueden dejar las barras un poco desalineadas en la consola. El contenido no cambia, y se ve mejor con una fuente monoespaciada.
* **Normalización y `wc -m`.** Como se normaliza a NFC antes de contar, un texto con letras acentuadas escritas en dos partes da un número de caracteres menor que el de `wc -m`.
* **Codificación.** Solo se soporta UTF-8. Un archivo en otra codificación (por ejemplo, UTF-16) se lee con caracteres de reemplazo y el resultado no es confiable.
* **Tamaño del archivo.** El diseño y la prueba de rendimiento apuntan a archivos de hasta 50.000 palabras. Un archivo más grande funciona, pero se lee completo en memoria, y no hay un límite que el programa haga cumplir.
* **Consola de Windows.** Si los acentos o los emojis se ven raros en la terminal, es un problema de la consola y no del programa. El terminal de VS Code normalmente los muestra bien, y en cmd puede ayudar el comando `chcp 65001`.


## Cómo funciona paso a paso

El programa hace siete pasos en orden. Cada uno vive en su propio archivo y recibe lo que produjo el anterior.

1. **Revisar los argumentos** (`word-frequency.js`). Se lee la ruta del archivo y si se pidió `--bars`. Si algo está mal, se lanza un error con un mensaje claro.
2. **Leer y limpiar el texto** (`src/read-text-file.js`). Se lee el archivo, se quita la marca BOM del inicio y se unifican las formas equivalentes de un mismo carácter (por ejemplo, una `é` escrita en dos partes pasa a ser una sola).
3. **Separar en palabras** (`src/tokenize.js`). Se recorre el texto carácter por carácter, una sola vez, y se decide qué hacer con cada uno. El resultado es la lista de palabras en minúscula, en orden de aparición.
4. **Contar caracteres** (`src/count-characters.js`). Se recorre el texto y se cuenta cada carácter, menos los saltos de línea.
5. **Contar frecuencias** (`src/frequencies.js`). Se usa una tabla de palabra y cantidad que recuerda el orden en que se agregó cada palabra. Como cada palabra entra a la tabla la primera vez que aparece, ese orden es justo el de primera aparición.
6. **Ordenar** (`src/counting-sort.js`). Se ordenan las palabras distintas de mayor a menor cantidad, con counting sort, sin comparar palabras entre sí.
7. **Armar la salida** (`src/format-output.js`). Se construye el texto, normal o con barras. Solo `word-frequency.js` lo imprime.

El total de palabras sale de la misma lista que alimenta las frecuencias, así que la suma de las cantidades siempre es igual a ese total.

### Ejemplo del paso 3: cómo se decide cada carácter

Con el texto `don't 3D-model`:

| Carácter | Qué se decide | Palabra en construcción |
|---|---|---|
| `d`, `o`, `n` | Son letras: entran | `don` |
| `'` | Hay una palabra en curso y sigue una letra: entra | `don'` |
| `t` | Es una letra: entra | `don't` |
| espacio | Separa: se guarda `don't` | (vacía) |
| `3` | Es un dígito: entra, pero todavía no hay ninguna letra | `3` |
| `D` | Es una letra: entra, y ahora la palabra ya tiene una letra | `3D` |
| `-` | Hay una palabra en curso y sigue una letra: entra | `3D-` |
| `m`, `o`, `d`, `e`, `l` | Son letras: entran | `3D-model` |
| fin del texto | Se guarda `3d-model` en minúscula | (vacía) |

Resultado: `don't` y `3d-model`. Una palabra solo se guarda si tiene al menos una letra, y por eso `2024-2025` no produce ninguna.

### Ejemplo del paso 6: cómo ordena el counting sort

Cinco palabras distintas, en el orden en que aparecieron en el archivo:

| Posición | Palabra | Cantidad |
|---|---|---|
| 0 | zebra | 3 |
| 1 | apple | 1 |
| 2 | mango | 3 |
| 3 | kiwi | 2 |
| 4 | pear | 1 |

Primero se cuenta cuántas palabras hay por cada cantidad. Luego se calcula dónde empieza cada grupo en la lista final, empezando por la cantidad más alta:

| Cantidad | Palabras en el grupo | Posición donde empieza el grupo |
|---|---|---|
| 3 | 2 | 0 |
| 2 | 1 | 2 |
| 1 | 2 | 3 |

Por último se recorren las palabras en su orden original y cada una se coloca en la primera posición libre de su grupo:

| Palabra | Se coloca en |
|---|---|
| zebra | posición 0 |
| apple | posición 3 |
| mango | posición 1 |
| kiwi | posición 2 |
| pear | posición 4 |

La lista final es `zebra`, `mango`, `kiwi`, `apple`, `pear`. El ordenamiento es estable, es decir, mantiene el orden de los empates: `zebra` queda antes que `mango` porque llegó primero, y `apple` antes que `pear` por lo mismo. Si se recorriera la lista al revés con las mismas posiciones de inicio, los empates saldrían invertidos.

## Por qué elegí counting sort

Lo que se ordena es una cantidad entera (cuántas veces aparece cada palabra), y con números enteros se puede calcular directamente la posición de cada palabra sin compararlas entre sí. Es estable por construcción, su tiempo crece siempre igual sin importar cómo estén repartidas las frecuencias, y es más corto de escribir que las alternativas. Su punto débil es que usa una tabla auxiliar con una casilla por cada cantidad de repeticiones posible, y esa tabla puede ser grande frente a lo que ordena cuando muy pocas palabras se repiten muchísimo, aunque nunca supera la cantidad de palabras. La alternativa más sólida es merge sort: también es estable y con tiempo garantizado, pero compara palabras, usa recursión y su tiempo crece un poco más rápido que el tamaño de los datos.

Algoritmos que descarté:

| Algoritmo | Por qué se descartó |
|---|---|
| Burbuja, inserción y selección | Con muchas palabras distintas, el tiempo se multiplica por cuatro cuando los datos se duplican. La selección clásica, además, no es estable. |
| Quick sort | No es estable, y con mala suerte en el pivote también se vuelve lento. |
| Heap sort | No es estable. Para conservar el orden de aparición habría que agregar un desempate extra. |
| Radix sort | Es estable y rápido, pero es más complejo que counting sort y está pensado para claves largas. Aquí la clave es un solo número pequeño. |

## Complejidad

Se usan tres medidas del texto:

* **Tamaño del archivo:** cuántos caracteres tiene el texto.
* **Cantidad de palabras:** cuántas palabras hay en total, contando las repetidas.
* **Cantidad de palabras distintas:** cuántas palabras diferentes hay, contando cada una una sola vez.

### Cuánto cuesta cada parte

| Parte | Qué recorre | Cómo crece el tiempo | Memoria extra |
|---|---|---|---|
| Leer y limpiar el texto | Todo el archivo, una vez | Con el tamaño del archivo | Una copia del texto, del tamaño del archivo |
| Separar en palabras | Cada carácter, una vez | Con el tamaño del archivo | Una lista con los caracteres (del tamaño del archivo) y la lista de palabras (de la cantidad de palabras) |
| Contar caracteres | Cada carácter, una vez | Con el tamaño del archivo | Casi ninguna |
| Contar frecuencias | Cada palabra, una vez | Con la cantidad de palabras | La tabla de palabra y cantidad, del tamaño de la cantidad de palabras distintas |
| Ordenar con counting sort | Las palabras distintas y una tabla auxiliar | Con la cantidad de palabras distintas más el tamaño de la tabla, que nunca supera la cantidad de palabras | La lista ordenada, de la cantidad de palabras distintas, y la tabla auxiliar |
| Armar la salida | Cada palabra distinta, una vez | Con la cantidad de palabras distintas | El texto de salida |

Ninguna parte tiene un recorrido dentro de otro recorrido. Cada una pasa una sola vez por sus datos, y por eso no hay ninguna parte cuyo tiempo se dispare al crecer el archivo. Tampoco depende de cómo estén repartidas las frecuencias: el peor caso de una parte sigue siendo proporcional a los datos que recibe.

### Si el archivo se hace el doble de grande

El tiempo total se hace aproximadamente el doble, no el cuádruple. Como cada parte recorre sus datos una sola vez, duplicar el tamaño del archivo duplica también la cantidad de palabras y el trabajo de las partes que las recorren. La parte de ordenar puede crecer menos que el doble en textos reales, porque un texto más largo suele repetir palabras que ya había usado, así que la cantidad de palabras distintas crece más despacio que el archivo. La memoria también crece en proporción.

Un algoritmo lento como el de burbuja, en cambio, tardaría cerca de cuatro veces más al duplicar las palabras distintas.

### Tiempos medidos

La prueba automática genera un archivo de 50.000 palabras y mide cada etapa. En mi computadora, todo el trabajo en memoria toma unas decenas de milisegundos, y la etapa más lenta es separar en palabras. El programa completo, con el arranque de Node incluido, tarda alrededor de un décimo de segundo. Son cifras aproximadas que cambian según el equipo. Por eso la prueba solo falla si el trabajo tarda más de 5 segundos, un límite muy amplio pensado para detectar un ordenamiento mal hecho y no para medir velocidad.