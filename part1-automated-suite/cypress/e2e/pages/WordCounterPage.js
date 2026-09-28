class WordCounterPage {
  // css selectors utilizados en los escenarios - centralizados aquí para facilitar el mantenimiento: si el sitio cambia su estructura HTML,
  // solo se actualiza en un lugar(Aqui!), sin tocar los step definitions ni los escenarios de Gherkin
  textBox = "#box";
  wordAndCharacterCounter = '.panel-footer [data-tr-detail="words_characters"]';
  keywordDensityToggle = 'a.accordion-toggle[data-target="#kwd-accordion"]';
  keywordDensityList = "#kwd-accordion-data a.list-group-item";

  // pageUrls - en este caso solo homepage
  visit() {
    cy.visit("https://wordcounter.net/");
  }

  // Limpia el campo de texto y escribe el texto recibido como parámetro
  enterText(text) {
    cy.get(this.textBox).clear().type(text);
  }

  // Limpia el campo de texto y escribe un texto fijo con un salto de línea entre las dos palabras (Enter en Cypress)
  enterTextWithLineBreaks() {
    cy.get(this.textBox).clear().type("lumu{enter}lumu");
  }

  // Valida el conteo de palabras: usa should() con una función personalizada para que Cypress reintente automáticamente
  // hasta que el DOM se actualice, en vez de leer el valor antes de tiempo.
  // El regex captura el primer número del texto (ej: "5 words 40 characters" -> "5") independiente del idioma de la pagina
  // ya que el navegador puede auto-traducir la página (ej: "words" -> "palabras"), y confundir la captura/lectura del elemento.
  // Se mantiene para casos donde no hay riesgo de condición de carrera (ej: validar el estado inicial
  // "0 words" al cargar la página, sin haber escrito texto todavía)
  assertWordCount(expectedCount) {
    cy.get(this.wordAndCharacterCounter).should(($el) => {
      const text = $el.text();
      const match = text.match(/(\d+)/);
      expect(match[1]).to.equal(expectedCount);
    });
  }

  // Valida el conteo de caracteres: mismo enfoque de should() con retry automático que assertWordCount().
  // Usa /\d+/g (flag global) para capturar todos los números del texto en un array, y toma la posición [1]
  // (que sería el segundo número), ya que la estructura del texto siempre es "palabras, luego caracteres",
  // sin depender de una palabra específica tipo "characters" (que también varía según el idioma).
  // Se mantiene solo para casos sin riesgo de condición de carrera, igual que assertWordCount()
  assertCharacterCount(expectedCount) {
    cy.get(this.wordAndCharacterCounter).should(($el) => {
      const text = $el.text();
      const numbers = text.match(/\d+/g);
      expect(numbers[1]).to.equal(expectedCount);
    });
  }

  // Valida el conteo de palabras Y caracteres en una sola lectura del DOM. Esto es importante porque
  // ambos números viven en el mismo elemento de texto (ej: "1 word 1 character"), y si se validaran
  // por separado en dos .should() distintos, existe una condición de carrera: el DOM podría estar en
  // un estado intermedio (ej: el word count ya se actualizó pero el character count no, o viceversa),
  // causando un falso positivo si el valor intermedio coincide por casualidad con el esperado.
  // Al validar ambos dentro del mismo .should(), Cypress reintenta hasta que AMBOS coincidan
  // simultáneamente, garantizando que el DOM ya terminó de actualizarse por completo.
  // Se usa en todos los escenarios donde se ingresa texto y luego se valida el resultado.
  assertWordAndCharacterCount(expectedWords, expectedCharacters) {
    cy.get(this.wordAndCharacterCounter).should(($el) => {
      const text = $el.text();
      const numbers = text.match(/\d+/g);
      expect(numbers[0]).to.equal(expectedWords);
      expect(numbers[1]).to.equal(expectedCharacters);
    });
  }

  // Verifica/Garantiza que el panel de 'Keyword Density' esté expandido antes de leer los datos(Good practices). Si el elemento
  // '#kwd-accordion' no tiene la clase "in" (que indica "expandido/visible"), hace clic en el toggle/acordeon para abrirlo.
  // me parece que queda mas resiliente si hay cambios futuros de estado del dropdown, en lugar de asumir que siempre viene expandido por defecto
  ensureKeywordDensityIsExpanded() {
    cy.get("#kwd-accordion").then(($panel) => {
      if (!$panel.hasClass("in")) {
        cy.get(this.keywordDensityToggle).click();
      }
    });
  }

   // Aqui yo valido el panel de Keyword Density comparando cada palabra esperada contra su conteo real
  assertKeywordDensity(expectedWords) {
    // Garantiza que el panel esté expandido antes de intentar leer los datos  
    this.ensureKeywordDensityIsExpanded();

    // Verifica que la lista tenga al menos tantos elementos como palabras esperadas,
    // Es mas para evitr falsos positivos por una lista vacía o incompleta.
    cy.get(this.keywordDensityList).should("have.length.at.least", expectedWords.length);

    expectedWords.forEach((expected) => {
      cy.get(this.keywordDensityList)
        // Busca la fila que contiene el texto exacto de la palabra esperada (.word)
        .contains(".word", expected.word)
        // Sube hasta el elemento owner <a class="list-group-item"> que contiene toda la fila
        .parents("a.list-group-item")
        // Encuentra el badge label (ej: "6 (43%)") dentro de esa misma fila específica
        .find(".badge")
        .invoke("text")
        .then((badgeText) => {
          // Extrae el número del badge y lo compara contra el conteo esperado/predefinido.
          // Este es mas para garantizar que cada palabra se valida contra su propio conteo, y no confunda con el de otra fila
          const match = badgeText.match(/(\d+)/);
          expect(match[1]).to.equal(expected.count);
        });
    });
  }
}

export default new WordCounterPage();