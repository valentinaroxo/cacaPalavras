# Revisão independente de qualidade do código

**Data:** 2026-10-27  
**Escopo:** organização, lógica, entradas, palavras repetidas, acessibilidade, responsividade, persistência e segurança básica.  
**Limite desta revisão:** relatório somente; nenhum código foi alterado.

## Verificações executadas

- `node --test`: **9 testes passaram, 0 falharam**.
- Inspeção da árvore de acessibilidade do jogo após submeter um palpite.
- Verificação de overflow em 320, 390, 760 e 1280 px: nenhuma rolagem horizontal.
- Cálculo de contraste das combinações de texto e fundo principais: valores entre 6,37:1 e 14,31:1 nos pares medidos.
- Teste direto do validador de persistência: um estado com `guesses: [null]` foi aceito como válido.

## Problemas encontrados

| ID | Gravidade | Arquivo/linhas | Evidência | Correção recomendada |
|---|---|---|---|---|
| C01 | **Média — acessibilidade** | `src/app.js:137–146` | Cada tile é criado como `<span>` genérico e recebe `aria-label`, mas sem papel semântico. Na árvore acessível inspecionada, a linha preenchida foi anunciada como “Tentativa 1: A B R A M”, sem os estados “posição correta”, “presente em outra posição” ou “ausente da palavra”. Isso diverge do protótipo, que define tiles com `role="img"` e rótulo explícito em `prototypes/index.html:1150–1154`. | Dar semântica acessível explícita aos tiles preenchidos (ou apresentar uma descrição de texto associada a cada tentativa) e testar o resultado com árvore de acessibilidade e leitor de tela. Manter as linhas vazias fora da árvore conforme a intenção atual. |
| C02 | **Média — robustez dos dados** | `src/persistence.js:23–36`; `src/app.js:137–146` | `isValidRound` valida que `guesses` é array e tem no máximo seis itens, mas não valida a forma dos itens nem `feedback`. O teste desta revisão confirmou que `isValidData` aceita uma rodada com `guesses: [null]`. Ao renderizar, `renderBoard` acessa `guess.feedback[columnIndex]`, o que lança exceção para esse estado. Dados truncados ou malformados no `localStorage` podem, portanto, interromper o carregamento em vez de acionar o aviso de dado inválido. | Validar cada palpite (texto, cinco letras, vetor de cinco estados permitidos), a coerência entre número de palpites e status, IDs de puzzle existentes e correspondência de modo/rodada; descartar ou recuperar estado inválido antes de renderizar. Acrescentar testes para objetos malformados que hoje passam pelo validador. |
| C03 | **Média — integridade do desafio** | `src/words.js:1–110`; `index.html:8–12`; `src/app.js:12–15, 272–277` | O cliente recebe o banco inteiro de respostas e seleciona localmente a palavra do dia. É possível inspecionar as respostas no JavaScript carregado ou no console do navegador antes de jogar. Não é exposição de dados pessoais nem execução remota, mas reduz a confidencialidade do desafio diário para quem inspeciona o cliente. | Documentar explicitamente que o jogo não é resistente a consulta da resposta. Se impedir a inspeção for requisito futuro, rever a distribuição da resposta diária; não confiar em ofuscação como controle de segurança. A abordagem atual é compatível com uma aplicação estática sem backend, mas essa limitação deve ser aceita conscientemente. |
| C04 | **Média — validação lexical** | `src/words.js`; `src/app.js:7–11`; `SPECS.md:191–193` | O jogo só aceita respostas e palpites constantes em uma lista curada pequena (77 respostas e 149 palpites adicionais). Uma palavra portuguesa válida que não esteja nessa lista é rejeitada como desconhecida. A própria especificação registra que o banco não cobre todo o vocabulário. | Tratar como limitação do MVP. Se expandir, utilizar uma fonte apropriada e licenciada, revisar adequação etária e colisões após normalização; acrescentar testes para integridade e cobertura do banco. |
| C05 | **Baixa — cobertura de testes** | `tests/game.test.js`; `SPECS.md:285–300` | Os 9 testes executados passaram, mas a suíte não exercita o app no DOM. Não há teste automatizado visível para contagem de `played/completed` através de vitória/derrota, compartilhamento e seus fallbacks, refresh da data no app, retomada real após reload, operação por teclado ou árvore acessível. A ausência é importante porque vários desses fluxos são coordenados em `src/app.js`. | Adicionar testes de integração para estatísticas, restauração e compartilhamento, além de verificação automatizada/manual de acessibilidade. Manter os testes puros atuais para as regras de domínio. |
| C06 | **Baixa — validação de datas** | `src/persistence.js:28–35, 44–46`; `src/game.js:84–90` | A validação de `dateId` usa somente a expressão regular `YYYY-MM-DD`; não verifica se a data existe no calendário. Valores como `2026-02-31` passam no formato e `Date.parse` pode normalizá-los para outra data. Isso pode produzir streak ou seleção diária inesperada se o armazenamento estiver adulterado ou corrompido. | Validar datas ISO com round-trip para calendário UTC (ou helper centralizado) e testar datas inválidas, anos bissextos e valores fora de faixa. |
| C07 | **Baixa — governança lexical** | `src/words.js`; `SPECS.md:191–193` | As pistas e definições são conteúdo estático escrito no código; a revisão não encontrou fonte, processo de curadoria ou teste automatizado de adequação etária para cada entrada. A revisão não confirmou termos impróprios, mas também não pode atestar a qualidade editorial de todo o banco. | Criar revisão editorial antes de expandir o conjunto. Não declarar o banco verificado por idade sem evidência de revisão. |

