# AcessaSP - Registro de barreiras de acessibilidade urbana

Global Solution 2026.2 - CitizenTech | Application Development | FIAP

**Integrantes:**  
João Vitor Lima Caldeira (RM 566541)  
Miguel Vanucci Delgado (RM 563491)

## Problema
Calçadas quebradas, falta de rampas, piso tátil ausente e outros obstáculos dificultam a locomoção de pessoas com deficiência, idosos e pessoas com mobilidade reduzida. Hoje não há uma forma simples de registrar essas barreiras e mostrar quais são as mais frequentes e urgentes.

## Público-alvo
Pessoas com deficiência, idosos, gestantes, pais com carrinho de bebê e a gestão pública que precisa priorizar obras e correções.

## Objetivo
Permitir que qualquer pessoa registre uma barreira de acessibilidade, classificar sua prioridade automaticamente e mostrar indicadores que ajudem a decidir o que corrigir primeiro.

## ODS relacionados
- **ODS 11** - Cidades e Comunidades Sustentáveis (meta de acesso a espaços públicos seguros e inclusivos).
- **ODS 10** - Redução das Desigualdades (inclusão de pessoas com deficiência).

## Tecnologias
HTML, CSS, JavaScript, Node.js, Express e MongoDB (driver oficial `mongodb`).

## Como executar
Pré-requisitos: Node.js 18+ e MongoDB rodando localmente (porta 27017).

```bash
npm install
npm start
```

Abra http://localhost:3000

Para usar outro MongoDB (ex.: Atlas), defina a variável `MONGO_URI` antes de iniciar:

```bash
# Linux/Mac
MONGO_URI="mongodb+srv://usuario:senha@cluster/..." npm start
# Windows (PowerShell)
$env:MONGO_URI="mongodb://127.0.0.1:27017"; npm start
```

O banco `acessasp` e a coleção `ocorrencias` são criados automaticamente no primeiro registro.

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

Validação no servidor: categoria e gravidade precisam ser valores válidos; local de 5 a 120 caracteres; descrição de 10 a 500 caracteres.

## Indicadores
1. **Total de ocorrências:** contagem de todos os documentos da coleção (`countDocuments`).
2. **Resumo por prioridade e por categoria:** agrupamento com `$group` do MongoDB, exibido com quantidade e porcentagem.

**Regra de classificação da prioridade (definida pelo grupo):**
pontos = gravidade (Baixa = 1, Média = 2, Alta = 3) + 1 se a barreira fica perto de hospital, escola, terminal ou outro local de grande circulação.
- 4 pontos ou mais: **Alta**
- 3 pontos: **Média**
- 1 ou 2 pontos: **Baixa**

## Estrutura
```
acessasp/
  server.js          servidor Express, rotas, validação e MongoDB
  package.json
  README.md
  public/
    index.html       introdução + formulário
    ocorrencias.html lista + indicadores
    404.html         página de rota inexistente
    style.css
    form.js          envio do formulário (POST)
    lista.js         consulta (GET) e exibição
```

## Vídeo pitch
[link do YouTube](https://youtu.be/uhAadOBMp9k?is=-miS1Q4_HMnUb5nZ)
