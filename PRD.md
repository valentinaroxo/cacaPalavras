# PRD — Jogo casual de adivinhação de palavras

**Status:** Requisitos iniciais  
**Data:** 2026-10-27  
**Idioma inicial:** Português do Brasil  
**Nome do produto:** Provisório

## 1. Visão do produto

Criar um jogo casual para a web em que crianças e jovens deduzem uma palavra secreta por meio de palpites e feedback claro. Cada rodada deve ser fácil de começar, curta, acolhedora e divertida em celulares, tablets e computadores. O jogo deve também oferecer uma oportunidade leve de aprender palavras, sem transformar o erro ou a perda de uma sequência em punição.

## 2. Público e princípios

- **Público prioritário provisório:** crianças e jovens de aproximadamente 8 a 17 anos. A faixa foi adotada como padrão porque não houve uma faixa mais específica selecionada.
- **Idioma:** Português do Brasil.
- **Princípios:** regras fáceis de entender, tentativas sem cronômetro, retorno imediato, vocabulário adequado à idade, interface responsiva, acessibilidade e privacidade por padrão.

## 3. Pesquisa de referência

Foram comparados modelos conhecidos de jogos de adivinhação e consultadas orientações de acessibilidade da WCAG 2.2.

| Referência ou padrão | Mecânica observada | Aprendizado para o produto |
|---|---|---|
| [Wordle, The New York Times](https://www.nytimes.com/games/wordle/) | A página apresenta o jogo como a descoberta de uma palavra em seis tentativas, com um novo desafio por dia. | Tentativas limitadas e uma rodada diária tornam o objetivo claro e dão um ritmo curto e compartilhável. |
| [Contexto](https://contexto.me/) | Cada palpite recebe uma indicação de proximidade semântica em relação à resposta. | Pistas graduais podem ensinar sem revelar a resposta de imediato. |
| [Waffle](https://wafflegame.net/) | O jogo apresenta um desafio diário em grade, limite de movimentos, resultado compartilhável, estatísticas e arquivo de partidas. | Estatísticas, arquivo e compartilhamento são padrões recorrentes, mas não são necessários para o núcleo de um jogo simples. |
| [Forca](https://en.wikipedia.org/wiki/Hangman_(game)) | A palavra é representada por espaços; a pessoa sugere letras e perde tentativas quando erra. | A revelação incremental é intuitiva, mas o produto opta por palpites da palavra inteira e feedback por posição. |

### Síntese da pesquisa

- **Mecânicas:** jogos do gênero variam entre adivinhar a palavra inteira com pistas por letra, sugerir letras uma de cada vez, estimar proximidade semântica ou reorganizar letras em uma grade. O formato de palavra inteira foi escolhido por oferecer um ciclo de dedução direto, com poucas regras.
- **Experiência de uso:** uma instrução curta, um campo de jogo evidente, retorno imediato após cada tentativa e um desfecho explícito ajudam a pessoa a entender o que fazer. Desafio diário, modo de prática, estatísticas pessoais, arquivo e compartilhamento aparecem em jogos de referência; devem ser tratados como opções de produto, não como requisitos universais.
- **Acessibilidade:** a WCAG recomenda que as funções sejam operáveis por teclado, que cor não seja a única forma de transmitir significado, que texto tenha contraste suficiente, que controles sejam fáceis de acionar e que o conteúdo continue utilizável com texto ampliado. Um jogo sem cronômetro evita pressão desnecessária e permite que cada pessoa pense no próprio ritmo.
- **Adequação ao público:** palavras e explicações devem ser adequadas à faixa etária; a experiência inicial evita cadastro, chat, ranking, anúncios e compras. Essas escolhas mantêm a interação simples e reduzem exposição e pressão social.

## 4. Objetivos e limites

### Objetivos

1. Permitir que uma pessoa comece uma rodada sem cadastro.
2. Tornar compreensível o resultado de cada palpite sem exigir conhecimento prévio.
3. Oferecer um desafio diário e partidas livres para praticar.
4. Reforçar o aprendizado de vocabulário por meio de definições breves.
5. Manter a experiência agradável e utilizável em telas pequenas e com diferentes formas de interação.

### Fora do escopo inicial

- Contas, perfis, chat, mensagens ou conteúdo publicado por jogadores.
- Rankings públicos, competição entre jogadores ou recompensas colecionáveis.
- Anúncios, compras ou outros mecanismos de monetização.
- Dificuldade progressiva, categorias selecionáveis e modos com regras alternativas.

## 5. Experiência principal

1. A pessoa escolhe o desafio diário ou uma partida de prática.
2. O jogo explica brevemente que é preciso descobrir uma palavra de cinco letras em até seis palpites.
3. A pessoa envia um palpite válido. Cada palpite deve ser uma palavra reconhecida de cinco letras.
4. O jogo informa, letra por letra, quais letras estão na posição correta, aparecem em outra posição ou não fazem parte da resposta.
5. A pessoa pode pedir uma pista contextual durante a rodada.
6. A rodada termina quando a palavra é acertada ou quando as seis tentativas são usadas.
7. Ao final, o jogo mostra a resposta, uma definição curta e o resultado. No desafio diário, também pode apresentar um resumo compartilhável sem revelar a palavra.

## 6. Regras do jogo

### Palavras e tentativas

- A palavra-resposta tem **cinco letras** e pertence ao vocabulário em Português do Brasil.
- Cada rodada permite **até seis tentativas**.
- Não há limite de tempo para enviar um palpite.
- Apenas palavras válidas de cinco letras são aceitas como tentativas. Um palpite inválido não consome uma tentativa e recebe uma explicação breve e clara.
- As respostas devem ser palavras comuns e apropriadas à faixa etária. Nomes próprios, abreviações, termos ofensivos e palavras excessivamente raras não são respostas.
- O vocabulário é misturado, sem categoria obrigatória informada no início da rodada.

### Acentos, letras repetidas e feedback

- A comparação ignora acentos e cedilha: por exemplo, a presença de acento não muda a identificação da letra para fins de palpite. A resposta é exibida com sua ortografia correta ao final.
- O conjunto de respostas deve evitar palavras que se tornem indistinguíveis quando acentos e cedilha são ignorados.
- Letras repetidas são permitidas. O feedback deve respeitar quantas vezes cada letra aparece na resposta, sem indicar ocorrências excedentes como válidas.
- Cada letra do palpite recebe um dos três resultados: **posição correta**, **presente em outra posição** ou **ausente da palavra**.
- Cores podem reforçar esses resultados, mas cada resultado também precisa de uma indicação visual não baseada em cor e de uma descrição compreensível por tecnologia assistiva.

### Vitória, fim de tentativas e pistas

- A rodada é vencida quando a pessoa envia a palavra-resposta correta.
- Se as seis tentativas acabarem sem acerto, a rodada termina e o jogo revela a resposta.
- Cada rodada oferece uma pista contextual opcional, sem penalidade, como uma categoria ampla ou uma breve definição que não entregue a resposta.
- Ao encerrar qualquer rodada, o jogo mostra a palavra na grafia correta e uma definição curta, simples e adequada à idade.

## 7. Modos e progresso

- **Desafio diário:** uma palavra compartilhada entre jogadores no mesmo dia; cada pessoa tem uma tentativa de rodada diária.
- **Prática livre:** permite iniciar novas rodadas sem esperar pelo próximo desafio diário.
- **Dificuldade:** fixa; todas as rodadas usam as mesmas regras iniciais.
- **Estatísticas pessoais:** exibir partidas jogadas e concluídas e a sequência atual e recorde de dias consecutivos em que o desafio diário foi concluído. A sequência conta tanto vitória quanto derrota, para não penalizar quem erra. Não há ranking ou comparação pública.
- **Virada do desafio diário:** à meia-noite UTC, para que a mesma data corresponda ao mesmo desafio para todos.
- **Compartilhamento:** opcional e iniciado pela própria pessoa; o resumo não inclui a palavra-resposta nem dados pessoais.
- **Recompensas:** não há pontos, medalhas ou itens desbloqueáveis na primeira versão.

## 8. Requisitos de experiência e acessibilidade

Estes requisitos são critérios de produto orientados pela WCAG 2.2, não uma declaração de conformidade certificada.

### Direção visual aprovada — Caderno de pistas

- A experiência deve usar uma direção editorial acolhedora, inspirada em um caderno de descobertas: superfície em tom de papel claro, detalhes discretos de pauta, contornos legíveis e cartões simples. O visual deve funcionar para crianças e jovens sem parecer infantilizado.
- A paleta principal combina fundo marfim, texto azul-noite, verde-petróleo para a ação principal e amarelo-ouro para letras presentes em outra posição. Os estados do tabuleiro devem manter contraste suficiente e cada cor precisa ser acompanhada por símbolo e indicação textual; o amarelo usa texto escuro.
- A hierarquia da partida deve priorizar, nesta ordem: identificação do modo, número de tentativas, instrução breve, tabuleiro de seis linhas e cinco letras, entrada do palpite, ação para enviar e acesso à pista opcional.
- A legenda de feedback deve permanecer próxima ao tabuleiro e explicar os três estados com rótulos diretos: posição correta, presente em outra posição e ausente da palavra.
- O desafio diário e a prática livre devem ser opções claramente identificadas e fáceis de alternar. O estado selecionado precisa ser distinguível sem depender apenas de cor.
- Em telas largas, o tabuleiro e os controles formam a área principal; instruções e estatísticas pessoais ficam em uma área de apoio. Em celular, as áreas passam para uma coluna, preservando a sequência entre instruções, tabuleiro, legenda e controles, sem rolagem horizontal.
- Os controles de entrada e envio devem ficar juntos; em telas estreitas, podem se reorganizar verticalmente para manter alvos confortáveis ao toque. A pista aparece sob o seu controle, somente quando solicitada.
- O resultado final deve apresentar a palavra e sua definição breve em uma seção identificável. O compartilhamento do desafio diário permanece opcional e não revela a palavra nem dados pessoais.
- Manter foco visível, linguagem direta, tipografia legível e animações discretas que não sejam necessárias para entender os resultados. A interface deve respeitar as opções de movimento reduzido do dispositivo.
- A prévia aprovada em [prototypes/index.html](./prototypes/index.html) demonstra essa direção visual. Seus valores de exemplo são ilustrativos; não definem estatísticas ou conteúdo real do jogo.

- A interface deve reorganizar-se para celulares, tablets e computadores, preservando o acesso às regras, ao tabuleiro e aos controles.
- Todas as ações da rodada devem poder ser realizadas por teclado, e o foco deve permanecer perceptível.
- O estado de cada letra deve ser entendido sem depender exclusivamente de cor; a informação também deve estar disponível em texto para leitores de tela.
- Textos comuns devem alcançar contraste mínimo de **4,5:1** e textos grandes, **3:1**.
- Controles acionáveis devem atender ao mínimo de **24 × 24 pixels CSS** ou às exceções de espaçamento da WCAG 2.2; quando possível, devem ser maiores para uso confortável por toque.
- O conteúdo deve continuar utilizável com texto ampliado até **200%**, sem perda de informação ou funcionalidade.
- A página deve reorganizar o conteúdo em telas estreitas, sem exigir rolagem horizontal para ler instruções ou acessar controles.
- Instruções, avisos de palpite inválido, pistas e resultados devem usar linguagem direta, curta e apropriada ao público.
- Animações não devem ser necessárias para compreender o resultado; movimentos decorativos devem ser discretos e respeitar preferências de redução de movimento.
- Não deve haver cronômetro ou mudança automática de rodada que pressione a pessoa a agir rapidamente.

## 9. Privacidade e segurança do público

- Jogar não exige cadastro ou perfil.
- A primeira versão não oferece chat, mensagens, ranking público, anúncios ou compras.
- O compartilhamento é opcional, iniciado pelo jogador e limitado a um resumo sem resposta e sem identificadores pessoais.
- O jogo não deve solicitar que crianças publiquem informações pessoais para participar ou progredir.
- A sequência diária é um indicador pessoal, sem recompensa ou competição. Concluir o desafio diário conta para a sequência mesmo quando a palavra não é acertada.

## 10. Critérios de aceite do produto

- Uma pessoa que abre o jogo pela primeira vez consegue entender o objetivo e iniciar uma rodada com as instruções apresentadas.
- Um palpite inválido não reduz as tentativas e explica como corrigir o problema.
- Para cada palpite válido, o jogo distingue corretamente letras certas, presentes em outra posição e ausentes, inclusive quando há letras repetidas.
- Acertar encerra a rodada como vitória; usar seis tentativas sem acertar encerra a rodada e revela a palavra.
- A definição é apresentada no encerramento, tanto em vitória quanto em derrota.
- O desafio diário e a prática livre podem ser identificados e iniciados sem ambiguidade.
- O compartilhamento não revela a resposta nem informações pessoais.
- Todas as funções essenciais estão disponíveis por teclado e o feedback não depende só de cor.
- O jogo continua utilizável em telas estreitas, com texto ampliado e com tempo livre para responder.

## 11. Referências consultadas

### Jogos e mecânicas

- [Wordle — The New York Times](https://www.nytimes.com/games/wordle/) — descrição oficial do desafio diário e das seis tentativas.
- [Contexto](https://contexto.me/) — descrição do jogo baseada em proximidade semântica dos palpites.
- [Waffle](https://wafflegame.net/) — referência para desafio diário, estatísticas, arquivo e compartilhamento de resultado.
- [Hangman — Wikipedia](https://en.wikipedia.org/wiki/Hangman_(game)) — descrição da mecânica tradicional de descobrir uma palavra sugerindo letras.

### Acessibilidade — W3C WAI, WCAG 2.2

- [Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) — operação por teclado.
- [Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) — não usar cor como único meio de transmitir informação.
- [Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) — contraste de texto.
- [Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) — tamanho e espaçamento de alvos de interação.
- [Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) — ampliação de texto até 200%.
- [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) — reorganização do conteúdo em telas estreitas.
- [Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) — instruções e rótulos claros.
- [Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html) — alternativas textuais para conteúdo e controles não textuais.
- [Timing Adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html) — tempo suficiente para concluir tarefas.
- [Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) — controle de movimento e conteúdo que se atualiza automaticamente.
