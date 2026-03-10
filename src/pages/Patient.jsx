import { useState, useEffect } from "react";

// ══════════════════════════════════════════════════════════════════════
//  ⚙️  CONFIG — Remplace par ton URL Google Apps Script déployé
// ══════════════════════════════════════════════════════════════════════
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx2o28zWgdBWy9ZLbojl0KLMtHZqW965n5GCaqy5kNhDEXumMLO1Z5h6ClHirVLjTPulA/exec"
async function fetchHopitaux() {
  try {
    const r = await fetch(APPS_SCRIPT_URL + "?action=getHopitaux");
    const data = await r.json();
    if (data.ok && data.hopitaux && data.hopitaux.length > 0) {
      return data.hopitaux.map(h => ({
        id:       h.id,
        name:     h.nom,
        city:     h.ville,
        address:  h.adresse   || "",
        phone:    h.telephone || "",
        lat:      parseFloat(h.lat) || 0,
        lng:      parseFloat(h.lng) || 0,
        departments: (h.sections || []).map((s, i) => ({
          id:        h.id + "_S" + i,
          name:      s.nom,
          icon:      s.icon      || "\uD83C\uDFE5",
          freeBeds:  parseInt(s.libres)   || 0,
          totalBeds: parseInt(s.capacite) || 20,
          slots:     s.horaires  || ["08:00","09:00","10:00","14:00","15:00"],
        })),
      }));
    }
  } catch(e) { console.warn("fetchHopitaux:", e); }
  return null;
}
// ══════════════════════════════════════════════════════════════════════
//  DONNÉES DÉMO
// ══════════════════════════════════════════════════════════════════════
const DEMO_HOSPITALS = [
  {
    id:"H001", name:"CHU Ibn Sina", city:"Rabat", address:"Av. Ibn Sina, Souissi",
    phone:"0537-67-20-70", lat:33.9889, lng:-6.8555,
    departments:[
      {id:"D001",name:"Urgences",    icon:"🚨",freeBeds:4, totalBeds:20,slots:["08:00","09:30","11:00","14:00","15:30"]},
      {id:"D002",name:"Cardiologie",icon:"❤️",freeBeds:8, totalBeds:30,slots:["09:00","10:30","14:00","16:00"]},
      {id:"D003",name:"Pédiatrie",  icon:"👶",freeBeds:12,totalBeds:25,slots:["08:30","10:00","11:30","15:00"]},
      {id:"D004",name:"Chirurgie",  icon:"🔪",freeBeds:0, totalBeds:40,slots:[]},
      {id:"D005",name:"Neurologie", icon:"🧠",freeBeds:3, totalBeds:20,slots:["10:00","14:30"]},
    ],
  },
  {
    id:"H002", name:"Hôpital Avicenne", city:"Casablanca", address:"Rue Moulay Youssef",
    phone:"0522-22-41-00", lat:33.5731, lng:-7.5898,
    departments:[
      {id:"D006",name:"Urgences",    icon:"🚨",freeBeds:2, totalBeds:15,slots:["08:00","09:00","11:00"]},
      {id:"D007",name:"Cardiologie", icon:"❤️",freeBeds:6, totalBeds:25,slots:["09:30","11:00","14:30","16:00"]},
      {id:"D008",name:"Pédiatrie",   icon:"👶",freeBeds:11,totalBeds:20,slots:["08:00","09:30","11:00","14:00","15:30"]},
      {id:"D009",name:"Dermatologie",icon:"🩺",freeBeds:5, totalBeds:18,slots:["10:00","11:30","15:00"]},
    ],
  },
  {
    id:"H003", name:"Hôpital Hassan II", city:"Fès", address:"Bd Hassan II",
    phone:"0535-93-50-50", lat:34.0347, lng:-5.0003,
    departments:[
      {id:"D010",name:"Urgences",  icon:"🚨",freeBeds:0, totalBeds:18,slots:[]},
      {id:"D011",name:"Cardiologie",icon:"❤️",freeBeds:5,totalBeds:28,slots:["10:00","14:00","16:00"]},
      {id:"D012",name:"Pédiatrie", icon:"👶",freeBeds:7,totalBeds:22,slots:["09:00","11:00","15:30"]},
      {id:"D013",name:"Chirurgie", icon:"🔪",freeBeds:20,totalBeds:38,slots:["08:00","09:00","10:00","14:00","15:00","16:00"]},
    ],
  },
  {
    id:"H004", name:"Hôpital Militaire Med V", city:"Rabat", address:"Hay Riad",
    phone:"0537-71-15-00", lat:33.9603, lng:-6.8536,
    departments:[
      {id:"D014",name:"Urgences",     icon:"🚨",freeBeds:7,totalBeds:25,slots:["08:00","09:00","10:00","11:00","14:00","15:00"]},
      {id:"D015",name:"Ophtalmologie",icon:"👁️",freeBeds:9,totalBeds:15,slots:["09:00","10:30","14:00","15:30"]},
      {id:"D016",name:"Orthopédie",   icon:"🦴",freeBeds:4,totalBeds:20,slots:["10:00","14:30"]},
    ],
  },
  {
    id:"H005", name:"Clinique Al Farabi", city:"Marrakech", address:"Av. Mohamed VI",
    phone:"0524-33-71-00", lat:31.6295, lng:-7.9811,
    departments:[
      {id:"D017",name:"Cardiologie",icon:"❤️",freeBeds:4,totalBeds:12,slots:["09:30","11:00","15:00"]},
      {id:"D018",name:"Gynécologie",icon:"🌸",freeBeds:6,totalBeds:15,slots:["08:30","10:00","14:00","16:00"]},
      {id:"D019",name:"Pédiatrie",  icon:"👶",freeBeds:3,totalBeds:10,slots:["09:00","11:30","15:30"]},
    ],
  },
];

