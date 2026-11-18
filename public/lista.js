const erroBox = document.getElementById("erro");

function barra(rotulo, valor, total, classe) {
  const pct = total ? Math.round((valor / total) * 100) : 0;
  const linha = document.createElement("div");
  linha.className = "barra-linha";
  const nome = document.createElement("span");
  nome.textContent = rotulo;
  const num = document.createElement("strong");
  num.textContent = `${valor} (${pct}%)`;
  const trilho = document.createElement("div");
  trilho.className = "barra-trilho";
  const fill = document.createElement("div");
  fill.className = "barra-preench " + (classe || "");
  fill.style.width = pct + "%";
  trilho.appendChild(fill);
  linha.append(nome, num, trilho);
  return linha;
}

async function carregarIndicadores() {
  const resp = await fetch("/api/indicadores");
  if (!resp.ok) throw new Error();
  const ind = await resp.json();

  document.getElementById("total").textContent = ind.total;

  const prio = document.getElementById("porPrioridade");
  prio.innerHTML = "";
  ["Alta", "Média", "Baixa"].forEach((p) => prio.appendChild(barra(p, ind.porPrioridade[p], ind.total, p)));

  const cat = document.getElementById("porCategoria");
  cat.innerHTML = "";
  if (ind.porCategoria.length === 0) cat.textContent = "Nenhum registro ainda.";
  ind.porCategoria.forEach((c) => cat.appendChild(barra(c.categoria, c.quantidade, ind.total)));
}

async function carregarLista(filtro) {
  const url = filtro ? `/api/ocorrencias?prioridade=${encodeURIComponent(filtro)}` : "/api/ocorrencias";
  const resp = await fetch(url);
  if (!resp.ok) throw new Error();
  const lista = await resp.json();

  const box = document.getElementById("lista");
  box.innerHTML = "";
  if (lista.length === 0) {
    const v = document.createElement("div");
    v.className = "vazio";
    v.innerHTML = 'Nenhuma ocorrência encontrada. <a href="/">Registre a primeira barreira.</a>';
    box.appendChild(v);
    return;
  }

  lista.forEach((o) => {
    const art = document.createElement("article");
    art.className = "registro " + o.prioridade;

    const h = document.createElement("h3");
    h.textContent = o.categoria + " - " + o.local;

    const prio = document.createElement("p");
    const selo = document.createElement("span");
    selo.className = "selo " + o.prioridade;
    selo.textContent = "Prioridade " + o.prioridade;
    prio.append(selo, ` (gravidade ${o.gravidade.toLowerCase()}${o.localSensivel ? ", perto de local de grande circulação" : ""})`);

    const desc = document.createElement("p");
    desc.textContent = o.descricao;

    const meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent = `Registrado por ${o.relator} em ${new Date(o.criadoEm).toLocaleString("pt-BR")}`;

    art.append(h, prio, desc, meta);
    box.appendChild(art);
  });
}

async function iniciar(filtro = "") {
  try {
    erroBox.classList.add("escondido");
    await Promise.all([carregarIndicadores(), carregarLista(filtro)]);
  } catch (e) {
    erroBox.textContent = "Não foi possível carregar os dados. Verifique se o servidor e o MongoDB estão rodando.";
    erroBox.classList.remove("escondido");
  }
}

document.querySelectorAll(".filtros button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filtros button").forEach((b) => b.setAttribute("aria-pressed", "false"));
    btn.setAttribute("aria-pressed", "true");
    carregarLista(btn.dataset.filtro).catch(() => {
      erroBox.textContent = "Erro ao filtrar as ocorrências.";
      erroBox.classList.remove("escondido");
    });
  });
});

iniciar();
