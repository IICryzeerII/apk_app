// Navigation et démarrage de l'appli

function pickScreen(){
  $("header").style.display = "none";
  $("nav").style.display = "none";
  $("#main").innerHTML = `<div class="pick"><h2>⚽ Quelle équipe suivre ?</h2>` +
    Object.keys(EQUIPES).map(n => `<button data-t="${esc(n)}">${esc(n)}</button>`).join("") + `</div>`;
  document.querySelectorAll(".pick button").forEach(b => b.onclick = () => {
    store.set("team", b.dataset.t);
    start(b.dataset.t);
  });
}

async function start(name){
  state.team = name;
  state.tab = "infos"; // <-- On démarre sur l'onglet infos
  $("header").style.display = "flex";
  $("nav").style.display = "flex";
  $("#title").textContent = "Parmain AC · " + name;
  $("#main").innerHTML = `<div class="mut">Chargement…</div>`;
  try {
    await load(name);
    render();
  } catch (e) {
    $("#main").innerHTML = `<div class="mut">Impossible de charger les données.<br><small>${esc(e.message)}</small><br><br><button class="back" id="retry">Réessayer</button></div>`;
    $("#retry").onclick = () => start(name);
  }
}

// Affiche l'onglet courant
function render(){
  document.querySelectorAll("nav button").forEach(b => b.classList.toggle("on", b.dataset.tab === state.tab));
  
  if (state.tab === "infos") renderInfos();
  else if (state.tab === "stats") renderStats();
  else if (state.tab === "classement") renderClassement();
  else renderMatchs();
}

document.addEventListener("DOMContentLoaded", () => {
  $("#change").onclick = pickScreen;
  document.querySelectorAll("nav button").forEach(b => b.onclick = () => { state.tab = b.dataset.tab; render(); });
  const saved = store.get("team");
  saved && EQUIPES[saved] ? start(saved) : pickScreen();
});
