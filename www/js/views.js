// Affichage : classement, liste des matchs, détail d'un match

function renderClassement(){
  $("#main").innerHTML = `<table><tr><th>#</th><th class="nm">Équipe</th><th>Pts</th><th>J</th><th>G</th><th>N</th><th>P</th><th>Diff</th></tr>` +
    state.classement.map(e => `<tr class="${e.equipe.toUpperCase().includes(CLUB) ? "me" : ""}">
      <td>${esc(e.rang)}</td><td class="nm">${esc(e.equipe)}</td><td class="pts">${esc(e.points)}</td>
      <td>${e.joues}</td><td>${e.gagnes}</td><td>${e.nuls}</td><td>${e.perdus}</td><td>${e.diff > 0 ? "+" : ""}${e.diff}</td></tr>`).join("") + `</table>`;
}

function scoreBlock(m, big){
  const mid = played(m) && m.score_a !== null
    ? `${m.score_a} - ${m.score_b}`
    : (parseDate(m.texte)?.h || "–");
  return `<div class="row ${big ? "big" : ""}">
    <div class="tm"><img src="${esc(m.logo_a)}" alt="" onerror="this.style.visibility='hidden'">${esc(m.nom_equipe_a)}</div>
    <div class="sc">${mid}</div>
    <div class="tm"><img src="${esc(m.logo_b)}" alt="" onerror="this.style.visibility='hidden'">${esc(m.nom_equipe_b)}</div></div>`;
}

function badge(m){
  if (!played(m)) return "";
  if (forfait(m)) return `<span class="tag">Forfait</span>`;
  if (m.statut.toLowerCase().includes("arr")) return `<span class="tag">Arrêté</span>`;
  return `<span class="tag ok">Terminé</span>`;
}

function renderMatchs(){
  $("#main").innerHTML = state.matches.map((m, i) => {
    // Création du lien cliquable si l'URL de la carte existe
    const lieuHtml = m.lieu_lien_carte
      ? `<a href="${esc(m.lieu_lien_carte)}" target="_blank" onclick="event.stopPropagation()" style="color:inherit; text-decoration:underline;">📍 ${esc(m.lieu || "Lieu à confirmer")}</a>`
      : `📍 ${esc(m.lieu || "Lieu à confirmer")}`;

    return `<div class="m" data-i="${i}" ${!played(m) ? "data-next" : ""}>
    <div class="mh"><span>${dateTxt(parseDate(m.texte))}</span>${badge(m)}</div>
    ${scoreBlock(m)}
    <div class="mh" style="margin:10px 0 0;justify-content:center">${lieuHtml}</div></div>`;
  }).join("") || `<div class="mut">Aucun match</div>`;
  
  document.querySelectorAll(".m").forEach(el => el.onclick = () => renderDetail(+el.dataset.i));
  const next = $("[data-next]");
  if (next) next.scrollIntoView({ block: "start" });
}

function lineup(list){
  if (!list || !list.length) return `<div class="mut" style="padding:8px">—</div>`;
  const row = j => `<div class="pl"><b>${esc(j.maillot)}</b>${esc(j.nom)}${j.evenements && j.evenements.length ? `<i>${j.evenements.map(esc).join(" · ")}</i>` : ""}</div>`;
  const starters = list.filter(j => j.role === "titulaire");
  const subs = list.filter(j => j.role !== "titulaire");
  return `<div class="sec" style="margin-top:0">Titulaires</div>${starters.map(row).join("")}` +
         (subs.length ? `<div class="sec">Remplaçants</div>${subs.map(row).join("")}` : "");
}

function renderDetail(i){
  const m = state.matches[i], moments = m.moments_forts || [];
  
  // Création du lien cliquable pour la vue détaillée
  const lieuHtml = m.lieu_lien_carte
    ? `<a href="${esc(m.lieu_lien_carte)}" target="_blank" style="color:inherit; text-decoration:underline;">📍 ${esc(m.lieu || "Lieu à confirmer")}</a>`
    : `📍 ${esc(m.lieu || "Lieu à confirmer")}`;

  let h = `<button class="back" id="back">← Retour</button>
    <div class="m" style="cursor:default"><div class="mh" style="justify-content:center;flex-direction:column;text-align:center;align-items:center">
      <span>${dateTxt(parseDate(m.texte))}</span><span>${lieuHtml}</span>${badge(m)}</div>${scoreBlock(m, true)}</div>`;

  if (!played(m)) {
    h += `<div class="mut">Match à venir.<br>Les compositions seront disponibles après le match.</div>`;
  } else {
    if (moments.length) {
      h += `<div class="sec">Moments forts</div>` + moments.map(e => `<div class="ev ${e.equipe === "exterieur" ? "b" : ""}">
        <div class="mn">${esc(e.minute)}</div><div style="font-size:18px">${icon(e.type)}</div>
        <div class="tx">${esc(e.description || e.joueur)}</div></div>`).join("");
    }
    const none = !(m.joueurs_a || []).length && !(m.joueurs_b || []).length;
    h += none ? `<div class="mut">Pas de feuille de match disponible.</div>` :
      `<div class="sec">Compositions</div><div class="cols">
        <div><b style="font-size:13px">${esc(m.nom_equipe_a)}</b>${lineup(m.joueurs_a)}</div>
        <div><b style="font-size:13px">${esc(m.nom_equipe_b)}</b>${lineup(m.joueurs_b)}</div></div>`;
  }
  $("#main").innerHTML = h;
  $("#main").scrollTop = 0;
  $("#back").onclick = render;
}
