# cacaPalavras

Jogo web de adivinhação de palavras em Português do Brasil.

## Executar localmente

Não há dependências de pacote. Com Python 3 instalado, na raiz do projeto execute:

```powershell
python -m http.server 8000
```

Abra <http://localhost:8000> no navegador. Para encerrar o servidor, pressione `Ctrl+C` no terminal.

## Testes

Com Node.js instalado, execute os testes de domínio:

```powershell
node --test
```

O protótipo visual está disponível em [prototypes/index.html](./prototypes/index.html). O jogo funcional é servido por [index.html](./index.html).

## Documentação

- [PRD](./PRD.md): funcionalidades e regras do produto.
- [Especificação técnica](./SPECS.md): arquitetura implementada, domínio, validação e limitações conhecidas.
