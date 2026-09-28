# ==================================================================================
# Hola chicos, este archivo '.feature' está organizado en 3 secciones, basadas en criterios de test:
# [Aqui partimos de la premisa que ya leyeron los Business Requirements que fueron creados por mi: TECHNICAL_NOTES.md]
#
# 1. "# WordCount Check"
#    Contiene todos los tests relacionados con la validación de 'Word Count' y 'Character Count'.
#
# 2. "# keywordDensity Check"
#    Contiene todos los tests relacionados con la validación del panel de 'Keyword Density'.
#
# 3. "# Known Issues"
#    Contiene todos los issues conocidos.
#    El propósito de esta sección es simular un escenario donde funcionalidades en Prod se rompieron debido a un change/fix, resultando en un
#    issue que fue encontrando.
#    Entonces partindo de la premisa que el issue es conocido/documentado, basado en el documento de Requirements y Expected Results creado por mí.
#    Por eso, estos escenarios NO están incluidos en las tags @sanity, @wordCount o @keywordDensity.
#    En cambio, tienen su propio tag "@knownIssue" para una rápida verificación, y también están
#    tageados en @fullRegression, que cubre toda la suite de tests.
#     
# TAGS UTILIZADOS PARA CORRER:
#     @sanity: Quick check del ambiente. Similar a un smoke test: valida que las funcionalidades más básicas y críticas estén funcionando correctamente
#     @wordCount: Ejecuta solo los tests relacionados con la validación de Word Count y Character Count.
#     @keywordDensity: Ejecuta solo los tests relacionados con la validación del panel de Keyword Density.
#     @knownIssue: Ejecuta solo los escenarios de issues ya conocidos/documentados en el sitio. (Como explicado arriba en la sección "3. # Known Issues").
#     @fullRegression: Ejecuta la suite completa de tests. (WordCount Check, keywordDensity Check, y Known Issues)                   
#
# ==================================================================================

Feature: Word Counter validation
  As a user of wordcounter.net
  I want the tool to correctly count words and characters
  So that I can trust the results


# WordCount Check

 @sanity @wordCount @fullRegression
  Scenario: Validate initial word and character count is zero on page load
    Given I am on the wordcounter.net homepage
    Then the word count should display "0"
    And the character count should display "0"

 @sanity @wordCount @fullRegression
  Scenario: Validate word count for a simple sentence
    Given I am on the wordcounter.net homepage
    When I enter the text "lumu illuminates attacks and adversaries"
    Then the word and character count should display "5" words and "40" characters

 @sanity @wordCount @fullRegression
  Scenario: Validate whitespace-only text counts characters but not words
    Given I am on the wordcounter.net homepage
    When I enter the text "     "
    Then the word and character count should display "0" words and "5" characters

 @sanity @wordCount @fullRegression
  Scenario: Validate multiple spaces between words
    Given I am on the wordcounter.net homepage
    When I enter the text "lumu           lumu"
    Then the word and character count should display "2" words and "19" characters

 @sanity @wordCount @fullRegression
  Scenario: Validate line breaks are not counted as words or characters
    Given I am on the wordcounter.net homepage
    When I enter the text with line breaks
    Then the word and character count should display "0" words and "0" characters

@sanity @wordCount @fullRegression
  Scenario: Validate punctuation attached to words does not create new words
    Given I am on the wordcounter.net homepage
    When I enter the text "lumu, lumu."
    Then the word and character count should display "2" words and "11" characters

@sanity @wordCount @fullRegression
  Scenario: Validate words with apostrophes count as a single word
    Given I am on the wordcounter.net homepage
    When I enter the text "don't stop"
    Then the word and character count should display "2" words and "10" characters

@sanity @wordCount @fullRegression
  Scenario: Validate hyphenated words count as single word
    Given I am on the wordcounter.net homepage
    When I enter the text "well-known test"
    Then the word and character count should display "2" words and "15" characters

@sanity @wordCount @fullRegression
  Scenario: Validate word and character count updates correctly when current text is updated on same session
    Given I am on the wordcounter.net homepage
    When I enter the text "Lorem ipsum dolor sit amet"
    Then the word and character count should display "5" words and "26" characters
    When I enter the text "Lorem ipsum dolor "
    Then the word and character count should display "3" words and "18" characters

