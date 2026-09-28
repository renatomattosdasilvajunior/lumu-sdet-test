# Prueba técnica SDET

Repositorio con las cuatro partes de la prueba técnica SDET. Cada parte tiene su propia carpeta, y las partes 1 y 4 incluyen instrucciones detalladas dentro de su propio README.

## Qué contiene el repositorio

| Parte | Carpeta | Qué es |
|---|---|---|
| 1 | `part1-automated-suite/` | Suite de pruebas automatizadas con Cypress y Cucumber sobre wordcounter.net |
| 2 | `part2-failure-report/` | Reporte de hallazgos y cobertura de wordcounter.net, en un archivo HTML |
| 3 | `part3-ux-report/` | Reporte de problemas de experiencia de usuario, en un archivo HTML |
| 4 | `part4-word-frequency/` | Programa en Node.js que cuenta la frecuencia de palabras de un archivo de texto |

## Requisitos

* Node.js versión 22 o superior para la parte 1 (lo exige el generador de reportes).
* Node.js versión 18 o superior para la parte 4.
* Conexión a internet para la parte 1, porque prueba el sitio real wordcounter.net.
* Un navegador para ver los reportes de las partes 1, 2 y 3.

Para revisar la versión de Node instalada, en cualquier sistema:

```
node --version
```

## Cómo correr la parte 1

Antes de empezar: la suite tiene 23 escenarios, y 8 de ellos llevan la etiqueta `@knownIssue`. Esos 8 fallan a propósito, porque documentan issues reales del sitio contra reglas de negocio definidas en la propia prueba. Por eso el comando de la suite termina con un código de error, y eso es lo esperado, no una señal de que algo está roto.

1. Abra una terminal dentro de la carpeta `part1-automated-suite`.
2. Instale las dependencias:

```
npm install
```

3. Corra toda la suite, sin abrir el navegador:

```
npx cypress run
```

Los resultados quedan guardados en `cypress/reports/cucumber-json/results.json`. Ese archivo se sobrescribe en cada corrida.

4. Genere el reporte visual:

```
node generate-report.mjs
```

Esto crea `cypress/reports/html/index.html`. Ábralo con doble clic para verlo en el navegador. Al hacer clic en el nombre del Feature se ven los escenarios, y en un escenario fallido se ve el error y la captura de pantalla.

### Modo interactivo

Para ver la suite corriendo en el navegador:

```
npx cypress open
```

Elija E2E Testing, luego Chrome, y haga clic en `wordCounter.feature`.

### Correr solo un grupo de escenarios

Con esta versión de Cypress y del preprocessor, las etiquetas se pasan con `--expose`, no con `--env`:

```
npx cypress run --expose "tags=@sanity"
```

Otras etiquetas disponibles: `@wordCount`, `@keywordDensity`, `@knownIssue` y `@fullRegression`.

### Las decisiones técnicas de la parte 1

Las decisiones técnicas y las reglas de negocio detrás de cada escenario están en `part1-automated-suite/TECHNICAL_NOTES.md`.

## Cómo ver las partes 2 y 3

Son archivos HTML interactivos. GitHub los muestra como código, no los ejecuta, así que hay que descargarlos o clonar el repositorio y abrirlos con doble clic para verlos en el navegador:

* Parte 2: `part2-failure-report/Renato_failure_report.html`
* Parte 3: `part3-ux-report/ux-report.html`

## Cómo correr la parte 4

Programa en Node.js que lee un archivo de texto, cuenta cuántas veces aparece cada palabra y las muestra ordenadas de mayor a menor frecuencia, con una opción para ver un histograma.

Desde la carpeta `part4-word-frequency`, sin instalar nada:

```
node word-frequency.js ejemplo.txt
```

Con el histograma:

```
node word-frequency.js ejemplo.txt --bars
```

Para correr las 121 pruebas automáticas:

```
npm test
```

El detalle completo (ejemplos de salida, asunciones, limitaciones y complejidad) está en `part4-word-frequency/README.md`.

## Dónde están las asunciones y decisiones de cada parte

| Parte | Dónde |
|---|---|
| 1 | `part1-automated-suite/TECHNICAL_NOTES.md` |
| 2 | Dentro del propio reporte, `part2-failure-report/Renato_failure_report.html` |
| 3 | Dentro del propio reporte, `part3-ux-report/ux-report.html` |
| 4 | `part4-word-frequency/README.md` |

## Problemas comunes

**Cypress dice que no está instalado.**

```
npx cypress install
```

**En Windows PowerShell, un mensaje dice que la ejecución de scripts está deshabilitada.**

```
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

También puede correr los comandos desde cmd en lugar de PowerShell.

**`npx cypress run` termina con un código de error.**

Es lo esperado si los 8 escenarios con la etiqueta `@knownIssue` fallan. Revise el reporte HTML para confirmar que son justamente esos 8, y no otros.