function getDistanceKm(lat1,lng1,lat2,lng2){
  const R=6371,dLat=((lat2-lat1)*Math.PI)/180,dLng=((lng2-lng1)*Math.PI)/180;
  const a=Math.sin(dLat/2)**2+Math.cos((lat1*Math.PI)/180)*Math.cos((lat2*Math.PI)/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
function getNextDates(n=7){
  return Array.from({length:n},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()+i);
    return {iso:d.toISOString().split("T")[0],label:d.toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"}),isToday:i===0};
  });
}
// ─────────────────────────────────────────────────────────────────────
//  ENVOI VERS GOOGLE SHEETS
//  Pourquoi cette méthode ?
//  fetch() avec mode:"no-cors" NE FONCTIONNE PAS avec Apps Script :
//  le navigateur bloque le corps JSON avant même qu'il parte.
//  La seule méthode fiable depuis un navigateur = URLSearchParams
//  avec mode:"no-cors" ET Content-Type application/x-www-form-urlencoded
//  OU un formulaire caché. On utilise URLSearchParams ici.
// ─────────────────────────────────────────────────────────────────────
async function saveToSheets(data) {
  try {
    // Convertir les données en paramètres URL (pas JSON)
    // Apps Script lit e.parameter.xxx depuis ce format
    const params = new URLSearchParams();
    Object.entries(data).forEach(([k, v]) => {
      params.append(k, v == null ? "" : String(v));
    });

    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    return { success: true };
  } catch (e) {
    console.error("saveToSheets error:", e);
    return { success: false };
  }
}

// ══════════════════════════════════════════════════════════════════════
//  CSS — THÈME DOKITA VERT
// ══════════════════════════════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Instrument+Sans:wght@400;500;600&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  /* ── Palette Verte Dokita ── */
  --g900:#052e1c;
  --g800:#0a5c36;
  --g700:#0a7c5c;
  --g600:#0d9966;
  --g500:#10b981;
  --g400:#34d399;
  --g300:#6ee7b7;
  --g100:#d1fae5;
  --g50: #ecfdf5;
  --g25: #f0fdf7;

  --lime:#84cc16;
  --lime-l:#f7fee7;

  --red:#ef4444;   --red-l:#fef2f2;
  --amber:#f59e0b; --amber-l:#fffbeb;

  --gray-50:#f9fafb;  --gray-100:#f3f4f6; --gray-200:#e5e7eb;
  --gray-300:#d1d5db; --gray-400:#9ca3af; --gray-500:#6b7280;
  --gray-600:#4b5563; --gray-700:#374151; --gray-800:#1f2937; --gray-900:#111827;
  --white:#ffffff;

  --shadow-xs:0 1px 2px rgba(0,0,0,.06);
  --shadow-sm:0 1px 4px rgba(0,0,0,.08),0 1px 2px rgba(0,0,0,.04);
  --shadow:0 4px 16px rgba(0,0,0,.08),0 2px 6px rgba(0,0,0,.04);
  --shadow-green:0 8px 24px rgba(10,124,92,.2);
  --r:16px; --r-sm:11px; --r-xs:8px;
}

body{
  font-family:'Instrument Sans',sans-serif;
  background:var(--gray-50);
  color:var(--gray-800);
  min-height:100vh;
  -webkit-font-smoothing:antialiased;
}
.app{min-height:100vh;display:flex;flex-direction:column}

/* ── HEADER ─────────────────────────────────────────── */
.header{
  background:var(--white);
  border-bottom:1px solid var(--gray-200);
  position:sticky;top:0;z-index:50;
}
.header-inner{
  max-width:540px;margin:0 auto;padding:.85rem 1.1rem;
  display:flex;align-items:center;justify-content:space-between;
}
.logo{
  display:flex;align-items:center;gap:.5rem;
  font-family:'Plus Jakarta Sans',sans-serif;
  font-size:1.35rem;font-weight:800;color:var(--g700);
  letter-spacing:-0.5px;
}
.logo-mark{
  width:36px;height:36px;border-radius:10px;
  background:linear-gradient(135deg,var(--g600) 0%,var(--g400) 100%);
  display:flex;align-items:center;justify-content:center;
  box-shadow:var(--shadow-green);
  overflow:hidden;flex-shrink:0;
}
.logo-cross{display:none}
.avatar{
  width:34px;height:34px;border-radius:50%;
  background:linear-gradient(135deg,var(--g500),var(--g700));
  display:flex;align-items:center;justify-content:center;
  font-size:.82rem;font-weight:700;color:white;
  box-shadow:0 2px 8px rgba(10,124,92,.3);
}

/* ── PAGE ───────────────────────────────────────────── */
.page{flex:1;max-width:540px;margin:0 auto;width:100%;padding:1.4rem 1rem 5.5rem}

/* ── CARD ───────────────────────────────────────────── */
.card{
  background:var(--white);border-radius:var(--r);
  border:1px solid var(--gray-200);
  box-shadow:var(--shadow-sm);overflow:hidden;
  animation:up .3s ease both;
}
@keyframes up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.card-body{padding:1.25rem}

/* ── TYPE ───────────────────────────────────────────── */
.title{font-family:'Plus Jakarta Sans',sans-serif;font-size:1.35rem;font-weight:800;color:var(--gray-900);line-height:1.25}
.sub  {font-size:.85rem;color:var(--gray-500);margin-top:.2rem}
.sec  {font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.9px;color:var(--gray-400);margin-bottom:.7rem}

/* ── FORM ───────────────────────────────────────────── */
.field{display:flex;flex-direction:column;gap:.35rem;margin-bottom:.9rem}
.field:last-child{margin-bottom:0}
label{font-size:.78rem;font-weight:600;color:var(--gray-600)}
input,select{
  padding:.7rem 1rem;border-radius:var(--r-sm);
  border:1.5px solid var(--gray-200);background:var(--white);
  font-family:inherit;font-size:.9rem;color:var(--gray-800);
  outline:none;transition:border-color .2s,box-shadow .2s;width:100%;
}
input:focus,select:focus{
  border-color:var(--g500);
  box-shadow:0 0 0 3px rgba(16,185,129,.12);
}
input::placeholder{color:var(--gray-400)}
.iw{position:relative}
.ii{position:absolute;left:.9rem;top:50%;transform:translateY(-50%);color:var(--gray-400);font-size:.9rem;pointer-events:none}
.iw input{padding-left:2.4rem}

/* ── BUTTONS ────────────────────────────────────────── */
.btn{
  display:inline-flex;align-items:center;justify-content:center;gap:.4rem;
  padding:.75rem 1.5rem;border-radius:var(--r-sm);border:none;
  font-family:inherit;font-size:.9rem;font-weight:600;
  cursor:pointer;transition:all .2s;white-space:nowrap;
}
.btn-primary{
  background:linear-gradient(135deg,var(--g600) 0%,var(--g500) 100%);
  color:white;box-shadow:0 4px 14px rgba(10,124,92,.25);
}
.btn-primary:hover{box-shadow:var(--shadow-green);transform:translateY(-1px)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none}
.btn-outline{background:transparent;color:var(--g700);border:1.5px solid var(--g300)}
.btn-outline:hover{background:var(--g50)}
.btn-ghost{background:var(--gray-100);color:var(--gray-600)}
.btn-ghost:hover{background:var(--gray-200)}
.btn-sm{padding:.48rem .9rem;font-size:.8rem;border-radius:var(--r-xs)}
.btn-block{width:100%}

