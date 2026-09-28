# Documentación Técnica de Automatización: Lumu SDET Test (Part 1)

**Nota inicial:** No fue modificado ningún setting/configuración de la página wordcounter.net. Se respetó lo indicado en el documento de la prueba: "You don't need to modify any settings in the website, always use the default settings." Todos los tests fueron ejecutados usando la configuración por defecto del sitio.

---

## 1. Justificacion de Negocio (Business Justification)

Soy consciente de que wordcounter.net ya cuenta con funcionalidades pre-establecidas, y que el documento de la prueba pide generar un reporte resumen mostrando cuántos escenarios fueron ejecutados, cuántos pasaron y cuántos fallaron, con su respectiva descripción de error.

Sin embargo, delante de algunas inconsistencias de resultados de la pagina wordcounter.net, me pareció prudente definir algunas reglas de negocio, aunque en el PDF no se encuentran descritas, con el objetivo de demostrar la flexibilidad del framework de automatización (aunque sea para una tarea puntual/basica), el conocimiento de procesos, experiencia con good practices y metodologias mas comunes del área de QA.

Con estas reglas/expected results establecidos, podemos simular un escenario real: una business rule que cambió sobre algo que ya existía en producción, representando de manera sencilla una opción de cómo se podría manejar un existing issue en la Suite:

- Aislar estos tests del resto de la suite, ahorrando tiempo y evitando falsos positivos conocidos.
- Al ser una existing rule (no un new feature), el código de test puede actualizarse con el expected result correcto antes de que la buildChange/Fix llegue a PROD, según lo validado en ambientes previos (dev/stg/preprod/uat), dejando la suite lista para correr completa en el momento del deploy.

La otra razón del porque me pareció necesario crear esas reglas, fue para tener mas claridad, por ejemplo:

- "don't" se cuenta como palabra en el Word Count, pero no aparece en el Keyword Density by default.
- "adversaries-adversaries" se cuenta como 2 palabras en el Keyword Density, mientras que "well-known well-known" pierde la palabra "well" por completo, contando solo "known" 2 veces (Aplica condiciones).
- "123 123, 123" se cuenta como 3 palabras en Word Count, pero se pierde en el Keyword Density.
- "e" se cuenta como palabra en el Word Count, pero no aparece en el Keyword Density, y "ee" sí aparece como palabra en el Keyword Density.

Esto sugiere que Word Count y Keyword Density procesan las palabras de forma diferente: el primero trata correctamente las palabras compuestas, mientras el segundo, en su intento de reducir ruido, termina perdiendo información válida.

---

## 2. Reglas de Negocio (Business Rules)

Las siguientes Reglas fueron diseñadas con el propósito de forzar el fallo, ya que el comportamiento real del sitio se contradice en diferentes situaciones:

Imagina la situación: Acabas de salir de una meeting con estos 8 nuevos requisitos.

1. Una sola letra (ej: "e") NO debería contar como palabra (regla: mínimo 2 letras para considerarse una palabra).
2. Letra + puntuación (ej: "e,") NO debería contar como palabra. Debería contar como 2 caracteres.
3. Emojis deberían contarse como caracteres, NO como palabra.
4. Números deberían contarse como caracteres, NO como palabra.
5. Palabras con apóstrofe (ej: "don't") deberían aparecer en el Keyword Density.
6. Palabras compuestas por guión (ej: "well-known") NO deberían perder su primera parte en el Keyword Density.
7. Palabras pegadas al símbolo "<" no deberían romper el cálculo completo del Keyword Density.
8. Caracteres especiales de puntuación (ej: ¿, ¡, °,) no deben ser contados como palabras individuales.

Estas 8 reglas están documentadas y automatizadas en la sección "Known Issues" de este documento, y se validan de manera consistente y reproducible en cada ejecución de la suite.

Abajo tenemos los expected results a ser tomado en cuenta para el desarrollo de nuevos Test Cases, tomando en cuenta las reglas creadas.

