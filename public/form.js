const form = document.getElementById("form");
const msg = document.getElementById("mensagem");

function mostrar(tipo, titulo, lista) {
  msg.className = "msg " + tipo;
  msg.innerHTML = "";
  const p = document.createElement("strong");
  p.textContent = titulo;
  msg.appendChild(p);
  if (lista && lista.length) {
    const ul = document.createElement("ul");
    lista.forEach((e) => {
      const li = document.createElement("li");
      li.textContent = e;
      ul.appendChild(li);
    });
    msg.appendChild(ul);
  }
  msg.focus();
  msg.scrollIntoView({ behavior: "smooth", block: "center" });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const dados = {
    categoria: form.categoria.value,
    local: form.local.value,
    descricao: form.descricao.value,
    gravidade: form.gravidade.value,
    localSensivel: form.localSensivel.checked,
    relator: form.relator.value,
  };

  try {
    const resp = await fetch("/api/ocorrencias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    const json = await resp.json();
    if (resp.ok) {
      mostrar("ok", json.mensagem);
      form.reset();
    } else {
      mostrar("erro", json.mensagem, json.erros);
    }
  } catch (err) {
    mostrar("erro", "Não foi possível falar com o servidor. Tente novamente.");
  }
});
