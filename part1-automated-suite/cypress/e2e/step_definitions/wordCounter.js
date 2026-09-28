// ============================================================================
// NOTA - hola chicos, para esta ESTRATEGIA DE STEP DEFINITIONS YO TOMÉ ESTA DECISIÓN ASI:
// Esta suite utiliza step definitions parametrizados/reutilizables (ej: {string})
// en vez de un step dedicado para cada escenario específico. Esta decisión se
// tomó debido al volumen de repetición entre escenarios (múltiples tests
// ingresando diferente texto en el mismo campo, validando los mismos contadores).
//
// Pero para un proyecto más grande con más páginas/sub-dominios, elementos más aislados/únicos, o
// acciones específicas de negocio (ej: "click en el botón de checkout",
// "seleccionar plan premium"), dedicaría step definitions por acción, porque
// sería el mejor enfoque, ya que mantiene el archivo '.feature' más cercano
// al lenguaje de negocio y más fácil de leer para stakeholders no técnicos.
// ============================================================================

import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import wordCounterPage from "../pages/WordCounterPage";

// Navega a la página principal de wordcounter.net antes de cada ejecución de escenario
Given("I am on the wordcounter.net homepage", () => {
  wordCounterPage.visit();
});

// Limpia el campo de texto y escribe el texto dado: {string} - (Como mencioné al inicio de este documento).
// Captura el valor definido en el step del Gherkin en "wordCounter.feature", permitiendo que este único step definition
// sea reutilizado en muchos escenarios con diferente texto de entrada. (Como comenté al inicio de este documento)
When("I enter the text {string}", (text) => {
  wordCounterPage.enterText(text);
});

// Ingresa un texto fijo que contiene un salto de línea (la tecla Enter), usado específicamente para validar que los saltos
// de línea no se cuenten como palabras o caracteres. No se necesita ningún parámetro ya que el texto es estático para este escenario específico (edge case)
When("I enter the text with line breaks", () => {
  wordCounterPage.enterTextWithLineBreaks();
});

// Valida que el conteo de palabras mostrado en la página coincida con el valor esperado:
// El {string} captura el número esperado en el step de Gherkin (ej: Then the word count should display "2") y lo usa.
// Se mantiene solo para el escenario de estado inicial (sin texto ingresado), donde no hay riesgo de
// race condition con la actualización del DOM.
Then("the word count should display {string}", (expectedCount) => {
  wordCounterPage.assertWordCount(expectedCount);
});

// Valida que el conteo de caracteres mostrado en la página coincida con el valor esperado:
// {string} captura el número esperado desde el step de Gherkin (ej: Then the character count should display "10"). Similar al de arriba.
// Se mantiene solo para el escenario de estado inicial, misma razón que el step anterior.
Then("the character count should display {string}", (expectedCount) => {
  wordCounterPage.assertCharacterCount(expectedCount);
});

// Valida word count y character count en una sola aserción combinada. Se usa en todos los escenarios
// donde se ingresa texto, evitando race condition donde el DOM podría estar en un estado
// intermedio entre la actualización de ambos valores (ver assertWordAndCharacterCount() en el Page Object
// para el detalle técnico completo de por qué esto era necesario)
Then("the word and character count should display {string} words and {string} characters", (expectedWords, expectedCharacters) => {
  wordCounterPage.assertWordAndCharacterCount(expectedWords, expectedCharacters);
});

// Valida el panel de Keyword Density comparando cada palabra y su conteo esperado:
// dataTable captura la tabla Gherkin (word | count) definida en el step, y hashes() la convierte en un array de
// objetos como [{word: "lumu", count: "6"}, ...] para su validación. obs: El dataTable es una funcion default de Gherkin.
Then("the keyword density should show the following words and counts:", (dataTable) => {
  const expectedWords = dataTable.hashes();
  wordCounterPage.assertKeywordDensity(expectedWords);
});