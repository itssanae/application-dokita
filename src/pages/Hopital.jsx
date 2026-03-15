import { useState, useEffect } from "react";

// ══════════════════════════════════════════════════════════════════════
//  ⚙️  CONFIG
// ══════════════════════════════════════════════════════════════════════
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx2o28zWgdBWy9ZLbojl0KLMtHZqW965n5GCaqy5kNhDEXumMLO1Z5h6ClHirVLjTPulA/exec";

const SECTIONS_LISTE = [
  {nom:"Urgences",     icon:"🚨"},{nom:"Cardiologie",  icon:"❤️"},
  {nom:"Pédiatrie",    icon:"👶"},{nom:"Chirurgie",     icon:"🔪"},
  {nom:"Neurologie",   icon:"🧠"},{nom:"Ophtalmologie", icon:"👁️"},
  {nom:"Orthopédie",   icon:"🦴"},{nom:"Dermatologie",  icon:"🩺"},
  {nom:"Gynécologie",  icon:"🌸"},{nom:"Radiologie",    icon:"🩻"},
  {nom:"Oncologie",    icon:"🎗️"},{nom:"Psychiatrie",   icon:"🧘"},
];

const HORAIRES_DEF = ["08:00","09:00","10:00","11:00","14:00","15:00","16:00"];

// ══════════════════════════════════════════════════════════════════════
//  UTILITAIRES
// ══════════════════════════════════════════════════════════════════════
const today   = () => new Date().toISOString().split("T")[0];
const fmtDate = iso => iso
  ? new Date(iso+"T00:00:00").toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})
  : "";
const heure   = () => new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
const genId   = p  => {
  const d=new Date();
  return `${p}-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}-${Math.random().toString(36).substring(2,6).toUpperCase()}`;
};

async function sendSheet(data){
  try{
    const p=new URLSearchParams();
    Object.entries(data).forEach(([k,v])=>p.append(k,v==null?"":String(v)));
    await fetch(APPS_SCRIPT_URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:p.toString()});
    return true;
  }catch{return false;}
}

