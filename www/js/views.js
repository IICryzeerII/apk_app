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

function renderInfos() {
  const inf = state.infos;
  if (!inf) {
    $("#main").innerHTML = `<div class="mut">Informations du club indisponibles.</div>`;
    return;
  }

  let html = ``;

  // --- SECTION 1 : INFORMATIONS ---
  html += `<h2 style="margin: 15px 0 10px 5px; color: #fff; font-size: 18px; text-transform: uppercase;">Informations</h2>`;
  html += `<div class="cols">`; 

  // Carte Identité
  html += `
    <div class="card-info">
      <div class="sec" style="margin-top:0">Identité</div>
      <div style="margin-bottom:8px"><b style="display:block;font-size:11px;color:var(--mut)">Nom :</b> ${esc(inf.identite.nom)}</div>
      <div style="margin-bottom:8px"><b style="display:block;font-size:11px;color:var(--mut)">Numéro d'affiliation :</b> ${esc(inf.identite.numero_affiliation)}</div>
      <div style="margin-bottom:8px"><b style="display:block;font-size:11px;color:var(--mut)">Ligue :</b> ${esc(inf.identite.ligue)}</div>
      <div><b style="display:block;font-size:11px;color:var(--mut)">District :</b> ${esc(inf.identite.district)}</div>
    </div>
  `;

  // Carte Coordonnées
  html += `
    <div class="card-info">
      <div class="sec" style="margin-top:0">Coordonnées</div>
      <div style="margin-bottom:12px">
        <b style="display:block;font-size:11px;color:var(--mut)">Email officiel :</b>
        <a href="mailto:${esc(inf.contact_club.email)}" style="color:inherit;text-decoration:none">📧 ${esc(inf.contact_club.email)}</a>
      </div>
      <div>
        <b style="display:block;font-size:11px;color:var(--mut)">Téléphone autre :</b>
        <a href="tel:${esc(inf.contact_club.telephone).replace(/\s/g, '')}" style="color:inherit;text-decoration:none">📞 ${esc(inf.contact_club.telephone)}</a>
      </div>
    </div>
  `;
  html += `</div>`; // Fin de la grille Informations

  // --- SECTION 2 : INSTALLATIONS ---
  html += `<h2 style="margin: 25px 0 10px 5px; color: #fff; font-size: 18px; text-transform: uppercase;">Les Installations</h2>`;
  
  const mapBtn = inf.installation.lien_maps 
    ? `<a href="${esc(inf.installation.lien_maps)}" target="_blank" style="display:inline-block; margin-top:12px; background:var(--card2); border:1px solid var(--acc); color:var(--acc); padding:8px 12px; border-radius:6px; text-decoration:none; font-size:11px; font-weight:bold; letter-spacing: 0.5px;">🗺️ VOIR SUR LA CARTE</a>` 
    : '';

  html += `
    <div class="card-info">
      <div class="sec" style="margin-top:0; color:var(--acc); text-transform:uppercase;">${esc(inf.installation.nom)}</div>
      <div style="font-size:13px; color:var(--txt);">${esc(inf.installation.description)}</div>
      ${mapBtn}
    </div>
  `;

  // --- SECTION 3 : STAFF ---
  html += `<h2 style="margin: 25px 0 10px 5px; color: #fff; font-size: 18px; text-transform: uppercase;">Le Staff</h2>`;
  html += `<div class="cols">`;

  // Carte Président
  if (inf.staff.bureau.president) {
    const p = inf.staff.bureau.president;
    html += `
      <div class="card-info">
        <div class="sec" style="margin-top:0">Président</div>
        <div style="font-weight:bold; margin-bottom:8px;">👤 ${esc(p.nom)}</div>
        ${p.email ? `<div style="font-size:12px; margin-bottom:4px;"><a href="mailto:${esc(p.email)}" style="color:var(--mut);text-decoration:none">📧 ${esc(p.email)}</a></div>` : ''}
        ${p.telephone ? `<div style="font-size:12px;"><a href="tel:${esc(p.telephone).replace(/\s/g, '')}" style="color:var(--mut);text-decoration:none">📞 ${esc(p.telephone)}</a></div>` : ''}
      </div>
    `;
  }

  // Carte Vice-Président
  if (inf.staff.bureau.vice_president) {
    html += `
      <div class="card-info">
        <div class="sec" style="margin-top:0">Vice-Président</div>
        <div style="font-weight:bold;">👤 ${esc(inf.staff.bureau.vice_president)}</div>
      </div>
    `;
  }

  // Cartes Seniors (Coachs)
  if (state.team.toLowerCase().includes("senior") && inf.staff.seniors) {
    inf.staff.seniors.forEach(coach => {
      html += `
        <div class="card-info">
          <div class="sec" style="margin-top:0">${esc(coach.role)}</div>
          <div style="font-weight:bold; margin-bottom:8px;">⚽ ${esc(coach.nom)}</div>
          ${coach.telephone ? `<div style="font-size:12px;"><a href="tel:${esc(coach.telephone).replace(/\s/g, '')}" style="color:var(--mut);text-decoration:none">📞 ${esc(coach.telephone)}</a></div>` : ''}
        </div>
      `;
    });
  }

  html += `</div>`; // Fin de la grille Staff

  $("#main").innerHTML = html;
  $("#main").scrollTop = 0;
}