# keywordDensity Check

@sanity @keywordDensity @fullRegression
  Scenario: Validate keyword density for a repeated text
    Given I am on the wordcounter.net homepage
    When I enter the text "lumu lumu lumu lumu lumu illuminates illuminates attacks and adversaries lumu illuminates all attacks and adversaries"
    Then the keyword density should show the following words and counts:
      | word         | count |
      | lumu         | 6     |
      | illuminates  | 3     |
      | attacks      | 2     |

@sanity @keywordDensity @fullRegression
  Scenario: Validate keyword density shows 100 percent for a single repeated word
    Given I am on the wordcounter.net homepage
    When I enter the text "lumu lumu lumu lumu"
    Then the keyword density should show the following words and counts:
      | word | count |
      | lumu | 4     |     

@keywordDensity @fullRegression
  Scenario: Validate keyword density input order
    Given I am on the wordcounter.net homepage
    When I enter the text "zebra apple zebra apple"
    Then the keyword density should show the following words and counts:
      | word  | count |
      | zebra | 2     |
      | apple | 2     |

@sanity @keywordDensity @fullRegression
  Scenario: Validate keyword density case sensitive
    Given I am on the wordcounter.net homepage
    When I enter the text "Lumu lumu LUMU illuminates"
    Then the keyword density should show the following words and counts:
      | word        | count |
      | lumu        | 3     |
      | illuminates | 1     |

@keywordDensity @fullRegression
  Scenario: Validate keyword density agrupation with attached punctuation
    Given I am on the wordcounter.net homepage
    When I enter the text "lumu, lumu."
    Then the keyword density should show the following words and counts:
      | word | count |
      | lumu | 2     |    

@sanity @keywordDensity @fullRegression
  Scenario: Validate numbers do not appear in keyword density
    Given I am on the wordcounter.net homepage
    When I enter the text "123 123 123 lumu"
    Then the keyword density should show the following words and counts:
      | word | count |
      | lumu | 1     |

# Known Issues

@knownIssue @fullRegression
  Scenario: Validate single letter should NOT count as a word
    Given I am on the wordcounter.net homepage
    When I enter the text "e"
    Then the word and character count should display "0" words and "1" characters

@knownIssue @fullRegression
  Scenario: Validate single letter with punctuation should NOT count as a word
    Given I am on the wordcounter.net homepage
    When I enter the text "e,"
    Then the word and character count should display "0" words and "2" characters

@knownIssue @fullRegression
  Scenario: Validate emoji should NOT count as a word
    Given I am on the wordcounter.net homepage
    When I enter the text "lumu 😀 illuminates"
    Then the word and character count should display "2" words and "19" characters

@knownIssue @fullRegression
  Scenario: Validate numbers should NOT count as a word
    Given I am on the wordcounter.net homepage
    When I enter the text "lumu 123 illuminates"
    Then the word and character count should display "2" words and "20" characters

@knownIssue @fullRegression
  Scenario: Validate words with apostrophes should appear in keyword density
    Given I am on the wordcounter.net homepage
    When I enter the text "don't don't stop"
    Then the keyword density should show the following words and counts:
      | word  | count |
      | don't | 2     |
      | stop  | 1     |

@knownIssue @fullRegression
  Scenario: Validate hyphenated word does not lose its first part in keyword density
    Given I am on the wordcounter.net homepage
    When I enter the text "well-known well-known niño"
    Then the keyword density should show the following words and counts:
      | word       | count |
      | well-known | 2     |
      | niño       | 1     |

@knownIssue @fullRegression
  Scenario: Validate word attached to less-than symbol breaks keyword density completely
    Given I am on the wordcounter.net homepage
    When I enter the text "<lorem ipsum dolor"
    Then the keyword density should show the following words and counts:
      | word  | count |
      | lorem | 1     |
      | ipsum | 1     |
      | dolor | 1     |

@knownIssue @fullRegression
  Scenario: Validate special characters do not break word tokenization
    Given I am on the wordcounter.net homepage
    When I enter the text "¿Hola? ¡Test! 90° . , ! @ # $ *"
    Then the word and character count should display "3" words and "31" characters