| # | Regla | Expected Result | Actual Result | Estado |
|---|---|---|---|---|
| 1 | Texto vacío | 0 words, 0 characters | 0 words, 0 characters | ✅ Pass |
| 2 | Solo espacios en blanco | Cuenta caracteres, no palabras | Cuenta caracteres, no palabras | ✅ Pass |
| 3 | Espacios múltiples entre palabras | Cuenta palabras correctamente, espacios como caracteres | Cuenta palabras correctamente, espacios como caracteres | ✅ Pass |
| 4 | Saltos de línea | No cuentan como palabra ni como caracter | No cuentan como palabra ni como caracter | ✅ Pass |
| 5 | Puntuación pegada a la palabra (ej: "lumu,") | La puntuación cuenta como caracter, no crea una palabra nueva | La puntuación cuenta como caracter, no crea una palabra nueva | ✅ Pass |
| 6 | Palabras con apóstrofe (ej: "don't") | Se cuenta como una sola palabra | Se cuenta como una sola palabra | ✅ Pass |
| 7 | Palabras con guión (ej: "well-known") | Se cuenta como una sola palabra | Se cuenta como una sola palabra | ✅ Pass |
| 8 | Keyword Density: palabra repetida | Muestra el porcentaje correcto (100% si es la única palabra) | Muestra el porcentaje correcto | ✅ Pass |
| 9 | Keyword Density: empate en frecuencia | Las palabras empatadas aparecen en el orden en que fueron ingresadas | Las palabras empatadas aparecen en el orden en que fueron ingresadas | ✅ Pass |
| 10 | Keyword Density: sensibilidad a mayúsculas/minúsculas | Debe ser case-insensitive (agrupa "Lumu", "lumu", "LUMU" como una sola entrada) | Es case-insensitive, agrupa correctamente | ✅ Pass |
| 11 | Una sola letra (ej: "e") | NO debe contar como palabra (mínimo 2 letras para ser palabra) | Cuenta como 1 palabra | ❌ Fail (Known Issue) |
| 12 | Letra + puntuación (ej: "e,") | NO debe contar como palabra | Cuenta como 1 palabra | ❌ Fail (Known Issue) |
| 13 | Emojis | Deben contarse como caracteres, NO como palabra | Se cuentan como palabra | ❌ Fail (Known Issue) |
| 14 | Números | Deben contarse como caracteres, NO como palabra | Se cuentan como palabra | ❌ Fail (Known Issue) |
| 15 | Keyword Density: palabras con apóstrofe (ej: "don't") | Deben aparecer en el ranking de keywords | No aparecen (by default) | ❌ Fail (Known Issue) |
| 16 | Keyword Density: palabras con guión (ej: "well-known") | No deben perder su primera parte | Pierde "well" en presencia de tildes/ñ, muestra solo "known" | ❌ Fail (Known Issue) |
| 17 | Keyword Density: palabra pegada al símbolo "<" | No debe romper el cálculo del Keyword Density | Rompe el Keyword Density completo (queda vacío) | ❌ Fail (Known Issue) |
| 18 | Caracteres especiales de puntuación internacional (¿, ¡, °, etc.) | No deben contarse como palabras individuales | Cada símbolo suelto se cuenta como 1 palabra | ❌ Fail (Known Issue) |

---

## 3. Decisiones Técnicas Tomadas

### 3.1 Stack elegido: Cypress + Cucumber
Se eligió Cypress + Cucumber (`@badeball/cypress-cucumber-preprocessor`) para escribir los escenarios en formato BDD (Given-When-Then), facilitando la lectura del comportamiento esperado tanto para perfiles técnicos como no técnicos.

### 3.2 Patrón Page Object Model (POM)
Todo el código de interacción con la página (selectores y acciones) está centralizado en `WordCounterPage.js`, separado de los step definitions. Esto facilita el mantenimiento: si el sitio cambia su estructura HTML, solo se actualiza en un lugar, sin tocar los escenarios de Gherkin ni los step definitions.

### 3.3 Regex independiente del idioma
Wordcounter.net puede mostrar el texto en diferentes idiomas dependiendo de si el navegador auto-traduce la página (ej: "words" se traduce a "palabras"). Para evitar cualquier tipo de falla de esta naturaleza, no se utiliza ningun elemento del estilo palabras de la pagina. Siempre priorizando IDs y Clases.

### 3.4 Manejo defensivo del dropdown de Keyword Density
Se detectó que el panel de Keyword Density puede estar expandido o colapsado dependiendo del estado de la página. Para evitar que los tests fallen si el dropdown estuviera cerrado en algún momento (por ejemplo, un cambio futuro en el comportamiento por defecto del sitio), se implementó una verificación (`ensureKeywordDensityIsExpanded()`) que expande el panel automáticamente si detecta que está colapsado, antes de intentar leer los datos.

### 3.5 Espera inteligente (retry-ability) en vez de tiempos fijos
En vez de usar `cy.wait(tiempo fijo)`, se utilizó `.should()` con funciones personalizadas, que hacen que Cypress reintente automáticamente la validación hasta que la condición se cumpla o se agote el timeout. Esto evita tests flaky causados por la actualización asíncrona del DOM (el sitio tarda una fracción de segundo en recalcular el conteo después de escribir texto).

### 3.6 Estrategia de Step Definitions parametrizados
Se utilizaron step definitions reutilizables con parámetros (`{string}`) en vez de un step dedicado por cada escenario específico, debido al alto volumen de repetición entre escenarios (múltiples tests ingresando texto diferente en el mismo campo, validando los mismos contadores). Para un proyecto más grande, con elementos más aislados o acciones específicas de negocio, se optaría por step definitions dedicados por acción, manteniendo el archivo `.feature` más cercano al lenguaje de negocio.

### 3.7 Generación del reporte sin versionado por timestamp
El reporte de resultados (`results.json`) se genera con un nombre fijo "results.json", sin timestamp. Esto significa que **si se corre la suite una vez, y luego se corre nuevamente, el reporte anterior será reemplazado por el nuevo**, no se vió necesário conservar un historial de ejecuciones. Tomé esta decisión únicamente por ser una prueba de ejecución puntual, no un proyecto continuo (on-going). Si se requiere trazabilidad histórica de ejecuciones para esta prueba puntual (por ejemplo, en un pipeline de CI/CD), se puede implementar versionado por timestamp sin complejidad, cambiando la opcion en el script en el file "generate-report.mjs" y "package.json".

