# AcessaSP - Registro de barreiras de acessibilidade urbana

Global Solution 2026.2 - CitizenTech | Application Development | FIAP

**Integrantes:** preencher nome completo e RM de cada integrante.

## Problema
Calçadas quebradas, falta de rampas, piso tátil ausente e outros obstáculos dificultam a locomoção de pessoas com deficiência, idosos e pessoas com mobilidade reduzida. Hoje não há uma forma simples de registrar essas barreiras e mostrar quais são as mais frequentes e urgentes.

## Público-alvo
Pessoas com deficiência, idosos, gestantes, pais com carrinho de bebê e a gestão pública que precisa priorizar obras e correções.

## Objetivo
Permitir que qualquer pessoa registre uma barreira de acessibilidade, classificar sua prioridade automaticamente e mostrar indicadores que ajudem a decidir o que corrigir primeiro.

## ODS relacionados
- **ODS 11** - Cidades e Comunidades Sustentáveis.
- **ODS 10** - Redução das Desigualdades.

## Tecnologias
HTML, CSS, JavaScript, Node.js, Express e MongoDB (driver oficial `mongodb`).

## Requisitos
- Node.js 18 ou superior.
- Uma instância MongoDB local ou uma conta/cluster no MongoDB Atlas.
- Acesso à internet para conectar ao Atlas.

## Como executar no Windows (PowerShell)

Abra o PowerShell na pasta que contém `package.json` e execute:

```powershell
npm install
$env:MONGO_URI="mongodb+srv://USUARIO:SENHA@SEU_CLUSTER.mongodb.net/acessasp?retryWrites=true&w=majority"
npm start
```

Substitua `USUARIO`, `SENHA` e `SEU_CLUSTER` pelos dados da sua conexão do MongoDB Atlas. Não coloque espaços na URI e codifique caracteres especiais da senha para URL.

Para encerrar o servidor, pressione `Ctrl + C`.

## Como executar no Windows (CMD)

```cmd
npm install
set MONGO_URI=mongodb+srv://USUARIO:SENHA@SEU_CLUSTER.mongodb.net/acessasp?retryWrites=true&w=majority
npm start
```

## Como executar no Linux (bash)

```bash
npm install
export MONGO_URI='mongodb+srv://USUARIO:SENHA@SEU_CLUSTER.mongodb.net/acessasp?retryWrites=true&w=majority'
npm start
```

Também é possível usar MongoDB local. Nesse caso, se `MONGO_URI` não for definida, o servidor usa por padrão `mongodb://127.0.0.1:27017`.

**Importante:** o projeto não carrega arquivos `.env` automaticamente. A variável `MONGO_URI` deve ser definida no terminal antes de executar `npm start`. O arquivo `.env.example` é apenas uma referência.

Abra http://localhost:3000

O banco `acessasp` e a coleção `ocorrencias` são criados pelo MongoDB quando o primeiro registro é inserido.

## Rotas

| Método | Rota | Função |
|---|---|---|
| GET | `/` | Página com introdução e formulário |
| GET | `/ocorrencias.html` | Página com lista e indicadores |
| POST | `/api/ocorrencias` | Valida e salva uma ocorrência (201, ou 400 com erros) |
| GET | `/api/ocorrencias` | Lista ocorrências; filtro opcional `?prioridade=Alta` |
| GET | `/api/indicadores` | Retorna os indicadores calculados |
| qualquer outra | - | Erro 404 (JSON em `/api/*`, página HTML nas demais) |

## Campos de cada registro
`categoria`, `local`, `descricao`, `gravidade`, `localSensivel`, `relator` (opcional), `prioridade` (calculada) e `criadoEm`.

Validação no servidor: categoria e gravidade precisam ser valores válidos; local de 5 a 120 caracteres; descrição de 10 a 500 caracteres; relator com até 60 caracteres.

## Indicadores
1. **Total de ocorrências:** contagem de todos os documentos da coleção (`countDocuments`).
2. **Resumo por prioridade:** agrupamento com `$group` do MongoDB, exibido com quantidade e porcentagem.
3. **Resumo por categoria:** agrupamento com `$group` do MongoDB, exibido com quantidade e porcentagem.

## Regra de classificação da prioridade
Pontos = gravidade (Baixa = 1, Média = 2, Alta = 3) + 1 ponto se a barreira fica perto de hospital, escola, terminal ou outro local de grande circulação.

- 4 pontos ou mais: **Alta**
- 3 pontos: **Média**
- 1 ou 2 pontos: **Baixa**

## Estrutura

```text
acessasp/
  server.js
  package.json
  package-lock.json
  README.md
  .env.example
  public/
    index.html
    ocorrencias.html
    404.html
    style.css
    form.js
    lista.js
```

## Vídeo pitch
Link: inserir aqui o link público ou não listado do vídeo (2 a 3 minutos).

Antes da entrega, preencher os integrantes e testar o link do vídeo em uma janela anônima.