## Observações positivas

- **Letras repetidas:** o algoritmo usa contagem de ocorrências em duas passagens (`src/game.js:47–75`). Os testes cobrem uma repetição excedente e uma distribuição com letras repetidas; os 9 testes passaram.
- **Entradas inválidas:** validação sintática e lexical é separada; códigos de erro distintos são convertidos em mensagens, sem incrementar tentativas (`src/game.js:21–45, 108–120`; `src/app.js:218–239`).
- **Renderização segura:** resposta, definições, mensagens e letras são inseridas com `textContent`/`createTextNode`, não por `innerHTML` (`src/app.js:98, 112–114, 142–147, 173–175, 202–203`). Não foi identificado sink de HTML dinâmico no caminho revisado.
- **Superfície externa:** não há dependências de pacote nem chamadas a serviço remoto no fluxo do jogo; estatísticas ficam em `localStorage`. O uso de armazenamento local não deve ser interpretado como armazenamento inviolável, mas não há dados de conta ou dados pessoais no modelo atual.
- **Layout:** os breakpoints em `src/styles.css:553–653` reorganizam o jogo e empilham o formulário em telas estreitas. As quatro larguras verificadas não tiveram overflow horizontal.
- **Contraste:** os principais pares medidos atendem ao mínimo de texto comum: tinta `#172b3a`/superfície `#fffdf8` 14,31:1; texto secundário `#344b55`/`#fffdf8` 9,05:1; branco/verde `#006b67` 6,37:1; tinta/amarelo `#f2c14e` 8,67:1; tinta/estado ausente `#dce4e7` 11,29:1. O cálculo não abrange todos os contextos ou elementos não textuais.
- **Falha de armazenamento:** acessos e gravações em `localStorage` têm tratamento de exceção e avisos na interface (`src/persistence.js:48–111`; `src/app.js:16–20, 102–114`). O problema C02 é especificamente a validação superficial de estruturas internas, não a ausência de tratamento geral de falhas de I/O.

## Resultado

Não foi confirmado um caminho de execução remota ou injeção de HTML no código revisado. Os riscos principais são de acessibilidade do feedback por letra, recuperação de estado local malformado e visibilidade do banco de respostas no cliente. O código e os testes permaneceram inalterados; os testes disponíveis passaram nesta revisão, mas não cobrem todos os fluxos de interface citados.