/* ── ALERTS ─────────────────────────────────────────── */
.alert{padding:.7rem .9rem;border-radius:var(--r-xs);font-size:.82rem;font-weight:500;margin-bottom:.9rem;display:flex;align-items:flex-start;gap:.5rem;line-height:1.45}
.alert-g   {background:var(--g50);color:var(--g800);border:1px solid var(--g300)}
.alert-err {background:var(--red-l);color:var(--red);border:1px solid rgba(239,68,68,.2)}
.alert-warn{background:var(--amber-l);color:#92400e;border:1px solid rgba(245,158,11,.2)}

/* ── BADGE ──────────────────────────────────────────── */
.badge{display:inline-flex;align-items:center;gap:.25rem;padding:.18rem .6rem;border-radius:99px;font-size:.7rem;font-weight:700}
.badge-g   {background:var(--g100);color:var(--g800)}
.badge-red {background:var(--red-l);color:var(--red)}
.badge-gray{background:var(--gray-100);color:var(--gray-500)}
.badge-lime{background:var(--lime-l);color:#3a5c00}

/* ── BOTTOM NAV ─────────────────────────────────────── */
.bnav{
  position:fixed;bottom:0;left:0;right:0;
  background:var(--white);border-top:1px solid var(--gray-200);
  display:flex;padding:.4rem 0 calc(.4rem + env(safe-area-inset-bottom));
  z-index:50;box-shadow:0 -4px 16px rgba(0,0,0,.06);
}
.bitem{
  flex:1;display:flex;flex-direction:column;align-items:center;gap:.2rem;
  padding:.35rem .5rem;border:none;background:transparent;cursor:pointer;
  font-family:inherit;font-size:.65rem;font-weight:600;color:var(--gray-400);
  transition:color .2s;
}
.bitem.on{color:var(--g600)}
.bitem svg{width:21px;height:21px}
.bpip{width:4px;height:4px;border-radius:50%;background:var(--g500);margin:0 auto}

/* ── HOSPITAL CARD ──────────────────────────────────── */
.hcard{
  background:var(--white);border-radius:var(--r);
  border:1.5px solid var(--gray-200);padding:1.05rem;
  cursor:pointer;transition:all .2s;margin-bottom:.7rem;
  position:relative;overflow:hidden;
}
.hcard::before{
  content:'';position:absolute;top:0;left:0;right:0;height:3px;
  background:linear-gradient(90deg,var(--g600),var(--g400));
  transform:scaleX(0);transform-origin:left;transition:transform .25s;
}
.hcard:hover{border-color:var(--g300);box-shadow:var(--shadow)}
.hcard:hover::before,.hcard.sel::before{transform:scaleX(1)}
.hcard.sel{border-color:var(--g400);background:var(--g25)}
.hname{font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:.98rem;color:var(--gray-900)}
.hcity{font-size:.78rem;color:var(--gray-500);margin-top:.15rem}
.hmeta{display:flex;align-items:center;gap:.6rem;margin-top:.55rem;flex-wrap:wrap}
.hdist{font-size:.72rem;font-weight:700;color:var(--g700);background:var(--g100);padding:.15rem .5rem;border-radius:99px}
.havail{font-size:.75rem;font-weight:700}
.havail.ok{color:var(--g600)} .havail.no{color:var(--red)}
.hprog{height:4px;background:var(--gray-100);border-radius:99px;overflow:hidden;margin-top:.5rem}
.hpbar{height:100%;border-radius:99px;transition:width .5s}
.hp-ok{background:linear-gradient(90deg,var(--g500),var(--g400))}
.hp-lo{background:var(--amber)}
.hp-no{background:var(--red)}

/* ── DEPT CARD ──────────────────────────────────────── */
.dcard{
  border:1.5px solid var(--gray-200);border-radius:var(--r-sm);
  padding:.85rem 1rem;cursor:pointer;transition:all .2s;
  display:flex;align-items:center;gap:.85rem;
  margin-bottom:.55rem;background:var(--white);
}
.dcard:hover:not(.dfull){border-color:var(--g300);background:var(--g25)}
.dcard.dsel{border-color:var(--g500);background:var(--g50)}
.dfull{opacity:.45;cursor:not-allowed}
.dicon{width:38px;height:38px;border-radius:10px;background:var(--g50);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0}
.dname{font-weight:700;font-size:.9rem;color:var(--gray-800)}
.dinfo{font-size:.74rem;color:var(--gray-500);margin-top:.1rem}
.dbeds{font-size:.78rem;font-weight:700;margin-left:auto;flex-shrink:0}
.dbeds.ok{color:var(--g600)} .dbeds.lo{color:var(--amber)} .dbeds.no{color:var(--red)}

/* ── DATE TABS ──────────────────────────────────────── */
.dtabs{display:flex;gap:.4rem;overflow-x:auto;padding-bottom:.4rem;margin-bottom:.9rem;scrollbar-width:none}
.dtabs::-webkit-scrollbar{display:none}
.dtab{
  flex-shrink:0;padding:.38rem .75rem;border-radius:var(--r-xs);
  border:1.5px solid var(--gray-200);font-family:inherit;
  font-size:.75rem;font-weight:600;cursor:pointer;
  background:var(--white);color:var(--gray-600);transition:all .2s;white-space:nowrap;
}
.dtab:hover{border-color:var(--g300);color:var(--g700)}
.dtab.on{background:linear-gradient(135deg,var(--g600),var(--g500));color:white;border-color:transparent;box-shadow:0 3px 10px rgba(10,124,92,.25)}

/* ── TIME SLOTS ─────────────────────────────────────── */
.sgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:.45rem}
.slot{
  padding:.55rem .4rem;border-radius:var(--r-xs);
  border:1.5px solid var(--gray-200);text-align:center;
  font-family:inherit;font-size:.8rem;font-weight:600;
  cursor:pointer;background:var(--white);color:var(--gray-700);transition:all .2s;
}
.slot:hover{border-color:var(--g400);color:var(--g700)}
.slot.on{background:linear-gradient(135deg,var(--g600),var(--g500));color:white;border-color:transparent;box-shadow:0 3px 8px rgba(10,124,92,.2)}

/* ── STEP BAR ───────────────────────────────────────── */
.sbar{display:flex;align-items:center;margin-bottom:1.4rem;gap:0}
.sitem{display:flex;align-items:center;gap:.3rem;font-size:.72rem;font-weight:700}
.scirc{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:800;flex-shrink:0}
.scirc.dn{background:var(--g500);color:white}
.scirc.ac{background:var(--g700);color:white;box-shadow:0 0 0 3px rgba(16,185,129,.2)}
.scirc.td{background:var(--gray-200);color:var(--gray-400)}
.slbl{color:var(--gray-400)}.slbl.ac{color:var(--gray-800)}.slbl.dn{color:var(--gray-600)}
.sline{flex:1;height:2px;background:var(--gray-200);margin:0 .35rem}
.sline.dn{background:var(--g400)}

/* ── SEARCH ─────────────────────────────────────────── */
.searchbar{
  display:flex;align-items:center;gap:.5rem;padding:.75rem .9rem;
  background:var(--white);border-radius:var(--r);
  border:1.5px solid var(--gray-200);box-shadow:var(--shadow-xs);margin-bottom:.75rem;
}
.searchbar:focus-within{border-color:var(--g400);box-shadow:0 0 0 3px rgba(16,185,129,.1)}
.searchbar input{border:none;outline:none;background:transparent;flex:1;font-family:inherit;font-size:.9rem;color:var(--gray-800)}
.searchbar input::placeholder{color:var(--gray-400)}
.si{color:var(--gray-400);flex-shrink:0}
.geobtn{
  display:flex;align-items:center;gap:.3rem;padding:.4rem .75rem;
  border-radius:var(--r-xs);border:1.5px solid var(--gray-200);
  background:var(--white);font-family:inherit;font-size:.74rem;font-weight:600;
  color:var(--gray-500);cursor:pointer;transition:all .2s;white-space:nowrap;flex-shrink:0;
}
.geobtn:hover{border-color:var(--g300);color:var(--g700)}
.geobtn.on{border-color:var(--g400);color:var(--g700);background:var(--g50)}

/* ── CONFIRM ─────────────────────────────────────────── */
.chero{
  background:linear-gradient(135deg,var(--g700) 0%,var(--g500) 100%);
  border-radius:var(--r);padding:1.6rem;color:white;text-align:center;margin-bottom:1rem;
  position:relative;overflow:hidden;
}
.chero::before{
  content:'';position:absolute;inset:0;
  background:repeating-linear-gradient(45deg,rgba(255,255,255,.03) 0px,rgba(255,255,255,.03) 1px,transparent 1px,transparent 12px);
}
.chero-content{position:relative;z-index:1}
.chero-icon{width:58px;height:58px;background:rgba(255,255,255,.2);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto .7rem;font-size:1.5rem}
.chero-title{font-family:'Plus Jakarta Sans',sans-serif;font-size:1.35rem;font-weight:800}
.chero-sub{opacity:.8;font-size:.82rem;margin-top:.25rem}
.drow{display:flex;align-items:flex-start;gap:.7rem;padding:.7rem 0;border-bottom:1px solid var(--gray-100)}
.drow:last-child{border-bottom:none}
.dico{width:30px;height:30px;border-radius:8px;background:var(--g50);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:.85rem}
.dlbl{font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--gray-400);margin-bottom:.12rem}
.dval{font-size:.88rem;font-weight:600;color:var(--gray-800)}