// ══════════════════════════════════════════════════════════════════════
//  CSS
// ══════════════════════════════════════════════════════════════════════
const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Instrument+Sans:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --g700:#0a7c5c;--g600:#0d9966;--g500:#10b981;--g400:#34d399;--g300:#6ee7b7;--g100:#d1fae5;--g50:#ecfdf5;
  --s900:#0a1628;--s850:#0d1e38;--s800:#0f2040;--s750:#112035;--s700:#162a45;--s600:#1e3a5f;
  --s400:#3d6080;--s300:#6b8fa8;--s200:#9ab0c0;--s100:#c8d8e4;--s50:#eaf0f5;
  --red:#ef4444;--red-d:#dc2626;--red-l:#fef2f2;
  --amber:#f59e0b;--amber-l:#fffbeb;
  --white:#fff;--bg-card:#ffffff;--border:#e5e7eb;--input:#f9fafb;
  --shadow-g:0 8px 32px rgba(16,185,129,.2);--shadow-c:0 1px 4px rgba(0,0,0,.07),0 2px 8px rgba(0,0,0,.04);
  --r:14px;--rsm:10px;--rxs:7px;
}
body{font-family:'Instrument Sans',sans-serif;background:#f9fafb;color:#1f2937;min-height:100vh;-webkit-font-smoothing:antialiased}
.app{min-height:100vh;display:flex;flex-direction:column}

/* HDR */
.hdr{background:#ffffff;border-bottom:1px solid #e5e7eb;position:sticky;top:0;z-index:50;box-shadow:0 1px 4px rgba(0,0,0,.06)}
.hdr-in{max-width:960px;margin:0 auto;padding:.75rem 1.1rem;display:flex;align-items:center;justify-content:space-between;gap:.8rem}
.logo{display:flex;align-items:center;gap:.5rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:1.18rem;font-weight:800;color:var(--g700);flex-shrink:0}
.logo-mk{width:33px;height:33px;border-radius:9px;background:linear-gradient(135deg,var(--g600),var(--g400));display:flex;align-items:center;justify-content:center;box-shadow:var(--shadow-g)}
.logo-sub{font-size:.57rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--g500);opacity:.8}
.h-pill{display:flex;align-items:center;gap:.4rem;background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.2);padding:.28rem .75rem;border-radius:99px}
.h-dot{width:6px;height:6px;border-radius:50%;background:var(--g500);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
.h-name{font-size:.74rem;font-weight:700;color:var(--g700);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.h-time{font-size:.68rem;color:#6b7280}
.av{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--g600),var(--g400));display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:800;color:white;flex-shrink:0}

/* PAGE */
.page{flex:1;max-width:960px;margin:0 auto;width:100%;padding:1.4rem 1rem 5.5rem}

/* CARD */
.card{background:var(--bg-card);border-radius:var(--r);border:1px solid var(--border);box-shadow:var(--shadow-c);overflow:hidden;animation:up .3s ease both}
@keyframes up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.cb{padding:1.2rem}

/* TYPE */
.ttl{font-family:'Plus Jakarta Sans',sans-serif;font-size:1.22rem;font-weight:800;color:#111827;line-height:1.2}
.sub{font-size:.81rem;color:#6b7280;margin-top:.18rem}
.slbl{font-size:.64rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin-bottom:.6rem}

/* STATS */
.sg{display:grid;grid-template-columns:repeat(4,1fr);gap:.65rem;margin-bottom:1.15rem}
@media(max-width:600px){.sg{grid-template-columns:repeat(2,1fr)}}
.sc{background:var(--bg-card);border-radius:var(--r);border:1px solid var(--border);padding:.9rem 1rem;position:relative;overflow:hidden}
.sc::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;border-radius:99px 99px 0 0}
.sg::before{background:linear-gradient(90deg,var(--g600),var(--g400))}
.scg::before{background:linear-gradient(90deg,var(--g600),var(--g400))}
.scb::before{background:linear-gradient(90deg,#2563eb,#60a5fa)}
.sca::before{background:linear-gradient(90deg,#b45309,var(--amber))}
.scr::before{background:linear-gradient(90deg,var(--red-d),var(--red))}
.si{width:33px;height:33px;border-radius:9px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;font-size:.9rem;margin-bottom:.55rem}
.sv{font-family:'Plus Jakarta Sans',sans-serif;font-size:1.65rem;font-weight:800;color:#111827;line-height:1}
.sl{font-size:.7rem;color:#6b7280;margin-top:.25rem;font-weight:500}
.ss{font-size:.65rem;color:var(--g600);margin-top:.3rem;font-weight:700}

/* NAV */
.bnav{position:fixed;bottom:0;left:0;right:0;background:#ffffff;border-top:1px solid #e5e7eb;display:flex;padding:.4rem 0 calc(.4rem + env(safe-area-inset-bottom));z-index:50;box-shadow:0 -2px 8px rgba(0,0,0,.06)}
.bi{flex:1;display:flex;flex-direction:column;align-items:center;gap:.18rem;padding:.32rem .5rem;border:none;background:transparent;cursor:pointer;font-family:inherit;font-size:.6rem;font-weight:600;color:#9ca3af;transition:color .2s}
.bi.on{color:var(--g600)}
.bi svg{width:20px;height:20px}
.bpip{width:4px;height:4px;border-radius:50%;background:var(--g500);margin:0 auto}

/* FORM */
.field{display:flex;flex-direction:column;gap:.3rem;margin-bottom:.78rem}
label{font-size:.74rem;font-weight:600;color:#4b5563}
input,select,textarea{padding:.66rem 1rem;border-radius:var(--rsm);border:1.5px solid #e5e7eb;background:#ffffff;font-family:inherit;font-size:.87rem;color:#111827;outline:none;transition:border-color .2s,box-shadow .2s;width:100%}
input:focus,select:focus,textarea:focus{border-color:var(--g500);box-shadow:0 0 0 3px rgba(16,185,129,.1)}
input::placeholder,textarea::placeholder{color:#9ca3af}
select option{background:#ffffff;color:#111827}
.iw{position:relative}
.ii{position:absolute;left:.88rem;top:50%;transform:translateY(-50%);color:#9ca3af;font-size:.82rem;pointer-events:none}
.iw input,.iw select{padding-left:2.3rem}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:.7rem}
@media(max-width:480px){.g2{grid-template-columns:1fr}}

/* BUTTONS */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.36rem;padding:.66rem 1.3rem;border-radius:var(--rsm);border:none;font-family:inherit;font-size:.86rem;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap}
.bp{background:linear-gradient(135deg,var(--g600),var(--g500));color:white;box-shadow:0 4px 14px rgba(16,185,129,.25)}
.bp:hover{box-shadow:var(--shadow-g);transform:translateY(-1px)}
.bp:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none}
.bg{background:#f9fafb;color:#374151;border:1px solid #e5e7eb}
.bg:hover{background:#f3f4f6}
.br{background:#fef2f2;color:#dc2626;border:1px solid #fecaca}
.bsm{padding:.36rem .75rem;font-size:.74rem;border-radius:var(--rxs)}
.bbl{width:100%}

/* ALERT */
.al{padding:.62rem .88rem;border-radius:var(--rxs);font-size:.8rem;font-weight:500;margin-bottom:.75rem;display:flex;align-items:flex-start;gap:.48rem;line-height:1.45}
.alg{background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0}
.ale{background:#fef2f2;color:#dc2626;border:1px solid #fecaca}
.ala{background:#fffbeb;color:#92400e;border:1px solid #fde68a}

/* BADGE */
.badge{display:inline-flex;align-items:center;gap:.18rem;padding:.15rem .52rem;border-radius:99px;font-size:.66rem;font-weight:700}
.bdg{background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0}
.bdr{background:#fef2f2;color:#dc2626;border:1px solid #fecaca}
.bda{background:#fffbeb;color:#92400e;border:1px solid #fde68a}
.bdgr{background:#f9fafb;color:#6b7280;border:1px solid #e5e7eb}

/* SECTION CARDS */
.seccard{background:#ffffff;border-radius:var(--rsm);border:1px solid #e5e7eb;padding:.88rem 1rem;margin-bottom:.55rem;box-shadow:0 1px 3px rgba(0,0,0,.05)}
.sech{display:flex;align-items:center;gap:.68rem}
.secico{width:36px;height:36px;border-radius:9px;background:#f0fdf4;border:1px solid #bbf7d0;display:flex;align-items:center;justify-content:center;font-size:.94rem;flex-shrink:0}
.secnm{font-weight:700;font-size:.88rem;color:#111827}
.seccap{font-size:.72rem;color:#6b7280;margin-top:.07rem}
.progbar{height:5px;background:#f3f4f6;border-radius:99px;overflow:hidden;margin-top:.6rem}
.progfill{height:100%;border-radius:99px;transition:width .5s}
.pfok{background:linear-gradient(90deg,var(--g600),var(--g400))}
.pflo{background:linear-gradient(90deg,#b45309,var(--amber))}
.pfno{background:linear-gradient(90deg,var(--red-d),var(--red))}
.numctrl{display:flex;align-items:center;gap:.42rem;margin-top:.62rem;flex-wrap:wrap}
.numlbl{font-size:.71rem;color:#6b7280}
.numin{width:60px;padding:.28rem .45rem;border-radius:6px;background:#f9fafb;border:1px solid #e5e7eb;color:#111827;font-family:inherit;font-size:.84rem;font-weight:700;text-align:center;outline:none}
.numin:focus{border-color:var(--g500)}
.savebtn{padding:.28rem .7rem;border-radius:6px;border:none;background:var(--g600);color:white;font-family:inherit;font-size:.73rem;font-weight:700;cursor:pointer;transition:background .2s;display:inline-flex;align-items:center;gap:.28rem}
.savebtn:hover{background:var(--g500)}
.savedok{font-size:.71rem;color:var(--g600);font-weight:700;animation:flash .4s ease}
@keyframes flash{from{opacity:0}to{opacity:1}}

/* RDV */
.rdvfilts{display:flex;gap:.42rem;margin-bottom:.88rem;flex-wrap:wrap}
.fbtn{padding:.3rem .75rem;border-radius:99px;border:1px solid #e5e7eb;font-family:inherit;font-size:.72rem;font-weight:600;cursor:pointer;background:#ffffff;color:#6b7280;transition:all .2s}
.fbtn.on{background:var(--g600);color:white;border-color:var(--g600)}
.fbtn:hover:not(.on){border-color:var(--g500);color:var(--g600)}
.rdvrow{background:#ffffff;border-radius:var(--rsm);border:1px solid #e5e7eb;padding:.82rem .95rem;cursor:pointer;transition:all .2s;margin-bottom:.52rem;box-shadow:0 1px 3px rgba(0,0,0,.04)}
.rdvrow:hover{border-color:#6ee7b7;background:#f0fdf4}
.rdvrow.open{border-color:var(--g500);background:#f0fdf4}
.rdvtop{display:flex;align-items:center;gap:.65rem}
.rdvtime{font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:.9rem;color:var(--g600);flex-shrink:0;width:44px}
.rdvname{font-weight:700;font-size:.86rem;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rdvdept{font-size:.72rem;color:#6b7280;margin-top:.07rem}
.rdvdet{margin-top:.78rem;padding-top:.78rem;border-top:1px solid #e5e7eb;display:grid;grid-template-columns:1fr 1fr;gap:.52rem}
.dtl{font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#9ca3af}
.dtv{font-size:.82rem;font-weight:600;color:#1f2937;margin-top:.1rem}

/* WIZARD STEPS */
.stepbar{display:flex;align-items:center;margin-bottom:1.4rem}
.sdot{width:27px;height:27px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.68rem;font-weight:800;flex-shrink:0;border:2px solid #e5e7eb}
.sddone{background:var(--g500);border-color:var(--g500);color:white}
.sdact{background:var(--g600);border-color:var(--g600);color:white;box-shadow:0 0 0 3px rgba(16,185,129,.15)}
.sdtodo{background:#f9fafb;color:#9ca3af}
.slabel{font-size:.68rem;font-weight:600;color:#9ca3af;margin-left:.36rem;white-space:nowrap}
.slabel.act{color:#111827}
.slabel.done{color:#6b7280}
.sline{flex:1;height:2px;background:#e5e7eb;margin:0 .32rem}
.sline.done{background:var(--g500)}

/* SECTION CHECKBOX GRID */
.scgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:.45rem;margin-bottom:.75rem}
@media(max-width:480px){.scgrid{grid-template-columns:repeat(2,1fr)}}
.scbox{border:1.5px solid var(--border);border-radius:var(--rxs);padding:.52rem .58rem;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:.38rem}
.scbox:hover{border-color:var(--g500);background:rgba(16,185,129,.05)}
.scbox.ck{border-color:var(--g500);background:rgba(16,185,129,.1)}
.scboxicon{font-size:.9rem}
.scboxname{font-size:.76rem;font-weight:600;color:#374151;flex:1}
.sctick{width:15px;height:15px;border-radius:4px;border:1.5px solid var(--s600);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:.58rem}
.scbox.ck .sctick{background:var(--g500);border-color:var(--g500);color:white}

/* CAPACITY ROW */
.caprow{display:flex;align-items:center;gap:.58rem;padding:.58rem .72rem;background:#f9fafb;border-radius:var(--rxs);border:1px solid #e5e7eb;margin-bottom:.42rem}
.capico{font-size:.88rem;flex-shrink:0}
.capnm{font-size:.83rem;font-weight:600;color:#111827;flex:1}
.capin{width:68px;padding:.28rem .45rem;border-radius:6px;background:#ffffff;border:1px solid #e5e7eb;color:#111827;font-family:inherit;font-size:.84rem;font-weight:700;text-align:center;outline:none}
.capin:focus{border-color:var(--g500)}
.capunit{font-size:.7rem;color:#6b7280}

/* AUTH */
.awrap{min-height:100vh;display:flex;flex-direction:column;background:#f9fafb}
.ahero{background:linear-gradient(160deg,var(--g700),var(--g500));padding:2.8rem 1.5rem 2rem;text-align:center;border-bottom:1px solid rgba(255,255,255,.1);position:relative;overflow:hidden}
.ahero::before{content:'';position:absolute;inset:0;background-image:radial-gradient(circle,rgba(255,255,255,.1) 1px,transparent 1px);background-size:22px 22px}
.acnt{position:relative;z-index:1}
.abigmark{width:65px;height:65px;border-radius:17px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;margin:0 auto .82rem;box-shadow:0 8px 32px rgba(0,0,0,.15)}
.aappname{font-family:'Plus Jakarta Sans',sans-serif;font-size:1.85rem;font-weight:800;color:#ffffff;letter-spacing:-1px}
.asubt{color:rgba(255,255,255,.8);font-size:.76rem;font-weight:700;margin-top:.28rem;letter-spacing:.5px;text-transform:uppercase}
.atabs{display:flex;background:#f3f4f6;border-radius:var(--rsm);padding:.18rem;margin-bottom:1.2rem}
.atab{flex:1;padding:.52rem;border-radius:var(--rxs);border:none;font-family:inherit;font-weight:700;font-size:.84rem;cursor:pointer;transition:all .2s}
.atab.on{background:#ffffff;color:var(--g700);box-shadow:0 1px 4px rgba(0,0,0,.1)}
.atab.off{background:transparent;color:#6b7280}
.abody{flex:1;padding:1.4rem 1.2rem;max-width:520px;margin:0 auto;width:100%}

/* PROFILE */
.phero{background:linear-gradient(135deg,var(--g700),var(--g500));border-radius:var(--r);padding:1.35rem;border:1px solid rgba(255,255,255,.1);margin-bottom:.95rem;position:relative;overflow:hidden}
.phero::before{content:'';position:absolute;top:-28px;right:-28px;width:105px;height:105px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.1),transparent 70%)}
.pname{font-family:'Plus Jakarta Sans',sans-serif;font-size:1.18rem;font-weight:800;color:#ffffff}
.pcity{font-size:.79rem;color:rgba(255,255,255,.75);margin-top:.16rem}
.pcode{display:inline-flex;align-items:center;gap:.32rem;margin-top:.62rem;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.3);padding:.26rem .68rem;border-radius:99px;font-size:.71rem;font-weight:700;color:#ffffff;font-family:'Courier New',monospace}
.inforow{display:flex;align-items:center;gap:.68rem;padding:.72rem;border-bottom:1px solid #e5e7eb}
.inforow:last-child{border-bottom:none}
.infoico{width:30px;height:30px;border-radius:8px;background:#f0fdf4;border:1px solid #bbf7d0;display:flex;align-items:center;justify-content:center;font-size:.8rem;flex-shrink:0}
.infolbl{font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#9ca3af}
.infoval{font-size:.83rem;font-weight:600;color:#1f2937;margin-top:.07rem}

/* MISC */
.row{display:flex;align-items:center;gap:.52rem;flex-wrap:wrap}
.f1{flex:1}
.mt1{margin-top:.32rem}.mt2{margin-top:.75rem}.mt3{margin-top:1.15rem}
.mb1{margin-bottom:.32rem}.mb2{margin-bottom:.75rem}
.spin{width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:white;border-radius:50%;animation:sp .6s linear infinite;flex-shrink:0}
@keyframes sp{to{transform:rotate(360deg)}}
.dvd{height:1px;background:#e5e7eb;margin:.75rem 0}
.empty{text-align:center;padding:2.5rem 1rem}
.emico{font-size:2.1rem;margin-bottom:.52rem;opacity:.4}
.emtxt{color:#9ca3af;font-size:.84rem}
`;

// ══════════════════════════════════════════════════════════════════════
//  ICONS
// ══════════════════════════════════════════════════════════════════════
const Ic={
  Home: ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Cal:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Grid: ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  Hosp: ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12h6M12 9v6"/></svg>,
  Out:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  Chk:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Dwn:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>,
  Rgt:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>,
};

// ══════════════════════════════════════════════════════════════════════
//  ROOT APP
// ══════════════════════════════════════════════════════════════════════
export default function App(){
  const [hosp,setSecs_]    = useState(null);
  const [sections,setSecs] = useState([]);
  const [rdvs,setRdvs]     = useState([]);
  const [tab,setTab]        = useState("dash");
  const [clk,setClk]        = useState(heure());

  useEffect(()=>{
    const t=setInterval(()=>setClk(heure()),30000);
    return ()=>clearInterval(t);
  },[]);

  useEffect(()=>{
    const h=localStorage.getItem("dh_hosp");
    const s=localStorage.getItem("dh_secs");
    const r=localStorage.getItem("dh_rdvs");
    if(h) setSecs_(JSON.parse(h));
    if(s) setSecs(JSON.parse(s));
    if(r) setRdvs(JSON.parse(r));
  },[]);

  // ── Polling RDV depuis Google Sheet toutes les 30s ──
  useEffect(()=>{
    if(!hosp) return;
    async function fetchRdvs(){
      try{
        const r=await fetch(APPS_SCRIPT_URL+"?action=getRdvs&hospitalId="+encodeURIComponent(hosp.id));
        const data=await r.json();
        if(data.ok && data.rdvs){
          setRdvs(data.rdvs);
          localStorage.setItem("dh_rdvs",JSON.stringify(data.rdvs));
          // Sync sections libres depuis le sheet
          if(data.sections){
            setSecs(data.sections);
            localStorage.setItem("dh_secs",JSON.stringify(data.sections));
          }
        }
      }catch(e){console.warn("polling:",e);}
    }
    fetchRdvs();
    const t=setInterval(fetchRdvs,30000);
    return ()=>clearInterval(t);
  },[hosp?.id]);

  function doLogin(h,s,password){
    setSecs_(h); setSecs(s);
    localStorage.setItem("dh_hosp",JSON.stringify(h));
    localStorage.setItem("dh_secs",JSON.stringify(s));
    // dh_credentials survit au logout — permet la reconnexion
    if(password){
      const creds = JSON.parse(localStorage.getItem("dh_credentials")||"[]");
      const exists = creds.find(c=>c.email===h.email);
      if(!exists) creds.push({email:h.email, password, hopitalId:h.id});
      localStorage.setItem("dh_credentials", JSON.stringify(creds));
    }
  }
  function logout(){
    localStorage.removeItem("dh_hosp");
    localStorage.removeItem("dh_secs");
    // NE PAS supprimer dh_credentials — nécessaire pour se reconnecter
    setSecs_(null); setSecs([]); setRdvs([]); setTab("dash");
  }

  // ── Quand le patient fait une réservation → décrémenter la section ──
  // Dans une vraie app, ceci serait déclenché par un webhook ou polling.
  // Ici on expose une fonction utilisée manuellement depuis les tests.
  function decrementSection(sectionNom){
    setSecs(prev=>{
      const next=prev.map(s=>
        s.nom===sectionNom && s.libres>0 ? {...s,libres:s.libres-1} : s
      );
      localStorage.setItem("dh_secs",JSON.stringify(next));
      return next;
    });
  }

  // ── Mise à jour manuelle par l'admin ──
  function updateLibres(sectionNom,val){
    setSecs(prev=>{
      const next=prev.map(s=>
        s.nom===sectionNom ? {...s,libres:Math.max(0,Math.min(s.capacite,val))} : s
      );
      localStorage.setItem("dh_secs",JSON.stringify(next));
      sendSheet({
        action:"updateSection",
        hospitalId:hosp?.id||"",
        hospitalNom:hosp?.nom||"",
        sectionNom,
        libres:val,
        updatedAt:new Date().toISOString(),
      });
      return next;
    });
  }

  if(!hosp) return <><style>{CSS}</style><AuthScreen onSave={doLogin}/></>;

  return(
    <>
      <style>{CSS}</style>
      <div className="app">
        <header className="hdr">
          <div className="hdr-in">
            <div className="logo">
              <div className="logo-mk">
                <svg width="17" height="17" viewBox="0 0 22 22" fill="none">
                  <polyline points="2,11 5,11 7,5 9,17 11,9 13,14 15,14 17,11 20,11" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              Dokita<span className="logo-sub">Hôpital</span>
            </div>
            <div className="h-pill">
              <div className="h-dot"/>
              <span className="h-name">{hosp.nom}</span>
            </div>
            <div className="row" style={{gap:".45rem"}}>
              <span className="h-time">{clk}</span>
              <div className="av">{hosp.nom.charAt(0)}</div>
            </div>
          </div>
        </header>

        {tab==="dash"     && <DashTab     hosp={hosp} sections={sections} rdvs={rdvs}/>}
        {tab==="rdvs"     && <RdvsTab     rdvs={rdvs}/>}
        {tab==="sections" && <SecsTab     sections={sections} onUpdate={updateLibres}/>}
        {tab==="profile"  && <ProfileTab  hosp={hosp} sections={sections} rdvs={rdvs} onLogout={logout}/>}

        <nav className="bnav">
          {[
            {id:"dash",    lbl:"Tableau",  I:Ic.Home},
            {id:"rdvs",    lbl:"RDV",      I:Ic.Cal},
            {id:"sections",lbl:"Sections", I:Ic.Grid},
            {id:"profile", lbl:"Hôpital",  I:Ic.Hosp},
          ].map(({id,lbl,I})=>(
            <button key={id} className={`bi ${tab===id?"on":""}`} onClick={()=>setTab(id)}>
              <I/>{lbl}{tab===id&&<div className="bpip"/>}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  AUTH — Connexion / Inscription
// ══════════════════════════════════════════════════════════════════════
function AuthScreen({onSave}){
  const [mode,setMode]=useState("login");
  return(
    <div className="awrap">
      <div className="ahero">
        <div className="acnt">
          <div className="abigmark">
            <svg width="30" height="30" viewBox="0 0 40 40" fill="none">
              <polyline points="2,20 9,20 13,8 17,32 21,14 25,26 29,26 33,20 38,20" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="aappname">Dokita</div>
          <div className="asubt">Interface Hôpital</div>
        </div>
      </div>
      <div className="abody">
        <div className="atabs">
          <button className={`atab ${mode==="login"?"on":"off"}`}    onClick={()=>setMode("login")}>Se connecter</button>
          <button className={`atab ${mode==="register"?"on":"off"}`} onClick={()=>setMode("register")}>Créer un compte</button>
        </div>
        {mode==="login" ? <LoginForm onSave={onSave}/> : <RegisterWizard onSave={onSave}/>}
      </div>
    </div>
  );
}

// ── Connexion ───────────────────────────────────────────────────────
function LoginForm({onSave}){
  const [email,setEmail]=useState("");
  const [pass,setPass]  =useState("");
  const [err,setErr]    =useState("");
  const [load,setLoad]  =useState(false);

  async function submit(e){
    e.preventDefault(); setErr(""); setLoad(true);
    await new Promise(r=>setTimeout(r,700));

    // 1. Vérifier email + mot de passe dans dh_credentials
    const creds = JSON.parse(localStorage.getItem("dh_credentials")||"[]");
    const match = creds.find(c=>c.email===email && c.password===pass);

    if(match){
      // 2. Chercher les données hôpital sauvegardées
      const savedHosp = localStorage.getItem("dh_hosp");
      const savedSecs = localStorage.getItem("dh_secs");

      if(savedHosp){
        const h = JSON.parse(savedHosp);
        // Vérifier que c'est bien le même hôpital
        if(h.email===email){
          onSave(h, savedSecs?JSON.parse(savedSecs):[]);
          setLoad(false); return;
        }
      }

      // 3. dh_hosp effacé après logout → reconstruire depuis dh_credentials
      // On recharge depuis le Google Sheet
      try {
        const r = await fetch(APPS_SCRIPT_URL+"?action=getHopitaux");
        const data = await r.json();
        if(data.ok){
          const found = data.hopitaux.find(h=>h.email===email);
          if(found){
            onSave(found, found.sections||[]);
            setLoad(false); return;
          }
        }
      } catch(e){}

      setErr("Impossible de charger votre profil. Vérifiez votre connexion.");
      setLoad(false); return;
    }

    setErr("Email ou mot de passe incorrect.");
    setLoad(false);
  }

  return(
    <form onSubmit={submit}>
      {err&&<div className="al ale">⚠️ {err}</div>}
      <div className="field">
        <label>Email de l'établissement</label>
        <div className="iw"><span className="ii">✉️</span>
          <input required type="email" placeholder="contact@hopital.ma" value={email} onChange={e=>setEmail(e.target.value)}/>
        </div>
      </div>
      <div className="field" style={{marginBottom:"1.15rem"}}>
        <label>Mot de passe</label>
        <div className="iw"><span className="ii">🔒</span>
          <input required type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)}/>
        </div>
      </div>
      <button type="submit" className="btn bp bbl" disabled={load}>
        {load?<><div className="spin"/>Connexion...</>:"Accéder au tableau de bord →"}
      </button>
    </form>
  );
}

// ── Inscription en 3 étapes ─────────────────────────────────────────
function RegisterWizard({onSave}){
  const [step,setStep]=useState(0);
  const [err,setErr]  =useState("");
  const [load,setLoad]=useState(false);

  // Étape 0 — Infos hôpital
  const [info,setInfo]=useState({nom:"",type:"Public",ville:"",adresse:"",telephone:"",email:"",password:""});
  const si=k=>e=>setInfo(p=>({...p,[k]:e.target.value}));

  // Étape 1 — Sélection sections
  const [coches,setCoches]=useState([]);
  const toggle=nom=>setCoches(p=>p.includes(nom)?p.filter(x=>x!==nom):[...p,nom]);

  // Étape 2 — Capacités
  const [caps,setCaps]=useState({});
  const setCap=(nom,v)=>setCaps(p=>({...p,[nom]:v}));

  function goStep1(e){
    e.preventDefault(); setErr("");
    if(!info.nom||!info.ville||!info.email||!info.password){setErr("Remplis tous les champs obligatoires (*).");return;}
    if(info.password.length<6){setErr("Mot de passe : minimum 6 caractères.");return;}
    setStep(1);
  }

  function goStep2(){
    if(coches.length===0){setErr("Sélectionne au moins une section médicale.");return;}
    setErr("");
    const init={};
    coches.forEach(n=>{init[n]=20;});
    setCaps(init);
    setStep(2);
  }

  async function finalize(e){
    e.preventDefault(); setErr(""); setLoad(true);
    await new Promise(r=>setTimeout(r,900));

    const h={
      id:genId("HOP"),
      nom:info.nom, type:info.type, ville:info.ville,
      adresse:info.adresse, telephone:info.telephone,
      email:info.email, createdAt:new Date().toISOString(),
    };

    const s=coches.map(nom=>{
      const cap=Math.max(1,parseInt(caps[nom])||20);
      const meta=SECTIONS_LISTE.find(x=>x.nom===nom);
      return {nom, icon:meta?.icon||"🏥", capacite:cap, libres:cap, horaires:HORAIRES_DEF};
    });

    await sendSheet({action:"registerHopital",...h,sections:JSON.stringify(s)});
    onSave(h, s, info.password); // passer le mot de passe pour dh_credentials
    setLoad(false);
  }

  const STEPS=["Informations","Sections","Capacités"];

  return(
    <div>
      {/* Barre étapes */}
      <div className="stepbar">
        {STEPS.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",flex:i<STEPS.length-1?1:0}}>
            <div className={`sdot ${i<step?"sddone":i===step?"sdact":"sdtodo"}`}>
              {i<step?"✓":i+1}
            </div>
            <span className={`slabel ${i===step?"act":i<step?"done":""}`}>{s}</span>
            {i<STEPS.length-1&&<div className={`sline ${i<step?"done":""}`}/>}
          </div>
        ))}
      </div>

      {err&&<div className="al ale">⚠️ {err}</div>}

      {/* ── ÉTAPE 0 : Infos ── */}
      {step===0&&(
        <form onSubmit={goStep1}>
          <div className="field">
            <label>Nom de l'établissement *</label>
            <div className="iw"><span className="ii">🏥</span>
              <input required placeholder="ex: CHU Ibn Sina" value={info.nom} onChange={si("nom")}/>
            </div>
          </div>
          <div className="g2">
            <div className="field">
              <label>Type</label>
              <select value={info.type} onChange={si("type")}>
                {["Public","Privé","Militaire","Clinique","Centre de santé"].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Ville *</label>
              <input required placeholder="Rabat" value={info.ville} onChange={si("ville")}/>
            </div>
          </div>
          <div className="field">
            <label>Adresse complète</label>
            <input placeholder="Av. Ibn Sina, Souissi, Rabat" value={info.adresse} onChange={si("adresse")}/>
          </div>
          <div className="field">
            <label>Téléphone</label>
            <div className="iw"><span className="ii">📞</span>
              <input type="tel" placeholder="0537-XX-XX-XX" value={info.telephone} onChange={si("telephone")}/>
            </div>
          </div>
          <div className="field">
            <label>Email de contact *</label>
            <div className="iw"><span className="ii">✉️</span>
              <input required type="email" placeholder="contact@hopital.ma" value={info.email} onChange={si("email")}/>
            </div>
          </div>
          <div className="field" style={{marginBottom:"1.15rem"}}>
            <label>Mot de passe *</label>
            <div className="iw"><span className="ii">🔒</span>
              <input required type="password" placeholder="Min. 6 caractères" value={info.password} onChange={si("password")}/>
            </div>
          </div>
          <button type="submit" className="btn bp bbl">Suivant → Choisir les sections</button>
        </form>
      )}

      {/* ── ÉTAPE 1 : Sections ── */}
      {step===1&&(
        <div>
          <p className="sub mb2">Sélectionne toutes les sections disponibles dans ton établissement</p>
          <div className="scgrid">
            {SECTIONS_LISTE.map(s=>(
              <div key={s.nom} className={`scbox ${coches.includes(s.nom)?"ck":""}`} onClick={()=>toggle(s.nom)}>
                <span className="scboxicon">{s.icon}</span>
                <span className="scboxname">{s.nom}</span>
                <div className="sctick">{coches.includes(s.nom)&&"✓"}</div>
              </div>
            ))}
          </div>
          <div className="al alg mb2">
            <span>💡</span>
            <span>{coches.length} section{coches.length>1?"s":""} sélectionnée{coches.length>1?"s":""}. Tu pourras ajouter d'autres sections plus tard.</span>
          </div>
          <div className="row">
            <button className="btn bg bsm" onClick={()=>{setErr("");setStep(0)}}>← Retour</button>
            <button className="btn bp f1" onClick={goStep2}>
              Suivant → Définir les capacités
            </button>
          </div>
        </div>
      )}

      {/* ── ÉTAPE 2 : Capacités ── */}
      {step===2&&(
        <form onSubmit={finalize}>
          <p className="sub mb2">Indique le nombre de lits (capacité maximale) par section</p>
          {coches.map(nom=>{
            const meta=SECTIONS_LISTE.find(s=>s.nom===nom);
            return(
              <div key={nom} className="caprow">
                <span className="capico">{meta?.icon||"🏥"}</span>
                <span className="capnm">{nom}</span>
                <input
                  className="capin" type="number" min={1} max={999}
                  value={caps[nom]||20}
                  onChange={e=>setCap(nom,e.target.value)}
                />
                <span className="capunit">lits</span>
              </div>
            );
          })}
          <div className="al alg mt2">
            <span>🔄</span>
            <span>Les places libres démarrent à la capacité maximale et <strong>diminuent automatiquement</strong> à chaque réservation patient.</span>
          </div>
          <div className="row mt2">
            <button type="button" className="btn bg bsm" onClick={()=>setStep(1)}>← Retour</button>
            <button type="submit" className="btn bp f1" disabled={load}>
              {load?<><div className="spin"/>Création en cours...</>:"✓ Créer mon compte hôpital"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════════════════════════════════════
function DashTab({hosp,sections,rdvs}){
  const td=today();
  const rdvJour   = rdvs.filter(r=>r.date===td);
  const confirmes = rdvs.filter(r=>r.status==="Confirmé");
  const traites   = rdvs.filter(r=>r.status==="Traité");
  const totalLib  = sections.reduce((a,s)=>a+s.libres,0);
  const totalCap  = sections.reduce((a,s)=>a+s.capacite,0);
  const taux      = totalCap>0?Math.round(((totalCap-totalLib)/totalCap)*100):0;

  return(
    <div className="page">
      <div className="mb2">
        <div className="ttl">Tableau de bord</div>
        <div className="sub">{fmtDate(td)} · {hosp.nom}</div>
      </div>

      <div className="sg">
        {[
          {v:rdvJour.length,  l:"RDV aujourd'hui",ico:"📅",cls:"scg",s:`${rdvJour.filter(r=>r.status==="Confirmé").length} confirmés`},
          {v:confirmes.length,l:"Total confirmés", ico:"✅",cls:"scb",s:"En attente"},
          {v:traites.length,  l:"Traités",         ico:"✓", cls:"sca",s:"Ce mois"},
          {v:taux+"%",        l:"Taux occupation", ico:"🏥",cls:"scr",s:`${totalLib} lits libres`},
        ].map((s,i)=>(
          <div key={i} className={`sc ${s.cls}`} style={{animationDelay:i*.06+"s"}}>
            <div className="si">{s.ico}</div>
            <div className="sv">{s.v}</div>
            <div className="sl">{s.l}</div>
            <div className="ss">{s.s}</div>
          </div>
        ))}
      </div>

      {/* RDV du jour */}
      <div className="mb2">
        <div className="slbl">RDV du jour ({rdvJour.length})</div>
        {rdvJour.length===0
          ? <div className="empty"><div className="emico">📅</div><div className="emtxt">Aucun RDV pour aujourd'hui</div></div>
          : rdvJour.slice(0,4).map(r=><RdvRow key={r.id} rdv={r} compact/>)
        }
      </div>

      {/* État sections */}
      {sections.length>0&&(
        <div>
          <div className="slbl">État des sections</div>
          <div className="card">
            <div className="cb" style={{padding:0}}>
              {sections.map((s,i)=>{
                const pct=Math.round(((s.capacite-s.libres)/s.capacite)*100);
                const cls=pct>80?"pfno":pct>50?"pflo":"pfok";
                const col=pct>80?"#dc2626":pct>50?"#b45309":"var(--g600)";
                return(
                  <div key={s.nom} style={{padding:".68rem 1rem",borderBottom:i<sections.length-1?"1px solid #e5e7eb":"none"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:".32rem"}}>
                      <span style={{fontSize:".84rem",fontWeight:700,color:"#111827"}}>{s.icon} {s.nom}</span>
                      <span style={{fontSize:".74rem",fontWeight:700,color:col}}>{s.libres}/{s.capacite} libres</span>
                    </div>
                    <div className="progbar"><div className={`progfill ${cls}`} style={{width:pct+"%"}}/></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  RDV TAB
// ══════════════════════════════════════════════════════════════════════
function RdvsTab({rdvs}){
  const [filter,setFilter]=useState("tous");
  const [datef,setDatef]  =useState(today());

  const base=datef?rdvs.filter(r=>r.date===datef):rdvs;
  const list=filter==="tous"?base:base.filter(r=>r.status.toLowerCase()===filter);
  const cnt=s=>(datef?rdvs.filter(r=>r.date===datef):rdvs).filter(r=>s==="tous"||r.status.toLowerCase()===s).length;

  return(
    <div className="page">
      <div className="mb2">
        <div className="ttl">Réservations</div>
        <div className="sub">{list.length} RDV trouvé{list.length!==1?"s":""}</div>
      </div>
      <div className="field mb2" style={{maxWidth:220}}>
        <label>Date</label>
        <input type="date" value={datef} onChange={e=>setDatef(e.target.value)}/>
      </div>
      <div className="rdvfilts">
        {[{k:"tous",l:`Tous (${cnt("tous")})`},{k:"confirmé",l:`Confirmés (${cnt("confirmé")})`},{k:"traité",l:`Traités (${cnt("traité")})`},{k:"annulé",l:`Annulés (${cnt("annulé")})`}]
          .map(f=><button key={f.k} className={`fbtn ${filter===f.k?"on":""}`} onClick={()=>setFilter(f.k)}>{f.l}</button>)}
      </div>
      {list.length===0
        ? <div className="empty"><div className="emico">🔍</div><div className="emtxt">Aucun RDV pour ces filtres</div></div>
        : list.sort((a,b)=>a.time.localeCompare(b.time)).map(r=><RdvRow key={r.id} rdv={r}/>)
      }
    </div>
  );
}

function RdvRow({rdv,compact}){
  const [open,setOpen]=useState(false);
  const badge={
    "Confirmé":<span className="badge bdg">✓ Confirmé</span>,
    "Traité":  <span className="badge bda">✓ Traité</span>,
    "Annulé": <span className="badge bdr">✗ Annulé</span>,
  }[rdv.status]||<span className="badge bdgr">{rdv.status}</span>;

  return(
    <div className={`rdvrow ${open?"open":""}`} onClick={()=>!compact&&setOpen(o=>!o)}>
      <div className="rdvtop">
        <div className="rdvtime">{rdv.time}</div>
        <div style={{flex:1,minWidth:0}}>
          <div className="rdvname">{rdv.patientName}</div>
          <div className="rdvdept">{rdv.department} · {rdv.date}</div>
        </div>
        <div>{badge}</div>
        {!compact&&<div style={{color:"var(--s400)",marginLeft:".22rem",transition:"transform .2s",transform:open?"rotate(180deg)":"none",flexShrink:0}}><Ic.Dwn/></div>}
      </div>
      {open&&!compact&&(
        <div className="rdvdet">
          {[
            {l:"Nom complet",  v:rdv.patientName},
            {l:"Téléphone",    v:rdv.patientPhone},
            {l:"Email",        v:rdv.patientEmail},
            {l:"N° CIN",       v:rdv.patientCin},
            {l:"Section",      v:rdv.department},
            {l:"Date & Heure", v:`${rdv.date} à ${rdv.time}`},
            {l:"Référence",    v:rdv.id},
            {l:"Créé le",      v:rdv.createdAt},
          ].map(d=>(
            <div key={d.l}>
              <div className="dtl">{d.l}</div>
              <div className="dtv">{d.v||"—"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  SECTIONS TAB — Gestion des places
// ══════════════════════════════════════════════════════════════════════
function SecsTab({sections,onUpdate}){
  const [edits,setEdits]=useState({});
  const [saved,setSaved]=useState({});

  if(!sections||sections.length===0){
    return(
      <div className="page">
        <div className="empty">
          <div className="emico">🏥</div>
          <div className="emtxt">Aucune section configurée.<br/>Créez votre compte pour ajouter des sections.</div>
        </div>
      </div>
    );
  }

  function save(sec){
    const v=parseInt(edits[sec.nom]);
    if(isNaN(v)||v<0||v>sec.capacite) return;
    onUpdate(sec.nom,v);
    setSaved(p=>({...p,[sec.nom]:true}));
    setTimeout(()=>setSaved(p=>({...p,[sec.nom]:false})),2000);
  }

  return(
    <div className="page">
      <div className="mb2">
        <div className="ttl">Gestion des sections</div>
        <div className="sub">Ajustez les places libres · Les réservations patients décrément automatiquement</div>
      </div>

      <div className="al alg mb2">
        <span>🔄</span>
        <span>À chaque réservation patient dans l'app Dokita, la place est automatiquement déduite. Utilisez la mise à jour manuelle pour corriger en cas d'annulation ou de lit temporairement indisponible.</span>
      </div>

      {sections.map((sec,i)=>{
        const pct=Math.round(((sec.capacite-sec.libres)/sec.capacite)*100);
        const cls=pct>80?"pfno":pct>50?"pflo":"pfok";
        const col=pct>80?"#dc2626":pct>50?"#b45309":"var(--g600)";
        const val=edits[sec.nom]!==undefined?edits[sec.nom]:sec.libres;

        return(
          <div key={sec.nom} className="seccard" style={{animationDelay:i*.04+"s"}}>
            <div className="sech">
              <div className="secico">{sec.icon}</div>
              <div style={{flex:1}}>
                <div className="secnm">{sec.nom}</div>
                <div className="seccap">Capacité : {sec.capacite} lits · {sec.libres} libres · {sec.capacite-sec.libres} occupés</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:"1.22rem",color:col}}>{sec.libres}</div>
                <div style={{fontSize:".6rem",color:"#9ca3af"}}>/{sec.capacite}</div>
              </div>
            </div>

            <div className="progbar mt1">
              <div className={`progfill ${cls}`} style={{width:pct+"%"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:".63rem",color:"#9ca3af",marginTop:".28rem"}}>
              <span>0</span>
              <span style={{fontWeight:700,color:col}}>{pct}% occupé</span>
              <span>{sec.capacite}</span>
            </div>

            {/* Contrôle manuel */}
            <div className="numctrl">
              <span className="numlbl">Places libres :</span>
              <input
                className="numin" type="number" min={0} max={sec.capacite}
                value={val}
                onChange={e=>setEdits(p=>({...p,[sec.nom]:e.target.value}))}
              />
              <span className="numlbl">/ {sec.capacite} max</span>
              <button className="savebtn" onClick={()=>save(sec)}>
                <Ic.Chk/> Mettre à jour
              </button>
              {saved[sec.nom]&&<span className="savedok">✓ Sauvegardé !</span>}
            </div>

            {/* Horaires */}
            <div style={{marginTop:".58rem",display:"flex",flexWrap:"wrap",gap:".28rem",alignItems:"center"}}>
              <span style={{fontSize:".66rem",color:"#9ca3af",marginRight:".1rem"}}>Créneaux :</span>
              {sec.horaires.map(h=>(
                <span key={h} style={{background:"#f9fafb",border:"1px solid #e5e7eb",borderRadius:5,padding:".1rem .42rem",fontSize:".68rem",color:"#4b5563",fontWeight:600}}>{h}</span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  PROFILE
// ══════════════════════════════════════════════════════════════════════
function ProfileTab({hosp,sections,rdvs,onLogout}){
  const totalCap=sections.reduce((a,s)=>a+s.capacite,0);
  const totalLib=sections.reduce((a,s)=>a+s.libres,0);

  return(
    <div className="page">
      <div className="phero">
        <div style={{display:"flex",alignItems:"center",gap:".95rem",marginBottom:".68rem"}}>
          <div style={{width:48,height:48,borderRadius:13,background:"linear-gradient(135deg,var(--g600),var(--g400))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.3rem",fontWeight:900,color:"white",flexShrink:0}}>
            {hosp.nom.charAt(0)}
          </div>
          <div>
            <div className="pname">{hosp.nom}</div>
            <div className="pcity">📍 {hosp.ville} {hosp.type&&`· ${hosp.type}`}</div>
          </div>
        </div>
        <div className="pcode">🆔 {hosp.id}</div>
        <div style={{display:"flex",gap:".52rem",marginTop:".88rem"}}>
          {[{v:rdvs.length,l:"Total RDV"},{v:sections.length,l:"Sections"},{v:`${totalLib}/${totalCap}`,l:"Lits libres"}].map(s=>(
            <div key={s.l} style={{flex:1,background:"rgba(255,255,255,.2)",borderRadius:9,padding:".48rem",textAlign:"center",border:"1px solid rgba(255,255,255,.3)"}}>
              <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:".98rem",color:"#ffffff"}}>{s.v}</div>
              <div style={{fontSize:".62rem",color:"rgba(255,255,255,.75)",marginTop:".1rem"}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="slbl">Informations de l'établissement</div>
      <div className="card mb2">
        <div className="cb" style={{padding:0}}>
          {[
            {i:"🏥",l:"Établissement", v:hosp.nom},
            {i:"🏷️",l:"Type",         v:hosp.type||"—"},
            {i:"📍",l:"Ville",         v:hosp.ville||"—"},
            {i:"🗺️",l:"Adresse",      v:hosp.adresse||"—"},
            {i:"📞",l:"Téléphone",    v:hosp.telephone||"—"},
            {i:"✉️",l:"Email",        v:hosp.email||"—"},
          ].map(r=>(
            <div key={r.l} className="inforow">
              <div className="infoico">{r.i}</div>
              <div><div className="infolbl">{r.l}</div><div className="infoval">{r.v}</div></div>
            </div>
          ))}
        </div>
      </div>

      <div className="slbl">Compte</div>
      <div className="card">
        <div className="cb" style={{padding:0}}>
          <div className="inforow" style={{cursor:"pointer"}} onClick={onLogout}>
            <div className="infoico" style={{background:"#fef2f2",border:"1px solid #fecaca"}}><Ic.Out/></div>
            <div style={{flex:1}}><div className="infoval" style={{color:"#dc2626"}}>Se déconnecter</div></div>
            <div style={{color:"#9ca3af"}}><Ic.Rgt/></div>
          </div>
        </div>
      </div>

      <div className="al alg mt3" style={{fontSize:".72rem"}}>
        <span>🔗</span>
        <span>Connecté au même Google Sheet que l'app patient. Les réservations arrivent ici et les places diminuent automatiquement à chaque réservation confirmée.</span>
      </div>
    </div>
  );
}