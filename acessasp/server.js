// AcessaSP - servidor Express + MongoDB
const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const DB_NAME = process.env.DB_NAME || "acessasp";
const PORT = process.env.PORT || 3000;

const CATEGORIAS = [
  "Calçada danificada",
  "Falta de rampa",
  "Piso tátil ausente",
  "Semáforo sem sinal sonoro",
  "Obstáculo na via",
  "Transporte sem acessibilidade",
];
const GRAVIDADES = ["Baixa", "Média", "Alta"];

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let colecao; // coleção "ocorrencias" do MongoDB

// ---------- Regra de negócio: classificação automática de prioridade ----------
// pontos = gravidade (Baixa=1, Média=2, Alta=3) + 1 se for perto de local sensível
// (hospital, escola, terminal...). Total >= 4 -> Alta; 3 -> Média; senão -> Baixa.
function calcularPrioridade(gravidade, localSensivel) {
  const pontos = GRAVIDADES.indexOf(gravidade) + 1 + (localSensivel ? 1 : 0);
  if (pontos >= 4) return "Alta";
  if (pontos === 3) return "Média";
  return "Baixa";
}

// ---------- Validação básica ----------
function validar(body) {
  const erros = [];
  const categoria = String(body.categoria || "").trim();
  const local = String(body.local || "").trim();
  const descricao = String(body.descricao || "").trim();
  const gravidade = String(body.gravidade || "").trim();
  const relator = String(body.relator || "").trim();

  if (!CATEGORIAS.includes(categoria)) erros.push("Escolha uma categoria válida.");
  if (local.length < 5) erros.push("Informe o local com pelo menos 5 caracteres.");
  if (local.length > 120) erros.push("O local deve ter no máximo 120 caracteres.");
  if (descricao.length < 10) erros.push("A descrição precisa ter pelo menos 10 caracteres.");
  if (descricao.length > 500) erros.push("A descrição deve ter no máximo 500 caracteres.");
  if (!GRAVIDADES.includes(gravidade)) erros.push("Escolha uma gravidade válida.");
  if (relator.length > 60) erros.push("O nome deve ter no máximo 60 caracteres.");

  return {
    erros,
    dados: {
      categoria,
      local,
      descricao,
      gravidade,
      localSensivel: body.localSensivel === true || body.localSensivel === "true" || body.localSensivel === "on",
      relator: relator || "Anônimo",
    },
  };
}

// ---------- Rotas ----------
// POST: cadastra uma ocorrência
app.post("/api/ocorrencias", async (req, res) => {
  try {
    const { erros, dados } = validar(req.body || {});
    if (erros.length > 0) {
      return res.status(400).json({ sucesso: false, mensagem: "Corrija os campos abaixo.", erros });
    }
    dados.prioridade = calcularPrioridade(dados.gravidade, dados.localSensivel);
    dados.criadoEm = new Date();

    const resultado = await colecao.insertOne(dados);
    res.status(201).json({
      sucesso: true,
      mensagem: `Ocorrência registrada com prioridade ${dados.prioridade}.`,
      id: resultado.insertedId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ sucesso: false, mensagem: "Erro interno ao salvar a ocorrência." });
  }
});

// GET: lista as ocorrências (mais recentes primeiro). Filtro opcional ?prioridade=Alta
app.get("/api/ocorrencias", async (req, res) => {
  try {
    const filtro = {};
    if (["Alta", "Média", "Baixa"].includes(req.query.prioridade)) {
      filtro.prioridade = req.query.prioridade;
    }
    const lista = await colecao.find(filtro).sort({ criadoEm: -1 }).toArray();
    res.json(lista);
  } catch (err) {
    console.error(err);
    res.status(500).json({ sucesso: false, mensagem: "Erro interno ao consultar as ocorrências." });
  }
});

// GET: indicadores (total + resumo por prioridade e por categoria)
app.get("/api/indicadores", async (req, res) => {
  try {
    const total = await colecao.countDocuments();
    const porPrioridadeBruto = await colecao
      .aggregate([{ $group: { _id: "$prioridade", quantidade: { $sum: 1 } } }])
      .toArray();
    const porCategoriaBruto = await colecao
      .aggregate([{ $group: { _id: "$categoria", quantidade: { $sum: 1 } } }, { $sort: { quantidade: -1 } }])
      .toArray();

    const porPrioridade = { Alta: 0, Média: 0, Baixa: 0 };
    porPrioridadeBruto.forEach((p) => (porPrioridade[p._id] = p.quantidade));
    const porCategoria = porCategoriaBruto.map((c) => ({ categoria: c._id, quantidade: c.quantidade }));

    res.json({ total, porPrioridade, porCategoria });
  } catch (err) {
    console.error(err);
    res.status(500).json({ sucesso: false, mensagem: "Erro interno ao calcular os indicadores." });
  }
});

// ---------- Tratamento de rota inexistente (404) ----------
app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ sucesso: false, mensagem: "Rota não encontrada." });
  }
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

// ---------- Inicialização ----------
async function iniciar() {
  try {
    const client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    colecao = client.db(DB_NAME).collection("ocorrencias");
    console.log(`MongoDB conectado (${DB_NAME}.ocorrencias)`);
    app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
  } catch (err) {
    console.error("Não foi possível conectar ao MongoDB. Ele está em execução?");
    console.error(err.message);
    process.exit(1);
  }
}

iniciar();