/* ── PROFILE ─────────────────────────────────────────── */
.phero{
  background:linear-gradient(135deg,var(--g700) 0%,var(--g400) 100%);
  border-radius:var(--r);padding:1.4rem;color:white;text-align:center;margin-bottom:1rem;
}
.pav{width:64px;height:64px;background:rgba(255,255,255,.2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.6rem;margin:0 auto .65rem}
.pname{font-family:'Plus Jakarta Sans',sans-serif;font-size:1.15rem;font-weight:800}
.pemail{font-size:.78rem;opacity:.75;margin-top:.15rem}
.pstat{display:flex;gap:.65rem;justify-content:center;margin-top:.75rem}
.pstatbox{background:rgba(255,255,255,.15);border-radius:9px;padding:.45rem .9rem;text-align:center}
.pstatval{font-weight:800;font-size:1.05rem}
.pstatlbl{font-size:.68rem;opacity:.75}
.mitem{display:flex;align-items:center;gap:.8rem;padding:.9rem 1.1rem;border-bottom:1px solid var(--gray-100);cursor:pointer;transition:background .15s}
.mitem:last-child{border-bottom:none}
.mitem:hover{background:var(--g25)}
.mico{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:.9rem;flex-shrink:0;background:var(--g50)}
.mlbl{font-weight:600;font-size:.88rem;flex:1}
.marr{color:var(--gray-300);font-size:.8rem}

/* ── RDV CARD ────────────────────────────────────────── */
.rcard{background:var(--white);border-radius:var(--r);border:1px solid var(--gray-200);overflow:hidden;margin-bottom:.7rem;box-shadow:var(--shadow-xs)}
.rtop{background:linear-gradient(90deg,var(--g50),var(--g25));padding:.7rem 1rem;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--g100)}
.rbody{padding:.9rem 1rem}
.rrow{display:flex;align-items:center;gap:.45rem;font-size:.83rem;color:var(--gray-600);margin-bottom:.3rem}
.rrow:last-child{margin-bottom:0}
.rrow strong{color:var(--gray-800)}

/* ── AUTH SCREEN ─────────────────────────────────────── */
.auth-hero{
  background:linear-gradient(160deg,var(--g700) 0%,var(--g500) 60%,var(--g400) 100%);
  padding:3.5rem 1.5rem 3rem;text-align:center;color:white;
  position:relative;overflow:hidden;
}
.auth-pattern{
  position:absolute;inset:0;
  background-image:radial-gradient(circle,rgba(255,255,255,.08) 1px,transparent 1px);
  background-size:20px 20px;
}
.auth-logo{position:relative;z-index:1}
.auth-bigmark{
  width:76px;height:76px;background:rgba(255,255,255,.2);border-radius:20px;
  display:flex;align-items:center;justify-content:center;
  margin:0 auto 1rem;font-size:2.2rem;
  box-shadow:0 8px 32px rgba(0,0,0,.15);
  backdrop-filter:blur(10px);
}
.auth-appname{font-family:'Plus Jakarta Sans',sans-serif;font-size:2.2rem;font-weight:800;letter-spacing:-1px}
.auth-tagline{opacity:.8;font-size:.9rem;margin-top:.3rem}
.auth-toggle{
  display:flex;background:var(--gray-100);border-radius:var(--r-sm);
  padding:.22rem;margin-bottom:1.25rem;
}
.auth-toggle-btn{
  flex:1;padding:.58rem;border-radius:var(--r-xs);border:none;
  font-family:inherit;font-weight:700;font-size:.875rem;cursor:pointer;
  transition:all .2s;
}
.auth-toggle-btn.on{background:var(--white);color:var(--g700);box-shadow:var(--shadow-sm)}
.auth-toggle-btn.off{background:transparent;color:var(--gray-500)}