### 3.8 Corrección de Race Condition en las aserciones

Durante el desarrollo de la suite, se detectó que 2 escenarios (relacionados con "single letter" y "single letter with punctuation") pasaban de forma inconsistente entre ejecuciones, a pesar de que el comportamiento manual del sitio mostraba consistentemente un resultado diferente al esperado.

**Causa raíz identificada:** el word count y el character count viven en el mismo elemento de texto del DOM (ej: "1 word 1 character"), pero se estaban validando en dos aserciones `.should()` separadas y consecutivas. Debido a la actualización asíncrona del DOM tras escribir texto, existía una ventana de tiempo donde el word count aún no se había actualizado (mostrando el valor inicial "0"), mientras que la aserción de word count corría exactamente en ese instante. Como el valor esperado ("0") coincidía por casualidad con ese estado transitorio, el test "pasaba" sin validar realmente el comportamiento final correcto: un falso positivo.

**Solución implementada:** se creó un nuevo método (`assertWordAndCharacterCount()`) que valida ambos números dentro de una única función `.should()`, forzando a Cypress a reintentar hasta que AMBOS valores coincidan simultáneamente con lo esperado. Esto garantiza que el DOM haya terminado de actualizarse por completo antes de dar el test como exitoso, eliminando la condición de carrera.

Este hallazgo fue validado corriendo la suite 4 veces consecutivas antes y después del fix, confirmando el comportamiento inconsistente original y la estabilidad total después de la corrección.

---

## 4. Cómo correr la suite

### 4.1 Instalación de dependencias

Desde la carpeta `part1-automated-suite`, ejecutar:

```bash
npm install
```

Esto instalará las siguientes dependencias necesarias:
- `cypress`: framework de automatización
- `@badeball/cypress-cucumber-preprocessor`: integración de Cucumber/Gherkin con Cypress
- `@bahmutov/cypress-esbuild-preprocessor`: bundler necesario para el preprocessor
- `multiple-cucumber-html-reporter`: generador del reporte HTML visual

### 4.2 Correr la suite vía interfaz visual (modo interactivo)

```bash
npx cypress open
```

Elegir **E2E Testing**, seleccionar navegador (**Chrome** recomendado), y hacer clic en `wordCounter.feature` para ejecutar todos los escenarios, con visualización en tiempo real.

### 4.3 Correr la suite en modo headless (sin interfaz, recomendado para CI/CD)

```bash
npx cypress run
```

Esto ejecuta todos los escenarios sin abrir el navegador visualmente, y genera el archivo `cypress/reports/cucumber-json/results.json` con los resultados.

### 4.4 Correr un subconjunto de tests usando tags

Es posible ejecutar solo un grupo específico de escenarios usando las tags definidas en el `.feature` file:

```bash
# Correr solo el smoke/sanity check (validaciones rápidas y críticas)
npx cypress run --expose "tags=@sanity"

# Correr solo los tests de Word Count / Character Count
npx cypress run --expose "tags=@wordCount"

# Correr solo los tests de Keyword Density
npx cypress run --expose "tags=@keywordDensity"

# Correr solo los escenarios de issues conocidos
npx cypress run --expose "tags=@knownIssue"

# Correr la suite de regresión completa (todos los escenarios)
npx cypress run --expose "tags=@fullRegression"
```

**Nota sobre granularidad de tags:** No se creó una tag específica por escenario individual (ej: para correr solo el TC #12 de forma aislada), ya que la suite actual tiene 23 test cases, un volumen manejable donde las tags por categoría (`@sanity`, `@wordCount`, `@keywordDensity`, `@knownIssue`) ya cubren bien las necesidades de filtrado. Para una suite más grande (50+ tests), sí valdría la pena implementar tags individuales por escenario para permitir ejecuciones puntuales más granulares durante debugging o desarrollo.

### 4.5 Generar el reporte HTML

Después de correr la suite en modo headless (paso 4.3), generar el reporte visual con:

```bash
node generate-report.mjs
```

Esto crea el reporte navegable en `cypress/reports/html/index.html`.

**Cómo leer el reporte:**
- La página principal muestra un resumen general de la ejecución (features, escenarios pasados/fallidos, duración total).
- Al hacer clic en el nombre del Feature (**"Word Counter validation"**), se accede a la página de detalle con la lista completa de escenarios.
- Dentro de esa página, es posible hacer clic en cualquier **escenario fallido** para expandir su detalle, donde se muestra:
  - El **screenshot** capturado automáticamente en el momento exacto de la falla.
  - La **descripción del error** (qué se esperaba vs qué se obtuvo).
  - El **step específico** de Gherkin donde ocurrió la falla.

Esto permite a cualquier persona que revise el reporte entender rápidamente qué falló, por qué, y visualizar el estado exacto de la página en ese momento, sin necesidad de correr la suite nuevamente.
