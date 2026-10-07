// Données et utilitaires : chargement des JSON, dates, état de l'appli

const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const cap = s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

// État partagé entre les fichiers
const state = { team: null, tab: "classement", classement: [], matches: [] };

// Mémoire du téléphone (équipe choisie)
const store = {
  get(k){ try{ return localStorage.getItem(k) }catch(e){ return null } },
  set(k,v){ try{ localStorage.setItem(k,v) }catch(e){} }
};

// Lit la date dans le champ "texte" (les matchs joués n'ont pas de champ "date")
function parseDate(texte){
  const m = /^(\S{3})\s+(\d{1,2})\s+(\S{3,4})\s+(\d{4})\s*-\s*(\d{1,2})[Hh](\d{2})/.exec(texte || "");
  return m ? { jour: cap(m[1]), j: m[2], mois: cap(m[3]), h: m[5].padStart(2,"0") + "h" + m[6] } : null;
}
const dateTxt = d => d ? `${d.jour} ${d.j} ${d.mois} · ${d.h}` : "Date à confirmer";

const played  = m => m.statut && m.statut.toLowerCase() !== "à venir";
const forfait = m => /forfait/i.test(m.texte || "");

// Icône selon le type d'événement
function icon(t){
  t = (t || "").toLowerCase();
  if (t.includes("yellow") || t.includes("jaune")) return "🟨";
  if (t.includes("red") || t.includes("rouge")) return "🟥";
  if (t.includes("goal") || t.includes("but")) return "⚽";
  if (t.includes("chang") || t.includes("subst")) return "🔄";
  return "•";
}

// Charge classement + matchs d'une équipe
async function load(name){
  const suffix = EQUIPES[name];
  const get = async f => {
    const r = await fetch(BASE + f + "?t=" + Math.floor(Date.now() / 60000));
    if (!r.ok) throw new Error(f + " : " + r.status);
    return (await r.json()).items || [];
  };
  const [c, m] = await Promise.all([get(`classement_${suffix}.json`), get(`matchs_${suffix}.json`)]);
  state.classement = c;
  state.matches = m;
}