/* ── MISC ───────────────────────────────────────────── */
.divider{height:1px;background:var(--gray-100);margin:.9rem 0}
.row{display:flex;gap:.7rem;align-items:center;flex-wrap:wrap}
.flex1{flex:1} .tc{text-align:center}
.mt1{margin-top:.35rem} .mt2{margin-top:.8rem} .mt3{margin-top:1.25rem}
.mb1{margin-bottom:.35rem} .mb2{margin-bottom:.8rem}
.empty{text-align:center;padding:3rem 1rem}
.emptyico{font-size:2.8rem;margin-bottom:.65rem}
.emptytxt{color:var(--gray-500);font-size:.88rem}
.spin{width:18px;height:18px;border:2.5px solid rgba(255,255,255,.3);border-top-color:white;border-radius:50%;animation:sp .6s linear infinite;flex-shrink:0}
@keyframes sp{to{transform:rotate(360deg)}}
.tl{font-size:.75rem} .tx{font-size:.7rem} .tm{color:var(--gray-500)}
`;

// ══════════════════════════════════════════════════════════════════════
//  SVG ICONS
// ══════════════════════════════════════════════════════════════════════
const Ic = {
  Home:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Cal:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Plus:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  User:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Search:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Pin:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Left:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>,
  Right:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>,
  Check:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Out:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  Geo:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 16v-4m10-8h-4M6 12H2"/></svg>,
  Info:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
};

// ══════════════════════════════════════════════════════════════════════
//  ROOT
// ══════════════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser]   = useState(null);
  const [screen, setScreen] = useState("login");
  const [tab, setTab]     = useState("home");
  const [rdvs, setRdvs]   = useState([]);
  const [draft, setDraft] = useState(null);
  const [hospitals, setHospitals] = useState(DEMO_HOSPITALS);

  useEffect(()=>{
    const u = localStorage.getItem("dokita_user");
    const r = localStorage.getItem("dokita_rdvs");
    if(u){setUser(JSON.parse(u));setScreen("main")}
    if(r) setRdvs(JSON.parse(r));
    fetchHopitaux().then(h => { if(h) setHospitals(h); });
  },[]);

  function login(u){setUser(u);localStorage.setItem("dokita_user",JSON.stringify(u));setScreen("main")}
  function logout(){localStorage.removeItem("dokita_user");setUser(null);setScreen("login");setTab("home")}
  function addRdv(r){const u=[r,...rdvs];setRdvs(u);localStorage.setItem("dokita_rdvs",JSON.stringify(u))}
  function book(h){setDraft({hospital:h});setTab("book")}

  return(
    <>
      <style>{CSS}</style>
      <div className="app">
        {screen==="login"
          ? <AuthScreen onLogin={login}/>
          : <>
              <header className="header">
                <div className="header-inner">
                  <div className="logo">
                    <div className="logo-mark">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <polyline points="2,11 5,11 7,5 9,17 11,9 13,14 15,14 17,11 20,11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  </div>
                    Dokita
                  </div>
                  {user && <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>}
                </div>
              </header>

              {tab==="home"    && <HomeTab    user={user} rdvs={rdvs} hospitals={hospitals} onBook={book} onTab={setTab}/>}
              {tab==="book"    && <BookTab    user={user} draft={draft} hospitals={hospitals} onDone={r=>{addRdv(r);setTab("rdvs")}} onBack={()=>setTab("home")}/>}
              {tab==="rdvs"    && <RdvsTab    rdvs={rdvs}/>}
              {tab==="profile" && <ProfileTab user={user} rdvs={rdvs} onLogout={logout}/>}

              <nav className="bnav">
                {[
                  {id:"home",   label:"Accueil", I:Ic.Home},
                  {id:"book",   label:"Réserver",I:Ic.Plus},
                  {id:"rdvs",   label:"Mes RDV", I:Ic.Cal},
                  {id:"profile",label:"Profil",  I:Ic.User},
                ].map(({id,label,I})=>(
                  <button key={id} className={`bitem ${tab===id?"on":""}`}
                    onClick={()=>{setTab(id);if(id==="book")setDraft(null)}}>
                    <I/>{label}{tab===id&&<div className="bpip"/>}
                  </button>
                ))}
              </nav>
            </>
        }
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════════════════════════════════
function AuthScreen({onLogin}){
  const [reg,setReg]   = useState(false);
  const [err,setErr]   = useState("");
  const [load,setLoad] = useState(false);
  const [f,setF]       = useState({name:"",phone:"",email:"",password:"",dob:"",cin:""});
  const s = k=>e=>setF(p=>({...p,[k]:e.target.value}));

  async function submit(e){
    e.preventDefault(); setErr(""); setLoad(true);
    await new Promise(r=>setTimeout(r,700));
    if(reg){
      if(!f.name||!f.phone||!f.email){setErr("Remplis tous les champs obligatoires (*)."); setLoad(false); return;}
      const u={id:Date.now().toString(),name:f.name,phone:f.phone,email:f.email,cin:f.cin,dob:f.dob};
      await saveToSheets({action:"addUser",...u,createdAt:new Date().toISOString()});
      onLogin(u);
    }else{
      if(!f.email||!f.password){setErr("Email et mot de passe requis."); setLoad(false); return;}
      onLogin({id:Date.now().toString(),name:f.email.split("@")[0],email:f.email,phone:""});
    }
    setLoad(false);
  }

  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:"var(--white)"}}>
      {/* Hero */}
      <div className="auth-hero">
        <div className="auth-pattern"/>
        <div className="auth-logo">
          <div className="auth-bigmark">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <polyline points="2,20 9,20 13,8 17,32 21,14 25,26 29,26 33,20 38,20" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="auth-appname">Dokita</div>
          <div className="auth-tagline">Votre santé, simplifiée</div>
        </div>
      </div>

      {/* Form */}
      <div style={{flex:1,padding:"1.5rem 1.25rem",maxWidth:420,margin:"0 auto",width:"100%"}}>
        <div className="auth-toggle">
          {[{v:false,l:"Se connecter"},{v:true,l:"S'inscrire"}].map(({v,l})=>(
            <button key={l} className={`auth-toggle-btn ${reg===v?"on":"off"}`} onClick={()=>{setReg(v);setErr("")}}>{l}</button>
          ))}
        </div>

        {err && <div className="alert alert-err">⚠️ {err}</div>}

        <form onSubmit={submit}>
          {reg && <>
            <div className="field">
              <label>Nom complet *</label>
              <div className="iw"><span className="ii">👤</span><input required placeholder="Ahmed Benali" value={f.name} onChange={s("name")}/></div>
            </div>
            <div className="field">
              <label>Téléphone *</label>
              <div className="iw"><span className="ii">📱</span><input required type="tel" placeholder="+212 6XX-XXX-XXX" value={f.phone} onChange={s("phone")}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".75rem"}}>
              <div className="field"><label>Date de naissance</label><input type="date" value={f.dob} onChange={s("dob")}/></div>
              <div className="field"><label>N° CIN</label><input placeholder="AB123456" value={f.cin} onChange={s("cin")}/></div>
            </div>
          </>}
          <div className="field">
            <label>Email *</label>
            <div className="iw"><span className="ii">✉️</span><input required type="email" placeholder="ahmed@email.ma" value={f.email} onChange={s("email")}/></div>
          </div>
          <div className="field" style={{marginBottom:"1.25rem"}}>
            <label>Mot de passe *</label>
            <div className="iw"><span className="ii">🔒</span><input required type="password" placeholder="Min. 6 caractères" value={f.password} onChange={s("password")}/></div>
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={load}>
            {load ? <><div className="spin"/>Chargement...</> : reg ? "Créer mon compte →" : "Se connecter →"}
          </button>
        </form>

        <div className="divider"/>
        <div style={{display:"flex",flexDirection:"column",gap:".4rem"}}>
          {["🏥  Tous les hôpitaux inscrits, en un seul endroit","📍  Trouvez les établissements près de vous","📅  Réservez un créneau en moins d'une minute"].map(f=>(
            <div key={f} style={{fontSize:".78rem",color:"var(--gray-500)"}}>{f}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  HOME
// ══════════════════════════════════════════════════════════════════════
function HomeTab({user,rdvs,hospitals,onBook,onTab}){
  const next = rdvs[0];
  return(
    <div className="page">
      <div className="mb2">
        <div className="title">Bonjour, {user?.name?.split(" ")[0]} 👋</div>
        <div className="sub">Comment puis-je vous aider ?</div>
      </div>

      {/* CTA */}
      <div style={{background:"linear-gradient(135deg,var(--g700) 0%,var(--g500) 100%)",borderRadius:"var(--r)",padding:"1.2rem",color:"white",marginBottom:"1.1rem",cursor:"pointer",position:"relative",overflow:"hidden"}} onClick={()=>onTab("book")}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,rgba(255,255,255,.06) 1px,transparent 1px)",backgroundSize:"16px 16px"}}/>
        <div style={{position:"relative",zIndex:1,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:"1.05rem"}}>Prendre un rendez-vous</div>
            <div style={{opacity:.8,fontSize:".8rem",marginTop:".2rem"}}>Recherchez et réservez en 1 min</div>
          </div>
          <div style={{width:46,height:46,background:"rgba(255,255,255,.18)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem",flexShrink:0}}>📅</div>
        </div>
      </div>

      {/* Prochain RDV */}
      {next ? (
        <div className="mb2">
          <div className="sec">Prochain rendez-vous</div>
          <div className="rcard">
            <div className="rtop">
              <div>
                <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:".88rem",color:"var(--g700)"}}>{next.hospital}</div>
                <div style={{fontSize:".74rem",color:"var(--gray-500)"}}>{next.department}</div>
              </div>
              <span className="badge badge-g">✓ Confirmé</span>
            </div>
            <div className="rbody">
              <div className="rrow">📅 <strong>{next.dateLabel||next.date}</strong> à <strong>{next.time}</strong></div>
              <div className="rrow">🏥 {next.hospital}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card mb2">
          <div className="card-body tc" style={{padding:"1.4rem 1rem"}}>
            <div style={{fontSize:"1.8rem",marginBottom:".4rem"}}>📋</div>
            <div style={{fontWeight:700,marginBottom:".25rem"}}>Aucun rendez-vous prévu</div>
            <div style={{fontSize:".8rem",color:"var(--gray-400)",marginBottom:".9rem"}}>Réservez votre première consultation</div>
            <button className="btn btn-primary btn-sm" onClick={()=>onTab("book")}>Réserver maintenant</button>
          </div>
        </div>
      )}

      {/* Hôpitaux */}
      <div>
        <div className="row mb1">
          <div className="sec" style={{margin:0,flex:1}}>Établissements disponibles</div>
          <button className="btn btn-ghost btn-sm" onClick={()=>onTab("book")}>Voir tout</button>
        </div>
        {hospitals.slice(0,3).map(h=>{
          const free = h.departments.reduce((a,d)=>a+d.freeBeds,0);
          return(
            <div key={h.id} className="hcard" onClick={()=>onBook(h)}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div className="hname">{h.name}</div>
                <span className={`badge ${free>0?"badge-g":"badge-red"}`}>{free>0?`${free} places`:"Complet"}</span>
              </div>
              <div className="hcity">📍 {h.city} · {h.address}</div>
              <div className="hmeta">
                <span style={{fontSize:".72rem",color:"var(--gray-400)"}}>📞 {h.phone}</span>
                <span style={{fontSize:".72rem",color:"var(--gray-400)"}}>{h.departments.length} spécialités</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  BOOK (4 étapes)
// ══════════════════════════════════════════════════════════════════════
function BookTab({user,draft,hospitals,onDone,onBack}){
  const [step,setStep] = useState(draft?.hospital?1:0);
  const [hosp,setHosp] = useState(draft?.hospital||null);
  const [dept,setDept] = useState(null);
  const [date,setDate] = useState(null);
  const [time,setTime] = useState(null);
  const [saving,setSaving] = useState(false);
  const [q,setQ]       = useState("");
  const [pos,setPos]   = useState(null);
  const [geoOn,setGeoOn] = useState(false);
  const [geoLoad,setGeoLoad] = useState(false);
  const dates = getNextDates(7);

  const filtered = hospitals
    .filter(h=>{if(!q)return true;const t=q.toLowerCase();return h.name.toLowerCase().includes(t)||h.city.toLowerCase().includes(t)||h.departments.some(d=>d.name.toLowerCase().includes(t));})
    .map(h=>({...h,dist:pos?getDistanceKm(pos.lat,pos.lng,h.lat,h.lng):null}))
    .sort((a,b)=>a.dist!==null&&b.dist!==null?a.dist-b.dist:0);

  function geo(){
    if(!navigator.geolocation)return;
    setGeoLoad(true);
    navigator.geolocation.getCurrentPosition(
      p=>{setPos({lat:p.coords.latitude,lng:p.coords.longitude});setGeoOn(true);setGeoLoad(false);},
      ()=>{setGeoLoad(false);}
    );
  }

  async function confirm(){
    setSaving(true);
    const rdv={
      id:Date.now().toString(),
      patientName:user.name,patientPhone:user.phone||"",
      patientEmail:user.email,patientCin:user.cin||"",
      hospital:hosp.name,hospitalId:hosp.id,
      department:dept.name,departmentId:dept.id,
      date:date.iso,dateLabel:date.label,time,
      status:"confirmé",createdAt:new Date().toISOString(),
    };
    await saveToSheets({action:"addReservation",...rdv});
    setSaving(false);
    onDone(rdv);
  }

  const STEPS=["Hôpital","Section","Créneau","Validation"];

  return(
    <div className="page">
      {/* Step bar */}
      <div className="sbar">
        {STEPS.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",flex:i<STEPS.length-1?1:0}}>
            <div className="sitem">
              <div className={`scirc ${i<step?"dn":i===step?"ac":"td"}`}>{i<step?"✓":i+1}</div>
              <span className={`slbl ${i<step?"dn":i===step?"ac":""}`}>{s}</span>
            </div>
            {i<STEPS.length-1&&<div className={`sline ${i<step?"dn":""}`}/>}
          </div>
        ))}
      </div>

      {/* ── STEP 0: Hôpital ── */}
      {step===0&&(
        <div>
          <div className="mb2"><div className="title" style={{fontSize:"1.1rem"}}>Choisissez un hôpital</div><div className="sub">Recherchez par nom, ville ou spécialité</div></div>

          <div className="searchbar">
            <span className="si"><Ic.Search/></span>
            <input placeholder="Rechercher..." value={q} onChange={e=>setQ(e.target.value)} autoFocus/>
          </div>

          <div className="row mb2">
            {!geoOn
              ? <button className="geobtn" onClick={geo} disabled={geoLoad}><Ic.Geo/>{geoLoad?"Localisation...":"Près de moi"}</button>
              : <button className="geobtn on" onClick={()=>{setGeoOn(false);setPos(null)}}><Ic.Geo/>Localisation active · Désactiver</button>
            }
          </div>

          {geoOn&&<div className="alert alert-g mb2"><Ic.Info/>Résultats triés par distance depuis vous</div>}

          {filtered.length===0&&<div className="empty"><div className="emptyico">🔍</div><div className="emptytxt">Aucun résultat pour « {q} »</div></div>}

          {filtered.map(h=>{
            const free=h.departments.reduce((a,d)=>a+d.freeBeds,0);
            const total=h.departments.reduce((a,d)=>a+d.totalBeds,0);
            const pct=Math.round(((total-free)/total)*100);
            return(
              <div key={h.id} className={`hcard ${hosp?.id===h.id?"sel":""}`} onClick={()=>{setHosp(h);setStep(1)}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div className="hname">{h.name}</div>
                  {h.dist!==null&&<span className="hdist">📍 {h.dist.toFixed(1)} km</span>}
                </div>
                <div className="hcity">📍 {h.city} · {h.address}</div>
                <div className="hmeta">
                  <span className={`havail ${free>0?"ok":"no"}`}>{free>0?`✓ ${free} places libres`:"✗ Complet"}</span>
                  <span style={{fontSize:".7rem",color:"var(--gray-400)"}}>📞 {h.phone}</span>
                </div>
                <div className="hprog"><div className={`hpbar ${pct>80?"hp-no":pct>50?"hp-lo":"hp-ok"}`} style={{width:pct+"%"}}/></div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── STEP 1: Département ── */}
      {step===1&&hosp&&(
        <div>
          <button className="btn btn-ghost btn-sm mb2" onClick={()=>setStep(0)}><Ic.Left/>Retour</button>
          <div className="mb2"><div className="title" style={{fontSize:"1.05rem"}}>{hosp.name}</div><div className="sub">Choisissez une section médicale</div></div>
          <div className="alert alert-g mb2"><Ic.Info/>Les sections complètes ne sont pas disponibles à la réservation.</div>
          {hosp.departments.map(d=>{
            const pct=Math.round(((d.totalBeds-d.freeBeds)/d.totalBeds)*100);
            const bc=d.freeBeds===0?"no":d.freeBeds<=3?"lo":"ok";
            return(
              <div key={d.id} className={`dcard ${d.freeBeds===0?"dfull":""} ${dept?.id===d.id?"dsel":""}`} onClick={()=>d.freeBeds>0&&setDept(d)}>
                <div className="dicon">{d.icon}</div>
                <div style={{flex:1}}>
                  <div className="dname">{d.name}</div>
                  <div className="dinfo">{d.totalBeds} lits · {d.slots.length} créneaux</div>
                  <div style={{height:3,background:"var(--gray-100)",borderRadius:99,overflow:"hidden",marginTop:".4rem",width:"100%"}}>
                    <div className={`hpbar ${pct>80?"hp-no":pct>50?"hp-lo":"hp-ok"}`} style={{height:"100%",width:pct+"%",borderRadius:99}}/>
                  </div>
                </div>
                <div className={`dbeds ${bc}`}>{d.freeBeds===0?"Complet":`${d.freeBeds} libre${d.freeBeds>1?"s":""}`}</div>
              </div>
            );
          })}
          <div className="mt3"><button className="btn btn-primary btn-block" disabled={!dept} onClick={()=>setStep(2)}>Choisir un créneau →</button></div>
        </div>
      )}

      {/* ── STEP 2: Créneau ── */}
      {step===2&&dept&&(
        <div>
          <button className="btn btn-ghost btn-sm mb2" onClick={()=>setStep(1)}><Ic.Left/>Retour</button>
          <div className="mb2"><div className="title" style={{fontSize:"1.05rem"}}>Choisissez un créneau</div><div className="sub">{hosp.name} · {dept.name}</div></div>
          <div className="sec">Date</div>
          <div className="dtabs">
            {dates.map(d=>(
              <button key={d.iso} className={`dtab ${date?.iso===d.iso?"on":""}`} onClick={()=>{setDate(d);setTime(null)}}>
                {d.label}{d.isToday&&<span style={{display:"block",fontSize:".58rem",opacity:.7,marginTop:"1px"}}>Aujourd'hui</span>}
              </button>
            ))}
          </div>
          {date&&(
            <>
              <div className="sec">Heure disponible</div>
              {dept.slots.length===0
                ? <div className="alert alert-err">⚠️ Aucun créneau disponible pour cette section.</div>
                : <div className="sgrid">{dept.slots.map(s=><button key={s} className={`slot ${time===s?"on":""}`} onClick={()=>setTime(s)}>{s}</button>)}</div>
              }
            </>
          )}
          <div className="mt3"><button className="btn btn-primary btn-block" disabled={!date||!time} onClick={()=>setStep(3)}>Confirmer le créneau →</button></div>
        </div>
      )}

      {/* ── STEP 3: Validation ── */}
      {step===3&&(
        <div>
          <div className="chero">
            <div className="chero-content">
              <div className="chero-icon">📋</div>
              <div className="chero-title">Vérifiez votre réservation</div>
              <div className="chero-sub">Confirmez avant de valider</div>
            </div>
          </div>
          <div className="card mb2">
            <div className="card-body">
              {[
                {i:"🏥",l:"Hôpital",    v:hosp.name},
                {i:"🏢",l:"Section",    v:dept.name},
                {i:"📅",l:"Date",       v:date.label},
                {i:"🕐",l:"Heure",      v:time},
                {i:"👤",l:"Patient",    v:user.name},
                {i:"📱",l:"Téléphone",  v:user.phone||"Non renseigné"},
              ].map(r=>(
                <div key={r.l} className="drow">
                  <div className="dico">{r.i}</div>
                  <div><div className="dlbl">{r.l}</div><div className="dval">{r.v}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="alert alert-warn"><span>⚠️</span><span>Présentez-vous 15 min avant l'heure avec une pièce d'identité.</span></div>
          <button className="btn btn-primary btn-block" disabled={saving} onClick={confirm}>
            {saving?<><div className="spin"/>Enregistrement...</>:"✓ Confirmer la réservation"}
          </button>
          <button className="btn btn-ghost btn-block mt1" onClick={()=>setStep(2)}>← Modifier</button>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  RDV LIST
// ══════════════════════════════════════════════════════════════════════
function RdvsTab({rdvs}){
  return(
    <div className="page">
      <div className="mb2">
        <div className="title">Mes rendez-vous</div>
        <div className="sub">{rdvs.length} réservation{rdvs.length!==1?"s":""} enregistrée{rdvs.length!==1?"s":""}</div>
      </div>
      {rdvs.length===0&&<div className="empty"><div className="emptyico">📅</div><div style={{fontWeight:700,marginBottom:".3rem"}}>Aucun rendez-vous</div><div className="emptytxt">Vos réservations apparaîtront ici.</div></div>}
      {rdvs.map(r=>(
        <div key={r.id} className="rcard">
          <div className="rtop">
            <div><div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:".9rem",color:"var(--g700)"}}>{r.hospital}</div><div style={{fontSize:".74rem",color:"var(--gray-500)"}}>{r.department}</div></div>
            <span className="badge badge-g">✓ {r.status}</span>
          </div>
          <div className="rbody">
            <div className="rrow">📅 <strong>{r.dateLabel||r.date}</strong> · <strong>{r.time}</strong></div>
            <div className="rrow">🏥 {r.hospital}</div>
            <div className="rrow" style={{fontSize:".72rem",color:"var(--gray-400)",fontFamily:"monospace"}}>Réf: #{r.id.slice(-6)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  PROFILE
// ══════════════════════════════════════════════════════════════════════
function ProfileTab({user,rdvs,onLogout}){
  return(
    <div className="page">
      <div className="phero">
        <div className="pav">{user?.name?.charAt(0)?.toUpperCase()||"?"}</div>
        <div className="pname">{user?.name}</div>
        <div className="pemail">{user?.email}</div>
        <div className="pstat">
          {[{v:rdvs.length,l:"RDV"},{v:new Set(rdvs.map(r=>r.hospitalId)).size,l:"Hôpitaux"}].map(s=>(
            <div key={s.l} className="pstatbox"><div className="pstatval">{s.v}</div><div className="pstatlbl">{s.l}</div></div>
          ))}
        </div>
      </div>

      <div className="sec">Informations personnelles</div>
      <div className="card mb2">
        <div className="card-body" style={{padding:0}}>
          {[
            {i:"👤",l:"Nom complet",  v:user?.name},
            {i:"📱",l:"Téléphone",    v:user?.phone||"Non renseigné"},
            {i:"✉️",l:"Email",        v:user?.email},
            {i:"🪪",l:"N° CIN",       v:user?.cin||"Non renseigné"},
            {i:"🎂",l:"Date naiss.",  v:user?.dob||"Non renseignée"},
          ].map(r=>(
            <div key={r.l} className="mitem">
              <div className="mico">{r.i}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:".68rem",color:"var(--gray-400)",fontWeight:700,textTransform:"uppercase",letterSpacing:".4px"}}>{r.l}</div>
                <div style={{fontWeight:600,fontSize:".86rem",marginTop:".1rem"}}>{r.v}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sec">Compte</div>
      <div className="card">
        <div className="card-body" style={{padding:0}}>
          <div className="mitem" onClick={onLogout} style={{color:"var(--red)"}}>
            <div className="mico" style={{background:"var(--red-l)"}}><Ic.Out/></div>
            <div className="mlbl" style={{color:"var(--red)"}}>Se déconnecter</div>
            <div className="marr"><Ic.Right/></div>
          </div>
        </div>
      </div>

      <div className="alert alert-g mt3" style={{fontSize:".76rem"}}>
        <Ic.Info/>
        <span>Vos données sont transmises à l'hôpital lors de chaque réservation via notre système sécurisé.</span>
      </div>
    </div>
  );
}