
/* ============================================================
   PILOT BRIDGE — APPLICATION
   Vanilla JS · Hash Router · localStorage persistence
   ============================================================ */
(() => {
'use strict';

/* ============================================================
   1. UTILITIES
   ============================================================ */
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = (p='ID') => p + '-' + Math.random().toString(36).slice(2,8).toUpperCase();
const fmtINR = (n) => {
  if (n == null) return '—';
  const s = Math.round(n).toString();
  if (s.length <= 3) return '₹' + s;
  const last3 = s.slice(-3), rest = s.slice(0,-3);
  return '₹' + rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
};
const fmtLakh = (n) => '₹' + (n/100000).toFixed(n % 100000 === 0 ? 0 : 1) + 'L';
const fmtDate = (d) => {
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'});
};
const fmtDateTime = (d) => {
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toLocaleDateString('en-IN', {day:'2-digit', month:'short'}) + ', ' +
         dt.toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'});
};
const timeAgo = (d) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff/60000);
  if (m < 1) return 'just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m/60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h/24) + 'd ago';
};
const initials = (name) => name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));

/* Icon set */
const ICONS = {
  dashboard:'<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  pathway:'<path d="M3 6h6l3 6h9"/><circle cx="6" cy="6" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="21" cy="12" r="2"/>',
  challenge:'<path d="M12 2v4"/><path d="M12 18v4"/><circle cx="12" cy="12" r="6"/><path d="M12 9v3l2 2"/>',
  startup:'<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  evaluation:'<path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h4"/><path d="M9 11V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H9"/><path d="M13 7h4"/><path d="M13 11h4"/><path d="M13 15h2"/>',
  pilot:'<path d="M12 2v6"/><circle cx="12" cy="12" r="4"/><path d="M4.9 19.1A10 10 0 0 1 12 2a10 10 0 0 1 7.1 17.1"/>',
  contract:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15h6"/><path d="M9 11h2"/>',
  monitoring:'<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
  payment:'<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
  validation:'<path d="M20 6 9 17l-5-5"/>',
  scaleup:'<path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>',
  evidence:'<path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M3 15h6v6H3z"/>',
  analytics:'<path d="M3 3v18h18"/><rect x="7" y="10" width="3" height="8"/><rect x="12" y="6" width="3" height="12"/><rect x="17" y="13" width="3" height="5"/>',
  templates:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  audit:'<path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  menu:'<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>',
  chevronRight:'<polyline points="9 18 15 12 9 6"/>',
  chevronLeft:'<polyline points="15 18 9 12 15 6"/>',
  chevronDown:'<polyline points="6 9 12 15 18 9"/>',
  x:'<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  check:'<polyline points="20 6 9 17 4 12"/>',
  checkCircle:'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  alert:'<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  alertTriangle:'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  info:'<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  plus:'<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  filter:'<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
  eye:'<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  edit:'<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/>',
  file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
  folder:'<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
  clock:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  users:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  building:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
  mapPin:'<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  globe:'<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  lock:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  zap:'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  target:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  trendingUp:'<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  award:'<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
  sparkles:'<path d="m12 3-1.9 5.8L4 10l6.1 1.2L12 17l1.9-5.8L20 10l-6.1-1.2z"/><path d="M5 3v4M3 5h4M19 17v4M17 19h4"/>',
  layers:'<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  refresh:'<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  play:'<polygon points="5 3 19 12 5 21 5 3"/>',
  pause:'<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  moon:'<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'
};
const icon = (name, cls='') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;

/* ============================================================
   2. MOCK DATA (SEED)
   ============================================================ */
const DEPARTMENTS = [
  {id:'D1', name:'Urban Development', short:'UDD'},
  {id:'D2', name:'Health & Family Welfare', short:'HFW'},
  {id:'D3', name:'Education', short:'EDU'},
  {id:'D4', name:'Water Resources', short:'WRD'},
  {id:'D5', name:'Energy', short:'ENR'},
  {id:'D6', name:'Transport', short:'TRP'},
  {id:'D7', name:'Municipal Corporation', short:'MCN'}
];
const DISTRICTS = ['Ranipur','Devgarh','Manikpur','Sundarvan','Jheelpur'];

const STAGES = [
  {key:'CHALLENGE',    name:'Challenge',    num:1},
  {key:'DISCOVERY',    name:'Discovery',    num:2},
  {key:'SCREENING',    name:'Screening',    num:3},
  {key:'EVALUATION',   name:'Evaluation',   num:4},
  {key:'PILOT_DESIGN', name:'Pilot Design', num:5},
  {key:'CONTRACT',     name:'Contract',     num:6},
  {key:'MONITORING',   name:'Monitoring',   num:7},
  {key:'PAYMENT',      name:'Payment',      num:8},
  {key:'VALIDATION',   name:'Validation',   num:9},
  {key:'SCALE_UP',     name:'Scale-up',     num:10}
];

const PERSONAS = [
  { id:'P1', role:'gov', name:'Meera Kulkarni', title:'Joint Director', org:'Urban Development Department',
    desc:'Create challenges, review evaluations, approve pilots and contracts, and make scale-up decisions.',
    color:'#1B4D89', caps:['Create challenges','Review applications','Approve pilots','Approve contracts','Monitor pilots','Scale-up decisions'] },
  { id:'P2', role:'evaluator', name:'Dr. Arvind Rao', title:'External Evaluator', org:'Domain Expert Panel',
    desc:'Score assigned applications against the weighted rubric and submit independent evaluations.',
    color:'#6D28D9', caps:['View assigned challenges','Score criteria','Add comments','Submit evaluation','COI declaration'] },
  { id:'P3', role:'startup', name:'Sana Iqbal', title:'Co-founder & CEO', org:'Aquavirt Systems',
    desc:'Discover challenges, apply with documents, track evaluation, submit pilot evidence and payments.',
    color:'#15803D', caps:['Discover challenges','Apply','Upload documents','Track application','Submit evidence'] },
  { id:'P4', role:'validator', name:'Prof. Nandini Bose', title:'Principal Validator', org:'State Engineering Test Lab',
    desc:'Independently verify pilot KPIs, compare baseline vs actual, and issue validation certificates.',
    color:'#B45309', caps:['Review evidence','Verify KPIs','Compare baseline','Upload report','Issue certificate'] },
  { id:'P5', role:'accounts', name:'Rakesh Menon', title:'Accounts Officer', org:'Finance Department',
    desc:'Verify milestone evidence, approve or hold milestone payments, and audit payment history.',
    color:'#0F766E', caps:['View contracts','Verify evidence','Approve payments','Hold payments','Payment history'] },
  { id:'P6', role:'admin', name:'Farah Sheikh', title:'Innovation Cell Admin', org:'Central Programme Office',
    desc:'Manage departments, templates, evaluation rubrics, workflow rules, users and cross-department demand.',
    color:'#334155', caps:['Manage departments','Manage templates','Configure rubrics','Workflow rules','Cross-dept demand'] }
];

const STARTUPS = [
  { id:'ST-01', name:'Aquavirt Systems', tech:'Water intelligence platform', industry:'Water', stage:'Series A',
    district:'Ranipur', deployments:3, cost:1200000, readiness:88, techFit:91, certs:['ISO 27001','DPIIT'],
    founded:2021, team:24, prevGov:['Ranipur Municipal Corp','Devgarh Water Board','Jheelpur PHED'],
    desc:'AI-driven leak detection and non-revenue water reduction using acoustic sensors and network analytics.' },
  { id:'ST-02', name:'FloodSense Labs', tech:'Hyperlocal flood forecasting', industry:'Disaster Mgmt', stage:'Seed',
    district:'Ranipur', deployments:2, cost:1800000, readiness:84, techFit:89, certs:['DPIIT','ISO 9001'],
    founded:2022, team:18, prevGov:['Ranipur Disaster Cell','Sundarvan ULB'],
    desc:'Sensor fusion + rainfall nowcasting to issue ward-level flood alerts 2+ hours ahead of thresholds.' },
  { id:'ST-03', name:'MedChain Cold', tech:'Cold-chain IoT monitoring', industry:'Health', stage:'Series A',
    district:'Devgarh', deployments:4, cost:950000, readiness:90, techFit:86, certs:['ISO 27001','CE'],
    founded:2020, team:31, prevGov:['Devgarh Health Dept','Manikpur PHC Network','State Vaccine Cell','Jheelpur CHC'],
    desc:'Temperature telemetry and excursion alerts for vaccine and biologics cold chain across PHCs.' },
  { id:'ST-04', name:'LuminaGrid', tech:'Streetlight fault detection', industry:'Energy', stage:'Seed',
    district:'Manikpur', deployments:2, cost:780000, readiness:82, techFit:88, certs:['DPIIT'],
    founded:2022, team:14, prevGov:['Manikpur Municipal Corp','Sundarvan ULB'],
    desc:'Retrofittable current-signature sensors to detect streetlight faults and predict failures.' },
  { id:'ST-05', name:'AirVeda', tech:'Air quality sensor network', industry:'Environment', stage:'Series A',
    district:'Sundarvan', deployments:5, cost:2200000, readiness:92, techFit:93, certs:['ISO 27001','ISO 9001','NABL'],
    founded:2019, team:42, prevGov:['Sundarvan Pollution Board','Ranipur ULB','Devgarh CPCB Node','Jheelpur MC','Manikpur ULB'],
    desc:'Low-cost calibrated air quality sensor grids with hyperlocal forecasting and source attribution.' },
  { id:'ST-06', name:'TeleCare Bharat', tech:'Teleconsultation platform', industry:'Health', stage:'Series B',
    district:'Jheelpur', deployments:6, cost:1600000, readiness:94, techFit:90, certs:['ISO 27001','ABDM Ready'],
    founded:2018, team:78, prevGov:['Jheelpur PHC Cluster','Ranipur District Hospital','Devgarh Health Dept','Manikpur CHC','Sundarvan PHC','State NHM'],
    desc:'ABDM-integrated teleconsultation with e-prescription, referral routing and offline-first design.' },
  { id:'ST-07', name:'EduTrack AI', tech:'Education analytics', industry:'Education', stage:'Seed',
    district:'Devgarh', deployments:1, cost:620000, readiness:76, techFit:81, certs:['DPIIT'],
    founded:2023, team:11, prevGov:['Devgarh Education Dept'],
    desc:'Attendance anomaly detection and early-warning dropout risk scoring for government schools.' },
  { id:'ST-08', name:'RouteMinds', tech:'Transit route optimisation', industry:'Transport', stage:'Series A',
    district:'Ranipur', deployments:3, cost:1400000, readiness:87, techFit:90, certs:['ISO 27001'],
    founded:2020, team:29, prevGov:['Ranipur Transport Corp','Manikpur City Bus','Sundarvan ULB'],
    desc:'Demand-weighted route optimisation and schedule adherence analytics for city bus networks.' },
  { id:'ST-09', name:'SolarWatch', tech:'Solar asset monitoring', industry:'Energy', stage:'Seed',
    district:'Manikpur', deployments:2, cost:880000, readiness:80, techFit:85, certs:['DPIIT','BIS'],
    founded:2022, team:16, prevGov:['Manikpur Renewable Agency','Devgarh Energy Dept'],
    desc:'Rooftop solar generation monitoring, soiling detection and performance-ratio benchmarking.' },
  { id:'ST-10', name:'WasteWise', tech:'Waste collection routing', industry:'Waste', stage:'Seed',
    district:'Sundarvan', deployments:2, cost:740000, readiness:79, techFit:83, certs:['DPIIT'],
    founded:2023, team:13, prevGov:['Sundarvan Municipal Corp','Ranipur ULB'],
    desc:'Fill-level sensing and dynamic collection routing to reduce vehicle-km and missed pickups.' }
];

const CHALLENGES = [
  { id:'CH-018', title:'Early Flood Alerts for Low-Lying Wards', dept:'Urban Development', district:'Ranipur',
    stage:'EVALUATION', priority:'High', day:12, status:'Needs action',
    problem:'Low-lying wards experience delayed flood warnings, resulting in avoidable disruption and emergency response delays.',
    baseline:'Warning lead time 20 minutes; false alert rate 28%; ward coverage 55%.',
    outcome:'Provide actionable flood alerts at least 2 hours before critical water-level thresholds are breached.',
    users:'Residents of 14 low-lying wards; District Disaster Management Cell; Ward officers.',
    budget:1800000, duration:90, risk:'Medium',
    kpis:[
      {name:'Flood warning lead time', baseline:'20 min', target:'120 min', current:'—', unit:'min', dir:'up'},
      {name:'False alert rate', baseline:'28%', target:'<10%', current:'—', unit:'%', dir:'down'},
      {name:'Ward coverage', baseline:'55%', target:'>90%', current:'—', unit:'%', dir:'up'}
    ],
    compliance:{dataProtection:true, cyber:true, ip:true, procurement:true, risk:true},
    tech:'IoT water-level sensors, rainfall nowcasting, ML alerting engine.',
    dataReq:'Historical rainfall, drainage network maps, ward-level elevation, sensor telemetry.',
    secReq:'Sensor data encryption in transit and at rest; role-based access; incident logging.',
    ipReq:'Startup retains foreground IP; department gets non-exclusive perpetual licence for public use.',
    eligibility:'DPIIT-recognised startup; prior deployment in disaster or municipal domain preferred; ISO 27001 or equivalent.'
  },
  { id:'CH-014', title:'Cut Water Lost in Ward Supply Networks', dept:'Water Resources', district:'Ranipur',
    stage:'MONITORING', priority:'High', day:64, status:'On track',
    problem:'Non-revenue water loss in ward supply networks due to delayed leak detection and unmetered flow.',
    baseline:'Water loss 31.4%; response time 48 hours; coverage 55%.',
    outcome:'Reduce non-revenue water loss below 20% and cut leak response time under 12 hours.',
    users:'Ward supply consumers; Water Board operations team.',
    budget:1800000, duration:120, risk:'Medium',
    kpis:[
      {name:'Water loss', baseline:'31.4%', target:'<20%', current:'18.7%', unit:'%', dir:'down'},
      {name:'Response time', baseline:'48 h', target:'<12 h', current:'13 h', unit:'h', dir:'down'},
      {name:'Coverage', baseline:'55%', target:'>90%', current:'94%', unit:'%', dir:'up'}
    ],
    compliance:{dataProtection:true, cyber:true, ip:true, procurement:true, risk:true},
    tech:'Acoustic leak sensors, network hydraulic modelling, anomaly detection.',
    dataReq:'Flow and pressure telemetry, valve maps, consumer complaint logs.',
    secReq:'Encrypted telemetry; SCADA isolation; quarterly VAPT.',
    ipReq:'Startup retains IP; department gets non-exclusive licence; source escrow for critical components.',
    eligibility:'DPIIT-recognised; prior water utility deployment; ISO 27001.'
  },
  { id:'CH-017', title:'Cold-Chain Monitoring for Vaccine Delivery', dept:'Health & Family Welfare', district:'Devgarh',
    stage:'PAYMENT', priority:'Medium', day:88, status:'Awaiting payment',
    problem:'Vaccine cold-chain excursions go undetected between district stores and PHCs, causing wastage.',
    baseline:'Excursion detection time 8 hours; wastage 4.2%.',
    outcome:'Detect cold-chain excursions within 15 minutes and reduce wastage below 1%.',
    users:'PHC nurses; district vaccine store; cold-chain handlers.',
    budget:950000, duration:90, risk:'Low',
    kpis:[
      {name:'Excursion detection time', baseline:'8 h', target:'<15 min', current:'11 min', unit:'min', dir:'down'},
      {name:'Vaccine wastage', baseline:'4.2%', target:'<1%', current:'0.8%', unit:'%', dir:'down'},
      {name:'PHC coverage', baseline:'40%', target:'>95%', current:'97%', unit:'%', dir:'up'}
    ],
    compliance:{dataProtection:true, cyber:true, ip:true, procurement:true, risk:true},
    tech:'BLE temperature loggers, gateway mesh, alerting dashboard.',
    dataReq:'Temperature logs, shipment manifests, PHC inventory.',
    secReq:'Device identity, encrypted BLE payloads, audit trails.',
    ipReq:'Startup retains IP; department licence for internal use.',
    eligibility:'DPIIT-recognised; health cold-chain experience; ISO 27001.'
  },
  { id:'CH-021', title:'Streetlight Fault Detection & Predictive Maintenance', dept:'Municipal Corporation', district:'Manikpur',
    stage:'VALIDATION', priority:'Medium', day:96, status:'Awaiting validation',
    problem:'Streetlight faults are reported by citizens and take days to locate and repair.',
    baseline:'Mean time to detect 3.2 days; complaint-based discovery 82%.',
    outcome:'Automatically detect and localise streetlight faults within 30 minutes.',
    users:'Ward electrical staff; citizens; night-time road users.',
    budget:780000, duration:75, risk:'Low',
    kpis:[
      {name:'Mean time to detect', baseline:'3.2 days', target:'<30 min', current:'22 min', unit:'min', dir:'down'},
      {name:'Auto-detection share', baseline:'18%', target:'>85%', current:'91%', unit:'%', dir:'up'},
      {name:'Pole coverage', baseline:'30%', target:'>90%', current:'93%', unit:'%', dir:'up'}
    ],
    compliance:{dataProtection:true, cyber:true, ip:true, procurement:true, risk:true},
    tech:'Current-signature sensing, mesh network, predictive failure model.',
    dataReq:'Pole inventory, feeder maps, outage history.',
    secReq:'Device attestation, encrypted mesh, OTA update signing.',
    ipReq:'Startup retains IP; department gets perpetual non-exclusive licence.',
    eligibility:'DPIIT-recognised; prior municipal deployment; BIS-compliant hardware.'
  },
  { id:'CH-022', title:'Hyperlocal Air Quality Sensor Network', dept:'Urban Development', district:'Sundarvan',
    stage:'SCALE_UP', priority:'High', day:130, status:'Decision pending',
    problem:'City has only 2 reference-grade monitors for 60 wards, so hyperlocal AQI is unknown.',
    baseline:'2 monitors; ward-level AQI coverage 3%.',
    outcome:'Deploy a calibrated 40-node network providing ward-level AQI and source attribution.',
    users:'Citizens; pollution control board; health department.',
    budget:2200000, duration:120, risk:'Medium',
    kpis:[
      {name:'Ward AQI coverage', baseline:'3%', target:'>85%', current:'94%', unit:'%', dir:'up'},
      {name:'Correlation with reference', baseline:'—', target:'>0.85', current:'0.91', unit:'r', dir:'up'},
      {name:'Data uptime', baseline:'—', target:'>95%', current:'98.4%', unit:'%', dir:'up'}
    ],
    compliance:{dataProtection:true, cyber:true, ip:true, procurement:true, risk:true},
    tech:'Low-cost PM2.5/PM10 sensors, calibration model, source attribution.',
    dataReq:'Reference station data, meteorology, land-use, traffic.',
    secReq:'Signed firmware, encrypted MQTT, public API rate limiting.',
    ipReq:'Startup retains IP; department gets licence; calibration model source escrow.',
    eligibility:'DPIIT-recognised; NABL calibration partner; prior pollution board deployment.'
  },
  { id:'CH-019', title:'Teleconsultation for Rural PHCs', dept:'Health & Family Welfare', district:'Jheelpur',
    stage:'PILOT_DESIGN', priority:'High', day:34, status:'In progress',
    problem:'Rural PHCs lack specialist access, forcing patients to travel 40+ km for basic consultations.',
    baseline:'Specialist access 12%; average travel 42 km.',
    outcome:'Enable 80% of PHC patients to receive specialist teleconsultation locally.',
    users:'PHC patients; medical officers; district specialists.',
    budget:1600000, duration:120, risk:'Medium',
    kpis:[
      {name:'Specialist access rate', baseline:'12%', target:'>80%', current:'—', unit:'%', dir:'up'},
      {name:'Avg patient travel', baseline:'42 km', target:'<8 km', current:'—', unit:'km', dir:'down'},
      {name:'Consultation completion', baseline:'—', target:'>90%', current:'—', unit:'%', dir:'up'}
    ],
    compliance:{dataProtection:true, cyber:true, ip:true, procurement:true, risk:true},
    tech:'ABDM-integrated teleconsult, e-prescription, offline-first mobile.',
    dataReq:'Patient records (consented), PHC rosters, specialist availability.',
    secReq:'ABDM compliance, end-to-end encryption, consent artefact logging.',
    ipReq:'Startup retains IP; department gets licence; data remains government property.',
    eligibility:'DPIIT-recognised; ABDM-ready; ISO 27001.'
  },
  { id:'CH-023', title:'School Attendance Anomaly Detection', dept:'Education', district:'Devgarh',
    stage:'SCREENING', priority:'Low', day:8, status:'In progress',
    problem:'Dropout risk is identified too late, after students have been absent for weeks.',
    baseline:'Dropout identification lag 6 weeks; dropout rate 3.8%.',
    outcome:'Flag at-risk students within 1 week of anomalous attendance patterns.',
    users:'School headmasters; block education officers; parents.',
    budget:620000, duration:90, risk:'Low',
    kpis:[
      {name:'Identification lag', baseline:'6 weeks', target:'<1 week', current:'—', unit:'wk', dir:'down'},
      {name:'Dropout rate', baseline:'3.8%', target:'<2%', current:'—', unit:'%', dir:'down'},
      {name:'School coverage', baseline:'—', target:'100%', current:'—', unit:'%', dir:'up'}
    ],
    compliance:{dataProtection:true, cyber:true, ip:true, procurement:true, risk:false},
    tech:'Attendance analytics, anomaly detection, parent SMS alerts.',
    dataReq:'Attendance registers (anonymised), enrolment data.',
    secReq:'Child data protection, role-based access, no PII in analytics layer.',
    ipReq:'Startup retains IP; department gets perpetual licence.',
    eligibility:'DPIIT-recognised; education sector experience; child data compliance.'
  },
  { id:'CH-024', title:'City Bus Route Optimisation', dept:'Transport', district:'Ranipur',
    stage:'DISCOVERY', priority:'Medium', day:5, status:'Discovering',
    problem:'Bus routes have not been revised in 7 years despite shifting demand patterns.',
    baseline:'Average load factor 46%; schedule adherence 61%.',
    outcome:'Revise routes and schedules to raise load factor above 70% and adherence above 85%.',
    users:'Bus commuters; transport corporation operations.',
    budget:1400000, duration:120, risk:'Medium',
    kpis:[
      {name:'Load factor', baseline:'46%', target:'>70%', current:'—', unit:'%', dir:'up'},
      {name:'Schedule adherence', baseline:'61%', target:'>85%', current:'—', unit:'%', dir:'up'},
      {name:'Avg wait time', baseline:'18 min', target:'<10 min', current:'—', unit:'min', dir:'down'}
    ],
    compliance:{dataProtection:true, cyber:true, ip:true, procurement:true, risk:true},
    tech:'Demand modelling, GPS trace analytics, schedule optimiser.',
    dataReq:'Ticket data, GPS traces, census, land-use.',
    secReq:'Anonymised mobility data, encrypted storage.',
    ipReq:'Startup retains IP; department perpetual licence.',
    eligibility:'DPIIT-recognised; transit authority experience.'
  },
  { id:'CH-025', title:'Rooftop Solar Performance Monitoring', dept:'Energy', district:'Manikpur',
    stage:'CHALLENGE', priority:'Medium', day:2, status:'Draft',
    problem:'Rooftop solar installations underperform but underperformance is invisible to the agency.',
    baseline:'Average performance ratio 0.62; soiling detection manual.',
    outcome:'Continuous monitoring with soiling and underperformance alerts within 24 hours.',
    users:'Renewable energy agency; rooftop owners.',
    budget:880000, duration:90, risk:'Low',
    kpis:[
      {name:'Performance ratio', baseline:'0.62', target:'>0.75', current:'—', unit:'', dir:'up'},
      {name:'Underperformance detection', baseline:'Manual', target:'<24 h', current:'—', unit:'h', dir:'down'},
      {name:'Site coverage', baseline:'—', target:'>90%', current:'—', unit:'%', dir:'up'}
    ],
    compliance:{dataProtection:true, cyber:true, ip:true, procurement:true, risk:false},
    tech:'Inverter telemetry, soiling model, performance benchmarking.',
    dataReq:'Inverter logs, irradiance, weather.',
    secReq:'Device identity, encrypted telemetry.',
    ipReq:'Startup retains IP; department licence.',
    eligibility:'DPIIT-recognised; BIS-compliant hardware.'
  },
  { id:'CH-026', title:'Waste Collection Route Intelligence', dept:'Municipal Corporation', district:'Sundarvan',
    stage:'CHALLENGE', priority:'Medium', day:1, status:'Draft',
    problem:'Waste collection routes are static; bins overflow in some areas while trucks run half-empty elsewhere.',
    baseline:'Missed pickups 14%; vehicle-km per tonne 3.8.',
    outcome:'Dynamic routing to cut missed pickups below 3% and vehicle-km per tonne below 2.5.',
    users:'Sanitation workers; ward officers; citizens.',
    budget:740000, duration:90, risk:'Low',
    kpis:[
      {name:'Missed pickups', baseline:'14%', target:'<3%', current:'—', unit:'%', dir:'down'},
      {name:'Vehicle-km / tonne', baseline:'3.8', target:'<2.5', current:'—', unit:'', dir:'down'},
      {name:'Bin coverage', baseline:'—', target:'>95%', current:'—', unit:'%', dir:'up'}
    ],
    compliance:{dataProtection:true, cyber:true, ip:true, procurement:true, risk:false},
    tech:'Fill-level sensors, dynamic routing, driver mobile app.',
    dataReq:'Bin locations, vehicle GPS, collection logs.',
    secReq:'Encrypted telemetry, driver authentication.',
    ipReq:'Startup retains IP; department licence.',
    eligibility:'DPIIT-recognised; municipal waste experience.'
  },
  { id:'CH-027', title:'Groundwater Level Prediction', dept:'Water Resources', district:'Jheelpur',
    stage:'DISCOVERY', priority:'High', day:6, status:'Discovering',
    problem:'Groundwater depletion is measured too late to inform extraction policy.',
    baseline:'Manual monitoring quarterly; prediction horizon 0.',
    outcome:'Predict groundwater levels 3 months ahead with under 10% error.',
    users:'Water resources dept; farmers; policy cell.',
    budget:1100000, duration:120, risk:'Medium',
    kpis:[
      {name:'Prediction error', baseline:'—', target:'<10%', current:'—', unit:'%', dir:'down'},
      {name:'Forecast horizon', baseline:'0', target:'90 days', current:'—', unit:'d', dir:'up'},
      {name:'Observation well coverage', baseline:'22%', target:'>80%', current:'—', unit:'%', dir:'up'}
    ],
    compliance:{dataProtection:true, cyber:true, ip:true, procurement:true, risk:true},
    tech:'Aquifer modelling, remote sensing, ML forecasting.',
    dataReq:'Well logs, rainfall, extraction permits, satellite data.',
    secReq:'Encrypted storage, controlled API access.',
    ipReq:'Startup retains IP; department licence + model documentation.',
    eligibility:'DPIIT-recognised; hydrology modelling experience.'
  },
  { id:'CH-028', title:'Emergency Response Dispatch Optimisation', dept:'Health & Family Welfare', district:'Ranipur',
    stage:'SCREENING', priority:'High', day:10, status:'Needs action',
    problem:'Ambulance dispatch is manual and does not account for real-time traffic or hospital capacity.',
    baseline:'Average response time 19 min; hospital diversion 12%.',
    outcome:'Reduce average emergency response time below 10 minutes.',
    users:'Emergency patients; 108 dispatch; hospitals.',
    budget:1500000, duration:100, risk:'High',
    kpis:[
      {name:'Response time', baseline:'19 min', target:'<10 min', current:'—', unit:'min', dir:'down'},
      {name:'Hospital diversion', baseline:'12%', target:'<3%', current:'—', unit:'%', dir:'down'},
      {name:'Dispatch accuracy', baseline:'—', target:'>95%', current:'—', unit:'%', dir:'up'}
    ],
    compliance:{dataProtection:true, cyber:true, ip:true, procurement:true, risk:true},
    tech:'Real-time dispatch engine, traffic integration, capacity-aware routing.',
    dataReq:'Ambulance GPS, traffic feeds, hospital bed availability.',
    secReq:'High-availability architecture, encrypted comms, audit logging.',
    ipReq:'Startup retains IP; department licence; escrow for critical algorithms.',
    eligibility:'DPIIT-recognised; emergency services experience; ISO 27001.'
  },
  { id:'CH-029', title:'Digital Attendance for Anganwadi Centres', dept:'Education', district:'Manikpur',
    stage:'EVALUATION', priority:'Low', day:16, status:'In progress',
    problem:'Anganwadi attendance is paper-based and aggregated monthly, hiding daily absences.',
    baseline:'Reporting lag 30 days; data completeness 58%.',
    outcome:'Daily digital attendance with offline sync and 95% completeness.',
    users:'Anganwadi workers; supervisors; ICDS officers.',
    budget:520000, duration:75, risk:'Low',
    kpis:[
      {name:'Reporting lag', baseline:'30 days', target:'<1 day', current:'—', unit:'d', dir:'down'},
      {name:'Data completeness', baseline:'58%', target:'>95%', current:'—', unit:'%', dir:'up'},
      {name:'Centre coverage', baseline:'—', target:'100%', current:'—', unit:'%', dir:'up'}
    ],
    compliance:{dataProtection:true, cyber:true, ip:true, procurement:true, risk:false},
    tech:'Offline-first mobile app, biometric/photo attendance, sync engine.',
    dataReq:'Beneficiary rolls (anonymised), worker rosters.',
    secReq:'Child data protection, device encryption, consent logging.',
    ipReq:'Startup retains IP; department perpetual licence.',
    eligibility:'DPIIT-recognised; ICDS/education experience; child data compliance.'
  },
  { id:'CH-030', title:'Pothole Detection using Computer Vision', dept:'Transport', district:'Devgarh',
    stage:'PILOT_DESIGN', priority:'Medium', day:28, status:'In progress',
    problem:'Pothole complaints are citizen-reported and road repair prioritisation is not data-driven.',
    baseline:'Avg repair time 34 days; citizen complaints 1,200/month.',
    outcome:'Automated pothole detection from bus-mounted cameras with 90% accuracy.',
    users:'Road maintenance crews; commuters.',
    budget:980000, duration:90, risk:'Low',
    kpis:[
      {name:'Detection accuracy', baseline:'—', target:'>90%', current:'—', unit:'%', dir:'up'},
      {name:'Avg repair time', baseline:'34 days', target:'<14 days', current:'—', unit:'d', dir:'down'},
      {name:'Road coverage', baseline:'—', target:'>80%', current:'—', unit:'%', dir:'up'}
    ],
    compliance:{dataProtection:true, cyber:true, ip:true, procurement:true, risk:false},
    tech:'Edge CV on bus cameras, geo-tagged detection, prioritisation engine.',
    dataReq:'Road imagery, GPS traces, complaint logs.',
    secReq:'Edge processing, no PII capture, encrypted uploads.',
    ipReq:'Startup retains IP; department licence.',
    eligibility:'DPIIT-recognised; CV deployment experience.'
  }
];

const APPLICATIONS = [
  { id:'AP-018-1', challengeId:'CH-018', startupId:'ST-02', status:'Shortlisted', submittedAt:'2026-09-04',
    docs:['Company profile','Solution document','Technical proposal','Past deployment evidence','Compliance documents','Financial information'] },
  { id:'AP-018-2', challengeId:'CH-018', startupId:'ST-05', status:'Shortlisted', submittedAt:'2026-09-05',
    docs:['Company profile','Solution document','Technical proposal','Compliance documents'] },
  { id:'AP-018-3', challengeId:'CH-018', startupId:'ST-08', status:'Evaluation', submittedAt:'2026-09-06',
    docs:['Company profile','Solution document','Technical proposal','Past deployment evidence'] },
  { id:'AP-014-1', challengeId:'CH-014', startupId:'ST-01', status:'Pilot', submittedAt:'2026-06-12',
    docs:['Company profile','Solution document','Technical proposal','Past deployment evidence','Compliance documents','Financial information'] },
  { id:'AP-014-2', challengeId:'CH-014', startupId:'ST-10', status:'Rejected', submittedAt:'2026-06-14',
    docs:['Company profile','Solution document'] },
  { id:'AP-017-1', challengeId:'CH-017', startupId:'ST-03', status:'Pilot', submittedAt:'2026-05-20',
    docs:['Company profile','Solution document','Technical proposal','Past deployment evidence','Compliance documents','Financial information'] },
  { id:'AP-021-1', challengeId:'CH-021', startupId:'ST-04', status:'Pilot', submittedAt:'2026-05-02',
    docs:['Company profile','Solution document','Technical proposal','Compliance documents'] },
  { id:'AP-022-1', challengeId:'CH-022', startupId:'ST-05', status:'Pilot', submittedAt:'2026-03-18',
    docs:['Company profile','Solution document','Technical proposal','Past deployment evidence','Compliance documents','Financial information'] },
  { id:'AP-019-1', challengeId:'CH-019', startupId:'ST-06', status:'Pilot', submittedAt:'2026-08-02',
    docs:['Company profile','Solution document','Technical proposal','Past deployment evidence','Compliance documents'] },
  { id:'AP-023-1', challengeId:'CH-023', startupId:'ST-07', status:'Screening', submittedAt:'2026-09-14',
    docs:['Company profile','Solution document','Compliance documents'] },
  { id:'AP-028-1', challengeId:'CH-028', startupId:'ST-06', status:'Screening', submittedAt:'2026-09-16',
    docs:['Company profile','Solution document','Technical proposal'] },
  { id:'AP-024-1', challengeId:'CH-024', startupId:'ST-08', status:'Submitted', submittedAt:'2026-09-19',
    docs:['Company profile','Solution document'] },
  { id:'AP-027-1', challengeId:'CH-027', startupId:'ST-01', status:'Submitted', submittedAt:'2026-09-20',
    docs:['Company profile','Solution document','Technical proposal'] },
  { id:'AP-030-1', challengeId:'CH-030', startupId:'ST-08', status:'Pilot', submittedAt:'2026-07-10',
    docs:['Company profile','Solution document','Technical proposal','Past deployment evidence'] },
  { id:'AP-030-2', challengeId:'CH-030', startupId:'ST-04', status:'Shortlisted', submittedAt:'2026-07-11',
    docs:['Company profile','Solution document','Technical proposal'] },
  { id:'AP-029-1', challengeId:'CH-029', startupId:'ST-07', status:'Evaluation', submittedAt:'2026-09-01',
    docs:['Company profile','Solution document','Compliance documents'] },
  { id:'AP-029-2', challengeId:'CH-029', startupId:'ST-06', status:'Evaluation', submittedAt:'2026-09-02',
    docs:['Company profile','Solution document'] },
  { id:'AP-026-1', challengeId:'CH-026', startupId:'ST-10', status:'Draft', submittedAt:'2026-09-22',
    docs:['Company profile'] },
  { id:'AP-025-1', challengeId:'CH-025', startupId:'ST-09', status:'Draft', submittedAt:'2026-09-22',
    docs:['Company profile'] }
];

const RUBRIC = [
  { key:'technical', name:'Technical feasibility', weight:30 },
  { key:'impact', name:'Impact potential', weight:25 },
  { key:'cost', name:'Cost effectiveness', weight:20 },
  { key:'security', name:'Security & compliance', weight:15 },
  { key:'scalability', name:'Scalability', weight:10 }
];

const EVALUATIONS = [
  { id:'EV-018-1', applicationId:'AP-018-1', evaluator:'Dr. Arvind Rao', role:'Domain Expert Panel',
    scores:{technical:88, impact:92, cost:85, security:86, scalability:90}, status:'Submitted',
    comments:'Strong sensor fusion approach; past Ranipur deployment directly relevant. Cost marginally high but justified by hardware quality.',
    coi:false, submittedAt:'2026-09-18' },
  { id:'EV-018-2', applicationId:'AP-018-1', evaluator:'Dr. Kavita Menon', role:'Domain Expert Panel',
    scores:{technical:85, impact:90, cost:82, security:88, scalability:87}, status:'Submitted',
    comments:'Solid technical plan. Recommend milestone-based hardware validation.',
    coi:false, submittedAt:'2026-09-18' },
  { id:'EV-018-3', applicationId:'AP-018-2', evaluator:'Dr. Arvind Rao', role:'Domain Expert Panel',
    scores:{technical:80, impact:84, cost:88, security:82, scalability:78}, status:'Submitted',
    comments:'Good air quality credentials but flood-domain fit is a stretch.',
    coi:false, submittedAt:'2026-09-19' },
  { id:'EV-018-4', applicationId:'AP-018-3', evaluator:'Dr. Arvind Rao', role:'Domain Expert Panel',
    scores:{technical:76, impact:74, cost:80, security:79, scalability:72}, status:'Submitted',
    comments:'Transit optimisation is adjacent; flood use case not well evidenced.',
    coi:false, submittedAt:'2026-09-19' },
  { id:'EV-018-5', applicationId:'AP-018-2', evaluator:'Dr. Kavita Menon', role:'Domain Expert Panel',
    scores:{technical:82, impact:86, cost:86, security:84, scalability:80}, status:'Draft',
    comments:'', coi:false, submittedAt:null },
  { id:'EV-029-1', applicationId:'AP-029-1', evaluator:'Dr. Arvind Rao', role:'Domain Expert Panel',
    scores:{technical:78, impact:80, cost:84, security:76, scalability:74}, status:'Submitted',
    comments:'Good education fit; offline-first design is a plus.',
    coi:false, submittedAt:'2026-09-15' },
  { id:'EV-029-2', applicationId:'AP-029-2', evaluator:'Dr. Arvind Rao', role:'Domain Expert Panel',
    scores:{technical:84, impact:86, cost:78, security:88, scalability:82}, status:'Submitted',
    comments:'Telehealth platform is over-specified for Anganwadi use case.',
    coi:false, submittedAt:'2026-09-16' }
];

const PILOTS = [
  { id:'PL-014', challengeId:'CH-014', startupId:'ST-01', contractId:'CT-014',
    title:'Water Loss Reduction — Ranipur Ward 7–14',
    startDate:'2026-07-15', endDate:'2026-11-12', duration:120, budget:1800000,
    status:'Active', progress:62, riskLevel:'Medium',
    geography:'Ranipur Wards 7–14', users:'14,200 households',
    milestones:[
      { id:'M1', name:'Deployment', amount:300000, due:'2026-07-30', status:'PAID', paidAt:'2026-08-02', deliverables:'Sensor installation in 8 wards; gateway commissioning.', evidence:'Installation report, sensor map', evidenceRequired:true },
      { id:'M2', name:'Operational pilot', amount:500000, due:'2026-08-30', status:'PAID', paidAt:'2026-09-01', deliverables:'Leak detection live; ops dashboard handed over.', evidence:'Ops report, dashboard screenshots', evidenceRequired:true },
      { id:'M3', name:'Performance target', amount:600000, due:'2026-10-15', status:'AWAITING_VALIDATION', paidAt:null, deliverables:'Water loss <20%; response time <12h.', evidence:'KPI dataset, sensor logs, field inspection', evidenceRequired:true },
      { id:'M4', name:'Final validation', amount:400000, due:'2026-11-12', status:'LOCKED', paidAt:null, deliverables:'Final validated report; scale-up recommendation.', evidence:'Validation certificate', evidenceRequired:true }
    ],
    kpis:[
      { name:'Water loss', baseline:31.4, current:18.7, target:20, unit:'%', dir:'down', status:'ACHIEVED' },
      { name:'Response time', baseline:48, current:13, target:12, unit:'h', dir:'down', status:'NEAR' },
      { name:'Coverage', baseline:55, current:94, target:90, unit:'%', dir:'up', status:'ACHIEVED' }
    ],
    trend:[
      {week:'W1', loss:30.1, response:44, coverage:58},
      {week:'W2', loss:28.4, response:38, coverage:66},
      {week:'W3', loss:26.2, response:31, coverage:71},
      {week:'W4', loss:24.0, response:26, coverage:78},
      {week:'W5', loss:22.1, response:21, coverage:83},
      {week:'W6', loss:20.6, response:18, coverage:88},
      {week:'W7', loss:19.4, response:15, coverage:91},
      {week:'W8', loss:18.7, response:13, coverage:94}
    ],
    risks:[
      { name:'Budget variance', value:'12%', level:'warn', detail:'Sensor unit cost 12% above estimate due to import duty revision. Absorbed within contingency.' },
      { name:'Timeline', value:'8 days delayed', level:'warn', detail:'M2 slipped 8 days due to monsoon access restrictions in Ward 11.' },
      { name:'KPI achievement', value:'91%', level:'ok', detail:'Two of three KPIs fully achieved; response time is 1 hour short of target.' },
      { name:'Data completeness', value:'97%', level:'ok', detail:'Sensor telemetry gap of 3% attributable to two offline nodes in Ward 9.' },
      { name:'Security review', value:'Pending', level:'warn', detail:'Quarterly VAPT scheduled; interim review passed.' },
      { name:'Incident count', value:'1 minor', level:'ok', detail:'One sensor enclosure tampering attempt; resolved without data loss.' }
    ]
  },
  { id:'PL-017', challengeId:'CH-017', startupId:'ST-03', contractId:'CT-017',
    title:'Vaccine Cold-Chain Monitoring — Devgarh District',
    startDate:'2026-06-01', endDate:'2026-08-30', duration:90, budget:950000,
    status:'Completed', progress:100, riskLevel:'Low',
    geography:'Devgarh District — 42 PHCs', users:'42 PHCs, 18,000 monthly doses',
    milestones:[
      { id:'M1', name:'Deployment', amount:250000, due:'2026-06-15', status:'PAID', paidAt:'2026-06-18', deliverables:'Loggers + gateways at 42 PHCs.', evidence:'Installation report', evidenceRequired:true },
      { id:'M2', name:'Operational pilot', amount:300000, due:'2026-07-15', status:'PAID', paidAt:'2026-07-17', deliverables:'Alerting dashboard live; staff trained.', evidence:'Training report, dashboard', evidenceRequired:true },
      { id:'M3', name:'Performance target', amount:250000, due:'2026-08-15', status:'PAID', paidAt:'2026-08-18', deliverables:'Wastage <1%; detection <15 min.', evidence:'KPI dataset, validation report', evidenceRequired:true },
      { id:'M4', name:'Final validation', amount:150000, due:'2026-08-30', status:'AWAITING_PAYMENT', paidAt:null, deliverables:'Final validated report.', evidence:'Validation certificate', evidenceRequired:true }
    ],
    kpis:[
      { name:'Excursion detection', baseline:480, current:11, target:15, unit:'min', dir:'down', status:'ACHIEVED' },
      { name:'Vaccine wastage', baseline:4.2, current:0.8, target:1, unit:'%', dir:'down', status:'ACHIEVED' },
      { name:'PHC coverage', baseline:40, current:97, target:95, unit:'%', dir:'up', status:'ACHIEVED' }
    ],
    trend:[
      {week:'W1', loss:3.8, response:120, coverage:52},
      {week:'W2', loss:3.1, response:74, coverage:64},
      {week:'W3', loss:2.4, response:48, coverage:73},
      {week:'W4', loss:1.9, response:32, coverage:81},
      {week:'W5', loss:1.4, response:22, coverage:88},
      {week:'W6', loss:1.1, response:16, coverage:92},
      {week:'W7', loss:0.9, response:13, coverage:95},
      {week:'W8', loss:0.8, response:11, coverage:97}
    ],
    risks:[
      { name:'Budget variance', value:'4%', level:'ok', detail:'Minor savings on gateway units.' },
      { name:'Timeline', value:'On schedule', level:'ok', detail:'All milestones delivered on time.' },
      { name:'KPI achievement', value:'100%', level:'ok', detail:'All three KPIs exceeded target.' },
      { name:'Data completeness', value:'99.2%', level:'ok', detail:'Excellent telemetry continuity.' },
      { name:'Security review', value:'Cleared', level:'ok', detail:'VAPT cleared with no critical findings.' },
      { name:'Incident count', value:'0', level:'ok', detail:'No security or operational incidents.' }
    ]
  },
  { id:'PL-021', challengeId:'CH-021', startupId:'ST-04', contractId:'CT-021',
    title:'Streetlight Fault Detection — Manikpur Zone 3',
    startDate:'2026-06-20', endDate:'2026-09-03', duration:75, budget:780000,
    status:'Completed', progress:100, riskLevel:'Low',
    geography:'Manikpur Zone 3 — 2,140 poles', users:'Zone 3 residents; electrical staff',
    milestones:[
      { id:'M1', name:'Deployment', amount:200000, due:'2026-07-05', status:'PAID', paidAt:'2026-07-08', deliverables:'Sensors on 2,140 poles.', evidence:'Installation report', evidenceRequired:true },
      { id:'M2', name:'Operational pilot', amount:250000, due:'2026-08-05', status:'PAID', paidAt:'2026-08-07', deliverables:'Detection dashboard live.', evidence:'Ops report', evidenceRequired:true },
      { id:'M3', name:'Performance target', amount:200000, due:'2026-08-25', status:'PAID', paidAt:'2026-08-28', deliverables:'MTTD <30 min; auto-detection >85%.', evidence:'KPI dataset', evidenceRequired:true },
      { id:'M4', name:'Final validation', amount:130000, due:'2026-09-03', status:'AWAITING_VALIDATION', paidAt:null, deliverables:'Validated report + certificate.', evidence:'Validation certificate', evidenceRequired:true }
    ],
    kpis:[
      { name:'Mean time to detect', baseline:4608, current:22, target:30, unit:'min', dir:'down', status:'ACHIEVED' },
      { name:'Auto-detection share', baseline:18, current:91, target:85, unit:'%', dir:'up', status:'ACHIEVED' },
      { name:'Pole coverage', baseline:30, current:93, target:90, unit:'%', dir:'up', status:'ACHIEVED' }
    ],
    trend:[
      {week:'W1', loss:120, response:340, coverage:38},
      {week:'W2', loss:96, response:210, coverage:52},
      {week:'W3', loss:71, response:120, coverage:66},
      {week:'W4', loss:52, response:74, coverage:76},
      {week:'W5', loss:38, response:48, coverage:84},
      {week:'W6', loss:29, response:32, coverage:89},
      {week:'W7', loss:25, response:26, coverage:92},
      {week:'W8', loss:22, response:22, coverage:93}
    ],
    risks:[
      { name:'Budget variance', value:'2%', level:'ok', detail:'Within tolerance.' },
      { name:'Timeline', value:'On schedule', level:'ok', detail:'Completed on time.' },
      { name:'KPI achievement', value:'100%', level:'ok', detail:'All KPIs exceeded.' },
      { name:'Data completeness', value:'98.1%', level:'ok', detail:'Minor gaps from two offline poles.' },
      { name:'Security review', value:'Cleared', level:'ok', detail:'Device attestation verified.' },
      { name:'Incident count', value:'0', level:'ok', detail:'No incidents.' }
    ]
  },
  { id:'PL-022', challengeId:'CH-022', startupId:'ST-05', contractId:'CT-022',
    title:'Hyperlocal Air Quality Network — Sundarvan',
    startDate:'2026-04-10', endDate:'2026-08-08', duration:120, budget:2200000,
    status:'Validated', progress:100, riskLevel:'Medium',
    geography:'Sundarvan — 40 wards', users:'1.2M residents; Pollution Control Board',
    milestones:[
      { id:'M1', name:'Deployment', amount:600000, due:'2026-05-01', status:'PAID', paidAt:'2026-05-04', deliverables:'40 nodes installed & calibrated.', evidence:'Installation + calibration report', evidenceRequired:true },
      { id:'M2', name:'Operational pilot', amount:700000, due:'2026-06-15', status:'PAID', paidAt:'2026-06-18', deliverables:'Public dashboard + API live.', evidence:'Dashboard, API docs', evidenceRequired:true },
      { id:'M3', name:'Performance target', amount:550000, due:'2026-07-20', status:'PAID', paidAt:'2026-07-22', deliverables:'Coverage >85%; correlation >0.85.', evidence:'KPI dataset', evidenceRequired:true },
      { id:'M4', name:'Final validation', amount:350000, due:'2026-08-08', status:'PAID', paidAt:'2026-08-12', deliverables:'Validation certificate.', evidence:'Validation certificate', evidenceRequired:true }
    ],
    kpis:[
      { name:'Ward AQI coverage', baseline:3, current:94, target:85, unit:'%', dir:'up', status:'ACHIEVED' },
      { name:'Correlation with reference', baseline:0, current:0.91, target:0.85, unit:'r', dir:'up', status:'ACHIEVED' },
      { name:'Data uptime', baseline:0, current:98.4, target:95, unit:'%', dir:'up', status:'ACHIEVED' }
    ],
    trend:[
      {week:'W1', loss:12, response:60, coverage:22},
      {week:'W2', loss:28, response:52, coverage:38},
      {week:'W3', loss:44, response:44, coverage:54},
      {week:'W4', loss:58, response:36, coverage:66},
      {week:'W5', loss:70, response:28, coverage:76},
      {week:'W6', loss:80, response:22, coverage:84},
      {week:'W7', loss:88, response:16, coverage:90},
      {week:'W8', loss:94, response:12, coverage:94}
    ],
    risks:[
      { name:'Budget variance', value:'6%', level:'ok', detail:'Calibration partner costs slightly higher.' },
      { name:'Timeline', value:'4 days delayed', level:'ok', detail:'Minor delay in node installation due to site access.' },
      { name:'KPI achievement', value:'100%', level:'ok', detail:'All KPIs exceeded.' },
      { name:'Data completeness', value:'98.4%', level:'ok', detail:'Excellent uptime.' },
      { name:'Security review', value:'Cleared', level:'ok', detail:'API rate limiting and signing verified.' },
      { name:'Incident count', value:'0', level:'ok', detail:'No incidents.' }
    ]
  },
  { id:'PL-019', challengeId:'CH-019', startupId:'ST-06', contractId:'CT-019',
    title:'Teleconsultation for Rural PHCs — Jheelpur',
    startDate:'2026-09-15', endDate:'2027-01-13', duration:120, budget:1600000,
    status:'Active', progress:8, riskLevel:'Medium',
    geography:'Jheelpur — 18 PHCs', users:'18 PHCs, 240,000 catchment',
    milestones:[
      { id:'M1', name:'Deployment', amount:400000, due:'2026-10-05', status:'IN_PROGRESS', paidAt:null, deliverables:'Teleconsult platform live at 18 PHCs.', evidence:'Deployment report', evidenceRequired:true },
      { id:'M2', name:'Operational pilot', amount:500000, due:'2026-11-10', status:'LOCKED', paidAt:null, deliverables:'50% of consults via teleconsult.', evidence:'Consultation logs', evidenceRequired:true },
      { id:'M3', name:'Performance target', amount:450000, due:'2026-12-15', status:'LOCKED', paidAt:null, deliverables:'Access >80%; travel <8 km.', evidence:'KPI dataset', evidenceRequired:true },
      { id:'M4', name:'Final validation', amount:250000, due:'2027-01-13', status:'LOCKED', paidAt:null, deliverables:'Validation certificate.', evidence:'Validation certificate', evidenceRequired:true }
    ],
    kpis:[
      { name:'Specialist access rate', baseline:12, current:14, target:80, unit:'%', dir:'up', status:'BELOW' },
      { name:'Avg patient travel', baseline:42, current:41, target:8, unit:'km', dir:'down', status:'BELOW' },
      { name:'Consultation completion', baseline:0, current:0, target:90, unit:'%', dir:'up', status:'BELOW' }
    ],
    trend:[
      {week:'W1', loss:12, response:42, coverage:14},
      {week:'W2', loss:13, response:42, coverage:16},
      {week:'W3', loss:14, response:41, coverage:18},
      {week:'W4', loss:14, response:41, coverage:20}
    ],
    risks:[
      { name:'Budget variance', value:'0%', level:'ok', detail:'No variance yet.' },
      { name:'Timeline', value:'On schedule', level:'ok', detail:'Deployment underway.' },
      { name:'KPI achievement', value:'Early stage', level:'warn', detail:'KPIs are baseline; pilot has just started.' },
      { name:'Data completeness', value:'72%', level:'warn', detail:'ABDM consent artefacts still being onboarded.' },
      { name:'Security review', value:'Pending', level:'warn', detail:'ABDM compliance review scheduled.' },
      { name:'Incident count', value:'0', level:'ok', detail:'No incidents.' }
    ]
  }
];

const CONTRACTS = [
  { id:'CT-014', challengeId:'CH-014', startupId:'ST-01', value:1800000, start:'2026-07-15', end:'2026-11-12',
    status:'Active', signedAt:'2026-07-14',
    ipClause:'Startup retains foreground IP. Department receives non-exclusive, perpetual, royalty-free licence for internal government use. Source escrow for critical detection algorithms.',
    dataClause:'All operational data generated during the pilot is the property of the Water Resources Department. Startup may use anonymised, aggregated data for product improvement with written consent.',
    securityClause:'ISO 27001 controls; encrypted telemetry (TLS 1.3, AES-256 at rest); quarterly VAPT; incident reporting within 24 hours; SCADA network isolation.',
    termination:'Either party may terminate with 30 days written notice. Department may terminate immediately for material breach, security incident, or non-performance against milestones.' },
  { id:'CT-017', challengeId:'CH-017', startupId:'ST-03', value:950000, start:'2026-06-01', end:'2026-08-30',
    status:'Completed', signedAt:'2026-05-30',
    ipClause:'Startup retains IP. Department receives non-exclusive perpetual licence for internal use.',
    dataClause:'Temperature and shipment data belongs to the Health Department. Aggregated anonymised data may be used for product improvement.',
    securityClause:'ISO 27001; encrypted BLE payloads; device identity; audit trails; VAPT cleared.',
    termination:'30-day written notice; immediate termination for breach or security incident.' },
  { id:'CT-021', challengeId:'CH-021', startupId:'ST-04', value:780000, start:'2026-06-20', end:'2026-09-03',
    status:'Completed', signedAt:'2026-06-18',
    ipClause:'Startup retains IP. Department receives perpetual non-exclusive licence.',
    dataClause:'Pole-level fault data belongs to the Municipal Corporation.',
    securityClause:'Device attestation; encrypted mesh; signed OTA updates; VAPT cleared.',
    termination:'30-day written notice; immediate termination for breach.' },
  { id:'CT-022', challengeId:'CH-022', startupId:'ST-05', value:2200000, start:'2026-04-10', end:'2026-08-08',
    status:'Completed', signedAt:'2026-04-08',
    ipClause:'Startup retains IP; calibration model source escrow with department.',
    dataClause:'AQI data is public; raw sensor data belongs to the Pollution Control Board.',
    securityClause:'Signed firmware; encrypted MQTT; public API rate limiting; VAPT cleared.',
    termination:'30-day written notice; immediate termination for breach.' },
  { id:'CT-019', challengeId:'CH-019', startupId:'ST-06', value:1600000, start:'2026-09-15', end:'2027-01-13',
    status:'Active', signedAt:'2026-09-12',
    ipClause:'Startup retains IP; department licence for internal use; data remains government property.',
    dataClause:'Patient data belongs to the Health Department and must remain within India. ABDM consent artefacts required for every consultation.',
    securityClause:'ABDM compliance; end-to-end encryption; consent logging; ISO 27001; VAPT before go-live.',
    termination:'30-day written notice; immediate termination for breach, data protection violation, or non-performance.' },
  { id:'CT-030', challengeId:'CH-030', startupId:'ST-08', value:980000, start:'2026-08-01', end:'2026-10-30',
    status:'Active', signedAt:'2026-07-28',
    ipClause:'Startup retains IP; department perpetual licence.',
    dataClause:'Road imagery and detection data belongs to Transport Department.',
    securityClause:'Edge processing; no PII capture; encrypted uploads; VAPT scheduled.',
    termination:'30-day written notice; immediate termination for breach.' }
];

const EVIDENCE = [
  { id:'EV-014-1', pilotId:'PL-014', type:'Installation report', name:'Ward 7–14 Sensor Installation Report.pdf',
    uploadedBy:'Sana Iqbal', uploadedAt:'2026-07-29T10:12:00', milestone:'M1', status:'Verified',
    verifiedBy:'Rakesh Menon', verifiedAt:'2026-08-01T14:30:00', kpi:'—', size:'4.2 MB', supports:'Milestone M1 — Deployment' },
  { id:'EV-014-2', pilotId:'PL-014', type:'Sensor data', name:'Acoustic Sensor Telemetry — Aug 2026.csv',
    uploadedBy:'Sana Iqbal', uploadedAt:'2026-08-28T16:40:00', milestone:'M2', status:'Verified',
    verifiedBy:'Rakesh Menon', verifiedAt:'2026-08-30T09:15:00', kpi:'Water loss', size:'18.7 MB', supports:'Milestone M2 — Operational pilot' },
  { id:'EV-014-3', pilotId:'PL-014', type:'KPI dataset', name:'Water Loss KPI Dataset — W1–W8.xlsx',
    uploadedBy:'Sana Iqbal', uploadedAt:'2026-10-10T11:05:00', milestone:'M3', status:'Under review',
    verifiedBy:null, verifiedAt:null, kpi:'Water loss', size:'1.1 MB', supports:'Milestone M3 — Performance target' },
  { id:'EV-014-4', pilotId:'PL-014', type:'Field photos', name:'Ward 11 Leak Repair — Before After.jpg',
    uploadedBy:'Sana Iqbal', uploadedAt:'2026-10-11T09:22:00', milestone:'M3', status:'Submitted',
    verifiedBy:null, verifiedAt:null, kpi:'Response time', size:'6.4 MB', supports:'Milestone M3 — Performance target' },
  { id:'EV-014-5', pilotId:'PL-014', type:'Inspection report', name:'Independent Field Inspection — Ward 9.pdf',
    uploadedBy:'Prof. Nandini Bose', uploadedAt:'2026-10-14T15:00:00', milestone:'M3', status:'Submitted',
    verifiedBy:null, verifiedAt:null, kpi:'Coverage', size:'2.8 MB', supports:'Milestone M3 — Performance target' },
  { id:'EV-017-1', pilotId:'PL-017', type:'Installation report', name:'42 PHC Logger Installation Report.pdf',
    uploadedBy:'Sana Iqbal', uploadedAt:'2026-06-14T10:00:00', milestone:'M1', status:'Verified',
    verifiedBy:'Rakesh Menon', verifiedAt:'2026-06-17T11:20:00', kpi:'—', size:'3.1 MB', supports:'Milestone M1 — Deployment' },
  { id:'EV-017-2', pilotId:'PL-017', type:'KPI dataset', name:'Cold Chain KPI Dataset — Full Pilot.xlsx',
    uploadedBy:'Sana Iqbal', uploadedAt:'2026-08-14T14:30:00', milestone:'M3', status:'Verified',
    verifiedBy:'Prof. Nandini Bose', verifiedAt:'2026-08-16T10:00:00', kpi:'Vaccine wastage', size:'2.2 MB', supports:'Milestone M3 — Performance target' },
  { id:'EV-017-3', pilotId:'PL-017', type:'Validation documents', name:'Validation Certificate — CT-017.pdf',
    uploadedBy:'Prof. Nandini Bose', uploadedAt:'2026-08-28T16:00:00', milestone:'M4', status:'Verified',
    verifiedBy:'Rakesh Menon', verifiedAt:'2026-08-29T09:00:00', kpi:'—', size:'0.9 MB', supports:'Milestone M4 — Final validation' },
  { id:'EV-021-1', pilotId:'PL-021', type:'Installation report', name:'Zone 3 Pole Sensor Installation.pdf',
    uploadedBy:'Sana Iqbal', uploadedAt:'2026-07-04T11:00:00', milestone:'M1', status:'Verified',
    verifiedBy:'Rakesh Menon', verifiedAt:'2026-07-07T15:00:00', kpi:'—', size:'5.6 MB', supports:'Milestone M1 — Deployment' },
  { id:'EV-021-2', pilotId:'PL-021', type:'KPI dataset', name:'Streetlight Detection KPI Dataset.xlsx',
    uploadedBy:'Sana Iqbal', uploadedAt:'2026-08-24T10:00:00', milestone:'M3', status:'Verified',
    verifiedBy:'Prof. Nandini Bose', verifiedAt:'2026-08-26T14:00:00', kpi:'Mean time to detect', size:'1.4 MB', supports:'Milestone M3 — Performance target' },
  { id:'EV-021-3', pilotId:'PL-021', type:'Validation documents', name:'Validation Certificate — CT-021 (pending).pdf',
    uploadedBy:'Prof. Nandini Bose', uploadedAt:'2026-09-01T10:00:00', milestone:'M4', status:'Under review',
    verifiedBy:null, verifiedAt:null, kpi:'—', size:'0.8 MB', supports:'Milestone M4 — Final validation' },
  { id:'EV-022-1', pilotId:'PL-022', type:'Installation report', name:'40 Node Installation & Calibration.pdf',
    uploadedBy:'Sana Iqbal', uploadedAt:'2026-04-30T10:00:00', milestone:'M1', status:'Verified',
    verifiedBy:'Rakesh Menon', verifiedAt:'2026-05-03T11:00:00', kpi:'—', size:'7.2 MB', supports:'Milestone M1 — Deployment' },
  { id:'EV-022-2', pilotId:'PL-022', type:'KPI dataset', name:'AQI Coverage & Correlation Dataset.xlsx',
    uploadedBy:'Sana Iqbal', uploadedAt:'2026-07-19T10:00:00', milestone:'M3', status:'Verified',
    verifiedBy:'Prof. Nandini Bose', verifiedAt:'2026-07-21T09:00:00', kpi:'Ward AQI coverage', size:'3.3 MB', supports:'Milestone M3 — Performance target' },
  { id:'EV-022-3', pilotId:'PL-022', type:'Validation documents', name:'Validation Certificate — CT-022.pdf',
    uploadedBy:'Prof. Nandini Bose', uploadedAt:'2026-08-06T10:00:00', milestone:'M4', status:'Verified',
    verifiedBy:'Rakesh Menon', verifiedAt:'2026-08-10T11:00:00', kpi:'—', size:'1.0 MB', supports:'Milestone M4 — Final validation' },
  { id:'EV-019-1', pilotId:'PL-019', type:'Deployment report', name:'PHC Teleconsult Deployment Plan.pdf',
    uploadedBy:'Sana Iqbal', uploadedAt:'2026-09-20T10:00:00', milestone:'M1', status:'Submitted',
    verifiedBy:null, verifiedAt:null, kpi:'—', size:'2.1 MB', supports:'Milestone M1 — Deployment' }
];

const PAYMENTS = [
  { id:'PM-014-1', pilotId:'PL-014', contractId:'CT-014', milestone:'M1', amount:300000, status:'PAID', approvedBy:'Rakesh Menon', approvedAt:'2026-08-02', paidAt:'2026-08-02', reason:'Deployment evidence verified.' },
  { id:'PM-014-2', pilotId:'PL-014', contractId:'CT-014', milestone:'M2', amount:500000, status:'PAID', approvedBy:'Rakesh Menon', approvedAt:'2026-09-01', paidAt:'2026-09-01', reason:'Operational pilot evidence verified.' },
  { id:'PM-014-3', pilotId:'PL-014', contractId:'CT-014', milestone:'M3', amount:600000, status:'AWAITING_VALIDATION', approvedBy:null, approvedAt:null, paidAt:null, reason:'Evidence under review; independent validation pending.' },
  { id:'PM-014-4', pilotId:'PL-014', contractId:'CT-014', milestone:'M4', amount:400000, status:'LOCKED', approvedBy:null, approvedAt:null, paidAt:null, reason:'Locked until M3 validation completes.' },
  { id:'PM-017-1', pilotId:'PL-017', contractId:'CT-017', milestone:'M1', amount:250000, status:'PAID', approvedBy:'Rakesh Menon', approvedAt:'2026-06-18', paidAt:'2026-06-18', reason:'Installation evidence verified.' },
  { id:'PM-017-2', pilotId:'PL-017', contractId:'CT-017', milestone:'M2', amount:300000, status:'PAID', approvedBy:'Rakesh Menon', approvedAt:'2026-07-17', paidAt:'2026-07-17', reason:'Operational pilot evidence verified.' },
  { id:'PM-017-3', pilotId:'PL-017', contractId:'CT-017', milestone:'M3', amount:250000, status:'PAID', approvedBy:'Rakesh Menon', approvedAt:'2026-08-18', paidAt:'2026-08-18', reason:'KPI evidence verified by validator.' },
  { id:'PM-017-4', pilotId:'PL-017', contractId:'CT-017', milestone:'M4', amount:150000, status:'AWAITING_PAYMENT', approvedBy:null, approvedAt:null, paidAt:null, reason:'Validation certificate uploaded; awaiting accounts approval.' },
  { id:'PM-021-1', pilotId:'PL-021', contractId:'CT-021', milestone:'M1', amount:200000, status:'PAID', approvedBy:'Rakesh Menon', approvedAt:'2026-07-08', paidAt:'2026-07-08', reason:'Installation evidence verified.' },
  { id:'PM-021-2', pilotId:'PL-021', contractId:'CT-021', milestone:'M2', amount:250000, status:'PAID', approvedBy:'Rakesh Menon', approvedAt:'2026-08-07', paidAt:'2026-08-07', reason:'Operational pilot evidence verified.' },
  { id:'PM-021-3', pilotId:'PL-021', contractId:'CT-021', milestone:'M3', amount:200000, status:'PAID', approvedBy:'Rakesh Menon', approvedAt:'2026-08-28', paidAt:'2026-08-28', reason:'KPI evidence verified.' },
  { id:'PM-021-4', pilotId:'PL-021', contractId:'CT-021', milestone:'M4', amount:130000, status:'AWAITING_VALIDATION', approvedBy:null, approvedAt:null, paidAt:null, reason:'Awaiting validation certificate.' },
  { id:'PM-022-1', pilotId:'PL-022', contractId:'CT-022', milestone:'M1', amount:600000, status:'PAID', approvedBy:'Rakesh Menon', approvedAt:'2026-05-04', paidAt:'2026-05-04', reason:'Installation & calibration verified.' },
  { id:'PM-022-2', pilotId:'PL-022', contractId:'CT-022', milestone:'M2', amount:700000, status:'PAID', approvedBy:'Rakesh Menon', approvedAt:'2026-06-18', paidAt:'2026-06-18', reason:'Dashboard & API evidence verified.' },
  { id:'PM-022-3', pilotId:'PL-022', contractId:'CT-022', milestone:'M3', amount:550000, status:'PAID', approvedBy:'Rakesh Menon', approvedAt:'2026-07-22', paidAt:'2026-07-22', reason:'KPI evidence verified.' },
  { id:'PM-022-4', pilotId:'PL-022', contractId:'CT-022', milestone:'M4', amount:350000, status:'PAID', approvedBy:'Rakesh Menon', approvedAt:'2026-08-12', paidAt:'2026-08-12', reason:'Validation certificate verified.' },
  { id:'PM-019-1', pilotId:'PL-019', contractId:'CT-019', milestone:'M1', amount:400000, status:'PENDING_EVIDENCE', approvedBy:null, approvedAt:null, paidAt:null, reason:'Awaiting deployment evidence.' }
];

const VALIDATIONS = [
  { id:'VL-017', pilotId:'PL-017', startupClaim:'Vaccine wastage reduced from 4.2% to 0.8%',
    claimedValue:'80.9% reduction', verifiedValue:'80.9% reduction', variance:'0.0%', status:'Validated',
    validator:'Prof. Nandini Bose', validatedAt:'2026-08-28', evidenceCount:3,
    comments:'Verified against logger telemetry and PHC inventory reconciliation. No variance found. Certificate issued.',
    kpis:[
      { name:'Excursion detection', baseline:'8 h', startupReported:'11 min', verified:'11 min', status:'Verified' },
      { name:'Vaccine wastage', baseline:'4.2%', startupReported:'0.8%', verified:'0.8%', status:'Verified' },
      { name:'PHC coverage', baseline:'40%', startupReported:'97%', verified:'97%', status:'Verified' }
    ]},
  { id:'VL-021', pilotId:'PL-021', startupClaim:'Streetlight fault detection time reduced from 3.2 days to 22 minutes',
    claimedValue:'99.5% reduction', verifiedValue:'—', variance:'—', status:'Under review',
    validator:'Prof. Nandini Bose', validatedAt:null, evidenceCount:3,
    comments:'Awaiting final inspection report before certificate issuance.',
    kpis:[
      { name:'Mean time to detect', baseline:'3.2 days', startupReported:'22 min', verified:'—', status:'Pending' },
      { name:'Auto-detection share', baseline:'18%', startupReported:'91%', verified:'—', status:'Pending' },
      { name:'Pole coverage', baseline:'30%', startupReported:'93%', verified:'—', status:'Pending' }
    ]},
  { id:'VL-022', pilotId:'PL-022', startupClaim:'Ward-level AQI coverage increased from 3% to 94%',
    claimedValue:'94%', verifiedValue:'94%', variance:'0.0%', status:'Validated',
    validator:'Prof. Nandini Bose', validatedAt:'2026-08-06', evidenceCount:3,
    comments:'Verified against node registry and API logs. Correlation with reference monitor independently reproduced at r=0.91.',
    kpis:[
      { name:'Ward AQI coverage', baseline:'3%', startupReported:'94%', verified:'94%', status:'Verified' },
      { name:'Correlation with reference', baseline:'—', startupReported:'0.91', verified:'0.91', status:'Verified' },
      { name:'Data uptime', baseline:'—', startupReported:'98.4%', verified:'98.4%', status:'Verified' }
    ]},
  { id:'VL-014', pilotId:'PL-014', startupClaim:'Water loss reduced by 40%',
    claimedValue:'40%', verifiedValue:'—', variance:'—', status:'Awaiting evidence',
    validator:'Prof. Nandini Bose', validatedAt:null, evidenceCount:2,
    comments:'KPI dataset under review. Field inspection report submitted. Awaiting final sensor log reconciliation.',
    kpis:[
      { name:'Water loss', baseline:'31.4%', startupReported:'18.7%', verified:'—', status:'Pending' },
      { name:'Response time', baseline:'48 h', startupReported:'13 h', verified:'—', status:'Pending' },
      { name:'Coverage', baseline:'55%', startupReported:'94%', verified:'—', status:'Pending' }
    ]}
];

const SCALEUP_DECISIONS = [
  { id:'SD-022', pilotId:'PL-022', challengeId:'CH-022', status:'Pending',
    officer:null, decidedAt:null, decision:null, reason:null, evidenceRef:null,
    matrix:{ performance:'High', risk:'Medium', cost:'Medium', evidence:'High', scalability:'High' },
    recommendation:'Evidence supports multi-district scale-up. Cost per node is within benchmark. Recommend department procurement + 3-district expansion.',
    recommendationType:'SUPPORT' }
];

const TEMPLATES = [
  { id:'TP-01', name:'Problem Statement Template', version:'v2.1', updated:'2026-08-12', owner:'Innovation Cell', status:'Active', category:'Challenge' },
  { id:'TP-02', name:'Evaluation Rubric (Weighted)', version:'v3.0', updated:'2026-09-01', owner:'Innovation Cell', status:'Active', category:'Evaluation' },
  { id:'TP-03', name:'Pilot Agreement Template', version:'v1.8', updated:'2026-07-20', owner:'Legal Cell', status:'Active', category:'Contract' },
  { id:'TP-04', name:'Data Sharing Clause', version:'v2.0', updated:'2026-06-15', owner:'Legal Cell', status:'Active', category:'Contract' },
  { id:'TP-05', name:'IP Clause (Startup Retains IP)', version:'v2.2', updated:'2026-08-05', owner:'Legal Cell', status:'Active', category:'Contract' },
  { id:'TP-06', name:'Cybersecurity Checklist', version:'v1.4', updated:'2026-05-30', owner:'CISO Office', status:'Active', category:'Compliance' },
  { id:'TP-07', name:'Risk Assessment Framework', version:'v1.6', updated:'2026-07-10', owner:'Innovation Cell', status:'Active', category:'Compliance' },
  { id:'TP-08', name:'Validation Report Template', version:'v2.0', updated:'2026-09-10', owner:'Test Lab', status:'Active', category:'Validation' },
  { id:'TP-09', name:'Payment Milestone Template', version:'v1.5', updated:'2026-06-25', owner:'Finance Dept', status:'Active', category:'Payment' },
  { id:'TP-10', name:'Scale-up Decision Template', version:'v1.2', updated:'2026-08-28', owner:'Innovation Cell', status:'Active', category:'Scale-up' }
];

const AUDIT_SEED = [
  { id:'AU-001', ts:'2026-09-20T09:12:00', user:'Meera Kulkarni', role:'Government Officer', action:'Challenge published', entity:'CH-018', details:'Challenge CH-018 published to discovery stage.' },
  { id:'AU-002', ts:'2026-09-20T10:30:00', user:'Farah Sheikh', role:'Innovation Cell Admin', action:'Rubric configured', entity:'TP-02', details:'Evaluation rubric weights updated to v3.0.' },
  { id:'AU-003', ts:'2026-09-21T11:45:00', user:'Dr. Arvind Rao', role:'External Evaluator', action:'Evaluation submitted', entity:'EV-018-1', details:'Scored application AP-018-1 for CH-018. Weighted 88.4.' },
  { id:'AU-004', ts:'2026-09-22T08:05:00', user:'Sana Iqbal', role:'Startup', action:'Evidence uploaded', entity:'EV-014-4', details:'Field photos uploaded for milestone M3 of PL-014.' },
  { id:'AU-005', ts:'2026-09-22T08:20:00', user:'Prof. Nandini Bose', role:'Principal Validator', action:'Evidence under review', entity:'EV-014-3', details:'KPI dataset for PL-014 M3 moved to under review.' }
];

const NOTIFICATIONS_SEED = [
  { id:'NT-01', ts:'2026-09-22T08:20:00', title:'CH-018 requires evaluation', body:'Application AP-018-2 has one pending evaluation.', type:'warning', read:false, link:'#/evaluations', role:'gov' },
  { id:'NT-02', ts:'2026-09-22T08:15:00', title:'Milestone M3 evidence submitted', body:'Aquavirt Systems uploaded KPI dataset for PL-014.', type:'info', read:false, link:'#/evidence', role:'validator' },
  { id:'NT-03', ts:'2026-09-22T07:50:00', title:'Payment awaiting approval', body:'Milestone M4 payment of ₹1,50,000 for CT-017 is awaiting approval.', type:'warning', read:false, link:'#/payments', role:'accounts' },
  { id:'NT-04', ts:'2026-09-21T18:30:00', title:'Validation deadline in 2 days', body:'PL-021 final validation is due on 24 Sep 2026.', type:'warning', read:false, link:'#/validation', role:'validator' },
  { id:'NT-05', ts:'2026-09-21T16:00:00', title:'Pilot KPI below target', body:'PL-019 specialist access rate is at 14% vs target 80%.', type:'error', read:false, link:'#/monitoring', role:'gov' },
  { id:'NT-06', ts:'2026-09-21T14:20:00', title:'New challenge published', body:'CH-026 Waste Collection Route Intelligence is open for discovery.', type:'info', read:true, link:'#/challenges', role:'startup' },
  { id:'NT-07', ts:'2026-09-21T11:00:00', title:'Contract signed', body:'CT-019 Teleconsultation for Rural PHCs signed with TeleCare Bharat.', type:'success', read:true, link:'#/contracts', role:'gov' },
  { id:'NT-08', ts:'2026-09-20T17:45:00', title:'Evaluation submitted', body:'Dr. Kavita Menon submitted evaluation for AP-018-1.', type:'info', read:true, link:'#/evaluations', role:'gov' },
  { id:'NT-09', ts:'2026-09-20T12:00:00', title:'Application shortlisted', body:'Your application for CH-018 has been shortlisted.', type:'success', read:false, link:'#/challenges/CH-018', role:'startup' },
  { id:'NT-10', ts:'2026-09-19T15:30:00', title:'Risk flagged', body:'PL-014 budget variance at 12% — review recommended.', type:'warning', read:true, link:'#/monitoring', role:'gov' }
];

/* ============================================================
   3. STORE (localStorage persistence)
   ============================================================ */
const STORAGE_KEY = 'pilotbridge.v2';

const buildSeed = () => ({
  departments: JSON.parse(JSON.stringify(DEPARTMENTS)),
  challenges: JSON.parse(JSON.stringify(CHALLENGES)),
  startups: JSON.parse(JSON.stringify(STARTUPS)),
  applications: JSON.parse(JSON.stringify(APPLICATIONS)),
  evaluations: JSON.parse(JSON.stringify(EVALUATIONS)),
  pilots: JSON.parse(JSON.stringify(PILOTS)),
  contracts: JSON.parse(JSON.stringify(CONTRACTS)),
  evidence: JSON.parse(JSON.stringify(EVIDENCE)),
  payments: JSON.parse(JSON.stringify(PAYMENTS)),
  validations: JSON.parse(JSON.stringify(VALIDATIONS)),
  scaleup: JSON.parse(JSON.stringify(SCALEUP_DECISIONS)),
  templates: JSON.parse(JSON.stringify(TEMPLATES)),
  notifications: JSON.parse(JSON.stringify(NOTIFICATIONS_SEED)),
  audit: JSON.parse(JSON.stringify(AUDIT_SEED)),
  rubric: JSON.parse(JSON.stringify(RUBRIC))
});

const Store = {
  state: null,
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) { this.state = JSON.parse(raw); return; }
    } catch(e) { }
    this.state = buildSeed();
    this.save();
  },
  save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state)); } catch(e) {}
  },
  reset() {
    this.state = buildSeed();
    this.save();
  },
  get(coll) { return this.state[coll] || []; },
  find(coll, id) { return (this.state[coll] || []).find(x => x.id === id); },
  update(coll, id, patch) {
    const item = this.find(coll, id);
    if (!item) return null;
    Object.assign(item, patch);
    this.save();
    return item;
  },
  add(coll, item) {
    if (!item.id) item.id = uid(coll.slice(0,2).toUpperCase());
    this.state[coll] = this.state[coll] || [];
    this.state[coll].push(item);
    this.save();
    return item;
  },
  remove(coll, id) {
    this.state[coll] = (this.state[coll] || []).filter(x => x.id !== id);
    this.save();
  }
};

const Session = {
  role: null, personaId: null, lang: 'EN', theme: 'light', sidebarCollapsed: false,
  load() {
    this.role = localStorage.getItem('pb.role') || null;
    this.personaId = localStorage.getItem('pb.persona') || null;
    this.lang = localStorage.getItem('pb.lang') || 'EN';
    this.theme = localStorage.getItem('pb.theme') || 'light';
    this.sidebarCollapsed = localStorage.getItem('pb.sbCol') === '1';
  },
  save() {
    localStorage.setItem('pb.role', this.role || '');
    localStorage.setItem('pb.persona', this.personaId || '');
    localStorage.setItem('pb.lang', this.lang);
    localStorage.setItem('pb.theme', this.theme);
    localStorage.setItem('pb.sbCol', this.sidebarCollapsed ? '1' : '0');
  },
  persona() { return PERSONAS.find(p => p.id === this.personaId) || null; }
};

/* ============================================================
   4. PERMISSIONS
   ============================================================ */
const PERMS = {
  gov:       ['dashboard','pathway','challenges','startups','evaluations','pilots','contracts','monitoring','payments','validation','evidence','analytics','publicvalue','audit'],
  evaluator: ['dashboard','evaluations','challenges','evidence'],
  startup:   ['dashboard','challenges','pilots','payments','evidence'],
  validator: ['dashboard','validation','evidence','pilots','monitoring'],
  accounts:  ['dashboard','contracts','payments','evidence','pilots'],
  admin:     ['dashboard','pathway','challenges','startups','evaluations','pilots','contracts','monitoring','payments','validation','evidence','analytics','publicvalue','templates','audit','settings']
};
const can = (role, key) => (PERMS[role] || []).includes(key);

/* ============================================================
   5. UI PRIMITIVES
   ============================================================ */
const Toast = {
  show(type, title, body) {
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    const ic = type === 'success' ? 'checkCircle' : type === 'error' ? 'alert' : type === 'warning' ? 'alertTriangle' : 'info';
    el.innerHTML = `${icon(ic)}<div class="toast-body"><b>${esc(title)}</b>${body ? `<p>${esc(body)}</p>` : ''}</div>`;
    $('#toasts').appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(20px)'; el.style.transition = 'all .25s'; }, 3600);
    setTimeout(() => el.remove(), 3900);
  }
};

const Overlay = {
  open() { $('#overlay').classList.add('open'); },
  close() { $('#overlay').classList.remove('open'); }
};

const Drawer = {
  open(title, html, footer = '') {
    const d = $('#drawer');
    d.innerHTML = `
      <div class="drawer-head">
        <div style="min-width:0"><h2 class="h2" style="margin-bottom:2px">${title}</h2></div>
        <button class="icon-btn" data-close-drawer aria-label="Close">${icon('x')}</button>
      </div>
      <div class="drawer-body">${html}</div>
      ${footer ? `<div class="drawer-foot">${footer}</div>` : ''}
    `;
    d.classList.add('open'); Overlay.open();
  },
  close() { $('#drawer').classList.remove('open'); Overlay.close(); }
};

const Modal = {
  open(title, html, footer = '') {
    const m = $('#modal');
    m.innerHTML = `
      <div class="drawer-head">
        <div style="min-width:0"><h2 class="h2">${title}</h2></div>
        <button class="icon-btn" data-close-modal aria-label="Close">${icon('x')}</button>
      </div>
      <div class="drawer-body">${html}</div>
      ${footer ? `<div class="drawer-foot">${footer}</div>` : ''}
    `;
    m.classList.add('open'); Overlay.open();
  },
  close() { $('#modal').classList.remove('open'); Overlay.close(); }
};

/* ============================================================
   6. WORKFLOW ENGINE
   ============================================================ */
const Workflow = {
  nextStage(stage) {
    const idx = STAGES.findIndex(s => s.key === stage);
    return idx >= 0 && idx < STAGES.length - 1 ? STAGES[idx + 1].key : null;
  },
  guard(challenge) {
    const eligible = Store.get('applications').filter(a => a.challengeId === challenge.id && ['Shortlisted','Pilot','Evaluation'].includes(a.status));
    switch (challenge.stage) {
      case 'CHALLENGE':
        return challenge.problem && challenge.outcome
          ? {ok:true, reason:'Challenge is complete and can be published to discovery.'}
          : {ok:false, reason:'Problem statement and desired outcome are required before publishing.'};
      case 'DISCOVERY':
        return {ok:true, reason:'Discovery is open. Move to screening when applications are received.'};
      case 'SCREENING':
        return eligible.length > 0
          ? {ok:true, reason:'Eligible startups found. Move to evaluation.'}
          : {ok:false, reason:'No eligible startup yet. Screening must pass at least one applicant.'};
      case 'EVALUATION':
        return Store.get('evaluations').some(e => e.status === 'Submitted')
          ? {ok:true, reason:'Evaluations submitted. Move to pilot design.'}
          : {ok:false, reason:'No submitted evaluation. Evaluation must complete first.'};
      case 'PILOT_DESIGN':
        return Store.get('applications').some(a => a.challengeId === challenge.id && a.status === 'Pilot')
          ? {ok:true, reason:'Pilot startup selected. Move to contract.'}
          : {ok:false, reason:'No approved startup selected for pilot.'};
      case 'CONTRACT':
        return Store.get('contracts').some(c => c.challengeId === challenge.id && ['Active','Completed'].includes(c.status))
          ? {ok:true, reason:'Contract approved. Move to monitoring.'}
          : {ok:false, reason:'Contract not approved. Approval required before monitoring.'};
      case 'MONITORING':
        return {ok:true, reason:'Pilot running. Move to payment when a milestone is ready.'};
      case 'PAYMENT':
        return {ok:true, reason:'Payments in progress. Move to validation when milestones are complete.'};
      case 'VALIDATION':
        return Store.get('validations').some(v => v.status === 'Validated' && Store.get('pilots').some(p => p.id === v.pilotId && p.challengeId === challenge.id))
          ? {ok:true, reason:'Validation complete. Move to scale-up decision.'}
          : {ok:false, reason:'Validation incomplete. Independent validation must be issued first.'};
      case 'SCALE_UP':
        return {ok:false, reason:'Already at final stage.'};
      default:
        return {ok:false, reason:'Unknown stage.'};
    }
  }
};

/* ============================================================
   7. SCORING
   ============================================================ */
const Scoring = {
  weighted(scores, rubric) {
    let total = 0, wsum = 0;
    rubric.forEach(r => {
      const s = scores[r.key];
      if (typeof s === 'number') { total += s * r.weight; wsum += r.weight; }
    });
    return wsum ? +(total / wsum).toFixed(1) : 0;
  },
  consensus(applicationId) {
    const evs = Store.get('evaluations').filter(e => e.applicationId === applicationId && e.status === 'Submitted');
    if (!evs.length) return null;
    const rubric = Store.get('rubric');
    const scores = evs.map(e => this.weighted(e.scores, rubric));
    return +(scores.reduce((a,b)=>a+b,0) / scores.length).toFixed(1);
  },
  breakdown(applicationId) {
    const evs = Store.get('evaluations').filter(e => e.applicationId === applicationId && e.status === 'Submitted');
    if (!evs.length) return null;
    const rubric = Store.get('rubric');
    const out = {};
    rubric.forEach(r => {
      const vals = evs.map(e => e.scores[r.key]).filter(v => typeof v === 'number');
      out[r.key] = vals.length ? +(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : 0;
    });
    return out;
  },
  matchScore(startup, challenge) {
    const techFit = startup.techFit || 80;
    const industryMatch = startup.industry && challenge.dept ? 78 + (startup.industry.length % 5) * 3 : 75;
    const readiness = startup.readiness || 80;
    const experience = clamp(60 + (startup.deployments || 0) * 7, 0, 100);
    const costFit = clamp(100 - Math.abs((startup.cost || 1000000) - (challenge.budget || 1000000)) / (challenge.budget || 1000000) * 100, 40, 100);
    const compliance = (startup.certs || []).includes('ISO 27001') ? 92 : 74;
    const overall = Math.round(techFit*.25 + industryMatch*.2 + readiness*.2 + experience*.15 + costFit*.1 + compliance*.1);
    return {
      overall,
      parts: [
        { label:'Technical fit', value: Math.round(techFit), color:'var(--primary)' },
        { label:'Problem fit', value: Math.round(industryMatch), color:'var(--info)' },
        { label:'Deployment readiness', value: Math.round(readiness), color:'var(--success)' },
        { label:'Experience', value: Math.round(experience), color:'var(--purple)' },
        { label:'Cost fit', value: Math.round(costFit), color:'var(--warning)' },
        { label:'Compliance readiness', value: Math.round(compliance), color:'#0F766E' }
      ]
    };
  }
};

/* ============================================================
   8. CHART HELPERS
   ============================================================ */
const Chart = {
  bars(data, {height=180, color='var(--primary)', labelKey='label', valueKey='value'} = {}) {
    const max = Math.max(...data.map(d => d[valueKey]), 1);
    const w = 100 / data.length;
    return `<svg class="chart" viewBox="0 0 100 ${height}" preserveAspectRatio="none" style="height:${height}px">
      ${[0,1,2,3].map(i => `<line class="grid-line" x1="0" y1="${(height/4)*i}" x2="100" y2="${(height/4)*i}" vector-effect="non-scaling-stroke"/>`).join('')}
      ${data.map((d,i) => {
        const h = (d[valueKey]/max) * (height - 24);
        return `<rect class="bar" x="${i*w + w*0.18}" y="${height - 20 - h}" width="${w*0.64}" height="${h}" rx="1.5" fill="${d.color || color}" vector-effect="non-scaling-stroke"><title>${esc(d[labelKey])}: ${d[valueKey]}</title></rect>`;
      }).join('')}
      ${data.map((d,i) => `<text class="axis-text" x="${i*w + w/2}" y="${height - 6}" text-anchor="middle" style="font-size:8px">${esc(String(d[labelKey]).slice(0,8))}</text>`).join('')}
    </svg>`;
  },
  hbars(data, {color='var(--primary)'} = {}) {
    const max = Math.max(...data.map(d => d.value), 1);
    return data.map(d => `
      <div class="score-bar">
        <div class="sb-label" style="width:170px">${esc(d.label)}</div>
        <div class="sb-track"><span style="width:${(d.value/max)*100}%;background:${d.color||color}"></span></div>
        <div class="sb-val">${d.value}</div>
      </div>`).join('');
  },
  line(series, {height=200, labels=[], yMax=null} = {}) {
    const allVals = series.flatMap(s => s.data);
    const max = yMax != null ? yMax : Math.max(...allVals, 1);
    const min = 0;
    const pad = 8;
    const W = 100, H = height;
    const stepX = (W - pad*2) / Math.max(labels.length - 1, 1);
    const y = v => H - 24 - ((v - min) / (max - min)) * (H - 40);
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="height:${height}px">
      ${[0,1,2,3].map(i => `<line class="grid-line" x1="0" y1="${10 + i*((H-30)/3)}" x2="${W}" y2="${10 + i*((H-30)/3)}" vector-effect="non-scaling-stroke"/>`).join('')}
      ${series.map(s => {
        const pts = s.data.map((v,i) => `${pad + i*stepX},${y(v)}`).join(' ');
        const area = `${pad},${H-24} ${pts} ${pad + (s.data.length-1)*stepX},${H-24}`;
        return `<polygon class="area" points="${area}" fill="${s.color}"/>
                <polyline class="line" points="${pts}" stroke="${s.color}" vector-effect="non-scaling-stroke"/>
                ${s.data.map((v,i) => `<circle class="dot" cx="${pad + i*stepX}" cy="${y(v)}" r="2.4" fill="${s.color}" vector-effect="non-scaling-stroke"><title>${esc(s.name)} ${esc(labels[i]||'')}: ${v}</title></circle>`).join('')}`;
      }).join('')}
      ${labels.map((l,i) => `<text class="axis-text" x="${pad + i*stepX}" y="${H-6}" text-anchor="middle" style="font-size:7px">${esc(l)}</text>`).join('')}
    </svg>`;
  },
  donut(segments, {size=160, thickness=18} = {}) {
    const total = segments.reduce((a,s)=>a+s.value,0) || 1;
    const r = (size - thickness) / 2;
    const c = size / 2;
    let acc = 0;
    const arcs = segments.map(s => {
      const start = acc / total * Math.PI * 2 - Math.PI/2;
      acc += s.value;
      const end = acc / total * Math.PI * 2 - Math.PI/2;
      const large = (end - start) > Math.PI ? 1 : 0;
      const x1 = c + r*Math.cos(start), y1 = c + r*Math.sin(start);
      const x2 = c + r*Math.cos(end), y2 = c + r*Math.sin(end);
      return `<path d="M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}" fill="none" stroke="${s.color}" stroke-width="${thickness}" stroke-linecap="butt"><title>${esc(s.label)}: ${s.value}</title></path>`;
    }).join('');
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${arcs}</svg>`;
  }
};

/* ============================================================
   9. SHARED COMPONENTS
   ============================================================ */
const STATUS_MAP = {
  Verified:'success', Approved:'success', PAID:'success', Paid:'success', Completed:'success', Validated:'success',
  ACHIEVED:'success', Achieved:'success', Active:'success', 'On track':'success', 'Eligible':'success', Cleared:'success',
  Pending:'warning', 'Needs action':'warning', 'Under review':'warning', NEAR:'warning', 'Near target':'warning',
  'Awaiting validation':'warning', AWAITING_VALIDATION:'warning', AWAITING_PAYMENT:'warning', PENDING_EVIDENCE:'warning',
  'Conditionally eligible':'warning', 'Awaiting evidence':'warning', 'In progress':'warning', IN_PROGRESS:'warning',
  'Decision pending':'warning', 'Discovering':'info', BELOW:'danger',
  Rejected:'danger', Blocked:'danger', Overdue:'danger', Failed:'danger', 'Not eligible':'danger',
  Draft:'neutral', Scheduled:'info', LOCKED:'neutral', Submitted:'info', Screening:'info', Shortlisted:'purple',
  Evaluation:'purple', Pilot:'purple', Contract:'info', Monitoring:'info', Payment:'info', Validation:'info', 'Scale-up':'info',
  SCALE_UP:'info', CHALLENGE:'neutral', DISCOVERY:'info', SCREENING:'info', EVALUATION:'purple',
  PILOT_DESIGN:'purple', CONTRACT:'info', MONITORING:'info', PAYMENT:'info', VALIDATION:'info',
  'Not started':'neutral', 'Validated with variance':'warning'
};
const badge = (status) => {
  const tone = STATUS_MAP[status] || 'neutral';
  return `<span class="badge badge-${tone}">${esc(status)}</span>`;
};

const PriorityBadge = (p) => {
  const tone = p === 'High' ? 'danger' : p === 'Medium' ? 'warning' : 'success';
  return `<span class="badge badge-${tone}">${esc(p)}</span>`;
};

const EmptyState = (iconName, title, body) =>
  `<div class="empty">${icon(iconName)}<b>${esc(title)}</b><p>${esc(body)}</p></div>`;

const KpiCard = ({label, value, sub, accent='blue', iconName=null, onClick=null}) => `
  <div class="kpi ${onClick ? 'clickable' : ''}" ${onClick ? `data-nav="${onClick}"` : ''}>
    <span class="kpi-accent ${accent}"></span>
    <div class="kpi-label">${iconName ? icon(iconName) : ''}${esc(label)}</div>
    <div class="kpi-value">${esc(String(value))}</div>
    ${sub ? `<div class="kpi-sub">${sub}</div>` : ''}
  </div>`;

const PipelineStage = (stage, count, active, onClick) => `
  <div class="pipe-stage ${active ? 'active' : ''}" ${onClick ? `data-stage="${stage.key}"` : ''}>
    <div class="pipe-num"><span>STAGE ${stage.num}</span>${count > 0 ? `<span style="color:var(--text-3)">${count}</span>` : ''}</div>
    <div class="pipe-name">${esc(stage.name)}</div>
    <div class="pipe-count">${count}</div>
    <div class="pipe-bar"><span style="width:${count ? Math.min(100, count * 12 + 8) : 0}%"></span></div>
  </div>`;

const Pipeline = (challenges, activeStage, {interactive=true} = {}) => {
  const counts = {};
  STAGES.forEach(s => counts[s.key] = 0);
  challenges.forEach(c => { if (counts[c.stage] != null) counts[c.stage]++; });
  return `<div class="pipeline-wrap"><div class="pipeline">
    ${STAGES.map(s => PipelineStage(s, counts[s.key], activeStage === s.key, interactive ? true : null)).join('')}
  </div></div>`;
};

const ChallengeCard = (c) => `
  <div class="board-card pri-${c.priority}" data-challenge="${c.id}">
    <div class="bc-id">${esc(c.id)}</div>
    <div class="bc-title">${esc(c.title)}</div>
    <div class="bc-meta">
      <span>${icon('mapPin')}${esc(c.district)}</span>
      <span>${icon('building')}${esc(c.dept)}</span>
    </div>
    <div class="bc-foot">
      <span class="xsmall muted">Day ${c.day}</span>
      ${c.status === 'Needs action' ? `<span class="badge badge-danger">Needs action</span>` : `<span class="badge badge-neutral">${esc(c.status)}</span>`}
    </div>
  </div>`;

const EvidenceCard = (e) => `
  <div class="board-card" data-evidence="${e.id}" style="cursor:pointer">
    <div class="bc-id">${esc(e.id)}</div>
    <div class="bc-title" style="display:flex;align-items:center;gap:6px">${icon('file')}${esc(e.name)}</div>
    <div class="bc-meta">
      <span>${icon('folder')}${esc(e.type)}</span>
      <span>${icon('clock')}${timeAgo(e.uploadedAt)}</span>
    </div>
    <div class="bc-foot">
      <span class="xsmall muted">${esc(e.uploadedBy)}</span>
      ${badge(e.status)}
    </div>
  </div>`;

const MilestoneCard = (m, contractValue) => {
  const pct = contractValue ? Math.round(m.amount / contractValue * 100) : 0;
  const statusTone = STATUS_MAP[m.status] || 'neutral';
  return `
    <div class="card card-pad" style="margin-bottom:10px">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:10px;min-width:0">
          <div style="width:32px;height:32px;border-radius:8px;background:var(--primary-50);color:var(--primary);display:grid;place-items:center;font-weight:700;font-size:12px;flex-shrink:0">${esc(m.id)}</div>
          <div style="min-width:0">
            <div class="h3">${esc(m.name)}</div>
            <div class="small muted">Due ${esc(fmtDate(m.due))} · ${pct}% of contract</div>
          </div>
        </div>
        ${badge(m.status)}
      </div>
      <div class="progress" style="margin-bottom:10px"><span style="width:${pct}%;background:var(--${statusTone === 'success' ? 'success' : statusTone === 'warning' ? 'warning' : 'primary'})"></span></div>
      <div class="grid g-2" style="gap:10px">
        <div><div class="xsmall muted">Amount</div><div class="h4">${fmtINR(m.amount)}</div></div>
        <div><div class="xsmall muted">Evidence required</div><div class="h4">${m.evidenceRequired ? 'Yes' : 'No'}</div></div>
      </div>
      <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border)">
        <div class="xsmall muted" style="margin-bottom:2px">Deliverables</div>
        <div class="small">${esc(m.deliverables)}</div>
      </div>
      <div style="margin-top:8px">
        <div class="xsmall muted" style="margin-bottom:2px">Evidence</div>
        <div class="small">${esc(m.evidence)}</div>
      </div>
      ${m.paidAt ? `<div class="small muted" style="margin-top:8px">Paid on ${esc(fmtDate(m.paidAt))}</div>` : ''}
    </div>`;
};

const KpiChartCard = (kpi) => {
  const tone = kpi.status === 'ACHIEVED' ? 'success' : kpi.status === 'NEAR' ? 'warning' : kpi.status === 'BELOW' ? 'danger' : 'neutral';
  const pct = (() => {
    const b = parseFloat(kpi.baseline) || 0, c = kpi.current === '—' ? b : parseFloat(kpi.current), t = parseFloat(kpi.target) || 1;
    if (kpi.dir === 'up') return clamp(((c - b) / Math.max(t - b, 1)) * 100, 0, 120);
    return clamp(((b - c) / Math.max(b - t, 1)) * 100, 0, 120);
  })();
  return `
    <div class="card card-pad">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:12px">
        <div class="h3">${esc(kpi.name)}</div>
        ${badge(kpi.status === 'ACHIEVED' ? 'Achieved' : kpi.status === 'NEAR' ? 'Near target' : kpi.status === 'BELOW' ? 'Below target' : 'In progress')}
      </div>
      <div class="grid g-3" style="gap:10px;margin-bottom:12px">
        <div><div class="xsmall muted">Baseline</div><div class="h3">${esc(String(kpi.baseline))}${esc(kpi.unit||'')}</div></div>
        <div><div class="xsmall muted">Current</div><div class="h3" style="color:var(--${tone === 'neutral' ? 'navy' : tone})">${esc(String(kpi.current))}${esc(kpi.unit||'')}</div></div>
        <div><div class="xsmall muted">Target</div><div class="h3">${esc(String(kpi.target))}${esc(kpi.unit||'')}</div></div>
      </div>
      <div class="progress ${tone === 'success' ? 'green' : tone === 'warning' ? 'amber' : ''}"><span style="width:${Math.min(pct,100)}%;background:var(--${tone === 'neutral' ? 'primary' : tone})"></span></div>
      <div class="xsmall muted" style="margin-top:6px">${Math.round(pct)}% of target progress</div>
    </div>`;
};

/* ---------- Decision Chain ---------- */
function DecisionChain(c, ctx) {
  const { applications = [], pilot, validation } = ctx;
  const submittedEvals = Store.get('evaluations').filter(e =>
    e.status === 'Submitted' && applications.some(a => a.id === e.applicationId)
  );
  const pilotEvidence = pilot ? Store.get('evidence').filter(e => e.pilotId === pilot.id) : [];
  const paidAmount = pilot
    ? Store.get('payments').filter(p => p.pilotId === pilot.id && p.status === 'PAID').reduce((a,p)=>a+p.amount,0)
    : 0;
  const scaleup = Store.get('scaleup').find(s => s.challengeId === c.id);

  const chain = [
    { key:'problem',   label:'Problem',               icon:'alert',
      status: c.problem && c.baseline ? 'done' : 'pending',
      detail: c.baseline ? 'Baseline established' : 'Not defined' },
    { key:'publish',   label:'Challenge published',   icon:'challenge',
      status: c.stage !== 'CHALLENGE' ? 'done' : 'pending',
      detail: c.stage !== 'CHALLENGE' ? 'Live for discovery' : 'Draft' },
    { key:'discovery', label:'Startup discovered',    icon:'startup',
      status: applications.length > 0 ? 'done' : 'pending',
      detail: applications.length + ' applicant' + (applications.length === 1 ? '' : 's') },
    { key:'screening', label:'Eligibility screened',  icon:'checkCircle',
      status: applications.some(a => ['Shortlisted','Pilot','Evaluation'].includes(a.status)) ? 'done' : 'pending',
      detail: applications.filter(a => ['Shortlisted','Pilot','Evaluation'].includes(a.status)).length + ' eligible' },
    { key:'eval',      label:'Expert evaluation',     icon:'evaluation',
      status: submittedEvals.length > 0 ? 'done' : 'pending',
      detail: submittedEvals.length + ' submitted' },
    { key:'pilot',     label:'Pilot approved',        icon:'pilot',
      status: pilot ? 'done' : 'pending',
      detail: pilot ? pilot.id : 'Not yet' },
    { key:'evidence',  label:'Evidence collected',    icon:'evidence',
      status: pilotEvidence.length > 0 ? 'done' : 'pending',
      detail: pilotEvidence.length + ' item' + (pilotEvidence.length === 1 ? '' : 's') },
    { key:'validate',  label:'Independent validation',icon:'validation',
      status: validation?.status === 'Validated' ? 'done'
            : validation ? 'warn' : 'pending',
      detail: validation?.status || 'Not started' },
    { key:'payment',   label:'Milestone payment',     icon:'payment',
      status: paidAmount > 0 ? 'done' : (pilot ? 'warn' : 'pending'),
      detail: paidAmount > 0 ? fmtINR(paidAmount) + ' released' : 'Pending' },
    { key:'scaleup',   label:'Scale-up decision',     icon:'scaleup',
      status: scaleup?.status === 'Decided' ? 'done'
            : scaleup ? 'warn' : 'pending',
      detail: scaleup?.decision || 'Awaiting validation' }
  ];

  const dotColor = s => s === 'done' ? 'var(--success)'
                    : s === 'warn' ? 'var(--warning)'
                    : 'var(--border-2)';
  const textColor = s => s === 'done' ? 'var(--success)'
                    : s === 'warn' ? 'var(--warning)'
                    : 'var(--text-3)';

  return `
    <div class="card" style="overflow:hidden">
      <div class="card-head" style="border-bottom:none;padding-bottom:6px">
        <div>
          <h3>Decision Chain</h3>
          <p>Every stage is traceable from problem to scale-up</p>
        </div>
        <span class="badge badge-neutral">${chain.filter(x=>x.status==='done').length}/${chain.length} complete</span>
      </div>
      <div style="padding:0 16px 16px">
        <div class="chain-wrap">
          ${chain.map((step, i) => `
            <div class="chain-step">
              <div class="chain-dot" style="background:${dotColor(step.status)};color:#fff">
                ${step.status === 'done' ? icon('check') : step.status === 'warn' ? icon('alertTriangle') : `<span style="font-size:9px;font-weight:700;color:var(--text-4)">${i+1}</span>`}
              </div>
              <div class="chain-body">
                <div class="chain-label" style="color:${textColor(step.status)}">${esc(step.label)}</div>
                <div class="chain-detail">${esc(step.detail)}</div>
              </div>
              ${i < chain.length - 1 ? `<div class="chain-connector" style="background:${step.status==='done'?'var(--success-100)':'var(--border)'}"></div>` : ''}
            </div>`).join('')}
        </div>
      </div>
    </div>`;
}

/* ---------- Evidence → Decision Flow ---------- */
function EvidenceFlow(pilot, validation) {
  if (!pilot) return '';
  const evidence = Store.get('evidence').filter(e => e.pilotId === pilot.id);
  if (!evidence.length && !validation) return '';

  const verified = evidence.filter(e => e.status === 'Verified');
  const paid = Store.get('payments').filter(p => p.pilotId === pilot.id && p.status === 'PAID');
  const locked = Store.get('payments').filter(p => p.pilotId === pilot.id && p.status !== 'PAID');

  return `
    <div class="card">
      <div class="card-head">
        <div>
          <h3>Evidence → Validation → Payment</h3>
          <p>How collected evidence flows into financial and procurement decisions</p>
        </div>
      </div>
      <div class="card-pad">
        <div class="grid g-4" style="gap:14px;align-items:start">
          <div>
            <div class="xsmall" style="font-weight:700;color:var(--text-4);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Evidence</div>
            ${evidence.slice(0,4).map(e => `
              <div class="flow-item">
                <span style="color:${e.status==='Verified'?'var(--success)':e.status==='Rejected'?'var(--danger)':'var(--warning)'}">
                  ${icon(e.status==='Verified'?'checkCircle':e.status==='Rejected'?'x':'clock')}
                </span>
                <div style="min-width:0">
                  <div class="flow-title">${esc(e.type)}</div>
                  <div class="flow-meta">${esc(e.milestone)} · ${esc(e.status)}</div>
                </div>
              </div>`).join('')}
            ${evidence.length > 4 ? `<div class="xsmall muted" style="margin-top:6px">+${evidence.length - 4} more</div>` : ''}
          </div>

          <div>
            <div class="xsmall" style="font-weight:700;color:var(--text-4);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Validator</div>
            ${validation ? `
              <div class="flow-box" style="background:${validation.status==='Validated'?'var(--success-50)':'var(--warning-50)'};border-color:${validation.status==='Validated'?'var(--success-100)':'var(--warning-100)'}">
                <div style="color:${validation.status==='Validated'?'var(--success)':'var(--warning)'};margin-bottom:4px">${icon(validation.status==='Validated'?'award':'clock')}</div>
                <div style="font-weight:700;font-size:12.5px;color:var(--navy)">${esc(validation.status)}</div>
                <div class="xsmall muted" style="margin-top:2px">${esc(validation.validator)}</div>
                ${validation.validatedAt ? `<div class="xsmall muted">${esc(fmtDate(validation.validatedAt))}</div>` : ''}
              </div>` : `
              <div class="flow-box" style="background:var(--surface-2);border-color:var(--border)">
                <div style="color:var(--text-3);margin-bottom:4px">${icon('clock')}</div>
                <div style="font-weight:700;font-size:12.5px;color:var(--text-3)">Not started</div>
              </div>`}
            <div class="xsmall muted" style="margin-top:6px">${verified.length}/${evidence.length} verified</div>
          </div>

          <div>
            <div class="xsmall" style="font-weight:700;color:var(--text-4);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Payment</div>
            ${paid.map(p => `
              <div class="flow-item">
                <span style="color:var(--success)">${icon('checkCircle')}</span>
                <div style="min-width:0">
                  <div class="flow-title">${esc(p.milestone)}</div>
                  <div class="flow-meta">${fmtINR(p.amount)} released</div>
                </div>
              </div>`).join('')}
            ${locked.slice(0,2).map(p => `
              <div class="flow-item">
                <span style="color:var(--text-4)">${icon('lock')}</span>
                <div style="min-width:0">
                  <div class="flow-title">${esc(p.milestone)}</div>
                  <div class="flow-meta">${fmtINR(p.amount)} · ${esc(p.status.replace(/_/g,' ').toLowerCase())}</div>
                </div>
              </div>`).join('')}
          </div>

          <div>
            <div class="xsmall" style="font-weight:700;color:var(--text-4);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Outcome</div>
            <div class="flow-box" style="background:var(--primary-50);border-color:var(--primary-100)">
              <div style="color:var(--primary);margin-bottom:4px">${icon('scaleup')}</div>
              <div style="font-weight:700;font-size:12.5px;color:var(--navy)">Scale-up readiness</div>
              <div class="xsmall muted" style="margin-top:2px">
                ${validation?.status==='Validated'
                  ? 'Evidence supports procurement decision'
                  : 'Awaiting independent validation'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

/* ---------- Public Value Panel ---------- */
function PublicValuePanel(pilot, validation) {
  if (!pilot) return '';
  const c = Store.find('challenges', pilot.challengeId);
  if (!c) return '';

  const kpi = pilot.kpis[0] || {};
  const baseline = parseFloat(kpi.baseline) || 0;
  const current = parseFloat(kpi.current) || 0;
  const target = parseFloat(kpi.target) || 1;
  const improvement = kpi.dir === 'up'
    ? ((current - baseline) / Math.max(target - baseline, 1)) * 100
    : ((baseline - current) / Math.max(baseline - target, 1)) * 100;
  const achievement = clamp(Math.round(improvement), 0, 100);

  const wardsMatch = pilot.geography.match(/(\d+)/);
  const wards = wardsMatch ? parseInt(wardsMatch[1]) : 8;
  const scaleWards = wards * 5;

  return `
    <div class="card" style="margin-bottom:20px">
      <div class="card-head">
        <div>
          <h3>Public Value</h3>
          <p>Impact created by this pilot, beyond procurement activity</p>
        </div>
        <span class="badge badge-purple">${icon('trendingUp')}Evidence-backed</span>
      </div>
      <div class="card-pad">
        <div class="grid g-3" style="gap:12px;margin-bottom:16px">
          <div class="value-tile">
            <div class="value-icon" style="background:var(--primary-50);color:var(--primary)">${icon('target')}</div>
            <div class="value-body">
              <div class="value-label">${esc(kpi.name || 'Primary KPI')}</div>
              <div class="value-value">${esc(String(baseline))}${esc(kpi.unit||'')} <span class="muted">→</span> ${esc(String(current))}${esc(kpi.unit||'')}</div>
              <div class="value-sub">Target ${esc(String(target))}${esc(kpi.unit||'')}</div>
            </div>
          </div>
          <div class="value-tile">
            <div class="value-icon" style="background:var(--success-50);color:var(--success)">${icon('checkCircle')}</div>
            <div class="value-body">
              <div class="value-label">Target achievement</div>
              <div class="value-value">${achievement}%</div>
              <div class="value-sub">Against declared outcome</div>
            </div>
          </div>
          <div class="value-tile">
            <div class="value-icon" style="background:var(--purple-50);color:var(--purple)">${icon('users')}</div>
            <div class="value-body">
              <div class="value-label">Population served</div>
              <div class="value-value">${esc(pilot.users)}</div>
              <div class="value-sub">${esc(pilot.geography)}</div>
            </div>
          </div>
          <div class="value-tile">
            <div class="value-icon" style="background:var(--warning-50);color:var(--warning)">${icon('payment')}</div>
            <div class="value-body">
              <div class="value-label">Pilot investment</div>
              <div class="value-value">${fmtLakh(pilot.budget)}</div>
              <div class="value-sub">Milestone-linked</div>
            </div>
          </div>
          <div class="value-tile">
            <div class="value-icon" style="background:var(--info-50);color:var(--info)">${icon('mapPin')}</div>
            <div class="value-body">
              <div class="value-label">Coverage</div>
              <div class="value-value">${wards} / ${wards}</div>
              <div class="value-sub">Wards in pilot scope</div>
            </div>
          </div>
          <div class="value-tile">
            <div class="value-icon" style="background:${validation?.status==='Validated'?'var(--success-50)':'var(--warning-50)'};color:${validation?.status==='Validated'?'var(--success)':'var(--warning)'}">${icon('shield')}</div>
            <div class="value-body">
              <div class="value-label">Evidence confidence</div>
              <div class="value-value">${validation?.status === 'Validated' ? 'Validated' : 'Pending'}</div>
              <div class="value-sub">${validation ? esc(validation.validator) : 'Awaiting validator'}</div>
            </div>
          </div>
        </div>

        <div style="padding:16px;background:var(--surface-2);border-radius:10px">
          <div class="xsmall" style="font-weight:700;color:var(--text-4);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">Scale-up scenario</div>
          <div class="grid g-4" style="gap:14px">
            <div>
              <div class="xsmall muted">Current pilot</div>
              <div class="h3">${wards} wards</div>
            </div>
            <div>
              <div class="xsmall muted">Potential deployment</div>
              <div class="h3">${scaleWards} wards</div>
            </div>
            <div>
              <div class="xsmall muted">Required investment</div>
              <div class="h3">${fmtLakh(pilot.budget * 4)}</div>
            </div>
            <div>
              <div class="xsmall muted">Evidence status</div>
              <div class="h3" style="color:${validation?.status==='Validated'?'var(--success)':'var(--warning)'}">
                ${validation?.status==='Validated' ? 'Ready' : 'Awaiting validation'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

/* ============================================================
   10. ROUTER
   ============================================================ */
const Router = {
  current: null, filters: {}, tab: null,
  parse() {
    const hash = location.hash.replace(/^#\/?/, '') || '';
    const parts = hash.split('/').filter(Boolean);
    return { path: parts[0] || 'role-select', param: parts[1] || null };
  },
  go(path) { location.hash = '#/' + path.replace(/^#?\/?/, ''); },
  render() {
    const { path, param } = this.parse();
    this.current = path;
    if (!Session.role && path !== 'role-select') { this.go('role-select'); return; }
    render();
  }
};
window.addEventListener('hashchange', () => Router.render());

/* ============================================================
   11. APPLICATION SHELL
   ============================================================ */
const NAV = [
  { key:'dashboard',  label:'Dashboard',        icon:'dashboard', group:'Overview' },
  { key:'pathway',    label:'Pathway Board',    icon:'pathway',   group:'Overview' },

  { key:'challenges', label:'Challenges',       icon:'challenge', group:'Procurement' },
  { key:'startups',   label:'Startup Discovery',icon:'startup',   group:'Procurement' },
  { key:'evaluations',label:'Evaluations',      icon:'evaluation',group:'Procurement' },

  { key:'pilots',     label:'Active Pilots',    icon:'pilot',     group:'Pilots' },
  { key:'monitoring', label:'Monitoring',       icon:'monitoring',group:'Pilots' },
  { key:'evidence',   label:'Evidence Vault',   icon:'evidence',  group:'Pilots' },

  { key:'contracts',  label:'Contracts',        icon:'contract',  group:'Governance' },
  { key:'payments',   label:'Payments',         icon:'payment',   group:'Governance' },
  { key:'validation', label:'Validation',       icon:'validation',group:'Governance' },
  { key:'scaleup',    label:'Scale-up Decisions',icon:'scaleup',  group:'Governance' },

  { key:'publicvalue',label:'Public Value',     icon:'trendingUp',group:'Insights' },
  { key:'analytics',  label:'Analytics',        icon:'analytics', group:'Insights' },
  { key:'audit',      label:'Audit Trail',      icon:'audit',     group:'Insights' },

  { key:'templates',  label:'Templates',        icon:'templates', group:'System' },
  { key:'settings',   label:'Settings',         icon:'settings',  group:'System' }
];

function Sidebar(role, current) {
  const groups = {};
  NAV.forEach(n => {
    if (!can(role, n.key)) return;
    (groups[n.group] = groups[n.group] || []).push(n);
  });
  const unread = Store.get('notifications').filter(n => !n.read).length;
  return `
    <aside class="sidebar ${Session.sidebarCollapsed ? 'collapsed' : ''}" id="sidebar">
      <div class="sb-brand">
        <div class="sb-logo">PB</div>
        <div class="sb-brand-text"><b>Pilot Bridge</b><span>Innovation Procurement</span></div>
      </div>
      <nav class="sb-nav">
        ${Object.entries(groups).map(([g, items]) => `
          <div class="sb-group-label">${esc(g)}</div>
          ${items.map(n => `
            <a class="sb-item ${current === n.key ? 'active' : ''}" href="#/${n.key}" data-nav-key="${n.key}">
              ${icon(n.icon)}
              <span class="sb-label">${esc(n.label)}</span>
              ${n.key === 'dashboard' && unread ? `<span class="sb-count">${unread}</span>` : ''}
            </a>
          `).join('')}
        `).join('')}
      </nav>
      <div class="sb-foot">
        <button class="sb-item" data-toggle-sidebar style="width:100%">
          ${icon(Session.sidebarCollapsed ? 'chevronRight' : 'chevronLeft')}
          <span class="sb-label">Collapse</span>
        </button>
      </div>
    </aside>`;
}

function Topbar(role) {
  const p = Session.persona();
  const unread = Store.get('notifications').filter(n => !n.read).length;
  return `
    <header class="topbar">
      <button class="icon-btn mobile-only" data-open-sidebar aria-label="Menu">${icon('menu')}</button>
      <button class="icon-btn desktop-only" data-toggle-sidebar aria-label="Toggle sidebar">${icon('menu')}</button>
      <button class="search-trigger" data-open-cmdk>
        ${icon('search')}
        <span>Search challenges, startups, pilots, contracts…</span>
        <kbd>⌘K</kbd>
      </button>
      <div class="tb-spacer"></div>
      <div class="demo-chip"><span class="dot"></span>DEMO · 22 Sep 2026</div>
      <button class="icon-btn" data-toggle-lang aria-label="Language" style="font-size:11px;font-weight:700;color:var(--text-2)">${Session.lang}</button>
      <button class="icon-btn" data-toggle-theme aria-label="Theme">${icon(Session.theme === 'dark' ? 'sun' : 'moon')}</button>
      <button class="icon-btn" data-open-notifications aria-label="Notifications">
        ${icon('bell')}${unread ? '<span class="badge-dot"></span>' : ''}
      </button>
      <button class="role-chip" data-open-role-switcher>
        <div class="avatar" style="background:${p?.color || 'var(--primary)'}">${initials(p?.name || 'User')}</div>
        <div class="role-chip-text desktop-only">
          <b>${esc(p?.name || 'User')}</b>
          <span>${esc(p?.title || '')}</span>
        </div>
        ${icon('chevronDown', 'desktop-only')}
      </button>
    </header>`;
}

function AccessRestricted() {
  return `
    <div class="content">
      <div class="empty" style="padding:80px 24px">
        ${icon('lock')}
        <b>Access restricted</b>
        <p>Your role does not have permission to view this section. Switch roles or return to the dashboard.</p>
        <a class="btn btn-primary" href="#/dashboard" style="margin-top:8px">${icon('dashboard')}Go to Dashboard</a>
      </div>
    </div>`;
}

/* ============================================================
   12. PAGES
   ============================================================ */
const Pages = {};

/* ---------- Role Selector ---------- */
Pages.roleSelect = () => {
  const roleCards = PERSONAS.map(p => `
    <button class="role-card" data-persona="${p.id}">
      <div class="role-avatar" style="background:${p.color}">${initials(p.name)}</div>
      <div>
        <h3>${esc(p.name)}</h3>
        <div class="rc-org">${esc(p.title)} · ${esc(p.org)}</div>
      </div>
      <p class="rc-desc">${esc(p.desc)}</p>
      <div class="rc-cta">Enter as ${esc(p.title.split(' ')[0])} ${icon('chevronRight')}</div>
    </button>`).join('');

  return `
    <div class="role-screen">
      <div class="role-brand">
        <div class="sb-logo">PB</div>
        <div class="role-brand-text"><b>Pilot Bridge</b><span>Government Innovation Procurement & Pilot Management</span></div>
      </div>
      <div class="role-hero">
        <div class="role-tagline">${icon('shield')}Evidence-driven innovation procurement</div>
        <h1>Enter the platform as</h1>
        <p>Choose a role to explore Pilot Bridge from that perspective. Every role has a distinct workspace and permission set.</p>
      </div>
      <div class="role-grid">${roleCards}</div>
      <div class="role-foot">
        <a class="btn btn-secondary" href="#/dashboard" data-public-dashboard>${icon('eye')}View public dashboard</a>
        <button class="btn btn-ghost" data-reset-demo>${icon('refresh')}Reset demo data</button>
      </div>
    </div>`;
};

/* ---------- Dashboard ---------- */
Pages.dashboard = () => {
  const role = Session.role;
  const p = Session.persona();
  const challenges = Store.get('challenges');
  const pilots = Store.get('pilots');
  const payments = Store.get('payments');

  const pilotValue = pilots.reduce((a,p) => a + (p.budget||0), 0);
  const activeChallenges = challenges.filter(c => c.stage !== 'SCALE_UP').length;
  const runningPilots = pilots.filter(p => p.status === 'Active').length;
  const readyForScaleup = pilots.filter(p => p.status === 'Validated' || p.status === 'Completed').length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const attention = [];

  challenges.filter(c => c.stage === 'EVALUATION').forEach(c => {
    const apps = Store.get('applications').filter(a => a.challengeId === c.id);
    const submitted = Store.get('evaluations').filter(e => e.status === 'Submitted' && apps.some(a => a.id === e.applicationId));
    const totalPossible = apps.length * 2;
    if (submitted.length < totalPossible) {
      attention.push({
        tone:'warning', icon:'evaluation',
        title:`${c.id} — Evaluation incomplete`,
        body:`${submitted.length}/${totalPossible} evaluations submitted · deadline 28 Sep`,
        link:`#/challenges/${c.id}`,
        action:'Open evaluation'
      });
    }
  });

  Store.get('evidence').filter(e => e.status === 'Under review' || e.status === 'Submitted').forEach(e => {
    const pilot = Store.find('pilots', e.pilotId);
    if (pilot && !attention.some(a => a.title.includes(pilot.id))) {
      attention.push({
        tone:'warning', icon:'validation',
        title:`${pilot.id} — Validation pending`,
        body:`${Store.get('evidence').filter(x=>x.pilotId===pilot.id).length} evidence files · validator action required`,
        link:`#/validation`,
        action:'Open validation'
      });
    }
  });

  payments.filter(p => p.status === 'AWAITING_PAYMENT').forEach(p => {
    const pilot = Store.find('pilots', p.pilotId);
    attention.push({
      tone:'danger', icon:'payment',
      title:`${fmtINR(p.amount)} — Payment awaiting approval`,
      body:`${p.milestone} · ${pilot?.title || p.pilotId}`,
      link:'#/payments',
      action:'Review payment'
    });
  });

  const toneColor = t => t === 'danger' ? 'var(--danger)' : t === 'warning' ? 'var(--warning)' : 'var(--primary)';
  const toneBg = t => t === 'danger' ? 'var(--danger-50)' : t === 'warning' ? 'var(--warning-50)' : 'var(--primary-50)';

  return `
    <div class="content">
      <div class="page-head">
        <div class="ph-left">
          <div class="xsmall" style="font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Government Innovation Control Center</div>
          <h1 class="h1">${greeting}, ${esc(p?.name.split(' ')[0] || 'there')}</h1>
          <p>Track public-sector problems from challenge → evidence → scale-up.</p>
        </div>
        <div class="ph-actions">
          ${can(role,'challenges') ? `<a class="btn btn-primary" href="#/challenges/new">${icon('plus')}New Challenge</a>` : ''}
          <button class="btn btn-secondary" data-run-demo>${icon('play')}Run Demo</button>
        </div>
      </div>

      <div class="grid g-4" style="margin-bottom:20px">
        ${KpiCard({label:'Pilot Value', value:fmtLakh(pilotValue), sub:'Across '+pilots.length+' pilots', accent:'blue', iconName:'payment'})}
        ${KpiCard({label:'Active Challenges', value:activeChallenges, sub:'Across 7 departments', accent:'purple', iconName:'challenge', onClick:'#/challenges'})}
        ${KpiCard({label:'Running Pilots', value:runningPilots, sub:'Monitored weekly', accent:'green', iconName:'pilot', onClick:'#/pilots'})}
        ${KpiCard({label:'Ready for Scale-up', value:readyForScaleup, sub:'Validation complete', accent:'amber', iconName:'scaleup', onClick:'#/scaleup'})}
      </div>

      <div class="card" style="margin-bottom:20px">
        <div class="card-head">
          <div>
            <h3>Where attention is needed</h3>
            <p>Decisions and verifications awaiting your role</p>
          </div>
          <span class="badge badge-${attention.length ? 'warning' : 'success'}">${attention.length} item${attention.length===1?'':'s'}</span>
        </div>
        <div class="card-pad">
          ${attention.length ? attention.slice(0,6).map(a => `
            <a class="attention-item" href="${a.link}">
              <div class="ai-icon" style="background:${toneBg(a.tone)};color:${toneColor(a.tone)}">${icon(a.icon)}</div>
              <div class="ai-body">
                <b>${esc(a.title)}</b>
                <span>${esc(a.body)}</span>
              </div>
              <span class="badge badge-${a.tone==='danger'?'danger':a.tone==='warning'?'warning':'info'}">${esc(a.action)}</span>
            </a>`).join('') : EmptyState('checkCircle','All clear','No items currently require your attention.')}
        </div>
      </div>

      <div class="grid g-2-1" style="margin-bottom:20px">
        <div class="card">
          <div class="card-head">
            <div><h3>10-stage innovation pipeline</h3><p>Click a stage to filter challenges below</p></div>
          </div>
          <div class="card-pad">
            ${Pipeline(challenges, null, {interactive:true})}
          </div>
        </div>
        <div class="card">
          <div class="card-head"><h3>Pipeline distribution</h3></div>
          <div class="card-pad">
            ${Chart.bars(STAGES.map(s => ({
              label: s.name.split(' ')[0],
              value: challenges.filter(c => c.stage === s.key).length,
              color: 'var(--primary)'
            })), {height:190})}
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <div><h3>Recent challenges</h3><p>Across all departments and districts</p></div>
          <a class="btn btn-secondary btn-sm" href="#/pathway">View Pathway Board ${icon('chevronRight')}</a>
        </div>
        <div class="card-pad" id="dash-challenges">
          <div class="grid g-3">
            ${challenges.slice(0,6).map(c => ChallengeCard(c)).join('')}
          </div>
        </div>
      </div>
    </div>`;
};

/* ---------- Pathway Board ---------- */
Pages.pathway = () => {
  const challenges = Store.get('challenges');
  const filters = Router.filters || {};
  const filtered = challenges.filter(c =>
    (!filters.dept || c.dept === filters.dept) &&
    (!filters.district || c.district === filters.district) &&
    (!filters.priority || c.priority === filters.priority) &&
    (!filters.q || (c.title + c.id).toLowerCase().includes(filters.q.toLowerCase()))
  );
  const depts = [...new Set(challenges.map(c => c.dept))];
  const districts = [...new Set(challenges.map(c => c.district))];

  return `
    <div class="content">
      <div class="page-head">
        <div class="ph-left">
          <h1 class="h1">Pathway Board</h1>
          <p>Every challenge flows through 10 governed stages from problem definition to scale-up decision.</p>
        </div>
        <div class="ph-actions">
          <a class="btn btn-primary" href="#/challenges/new">${icon('plus')}New Challenge</a>
        </div>
      </div>

      <div class="filter-bar">
        <input class="input" placeholder="Search challenges…" value="${esc(filters.q||'')}" data-filter="q" />
        <select class="select" data-filter="dept">
          <option value="">All departments</option>
          ${depts.map(d => `<option ${filters.dept===d?'selected':''}>${esc(d)}</option>`).join('')}
        </select>
        <select class="select" data-filter="district">
          <option value="">All districts</option>
          ${districts.map(d => `<option ${filters.district===d?'selected':''}>${esc(d)}</option>`).join('')}
        </select>
        <select class="select" data-filter="priority">
          <option value="">All priorities</option>
          <option ${filters.priority==='High'?'selected':''}>High</option>
          <option ${filters.priority==='Medium'?'selected':''}>Medium</option>
          <option ${filters.priority==='Low'?'selected':''}>Low</option>
        </select>
        ${Object.keys(filters).length ? `<button class="btn btn-ghost btn-sm" data-clear-filters>${icon('x')}Clear</button>` : ''}
      </div>

      <div class="board-wrap">
        <div class="board">
          ${STAGES.map(s => {
            const items = filtered.filter(c => c.stage === s.key);
            return `
              <div class="board-col">
                <div class="board-col-head">
                  <b>${s.num}. ${esc(s.name)}</b>
                  <span class="cnt">${items.length}</span>
                </div>
                <div class="board-col-body">
                  ${items.length ? items.map(c => ChallengeCard(c)).join('') : `<div class="board-empty">No challenges in this stage</div>`}
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>
    </div>`;
};

/* ---------- Challenges list ---------- */
Pages.challenges = () => {
  const challenges = Store.get('challenges');
  const filters = Router.filters || {};
  const filtered = challenges.filter(c =>
    (!filters.dept || c.dept === filters.dept) &&
    (!filters.stage || c.stage === filters.stage) &&
    (!filters.q || (c.title + c.id + c.district).toLowerCase().includes(filters.q.toLowerCase()))
  );
  const depts = [...new Set(challenges.map(c => c.dept))];

  return `
    <div class="content">
      <div class="page-head">
        <div class="ph-left">
          <h1 class="h1">Challenges</h1>
          <p>${challenges.length} challenges across ${depts.length} departments and 5 districts</p>
        </div>
        <div class="ph-actions">
          <a class="btn btn-primary" href="#/challenges/new">${icon('plus')}New Challenge</a>
        </div>
      </div>

      <div class="filter-bar">
        <input class="input" placeholder="Search by title, ID, district…" value="${esc(filters.q||'')}" data-filter="q" />
        <select class="select" data-filter="dept">
          <option value="">All departments</option>
          ${depts.map(d => `<option ${filters.dept===d?'selected':''}>${esc(d)}</option>`).join('')}
        </select>
        <select class="select" data-filter="stage">
          <option value="">All stages</option>
          ${STAGES.map(s => `<option value="${s.key}" ${filters.stage===s.key?'selected':''}>${esc(s.name)}</option>`).join('')}
        </select>
        ${Object.keys(filters).length ? `<button class="btn btn-ghost btn-sm" data-clear-filters>${icon('x')}Clear</button>` : ''}
      </div>

      <div class="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Title</th><th>Department</th><th>District</th>
              <th>Stage</th><th>Priority</th><th>Day</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length ? filtered.map(c => `
              <tr class="clickable" data-challenge="${c.id}">
                <td><span class="mono" style="font-weight:700">${esc(c.id)}</span></td>
                <td style="font-weight:600;max-width:340px">${esc(c.title)}</td>
                <td class="muted">${esc(c.dept)}</td>
                <td class="muted">${esc(c.district)}</td>
                <td>${badge(c.stage)}</td>
                <td>${PriorityBadge(c.priority)}</td>
                <td class="muted">Day ${c.day}</td>
                <td>${badge(c.status)}</td>
                <td>${icon('chevronRight')}</td>
              </tr>`).join('') : `<tr><td colspan="9">${EmptyState('challenge','No challenges match your filters','Try clearing filters or search with a different term.')}</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>`;
};

/* ---------- Challenge Detail ---------- */
Pages.challengeDetail = (id) => {
  const c = Store.find('challenges', id);
  if (!c) return `<div class="content">${EmptyState('alert','Challenge not found','The challenge you are looking for does not exist.')}</div>`;

  const tab = Router.tab || 'overview';
  const applications = Store.get('applications').filter(a => a.challengeId === c.id);
  const pilot = Store.get('pilots').find(p => p.challengeId === c.id);
  const contract = Store.get('contracts').find(ct => ct.challengeId === c.id);
  const validation = pilot ? Store.get('validations').find(v => v.pilotId === pilot.id) : null;
  const scaleup = Store.get('scaleup').find(s => s.challengeId === c.id);
  const ctx = { applications, pilot, contract, validation, scaleup };

  const tabs = [
    { key:'overview',   label:'Overview' },
    { key:'problem',    label:'Problem',    done: !!(c.problem && c.baseline) },
    { key:'solution',   label:'Solution',   count: applications.length },
    { key:'pilot',      label:'Pilot',      done: !!pilot },
    { key:'evidence',   label:'Evidence',   count: pilot ? Store.get('evidence').filter(e=>e.pilotId===pilot.id).length : 0 },
    { key:'validation', label:'Validation', done: validation?.status === 'Validated' },
    { key:'payments',   label:'Payments',   count: pilot ? Store.get('payments').filter(p=>p.pilotId===pilot.id).length : 0 },
    { key:'scaleup',    label:'Scale-up',   done: scaleup?.status === 'Decided' },
    { key:'audit',      label:'Audit' }
  ];

  const guard = Workflow.guard(c);
  const next = Workflow.nextStage(c.stage);

  let nextAction = null;
  if (c.stage === 'EVALUATION' && applications.length) {
    const submitted = Store.get('evaluations').filter(e => e.status === 'Submitted' && applications.some(a => a.id === e.applicationId)).length;
    if (submitted === 0) nextAction = { text:'Expert evaluation must complete before pilot design.', link:'#/evaluations', label:'Open Evaluations' };
    else nextAction = { text:'Evaluations submitted. Select a startup to proceed to pilot design.', link:`#/challenges/${c.id}`, label:'Review Evaluations' };
  } else if (c.stage === 'MONITORING' && pilot) {
    nextAction = { text:`Pilot is running. ${Store.get('evidence').filter(e=>e.pilotId===pilot.id && e.status==='Under review').length} evidence item(s) awaiting verification.`, link:'#/validation', label:'Open Validation' };
  } else if (c.stage === 'VALIDATION' && validation && validation.status !== 'Validated') {
    nextAction = { text:'Independent validator must verify pilot KPIs before payment release.', link:'#/validation', label:'Open Validation' };
  } else if (c.stage === 'PAYMENT' && pilot) {
    const pending = Store.get('payments').filter(p => p.pilotId === pilot.id && p.status === 'AWAITING_PAYMENT');
    if (pending.length) nextAction = { text:`${pending.length} payment(s) awaiting accounts approval.`, link:'#/payments', label:'Open Payments' };
  } else if (c.stage === 'SCALE_UP' && scaleup?.status === 'Pending') {
    nextAction = { text:'Validation complete. Scale-up decision is ready for your review.', link:'#/scaleup', label:'Open Scale-up' };
  } else if (!guard.ok && c.stage !== 'SCALE_UP') {
    nextAction = { text: guard.reason, link: null, label: null, blocked: true };
  }

  return `
    <div class="content">
      <div class="breadcrumb">
        <a href="#/pathway">Pathway Board</a>${icon('chevronRight')}
        <a href="#/challenges">Challenges</a>${icon('chevronRight')}
        <span>${esc(c.id)}</span>
      </div>

      <div class="page-head">
        <div class="ph-left">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;flex-wrap:wrap">
            <span class="mono" style="font-weight:800;color:var(--primary);font-size:13px">${esc(c.id)}</span>
            ${badge(c.stage)}
            ${PriorityBadge(c.priority)}
          </div>
          <h1 class="h1">${esc(c.title)}</h1>
          <p style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:6px">
            <span style="display:inline-flex;align-items:center;gap:5px">${icon('building')}${esc(c.dept)}</span>
            <span style="display:inline-flex;align-items:center;gap:5px">${icon('mapPin')}${esc(c.district)}</span>
            <span style="display:inline-flex;align-items:center;gap:5px">${icon('calendar')}Day ${c.day}</span>
            <span style="display:inline-flex;align-items:center;gap:5px">${icon('payment')}${fmtLakh(c.budget)}</span>
            <span style="display:inline-flex;align-items:center;gap:5px">${icon('clock')}${c.duration} days</span>
          </p>
        </div>
        <div class="ph-actions">
          ${can(Session.role,'gov') && c.stage !== 'SCALE_UP' ? `
            <button class="btn btn-primary" data-advance-challenge="${c.id}" ${guard.ok ? '' : 'disabled title="'+esc(guard.reason)+'"'}>
              ${icon('chevronRight')}Advance to ${esc(STAGES.find(s=>s.key===next)?.name || '—')}
            </button>` : ''}
          <button class="btn btn-secondary" data-export-challenge="${c.id}">${icon('download')}Export</button>
        </div>
      </div>

      ${nextAction ? `
        <div class="card card-pad" style="margin-bottom:16px;border-left:3px solid var(--${nextAction.blocked ? 'warning' : 'primary'});background:var(--${nextAction.blocked ? 'warning-50' : 'primary-50'})">
          <div style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap">
            <span style="color:var(--${nextAction.blocked ? 'warning' : 'primary'});flex-shrink:0;margin-top:2px">${icon(nextAction.blocked ? 'alertTriangle' : 'info')}</span>
            <div style="flex:1;min-width:200px">
              <div class="h4">${nextAction.blocked ? 'Workflow blocked' : 'Next governance action'}</div>
              <div class="small" style="color:var(--text-2);margin-top:2px">${esc(nextAction.text)}</div>
            </div>
            ${nextAction.label ? `<a class="btn btn-primary btn-sm" href="${nextAction.link}">${esc(nextAction.label)}${icon('chevronRight')}</a>` : ''}
          </div>
        </div>` : ''}

      <div style="margin-bottom:20px">
        ${DecisionChain(c, ctx)}
      </div>

      ${pilot ? `<div style="margin-bottom:20px">${EvidenceFlow(pilot, validation)}</div>` : ''}

      <div class="tabs">
        ${tabs.map(t => `
          <button class="tab ${tab===t.key?'active':''}" data-tab="${t.key}">
            ${esc(t.label)}
            ${t.count ? ` <span style="opacity:.55">(${t.count})</span>` : ''}
            ${t.done ? ` <span style="color:var(--success);display:inline-block;vertical-align:middle">${icon('check')}</span>` : ''}
          </button>`).join('')}
      </div>

      <div id="tab-content">${renderChallengeTab(c, tab, ctx)}</div>
    </div>`;
};

function renderChallengeTab(c, tab, ctx) {
  const {applications, pilot, validation, scaleup} = ctx;

  if (tab === 'overview') {
    return `
      <div class="grid g-2-1">
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="card card-pad">
            <h3 class="h3" style="margin-bottom:10px">Problem</h3>
            <p style="color:var(--text-2);line-height:1.65">${esc(c.problem)}</p>
            <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
              <div class="xsmall muted" style="margin-bottom:4px">Current baseline</div>
              <p class="small" style="color:var(--text-2)">${esc(c.baseline)}</p>
            </div>
          </div>
          <div class="card card-pad">
            <h3 class="h3" style="margin-bottom:10px">Desired outcome</h3>
            <p style="color:var(--text-2);line-height:1.65">${esc(c.outcome)}</p>
          </div>
          <div class="card">
            <div class="card-head"><h3>Outcome metrics</h3></div>
            <div class="card-pad">
              ${c.kpis.map(k => {
                const hasCurrent = k.current && k.current !== '—' && pilot;
                return `
                  <div class="metric-row">
                    <div>
                      <div class="mr-label" style="font-weight:600;color:var(--navy)">${esc(k.name)}</div>
                      <div class="xsmall muted" style="margin-top:2px">Baseline ${esc(k.baseline)} → Target ${esc(k.target)}</div>
                    </div>
                    <div class="mr-val" style="color:${hasCurrent ? 'var(--primary)' : 'var(--text-3)'}">
                      ${esc(hasCurrent ? String(k.current) : '—')}
                    </div>
                  </div>`;
              }).join('')}
            </div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="card">
            <div class="card-head"><h3>At a glance</h3></div>
            <div class="card-pad">
              <div class="metric-row"><span class="mr-label">Department</span><span class="mr-val">${esc(c.dept)}</span></div>
              <div class="metric-row"><span class="mr-label">District</span><span class="mr-val">${esc(c.district)}</span></div>
              <div class="metric-row"><span class="mr-label">Pilot duration</span><span class="mr-val">${c.duration} days</span></div>
              <div class="metric-row"><span class="mr-label">Estimated budget</span><span class="mr-val">${fmtINR(c.budget)}</span></div>
              <div class="metric-row"><span class="mr-label">Risk level</span><span class="mr-val">${esc(c.risk)}</span></div>
              <div class="metric-row"><span class="mr-label">Applications</span><span class="mr-val">${applications.length}</span></div>
            </div>
          </div>
          <div class="card">
            <div class="card-head"><h3>Compliance</h3></div>
            <div class="card-pad">
              ${[
                ['Data protection', c.compliance.dataProtection],
                ['Cybersecurity', c.compliance.cyber],
                ['IP clause', c.compliance.ip],
                ['Procurement pathway', c.compliance.procurement],
                ['Risk assessment', c.compliance.risk]
              ].map(([label, ok]) => `
                <div class="metric-row">
                  <span class="mr-label">${esc(label)}</span>
                  <span style="color:${ok?'var(--success)':'var(--warning)'};display:flex;align-items:center;gap:5px">
                    ${ok ? icon('checkCircle') : icon('alertTriangle')}
                    <span class="small" style="font-weight:650">${ok ? 'Cleared' : 'Pending'}</span>
                  </span>
                </div>`).join('')}
            </div>
          </div>
        </div>
      </div>`;
  }

  if (tab === 'problem') {
    return `
      <div class="grid g-2-1">
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="card card-pad">
            <div class="xsmall" style="font-weight:700;color:var(--text-4);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Problem statement</div>
            <p style="color:var(--text-2);line-height:1.7;font-size:14px">${esc(c.problem)}</p>
          </div>
          <div class="card card-pad">
            <div class="xsmall" style="font-weight:700;color:var(--text-4);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Current baseline</div>
            <p style="color:var(--text-2);line-height:1.7;font-size:14px">${esc(c.baseline)}</p>
          </div>
          <div class="card card-pad">
            <div class="xsmall" style="font-weight:700;color:var(--text-4);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Desired outcome</div>
            <p style="color:var(--text-2);line-height:1.7;font-size:14px">${esc(c.outcome)}</p>
          </div>
          <div class="card card-pad">
            <div class="xsmall" style="font-weight:700;color:var(--text-4);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Target population & impact</div>
            <p style="color:var(--text-2);line-height:1.7;font-size:14px">${esc(c.users)}</p>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="card">
            <div class="card-head"><h3>Challenge parameters</h3></div>
            <div class="card-pad">
              <div class="metric-row"><span class="mr-label">Priority</span><span>${PriorityBadge(c.priority)}</span></div>
              <div class="metric-row"><span class="mr-label">Risk level</span><span class="mr-val">${esc(c.risk)}</span></div>
              <div class="metric-row"><span class="mr-label">Budget</span><span class="mr-val">${fmtINR(c.budget)}</span></div>
              <div class="metric-row"><span class="mr-label">Duration</span><span class="mr-val">${c.duration} days</span></div>
              <div class="metric-row"><span class="mr-label">Department</span><span class="mr-val">${esc(c.dept)}</span></div>
              <div class="metric-row"><span class="mr-label">District</span><span class="mr-val">${esc(c.district)}</span></div>
            </div>
          </div>
          <div class="card">
            <div class="card-head"><h3>KPI targets</h3></div>
            <div class="card-pad">
              ${c.kpis.map(k => {
                const isUp = k.dir === 'up';
                return `
                  <div style="padding:10px 0;border-bottom:1px solid var(--border)">
                    <div class="h4" style="margin-bottom:4px">${esc(k.name)}</div>
                    <div style="display:flex;align-items:center;gap:8px;font-size:12px">
                      <span class="muted">${esc(k.baseline)}</span>
                      ${icon('chevronRight')}
                      <span style="font-weight:700;color:var(--primary)">${esc(k.target)}</span>
                      <span class="badge badge-${isUp?'success':'info'}" style="margin-left:auto">${isUp?'Higher is better':'Lower is better'}</span>
                    </div>
                  </div>`;
              }).join('')}
            </div>
          </div>
        </div>
      </div>`;
  }

  if (tab === 'solution') {
    if (!applications.length) return EmptyState('startup','No applications yet','Applications will appear here once startups apply to this challenge.');
    const rubric = Store.get('rubric');
    return `
      <div style="margin-bottom:16px">
        <h3 class="h3">Startup solutions</h3>
        <p class="small muted" style="margin-top:2px">${applications.length} application(s) · scored against the active weighted rubric</p>
      </div>
      ${applications.map(a => {
        const s = Store.find('startups', a.startupId);
        const ms = s ? Scoring.matchScore(s, c) : null;
        const consensus = Scoring.consensus(a.id);
        const breakdown = Scoring.breakdown(a.id);
        const evs = Store.get('evaluations').filter(e => e.applicationId === a.id);
        const submitted = evs.filter(e => e.status === 'Submitted');
        return `
          <div class="card" style="margin-bottom:16px">
            <div class="card-head">
              <div style="display:flex;align-items:center;gap:12px;min-width:0">
                <div class="avatar" style="width:40px;height:40px;border-radius:10px;font-size:13px;background:var(--primary);flex-shrink:0">${initials(s?.name || '??')}</div>
                <div style="min-width:0">
                  <h3>${esc(s?.name || a.startupId)}</h3>
                  <p>${esc(s?.tech || '')} · ${esc(a.id)}</p>
                </div>
              </div>
              <div style="text-align:right">
                ${consensus != null
                  ? `<div class="xsmall muted">Consensus</div><div class="h2" style="color:var(--primary)">${consensus}</div>`
                  : `<span class="badge badge-warning">${submitted.length}/${evs.length} submitted</span>`}
              </div>
            </div>
            <div class="card-pad">
              <div class="grid g-2" style="gap:20px">
                <div>
                  <div class="xsmall" style="font-weight:700;color:var(--text-4);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">Eligibility & Fit Signals</div>
                  ${ms ? ms.parts.map(p => `
                    <div class="score-bar">
                      <div class="sb-label" style="width:150px">${esc(p.label)}</div>
                      <div class="sb-track"><span style="width:${p.value}%;background:${p.color}"></span></div>
                      <div class="sb-val">${p.value}</div>
                    </div>`).join('') : '<p class="muted small">No fit data available.</p>'}
                  <div class="xsmall muted" style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border)">
                    Signals assist evaluation. Human evaluators make the final decision.
                  </div>
                </div>
                <div>
                  ${breakdown ? `
                    <div class="xsmall" style="font-weight:700;color:var(--text-4);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">Evaluation breakdown</div>
                    ${rubric.map(r => `
                      <div class="score-bar">
                        <div class="sb-label" style="width:150px">${esc(r.name)} <span class="muted">(${r.weight}%)</span></div>
                        <div class="sb-track"><span style="width:${breakdown[r.key]}%;background:var(--primary)"></span></div>
                        <div class="sb-val">${breakdown[r.key]}</div>
                      </div>`).join('')}
                  ` : `
                    <div class="xsmall" style="font-weight:700;color:var(--text-4);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">Evaluator reasoning</div>
                    ${evs.length ? evs.map(e => `
                      <div style="padding:8px 0;border-bottom:1px solid var(--border)">
                        <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
                          <b class="small">${esc(e.evaluator)}</b>
                          ${badge(e.status)}
                        </div>
                        <div class="small muted">${esc(e.comments || 'No comments.')}</div>
                      </div>`).join('') : '<p class="muted small">No evaluations recorded yet.</p>'}
                  `}
                </div>
              </div>
              <div style="display:flex;gap:8px;margin-top:14px;padding-top:14px;border-top:1px solid var(--border);flex-wrap:wrap">
                <a class="btn btn-secondary btn-sm" href="#/startups/${a.startupId}">${icon('eye')}View startup</a>
                ${Session.role === 'gov' && ['Shortlisted','Evaluation'].includes(a.status) ? `
                  <button class="btn btn-primary btn-sm" data-select-startup="${a.id}">${icon('check')}Select for pilot</button>` : ''}
              </div>
            </div>
          </div>`;
      }).join('')}`;
  }

  if (tab === 'pilot') {
    if (!pilot) return EmptyState('pilot','No pilot designed yet','Once a startup is selected, the pilot design wizard will create milestones, KPIs and success criteria here.');
    return `
      <div class="grid g-2-1">
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="card card-pad">
            <h3 class="h3" style="margin-bottom:10px">Pilot objective</h3>
            <p style="color:var(--text-2);line-height:1.65">${esc(c.outcome)}</p>
          </div>
          <div class="card">
            <div class="card-head"><h3>Milestones</h3><p>${pilot.milestones.length} milestones · ${fmtINR(pilot.budget)} total</p></div>
            <div class="card-pad">
              ${pilot.milestones.map(m => MilestoneCard(m, pilot.budget)).join('')}
            </div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="card">
            <div class="card-head"><h3>Pilot setup</h3></div>
            <div class="card-pad">
              <div class="metric-row"><span class="mr-label">Geography</span><span class="mr-val">${esc(pilot.geography)}</span></div>
              <div class="metric-row"><span class="mr-label">Users</span><span class="mr-val">${esc(pilot.users)}</span></div>
              <div class="metric-row"><span class="mr-label">Duration</span><span class="mr-val">${pilot.duration} days</span></div>
              <div class="metric-row"><span class="mr-label">Start</span><span class="mr-val">${esc(fmtDate(pilot.startDate))}</span></div>
              <div class="metric-row"><span class="mr-label">End</span><span class="mr-val">${esc(fmtDate(pilot.endDate))}</span></div>
              <div class="metric-row"><span class="mr-label">Progress</span><span class="mr-val">${pilot.progress}%</span></div>
            </div>
          </div>
          <div class="card">
            <div class="card-head"><h3>Success criteria</h3></div>
            <div class="card-pad">
              ${pilot.kpis.map(k => `
                <div class="metric-row">
                  <div><div class="mr-label" style="font-weight:600;color:var(--navy)">${esc(k.name)}</div>
                    <div class="xsmall muted">${esc(String(k.baseline))}${esc(k.unit||'')} → ${esc(String(k.target))}${esc(k.unit||'')}</div>
                  </div>
                  <div class="mr-val">${esc(String(k.current))}${esc(k.unit||'')}</div>
                </div>`).join('')}
            </div>
          </div>
        </div>
      </div>`;
  }

  if (tab === 'evidence') {
    const evs = pilot ? Store.get('evidence').filter(e => e.pilotId === pilot.id) : [];
    if (!evs.length) return EmptyState('evidence','No evidence uploaded','Evidence will appear here as the startup uploads milestone deliverables.');
    const verified = evs.filter(e => e.status === 'Verified').length;
    return `
      <div class="grid g-3" style="margin-bottom:16px">
        ${KpiCard({label:'Total Evidence', value:evs.length, accent:'blue', iconName:'evidence'})}
        ${KpiCard({label:'Verified', value:verified, accent:'green', iconName:'checkCircle'})}
        ${KpiCard({label:'Awaiting Review', value:evs.length - verified, accent:'amber', iconName:'clock'})}
      </div>
      <div class="grid g-3">${evs.map(e => EvidenceCard(e)).join('')}</div>`;
  }

  if (tab === 'validation') {
    if (!validation) return EmptyState('validation','No validation initiated','Independent validation begins after pilot evidence is submitted.');
    return renderValidationCard(validation, true);
  }

  if (tab === 'payments') {
    const pays = pilot ? Store.get('payments').filter(p => p.pilotId === pilot.id) : [];
    if (!pays.length) return EmptyState('payment','No payments yet','Milestone payments will appear here once the contract is active.');
    return renderPaymentsTable(pays, false);
  }

  if (tab === 'scaleup') {
    if (pilot) {
      return `
        ${PublicValuePanel(pilot, validation)}
        ${scaleup ? `
          <div class="card">
            <div class="card-head">
              <div><h3>Scale-up decision</h3><p>${esc(scaleup.id)}</p></div>
              ${badge(scaleup.status)}
            </div>
            <div class="card-pad">
              <div class="matrix" style="margin-bottom:16px">
                ${Object.entries(scaleup.matrix || {}).map(([k,v]) => {
                  const tone = v === 'High' ? 'success' : v === 'Medium' ? 'warning' : 'danger';
                  const label = k.charAt(0).toUpperCase() + k.slice(1);
                  return `<div class="matrix-cell"><div class="mc-label">${esc(label)}</div><div class="mc-val" style="color:var(--${tone})">${esc(v)}</div></div>`;
                }).join('')}
              </div>
              <div style="padding:14px;background:var(--primary-50);border-radius:10px;margin-bottom:16px">
                <div class="xsmall" style="font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">${icon('sparkles')} Decision support</div>
                <p class="small" style="color:var(--text-2)">${esc(scaleup.recommendation)}</p>
              </div>
              ${scaleup.status === 'Pending' && Session.role === 'gov' ? `
                <div style="display:flex;gap:8px;flex-wrap:wrap">
                  ${['Continue pilot','Extend pilot','Departmental procurement','Multi-district scale-up','Re-evaluation','Close pilot'].map(opt => `
                    <button class="btn btn-secondary" data-scaleup-decision="${scaleup.id}" data-decision="${esc(opt)}">${esc(opt)}</button>`).join('')}
                </div>` : ''}
              ${scaleup.decision ? `
                <div class="card card-pad" style="background:var(--success-50);border-color:var(--success-100)">
                  <div class="h4" style="color:var(--success);margin-bottom:8px">${icon('checkCircle')} Decision recorded</div>
                  <div class="metric-row"><span class="mr-label">Decision</span><span class="mr-val">${esc(scaleup.decision)}</span></div>
                  <div class="metric-row"><span class="mr-label">Officer</span><span class="mr-val">${esc(scaleup.officer)}</span></div>
                  <div class="metric-row"><span class="mr-label">Date</span><span class="mr-val">${esc(fmtDate(scaleup.decidedAt))}</span></div>
                  <div class="metric-row"><span class="mr-label">Evidence reference</span><span class="mr-val">${esc(scaleup.evidenceRef)}</span></div>
                  <div style="margin-top:8px"><div class="xsmall muted">Reason</div><p class="small">${esc(scaleup.reason)}</p></div>
                </div>` : ''}
            </div>
          </div>` : `<div class="card card-pad" style="text-align:center;padding:32px">
            <div style="color:var(--text-3);margin-bottom:8px">${icon('scaleup')}</div>
            <div class="h4">Scale-up decision not yet available</div>
            <p class="small muted" style="margin-top:4px">Independent validation must complete before the scale-up decision is enabled.</p>
            <a class="btn btn-primary btn-sm" href="#/validation" style="margin-top:12px">${icon('validation')}Open Validation</a>
          </div>`}
      `;
    }
    return EmptyState('scaleup','Scale-up not yet available','A pilot must be approved and validated before scale-up consideration.');
  }

  if (tab === 'audit') {
    const events = Store.get('audit').filter(a => a.entity === c.id || (a.details || '').includes(c.id));
    if (!events.length) return EmptyState('audit','No audit events yet','Actions taken on this challenge will be recorded here.');
    return renderAuditTimeline(events);
  }

  return '';
}

/* ---------- Startup Discovery ---------- */
Pages.startups = () => {
  const startups = Store.get('startups');
  const filters = Router.filters || {};
  const filtered = startups.filter(s =>
    (!filters.industry || s.industry === filters.industry) &&
    (!filters.district || s.district === filters.district) &&
    (!filters.q || (s.name + s.tech + s.industry).toLowerCase().includes(filters.q.toLowerCase()))
  );
  const industries = [...new Set(startups.map(s => s.industry))];

  return `
    <div class="content">
      <div class="page-head">
        <div class="ph-left">
          <h1 class="h1">Startup Discovery</h1>
          <p>${startups.length} DPIIT-recognised startups · Match scores are explainable, not opaque</p>
        </div>
      </div>

      <div class="filter-bar">
        <input class="input" placeholder="Search startups, technologies…" value="${esc(filters.q||'')}" data-filter="q" />
        <select class="select" data-filter="industry">
          <option value="">All industries</option>
          ${industries.map(i => `<option ${filters.industry===i?'selected':''}>${esc(i)}</option>`).join('')}
        </select>
        <select class="select" data-filter="district">
          <option value="">All districts</option>
          ${DISTRICTS.map(d => `<option ${filters.district===d?'selected':''}>${esc(d)}</option>`).join('')}
        </select>
        ${Object.keys(filters).length ? `<button class="btn btn-ghost btn-sm" data-clear-filters>${icon('x')}Clear</button>` : ''}
      </div>

      <div class="grid g-3">
        ${filtered.length ? filtered.map(s => {
          const challenge = Store.get('challenges').find(c => c.industry === s.industry) || Store.get('challenges')[0];
          const ms = Scoring.matchScore(s, challenge);
          return `
            <div class="card card-pad" data-startup="${s.id}" style="cursor:pointer;transition:border-color .15s" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--border)'">
              <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:14px">
                <div class="avatar" style="width:44px;height:44px;border-radius:11px;font-size:14px;background:var(--primary)">${initials(s.name)}</div>
                <div style="min-width:0;flex:1">
                  <div class="h3">${esc(s.name)}</div>
                  <div class="small muted">${esc(s.tech)}</div>
                </div>
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
                <span class="badge badge-neutral">${icon('mapPin')}${esc(s.district)}</span>
                <span class="badge badge-neutral">${icon('building')}${esc(s.industry)}</span>
                <span class="badge badge-neutral">${icon('award')}${esc(s.stage)}</span>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;padding:12px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);margin-bottom:12px">
                <div><div class="xsmall muted">Match</div><div class="h3" style="color:var(--primary)">${ms.overall}%</div></div>
                <div><div class="xsmall muted">Deployments</div><div class="h3">${s.deployments}</div></div>
                <div><div class="xsmall muted">Est. cost</div><div class="h3">${fmtLakh(s.cost)}</div></div>
              </div>
              <div class="xsmall muted" style="margin-bottom:6px;text-transform:uppercase;letter-spacing:.06em;font-weight:700">Match breakdown</div>
              ${ms.parts.slice(0,3).map(p => `
                <div class="score-bar">
                  <div class="sb-label" style="width:130px;font-size:11px">${esc(p.label)}</div>
                  <div class="sb-track" style="height:5px"><span style="width:${p.value}%;background:${p.color}"></span></div>
                  <div class="sb-val" style="font-size:11px">${p.value}</div>
                </div>`).join('')}
              <div style="display:flex;gap:6px;margin-top:12px;flex-wrap:wrap">
                ${(s.certs||[]).map(cert => `<span class="badge badge-success">${icon('shield')}${esc(cert)}</span>`).join('')}
              </div>
            </div>`;
        }).join('') : EmptyState('startup','No startups match your filters','Try clearing filters or searching with a different term.')}
      </div>
    </div>`;
};

/* ---------- Startup Detail ---------- */
Pages.startupDetail = (id) => {
  const s = Store.find('startups', id);
  if (!s) return `<div class="content">${EmptyState('alert','Startup not found','The startup you are looking for does not exist.')}</div>`;
  const apps = Store.get('applications').filter(a => a.startupId === s.id);
  const challenge = Store.get('challenges').find(c => c.industry === s.industry) || Store.get('challenges')[0];
  const ms = Scoring.matchScore(s, challenge);

  return `
    <div class="content">
      <div class="breadcrumb">
        <a href="#/startups">Startups</a>${icon('chevronRight')}<span>${esc(s.name)}</span>
      </div>
      <div class="page-head">
        <div class="ph-left" style="display:flex;gap:14px;align-items:flex-start">
          <div class="avatar" style="width:56px;height:56px;border-radius:14px;font-size:18px;background:var(--primary)">${initials(s.name)}</div>
          <div>
            <h1 class="h1">${esc(s.name)}</h1>
            <p>${esc(s.tech)} · ${esc(s.industry)} · Founded ${s.founded}</p>
          </div>
        </div>
      </div>

      <div class="grid g-2-1">
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="card card-pad">
            <h3 class="h3" style="margin-bottom:10px">About</h3>
            <p style="color:var(--text-2);line-height:1.65">${esc(s.desc)}</p>
          </div>

          <div class="card">
            <div class="card-head"><h3>Explainable match score</h3><p>Breakdown across six dimensions — no opaque single score</p></div>
            <div class="card-pad">
              <div style="display:flex;align-items:center;gap:20px;margin-bottom:16px">
                <div style="text-align:center">
                  <div style="font-size:40px;font-weight:800;color:var(--primary);letter-spacing:-.04em;line-height:1">${ms.overall}<span style="font-size:20px">%</span></div>
                  <div class="xsmall muted">Overall match</div>
                </div>
                <div style="flex:1">
                  ${ms.parts.map(p => `
                    <div class="score-bar">
                      <div class="sb-label" style="width:160px">${esc(p.label)}</div>
                      <div class="sb-track"><span style="width:${p.value}%;background:${p.color}"></span></div>
                      <div class="sb-val">${p.value}</div>
                    </div>`).join('')}
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-head"><h3>Previous government deployments</h3></div>
            <div class="card-pad">
              ${(s.prevGov||[]).map(g => `
                <div class="metric-row">
                  <span class="mr-label">${icon('building')} ${esc(g)}</span>
                  <span class="badge badge-success">${icon('check')}Deployed</span>
                </div>`).join('') || '<p class="muted small">No prior government deployments.</p>'}
            </div>
          </div>

          <div class="card">
            <div class="card-head"><h3>Applications</h3><p>${apps.length} application(s)</p></div>
            <div class="card-pad">
              ${apps.length ? apps.map(a => {
                const ch = Store.find('challenges', a.challengeId);
                return `
                  <div class="metric-row">
                    <div><div class="mr-label" style="font-weight:600;color:var(--navy)">${esc(ch?.title || a.challengeId)}</div>
                      <div class="xsmall muted">${esc(a.challengeId)} · Submitted ${esc(fmtDate(a.submittedAt))}</div>
                    </div>
                    ${badge(a.status)}
                  </div>`;
              }).join('') : '<p class="muted small">No applications yet.</p>'}
            </div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="card">
            <div class="card-head"><h3>Profile</h3></div>
            <div class="card-pad">
              <div class="metric-row"><span class="mr-label">Stage</span><span class="mr-val">${esc(s.stage)}</span></div>
              <div class="metric-row"><span class="mr-label">District</span><span class="mr-val">${esc(s.district)}</span></div>
              <div class="metric-row"><span class="mr-label">Team size</span><span class="mr-val">${s.team}</span></div>
              <div class="metric-row"><span class="mr-label">Pilot readiness</span><span class="mr-val">${s.readiness}%</span></div>
              <div class="metric-row"><span class="mr-label">Technical fit</span><span class="mr-val">${s.techFit}%</span></div>
              <div class="metric-row"><span class="mr-label">Estimated cost</span><span class="mr-val">${fmtINR(s.cost)}</span></div>
            </div>
          </div>
          <div class="card">
            <div class="card-head"><h3>Certifications</h3></div>
            <div class="card-pad" style="display:flex;gap:8px;flex-wrap:wrap">
              ${(s.certs||[]).map(cert => `<span class="badge badge-success">${icon('shield')}${esc(cert)}</span>`).join('') || '<span class="muted small">None listed</span>'}
            </div>
          </div>
        </div>
      </div>
    </div>`;
};

/* ---------- Evaluations ---------- */
Pages.evaluations = () => {
  const evs = Store.get('evaluations');
  const rubric = Store.get('rubric');
  const role = Session.role;

  const rows = evs.map(e => {
    const app = Store.find('applications', e.applicationId);
    const startup = app ? Store.find('startups', app.startupId) : null;
    const challenge = app ? Store.find('challenges', app.challengeId) : null;
    const score = Scoring.weighted(e.scores, rubric);
    return { e, app, startup, challenge, score };
  });

  const myRows = role === 'evaluator' ? rows.filter(r => r.e.evaluator === Session.persona()?.name) : rows;

  return `
    <div class="content">
      <div class="page-head">
        <div class="ph-left">
          <h1 class="h1">${role === 'evaluator' ? 'My Evaluations' : 'Evaluations'}</h1>
          <p>Weighted rubric scoring with explainable criteria and conflict-of-interest declarations</p>
        </div>
      </div>

      <div class="card" style="margin-bottom:16px">
        <div class="card-head"><h3>Active rubric</h3><p>Configured by Innovation Cell Admin · v3.0</p></div>
        <div class="card-pad">
          <div class="grid g-5" style="gap:12px">
            ${rubric.map(r => `
              <div style="padding:12px;border:1px solid var(--border);border-radius:10px;background:var(--surface-2)">
                <div class="xsmall muted">Criterion</div>
                <div class="h4" style="margin:4px 0 8px">${esc(r.name)}</div>
                <div class="h2" style="color:var(--primary)">${r.weight}%</div>
              </div>`).join('')}
          </div>
        </div>
      </div>

      <div class="tbl-wrap">
        <table>
          <thead><tr><th>Evaluation</th><th>Startup</th><th>Challenge</th><th>Evaluator</th><th>Score</th><th>Status</th><th></th></tr></thead>
          <tbody>
            ${myRows.length ? myRows.map(r => `
              <tr class="clickable" data-evaluation="${r.e.id}">
                <td><span class="mono" style="font-weight:700">${esc(r.e.id)}</span></td>
                <td><b>${esc(r.startup?.name || '—')}</b></td>
                <td class="muted" style="max-width:280px">${esc(r.challenge?.title || '—')}</td>
                <td class="muted">${esc(r.e.evaluator)}</td>
                <td><b style="color:var(--primary)">${r.score}</b><span class="xsmall muted">/100</span></td>
                <td>${badge(r.e.status)}</td>
                <td>${icon('chevronRight')}</td>
              </tr>`).join('') : `<tr><td colspan="7">${EmptyState('evaluation','No evaluations assigned','You have no evaluations assigned yet.')}</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>`;
};

/* ---------- Pilots ---------- */
Pages.pilots = () => {
  const pilots = Store.get('pilots');
  return `
    <div class="content">
      <div class="page-head">
        <div class="ph-left">
          <h1 class="h1">Pilots</h1>
          <p>${pilots.length} pilots · ${pilots.filter(p=>p.status==='Active').length} active · ${pilots.filter(p=>p.status==='Completed').length} completed · ${pilots.filter(p=>p.status==='Validated').length} validated</p>
        </div>
      </div>
      <div class="grid g-3">
        ${pilots.map(p => {
          const ch = Store.find('challenges', p.challengeId);
          const s = Store.find('startups', p.startupId);
          return `
            <div class="card card-pad" data-pilot="${p.id}" style="cursor:pointer;transition:border-color .15s" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--border)'">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px">
                <span class="mono" style="font-weight:700;font-size:11px;color:var(--text-4)">${esc(p.id)}</span>
                ${badge(p.status)}
              </div>
              <div class="h3" style="margin-bottom:6px">${esc(p.title)}</div>
              <div class="small muted" style="margin-bottom:12px">${esc(s?.name || '')} · ${esc(ch?.district || '')}</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:12px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);margin-bottom:12px">
                <div><div class="xsmall muted">Budget</div><div class="h4">${fmtLakh(p.budget)}</div></div>
                <div><div class="xsmall muted">Duration</div><div class="h4">${p.duration}d</div></div>
              </div>
              <div class="xsmall muted" style="margin-bottom:5px">Progress · ${p.progress}%</div>
              <div class="progress ${p.progress>=100?'green':''}"><span style="width:${p.progress}%"></span></div>
              <div style="display:flex;gap:6px;margin-top:12px;flex-wrap:wrap">
                ${p.kpis.map(k => `<span class="badge badge-${k.status==='ACHIEVED'?'success':k.status==='NEAR'?'warning':'danger'}">${esc(k.name)}</span>`).join('')}
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>`;
};

/* ---------- Pilot Detail ---------- */
Pages.pilotDetail = (id) => {
  const p = Store.find('pilots', id);
  if (!p) return `<div class="content">${EmptyState('alert','Pilot not found','')}</div>`;
  const ch = Store.find('challenges', p.challengeId);
  const s = Store.find('startups', p.startupId);
  const tab = Router.tab || 'monitoring';
  const tabs = [
    {key:'monitoring', label:'Monitoring'},
    {key:'milestones', label:'Milestones'},
    {key:'evidence', label:'Evidence'},
    {key:'payments', label:'Payments'},
    {key:'validation', label:'Validation'},
    {key:'risks', label:'Risk Monitor'}
  ];
  const validation = Store.get('validations').find(v => v.pilotId === p.id);
  return `
    <div class="content">
      <div class="breadcrumb">
        <a href="#/pilots">Pilots</a>${icon('chevronRight')}<span>${esc(p.id)}</span>
      </div>
      <div class="page-head">
        <div class="ph-left">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
            <span class="mono" style="font-weight:800;color:var(--primary);font-size:13px">${esc(p.id)}</span>
            ${badge(p.status)}
            ${badge(p.riskLevel + ' risk')}
          </div>
          <h1 class="h1">${esc(p.title)}</h1>
          <p>${esc(s?.name || '')} · ${esc(ch?.id || '')} · ${esc(p.geography)}</p>
        </div>
      </div>
      <div style="margin-bottom:20px">${PublicValuePanel(p, validation)}</div>
      <div class="tabs">
        ${tabs.map(t => `<button class="tab ${tab===t.key?'active':''}" data-pilot-tab="${t.key}" data-pilot-id="${p.id}">${esc(t.label)}</button>`).join('')}
      </div>
      <div id="pilot-tab-content">
        ${tab === 'monitoring' ? renderMonitoringForPilot(p, true) : ''}
        ${tab === 'milestones' ? `<div class="card"><div class="card-head"><h3>Milestones</h3><p>${p.milestones.length} milestones · ${fmtINR(p.budget)} total</p></div><div class="card-pad">${p.milestones.map(m => MilestoneCard(m, p.budget)).join('')}</div></div>` : ''}
        ${tab === 'evidence' ? `<div class="grid g-3">${Store.get('evidence').filter(e=>e.pilotId===p.id).map(e=>EvidenceCard(e)).join('') || EmptyState('evidence','No evidence yet','')}</div>` : ''}
        ${tab === 'payments' ? renderPaymentsTable(Store.get('payments').filter(pm=>pm.pilotId===p.id), true) : ''}
        ${tab === 'validation' ? (validation ? renderValidationCard(validation, true) : EmptyState('validation','No validation yet','')) : ''}
        ${tab === 'risks' ? renderRiskMonitor(p) : ''}
      </div>
    </div>`;
};

function renderMonitoringForPilot(p, full) {
  const trend = p.trend || [];
  const labels = trend.map(t => t.week);
  const paid = p.milestones.filter(m => m.status === 'PAID').reduce((a,m)=>a+m.amount,0);
  const locked = p.budget - paid;
  const dayMatch = p.startDate ? Math.round((Date.now() - new Date(p.startDate).getTime()) / (1000*60*60*24)) : 0;

  return `
    <div class="card card-pad" style="margin-bottom:20px;background:linear-gradient(180deg,var(--surface) 0%,var(--primary-50) 140%)">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
            <span class="mono" style="font-weight:800;color:var(--primary);font-size:12px">${esc(p.id)}</span>
            ${badge(p.status)}
            <span class="badge badge-${p.riskLevel==='Low'?'success':p.riskLevel==='High'?'danger':'warning'}">${esc(p.riskLevel)} risk</span>
          </div>
          <div class="h3">${esc(p.title)}</div>
          <div class="small muted" style="margin-top:2px">${esc(p.geography)} · ${esc(p.users)}</div>
        </div>
        <div style="text-align:right">
          <div class="xsmall muted">Pilot day</div>
          <div class="h2" style="color:var(--primary)">Day ${Math.max(dayMatch, 1)} <span style="color:var(--text-3);font-size:16px">/ ${p.duration}</span></div>
        </div>
      </div>
      <div class="grid g-3" style="margin-top:16px;gap:12px">
        <div class="value-tile" style="background:var(--surface)">
          <div class="value-icon" style="background:var(--primary-50);color:var(--primary)">${icon('payment')}</div>
          <div class="value-body">
            <div class="value-label">Total pilot value</div>
            <div class="value-value">${fmtINR(p.budget)}</div>
          </div>
        </div>
        <div class="value-tile" style="background:var(--surface)">
          <div class="value-icon" style="background:var(--success-50);color:var(--success)">${icon('checkCircle')}</div>
          <div class="value-body">
            <div class="value-label">Released</div>
            <div class="value-value" style="color:var(--success)">${fmtINR(paid)}</div>
          </div>
        </div>
        <div class="value-tile" style="background:var(--surface)">
          <div class="value-icon" style="background:var(--warning-50);color:var(--warning)">${icon('lock')}</div>
          <div class="value-body">
            <div class="value-label">Locked</div>
            <div class="value-value" style="color:var(--warning)">${fmtINR(locked)}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid g-3" style="margin-bottom:20px">
      ${p.kpis.map(k => KpiChartCard(k)).join('')}
    </div>

    <div class="grid g-2" style="margin-bottom:20px">
      <div class="card">
        <div class="card-head"><h3>KPI trend over time</h3><p>Weekly progression against target</p></div>
        <div class="card-pad">
          ${Chart.line([
            {name:'Primary metric', color:'var(--primary)', data: trend.map(t => t.loss)},
            {name:'Secondary metric', color:'var(--warning)', data: trend.map(t => t.response)},
            {name:'Coverage', color:'var(--success)', data: trend.map(t => t.coverage)}
          ], {height:220, labels})}
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h3>Milestone progress</h3><p>Each milestone is evidence-gated</p></div>
        <div class="card-pad">
          ${p.milestones.map(m => {
            const status = m.status;
            const pct = status === 'PAID' ? 100
                      : status === 'AWAITING_VALIDATION' || status === 'AWAITING_PAYMENT' ? 70
                      : status === 'IN_PROGRESS' ? 30 : 0;
            const tone = status === 'PAID' ? 'green'
                       : (status === 'AWAITING_VALIDATION' || status === 'AWAITING_PAYMENT') ? 'amber' : '';
            return `
              <div style="margin-bottom:14px">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                  <div>
                    <div class="h4">${esc(m.id)} · ${esc(m.name)}</div>
                    <div class="xsmall muted">${fmtINR(m.amount)} · due ${esc(fmtDate(m.due))}</div>
                  </div>
                  ${badge(status)}
                </div>
                <div class="progress ${tone}"><span style="width:${pct}%;background:${tone==='green'?'var(--success)':tone==='amber'?'var(--warning)':'var(--primary)'}"></span></div>
              </div>`;
          }).join('')}
        </div>
      </div>
    </div>

    ${full ? renderRiskMonitor(p) : ''}`;
}

function renderRiskMonitor(p) {
  const toneIcon = l => l === 'warn' ? icon('alertTriangle') : l === 'danger' ? icon('alert') : icon('checkCircle');
  const toneColor = l => l === 'warn' ? 'var(--warning)' : l === 'danger' ? 'var(--danger)' : 'var(--success)';
  const toneBg = l => l === 'warn' ? 'var(--warning-50)' : l === 'danger' ? 'var(--danger-50)' : 'var(--success-50)';
  return `
    <div class="card">
      <div class="card-head"><h3>Pilot Risk Monitor</h3><p>Click any risk to view explanation</p></div>
      <div class="card-pad">
        <div class="grid g-2">
          ${p.risks.map((r,i) => `
            <div data-risk="${p.id}-${i}" style="display:flex;gap:12px;align-items:flex-start;padding:14px;border:1px solid var(--border);border-radius:10px;cursor:pointer;transition:border-color .12s;background:${toneBg(r.level)}" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--border)'">
              <span style="color:${toneColor(r.level)};flex-shrink:0;margin-top:2px">${toneIcon(r.level)}</span>
              <div style="min-width:0;flex:1">
                <div class="h4">${esc(r.name)}</div>
                <div class="h3" style="color:${toneColor(r.level)};margin-top:2px">${esc(r.value)}</div>
              </div>
              ${icon('chevronRight')}
            </div>`).join('')}
        </div>
      </div>
    </div>`;
}

/* ---------- Contracts ---------- */
Pages.contracts = () => {
  const contracts = Store.get('contracts');
  return `
    <div class="content">
      <div class="page-head">
        <div class="ph-left"><h1 class="h1">Contracts</h1><p>${contracts.length} contracts · milestone-linked payments · IP and data clauses recorded</p></div>
      </div>
      <div class="tbl-wrap">
        <table>
          <thead><tr><th>Contract</th><th>Challenge</th><th>Startup</th><th>Value</th><th>Period</th><th>Status</th><th></th></tr></thead>
          <tbody>
            ${contracts.map(ct => {
              const ch = Store.find('challenges', ct.challengeId);
              const s = Store.find('startups', ct.startupId);
              return `
                <tr class="clickable" data-contract="${ct.id}">
                  <td><span class="mono" style="font-weight:700">${esc(ct.id)}</span></td>
                  <td style="max-width:280px">${esc(ch?.title || ct.challengeId)}</td>
                  <td><b>${esc(s?.name || ct.startupId)}</b></td>
                  <td><b>${fmtINR(ct.value)}</b></td>
                  <td class="muted small">${esc(fmtDate(ct.start))} → ${esc(fmtDate(ct.end))}</td>
                  <td>${badge(ct.status)}</td>
                  <td>${icon('chevronRight')}</td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
};

Pages.contractDetail = (id) => {
  const ct = Store.find('contracts', id);
  if (!ct) return `<div class="content">${EmptyState('alert','Contract not found','')}</div>`;
  return `
    <div class="content">
      <div class="breadcrumb"><a href="#/contracts">Contracts</a>${icon('chevronRight')}<span>${esc(ct.id)}</span></div>
      ${renderContractDetail(ct)}
    </div>`;
};

function renderContractDetail(ct) {
  const ch = Store.find('challenges', ct.challengeId);
  const s = Store.find('startups', ct.startupId);
  const pays = Store.get('payments').filter(p => p.contractId === ct.id);
  return `
    <div class="page-head">
      <div class="ph-left">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
          <span class="mono" style="font-weight:800;color:var(--primary);font-size:13px">${esc(ct.id)}</span>
          ${badge(ct.status)}
        </div>
        <h1 class="h1">${esc(ch?.title || ct.challengeId)}</h1>
        <p>${esc(s?.name || ct.startupId)} · Signed ${esc(fmtDate(ct.signedAt))}</p>
      </div>
    </div>
    <div class="grid g-2-1">
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card card-pad">
          <div class="grid g-3" style="gap:16px">
            <div><div class="xsmall muted">Contract value</div><div class="h2">${fmtINR(ct.value)}</div></div>
            <div><div class="xsmall muted">Start</div><div class="h3">${esc(fmtDate(ct.start))}</div></div>
            <div><div class="xsmall muted">End</div><div class="h3">${esc(fmtDate(ct.end))}</div></div>
          </div>
        </div>
        <div class="card card-pad">
          <h3 class="h3" style="margin-bottom:10px">IP clause</h3>
          <p style="color:var(--text-2);line-height:1.65">${esc(ct.ipClause)}</p>
        </div>
        <div class="card card-pad">
          <h3 class="h3" style="margin-bottom:10px">Data clause</h3>
          <p style="color:var(--text-2);line-height:1.65">${esc(ct.dataClause)}</p>
        </div>
        <div class="card card-pad">
          <h3 class="h3" style="margin-bottom:10px">Security clause</h3>
          <p style="color:var(--text-2);line-height:1.65">${esc(ct.securityClause)}</p>
        </div>
        <div class="card card-pad">
          <h3 class="h3" style="margin-bottom:10px">Termination conditions</h3>
          <p style="color:var(--text-2);line-height:1.65">${esc(ct.termination)}</p>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card">
          <div class="card-head"><h3>Payment schedule</h3></div>
          <div class="card-pad">
            ${pays.length ? pays.map(p => `
              <div class="metric-row">
                <div><div class="mr-label" style="font-weight:600;color:var(--navy)">${esc(p.milestone)}</div>
                  <div class="xsmall muted">${fmtINR(p.amount)}</div>
                </div>
                ${badge(p.status)}
              </div>`).join('') : '<p class="muted small">No payments recorded.</p>'}
          </div>
        </div>
        <div class="card">
          <div class="card-head"><h3>Documents</h3></div>
          <div class="card-pad">
            <div class="metric-row"><span class="mr-label">${icon('file')} Signed contract</span><span class="badge badge-success">Verified</span></div>
            <div class="metric-row"><span class="mr-label">${icon('file')} IP schedule</span><span class="badge badge-success">Verified</span></div>
            <div class="metric-row"><span class="mr-label">${icon('file')} Data sharing annex</span><span class="badge badge-success">Verified</span></div>
            <div style="margin-top:12px">
              <button class="btn btn-secondary btn-sm btn-block" data-noop>${icon('upload')}Upload document</button>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-head"><h3>Audit trail</h3></div>
          <div class="card-pad">
            ${renderAuditTimeline(Store.get('audit').filter(a => a.entity === ct.id || (a.details||'').includes(ct.id)).slice(0,5))}
          </div>
        </div>
      </div>
    </div>`;
}

/* ---------- Monitoring list ---------- */
Pages.monitoring = () => {
  const pilots = Store.get('pilots');
  return `
    <div class="content">
      <div class="page-head">
        <div class="ph-left"><h1 class="h1">Monitoring</h1><p>Live KPI tracking and risk monitoring for active pilots</p></div>
      </div>
      ${pilots.map(p => `
        <div class="card" style="margin-bottom:16px">
          <div class="card-head">
            <div>
              <h3>${esc(p.title)}</h3>
              <p>${esc(p.id)} · ${esc(p.geography)} · ${p.progress}% complete</p>
            </div>
            <div style="display:flex;gap:8px;align-items:center">
              ${badge(p.status)}
              <button class="btn btn-secondary btn-sm" data-pilot="${p.id}">${icon('eye')}View</button>
            </div>
          </div>
          <div class="card-pad">
            <div class="grid g-3" style="margin-bottom:16px">
              ${p.kpis.map(k => KpiChartCard(k)).join('')}
            </div>
            <div class="grid g-2">
              <div>
                <div class="h4" style="margin-bottom:8px">KPI trend</div>
                ${Chart.line([{name:'KPI', color:'var(--primary)', data:(p.trend||[]).map(t=>t.loss)}], {height:140, labels:(p.trend||[]).map(t=>t.week)})}
              </div>
              <div>
                <div class="h4" style="margin-bottom:8px">Milestone progress</div>
                ${p.milestones.map(m => `
                  <div style="margin-bottom:8px">
                    <div style="display:flex;justify-content:space-between;margin-bottom:3px">
                      <span class="small" style="font-weight:600">${esc(m.id)} · ${esc(m.name)}</span>
                      ${badge(m.status)}
                    </div>
                    <div class="progress ${m.status==='PAID'?'green':''}"><span style="width:${m.status==='PAID'?100:m.status.includes('AWAITING')?60:m.status==='IN_PROGRESS'?30:0}%;background:${m.status==='PAID'?'var(--success)':m.status.includes('AWAITING')?'var(--warning)':'var(--border-2)'}"></span></div>
                  </div>`).join('')}
              </div>
            </div>
          </div>
        </div>`).join('')}
    </div>`;
};

/* ---------- Payments ---------- */
Pages.payments = () => {
  const payments = Store.get('payments');
  const totalPaid = payments.filter(p => p.status === 'PAID').reduce((a,p) => a+p.amount, 0);
  const totalPending = payments.filter(p => ['AWAITING_VALIDATION','AWAITING_PAYMENT','PENDING_EVIDENCE'].includes(p.status)).reduce((a,p) => a+p.amount, 0);
  const totalLocked = payments.filter(p => p.status === 'LOCKED').reduce((a,p) => a+p.amount, 0);
  return `
    <div class="content">
      <div class="page-head">
        <div class="ph-left"><h1 class="h1">Payments</h1><p>Milestone-based payments · evidence-gated · every action requires a reason</p></div>
      </div>
      <div class="grid g-3" style="margin-bottom:20px">
        ${KpiCard({label:'Released', value:fmtINR(totalPaid), accent:'green', iconName:'checkCircle'})}
        ${KpiCard({label:'Pending', value:fmtINR(totalPending), accent:'amber', iconName:'clock'})}
        ${KpiCard({label:'Locked', value:fmtINR(totalLocked), accent:'blue', iconName:'lock'})}
      </div>
      ${renderPaymentsTable(payments, true)}
    </div>`;
};

function renderPaymentsTable(payments, interactive) {
  if (!payments.length) return EmptyState('payment','No payments','No milestone payments recorded for this contract.');
  return `
    <div class="tbl-wrap">
      <table>
        <thead><tr><th>Payment</th><th>Pilot / Contract</th><th>Milestone</th><th>Amount</th><th>Status</th><th>Approved by</th><th>${interactive ? 'Action' : ''}</th></tr></thead>
        <tbody>
          ${payments.map(p => {
            const pilot = Store.find('pilots', p.pilotId);
            const canAct = interactive && Session.role === 'accounts' && ['AWAITING_PAYMENT','AWAITING_VALIDATION','PENDING_EVIDENCE'].includes(p.status);
            return `
              <tr>
                <td><span class="mono" style="font-weight:700">${esc(p.id)}</span></td>
                <td><b class="small">${esc(pilot?.title || p.pilotId)}</b><div class="xsmall muted">${esc(p.contractId)}</div></td>
                <td><b>${esc(p.milestone)}</b></td>
                <td><b>${fmtINR(p.amount)}</b></td>
                <td>${badge(p.status)}</td>
                <td class="muted small">${esc(p.approvedBy || '—')}</td>
                <td>${canAct ? `
                  <div style="display:flex;gap:6px">
                    <button class="btn btn-success btn-sm" data-approve-payment="${p.id}">${icon('check')}Approve</button>
                    <button class="btn btn-secondary btn-sm" data-hold-payment="${p.id}">${icon('pause')}Hold</button>
                  </div>` : `<button class="btn btn-ghost btn-sm" data-payment-detail="${p.id}">${icon('eye')}View</button>`}
                </td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

/* ---------- Validation ---------- */
Pages.validation = () => {
  const validations = Store.get('validations');
  return `
    <div class="content">
      <div class="page-head">
        <div class="ph-left"><h1 class="h1">Independent Validation</h1><p>Validator compares baseline, startup-reported and independently verified values</p></div>
      </div>
      ${validations.map(v => renderValidationCard(v, true)).join('')}
    </div>`;
};

function renderValidationCard(v, full) {
  const pilot = Store.find('pilots', v.pilotId);
  const ch = pilot ? Store.find('challenges', pilot.challengeId) : null;
  const s = pilot ? Store.find('startups', pilot.startupId) : null;

  const cert = v.status === 'Validated' ? `
    <div class="cert" style="margin-top:16px">
      <div class="cert-head">
        <div class="cert-seal">${icon('award')}</div>
        <div>
          <div class="cert-id">VALIDATION CERTIFICATE · ${esc(v.id)}</div>
          <h2 class="h2" style="margin-top:4px">${esc(pilot?.title || '')}</h2>
          <div class="small muted">Issued ${esc(fmtDate(v.validatedAt))} by ${esc(v.validator)}</div>
        </div>
      </div>
      <div class="grid g-2" style="gap:12px;margin-bottom:16px">
        <div><div class="xsmall muted">Startup</div><div class="h4">${esc(s?.name || '')}</div></div>
        <div><div class="xsmall muted">Department</div><div class="h4">${esc(ch?.dept || '')}</div></div>
        <div><div class="xsmall muted">District</div><div class="h4">${esc(ch?.district || '')}</div></div>
        <div><div class="xsmall muted">Evidence items</div><div class="h4">${v.evidenceCount}</div></div>
      </div>
      <div style="border-top:1px solid var(--success-100);padding-top:14px">
        <div class="xsmall muted" style="margin-bottom:8px;text-transform:uppercase;letter-spacing:.06em;font-weight:700">Verified KPIs</div>
        ${v.kpis.map(k => `
          <div class="metric-row">
            <div><div class="mr-label" style="font-weight:600;color:var(--navy)">${esc(k.name)}</div>
              <div class="xsmall muted">Baseline ${esc(k.baseline)} · Reported ${esc(k.startupReported)}</div>
            </div>
            <div style="text-align:right">
              <div class="mr-val" style="color:var(--success)">${esc(k.verified)}</div>
              <div class="xsmall muted">${esc(k.status)}</div>
            </div>
          </div>`).join('')}
      </div>
      <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--success-100)">
        <div class="xsmall muted" style="margin-bottom:4px;text-transform:uppercase;letter-spacing:.06em;font-weight:700">Validator comments</div>
        <p class="small" style="color:var(--text-2)">${esc(v.comments)}</p>
      </div>
    </div>` : '';

  return `
    <div class="card" style="margin-bottom:16px">
      <div class="card-head">
        <div>
          <h3>${esc(pilot?.title || v.pilotId)}</h3>
          <p>${esc(v.id)} · ${esc(v.validator)}</p>
        </div>
        ${badge(v.status)}
      </div>
      <div class="card-pad">
        <div style="padding:14px;background:var(--surface-2);border-radius:10px;margin-bottom:16px">
          <div class="xsmall muted" style="margin-bottom:4px;text-transform:uppercase;letter-spacing:.06em;font-weight:700">Startup claim</div>
          <p style="color:var(--navy);font-weight:600">"${esc(v.startupClaim)}"</p>
          <div style="display:flex;gap:20px;margin-top:10px">
            <div><div class="xsmall muted">Claimed</div><div class="h4">${esc(v.claimedValue)}</div></div>
            <div><div class="xsmall muted">Independently verified</div><div class="h4" style="color:${v.status==='Validated'?'var(--success)':'var(--text-3)'}">${esc(v.verifiedValue)}</div></div>
            <div><div class="xsmall muted">Variance</div><div class="h4">${esc(v.variance)}</div></div>
          </div>
        </div>

        <div class="h4" style="margin-bottom:8px">KPI comparison</div>
        <div class="tbl-wrap" style="margin-bottom:16px">
          <table>
            <thead><tr><th>KPI</th><th>Baseline</th><th>Startup reported</th><th>Verified</th><th>Status</th></tr></thead>
            <tbody>
              ${v.kpis.map(k => `
                <tr>
                  <td style="font-weight:600">${esc(k.name)}</td>
                  <td class="muted">${esc(k.baseline)}</td>
                  <td>${esc(k.startupReported)}</td>
                  <td><b>${esc(k.verified)}</b></td>
                  <td>${badge(k.status)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>

        <div class="h4" style="margin-bottom:8px">Validator comments</div>
        <p class="small" style="color:var(--text-2);margin-bottom:16px">${esc(v.comments)}</p>

        ${cert}

        ${full && Session.role === 'validator' && v.status !== 'Validated' ? `
          <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap">
            <button class="btn btn-success" data-validate-pilot="${v.id}">${icon('checkCircle')}Approve & issue certificate</button>
            <button class="btn btn-secondary" data-request-evidence="${v.id}">${icon('upload')}Request more evidence</button>
            <button class="btn btn-danger" data-reject-validation="${v.id}">${icon('x')}Reject</button>
          </div>` : ''}
      </div>
    </div>`;
}

/* ---------- Scale-up ---------- */
Pages.scaleup = () => {
  const decisions = Store.get('scaleup');
  return `
    <div class="content">
      <div class="page-head">
        <div class="ph-left">
          <h1 class="h1">Scale-up Decisions</h1>
          <p>Decision support only — the authorised officer makes the final call, with reason and evidence reference</p>
        </div>
      </div>

      ${decisions.map(d => {
        const pilot = Store.find('pilots', d.pilotId);
        const ch = Store.find('challenges', d.challengeId);
        const s = pilot ? Store.find('startups', pilot.startupId) : null;
        const validation = Store.get('validations').find(v => v.pilotId === d.pilotId);
        return `
          <div class="card" style="margin-bottom:20px">
            <div class="card-head">
              <div><h3>${esc(pilot?.title || d.pilotId)}</h3><p>${esc(d.id)} · ${esc(s?.name || '')} · ${esc(ch?.district || '')}</p></div>
              ${badge(d.status)}
            </div>
            <div class="card-pad">
              ${PublicValuePanel(pilot, validation)}
              <div class="grid g-2-1">
                <div>
                  <div class="h4" style="margin-bottom:10px">Pilot outcome summary</div>
                  <div class="grid g-3" style="gap:12px;margin-bottom:16px">
                    ${(pilot?.kpis || []).map(k => `
                      <div style="padding:12px;border:1px solid var(--border);border-radius:10px">
                        <div class="xsmall muted">${esc(k.name)}</div>
                        <div class="h2" style="color:${k.status==='ACHIEVED'?'var(--success)':k.status==='NEAR'?'var(--warning)':'var(--text-3)'};margin:4px 0">${esc(String(k.current))}${esc(k.unit||'')}</div>
                        <div class="xsmall muted">Target ${esc(String(k.target))}${esc(k.unit||'')}</div>
                      </div>`).join('')}
                  </div>

                  <div class="h4" style="margin-bottom:10px">Decision support matrix</div>
                  <div class="matrix" style="margin-bottom:16px">
                    ${Object.entries(d.matrix).map(([k,v]) => {
                      const tone = v === 'High' ? 'success' : v === 'Medium' ? 'warning' : 'danger';
                      const label = k.charAt(0).toUpperCase() + k.slice(1);
                      return `<div class="matrix-cell"><div class="mc-label">${esc(label)}</div><div class="mc-val" style="color:var(--${tone})">${esc(v)}</div></div>`;
                    }).join('')}
                  </div>

                  <div style="padding:14px;background:var(--primary-50);border:1px solid var(--primary-100);border-radius:10px;margin-bottom:16px">
                    <div class="xsmall" style="font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">${icon('sparkles')} Decision support</div>
                    <p class="small" style="color:var(--text-2)">${esc(d.recommendation)}</p>
                    <p class="xsmall muted" style="margin-top:8px">This is automated decision support. The authorised officer must review and make the final government decision.</p>
                  </div>

                  ${Session.role === 'gov' && d.status === 'Pending' ? `
                    <div class="h4" style="margin-bottom:10px">Choose a pathway</div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
                      ${['Continue pilot','Extend pilot','Departmental procurement','Multi-district scale-up','Re-evaluation','Close pilot'].map(opt => `
                        <button class="btn btn-secondary" data-scaleup-decision="${d.id}" data-decision="${esc(opt)}">${esc(opt)}</button>`).join('')}
                    </div>` : ''}

                  ${d.decision ? `
                    <div class="card card-pad" style="background:var(--success-50);border-color:var(--success-100)">
                      <div class="h4" style="color:var(--success);margin-bottom:6px">${icon('checkCircle')} Decision recorded</div>
                      <div class="grid g-2" style="gap:10px">
                        <div><div class="xsmall muted">Decision</div><div class="h4">${esc(d.decision)}</div></div>
                        <div><div class="xsmall muted">Decided by</div><div class="h4">${esc(d.officer)}</div></div>
                        <div><div class="xsmall muted">Date</div><div class="h4">${esc(fmtDate(d.decidedAt))}</div></div>
                        <div><div class="xsmall muted">Evidence reference</div><div class="h4">${esc(d.evidenceRef)}</div></div>
                      </div>
                      <div style="margin-top:10px"><div class="xsmall muted">Reason</div><p class="small">${esc(d.reason)}</p></div>
                    </div>` : ''}
                </div>

                <div style="display:flex;flex-direction:column;gap:16px">
                  <div class="card card-pad">
                    <h3 class="h3" style="margin-bottom:12px">Readiness checks</h3>
                    <div class="metric-row"><span class="mr-label">KPI performance</span><span class="mr-val" style="color:var(--success)">${(pilot?.kpis||[]).filter(k=>k.status==='ACHIEVED').length}/${(pilot?.kpis||[]).length} achieved</span></div>
                    <div class="metric-row"><span class="mr-label">Independent validation</span>${validation?.status === 'Validated' ? '<span class="badge badge-success">Validated</span>' : '<span class="badge badge-warning">Pending</span>'}</div>
                    <div class="metric-row"><span class="mr-label">Evidence completeness</span><span class="mr-val">96%</span></div>
                    <div class="metric-row"><span class="mr-label">Risk level</span><span class="mr-val">${esc(pilot?.riskLevel || '—')}</span></div>
                    <div class="metric-row"><span class="mr-label">Compliance</span><span class="badge badge-success">Cleared</span></div>
                    <div class="metric-row"><span class="mr-label">Budget utilisation</span><span class="mr-val">${fmtLakh((pilot?.milestones||[]).filter(m=>m.status==='PAID').reduce((a,m)=>a+m.amount,0))}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>`;
      }).join('') || EmptyState('scaleup','No scale-up decisions pending','Validated pilots will appear here for scale-up consideration.')}
    </div>`;
};

/* ---------- Evidence Vault ---------- */
Pages.evidence = () => {
  const evidence = Store.get('evidence');
  const filters = Router.filters || {};
  const filtered = evidence.filter(e =>
    (!filters.status || e.status === filters.status) &&
    (!filters.type || e.type === filters.type) &&
    (!filters.q || (e.name + e.type + e.uploadedBy).toLowerCase().includes(filters.q.toLowerCase()))
  );
  const types = [...new Set(evidence.map(e => e.type))];

  return `
    <div class="content">
      <div class="page-head">
        <div class="ph-left"><h1 class="h1">Evidence Vault</h1><p>${evidence.length} evidence items · every item is traceable to a milestone, KPI and verifier</p></div>
      </div>

      <div class="filter-bar">
        <input class="input" placeholder="Search evidence…" value="${esc(filters.q||'')}" data-filter="q" />
        <select class="select" data-filter="type">
          <option value="">All types</option>
          ${types.map(t => `<option ${filters.type===t?'selected':''}>${esc(t)}</option>`).join('')}
        </select>
        <select class="select" data-filter="status">
          <option value="">All statuses</option>
          ${['Submitted','Under review','Verified','Rejected'].map(s => `<option ${filters.status===s?'selected':''}>${esc(s)}</option>`).join('')}
        </select>
        ${Object.keys(filters).length ? `<button class="btn btn-ghost btn-sm" data-clear-filters>${icon('x')}Clear</button>` : ''}
      </div>

      ${filtered.length ? `<div class="grid g-3">${filtered.map(e => EvidenceCard(e)).join('')}</div>` : EmptyState('evidence','No evidence matches your filters','')}
    </div>`;
};

/* ---------- Analytics ---------- */
Pages.analytics = () => {
  const challenges = Store.get('challenges');
  const applications = Store.get('applications');
  const pilots = Store.get('pilots');
  const payments = Store.get('payments');
  const validations = Store.get('validations');

  const byDept = {};
  challenges.forEach(c => byDept[c.dept] = (byDept[c.dept] || 0) + 1);
  const byDistrict = {};
  challenges.forEach(c => byDistrict[c.district] = (byDistrict[c.district] || 0) + 1);

  const completed = pilots.filter(p => ['Completed','Validated'].includes(p.status)).length;
  const validationRate = pilots.length ? Math.round(validations.filter(v=>v.status==='Validated').length / pilots.length * 100) : 0;
  const paidTotal = payments.filter(p=>p.status==='PAID').reduce((a,p)=>a+p.amount,0);

  const pilotOutcomes = [
    { label:'Validated', value: pilots.filter(p=>p.status==='Validated').length, color:'var(--success)' },
    { label:'Completed', value: pilots.filter(p=>p.status==='Completed').length, color:'var(--primary)' },
    { label:'Active', value: pilots.filter(p=>p.status==='Active').length, color:'var(--warning)' },
    { label:'Pending', value: pilots.filter(p=>p.status==='Pending').length, color:'var(--text-4)' }
  ];

  return `
    <div class="content">
      <div class="page-head">
        <div class="ph-left"><h1 class="h1">Analytics</h1><p>Programme-wide metrics across departments, districts and financial years</p></div>
      </div>

      <div class="grid g-4" style="margin-bottom:20px">
        ${KpiCard({label:'Total Challenges', value:challenges.length, accent:'blue', iconName:'challenge'})}
        ${KpiCard({label:'Applications', value:applications.length, accent:'purple', iconName:'startup'})}
        ${KpiCard({label:'Pilots', value:pilots.length, accent:'amber', iconName:'pilot'})}
        ${KpiCard({label:'Completed Pilots', value:completed, accent:'green', iconName:'checkCircle'})}
        ${KpiCard({label:'Validation Rate', value:validationRate + '%', accent:'green', iconName:'validation'})}
        ${KpiCard({label:'Avg Evaluation Time', value:'8.4 days', accent:'blue', iconName:'clock'})}
        ${KpiCard({label:'Avg Pilot Duration', value:'98 days', accent:'purple', iconName:'calendar'})}
        ${KpiCard({label:'Payment Turnaround', value:'3.2 days', accent:'green', iconName:'payment'})}
      </div>

      <div class="grid g-2" style="margin-bottom:20px">
        <div class="card">
          <div class="card-head"><h3>Challenges by department</h3></div>
          <div class="card-pad">
            ${Chart.bars(Object.entries(byDept).map(([label, value]) => ({label, value, color:'var(--primary)'})), {height:200})}
          </div>
        </div>
        <div class="card">
          <div class="card-head"><h3>District participation</h3></div>
          <div class="card-pad">
            ${Chart.bars(Object.entries(byDistrict).map(([label, value]) => ({label, value, color:'var(--info)'})), {height:200})}
          </div>
        </div>
      </div>

      <div class="grid g-2" style="margin-bottom:20px">
        <div class="card">
          <div class="card-head"><h3>Pipeline distribution</h3></div>
          <div class="card-pad">
            ${Chart.bars(STAGES.map(s => ({label:s.name, value:challenges.filter(c=>c.stage===s.key).length, color:'var(--primary)'})), {height:200})}
          </div>
        </div>
        <div class="card">
          <div class="card-head"><h3>Pilot outcomes</h3></div>
          <div class="card-pad" style="display:flex;align-items:center;gap:24px;flex-wrap:wrap">
            ${Chart.donut(pilotOutcomes, {size:160})}
            <div>
              ${pilotOutcomes.map(o => `
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                  <span style="width:10px;height:10px;border-radius:2px;background:${o.color}"></span>
                  <span class="small">${esc(o.label)}</span>
                  <b class="small" style="margin-left:auto">${o.value}</b>
                </div>`).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h3>Budget allocation & payments</h3><p>Total released: ${fmtINR(paidTotal)}</p></div>
        <div class="card-pad">
          <div class="grid g-2">
            <div>
              <div class="h4" style="margin-bottom:8px">Contracted value by pilot</div>
              ${Chart.hbars(pilots.map(p => ({label:p.id + ' · ' + (Store.find('startups',p.startupId)?.name||''), value:Math.round(p.budget/100000), color:'var(--primary)'})))}
            </div>
            <div>
              <div class="h4" style="margin-bottom:8px">Payment status distribution</div>
              ${Chart.hbars([
                {label:'Released', value:payments.filter(p=>p.status==='PAID').length, color:'var(--success)'},
                {label:'Awaiting validation', value:payments.filter(p=>p.status==='AWAITING_VALIDATION').length, color:'var(--warning)'},
                {label:'Awaiting payment', value:payments.filter(p=>p.status==='AWAITING_PAYMENT').length, color:'var(--warning)'},
                {label:'Pending evidence', value:payments.filter(p=>p.status==='PENDING_EVIDENCE').length, color:'var(--danger)'},
                {label:'Locked', value:payments.filter(p=>p.status==='LOCKED').length, color:'var(--text-4)'}
              ])}
            </div>
          </div>
        </div>
      </div>
    </div>`;
};

/* ---------- Public Value ---------- */
Pages.publicValue = () => {
  const pilots = Store.get('pilots').filter(p => p.status !== 'Pending');
  return `
    <div class="content">
      <div class="page-head">
        <div class="ph-left">
          <h1 class="h1">Public Value</h1>
          <p>Impact created by validated pilots — measured against declared baselines and targets</p>
        </div>
      </div>
      ${pilots.length ? pilots.map(p => {
        const v = Store.get('validations').find(x => x.pilotId === p.id);
        return `<div style="margin-bottom:24px">${PublicValuePanel(p, v)}</div>`;
      }).join('') : EmptyState('trendingUp','No pilots to report','Public value will appear once pilots begin collecting KPI data.')}
    </div>`;
};

/* ---------- Templates ---------- */
Pages.templates = () => {
  const templates = Store.get('templates');
  return `
    <div class="content">
      <div class="page-head">
        <div class="ph-left"><h1 class="h1">Template Library</h1><p>Standard templates for problem statements, contracts, data/IP clauses, cybersecurity, risk and validation</p></div>
      </div>
      <div class="tbl-wrap">
        <table>
          <thead><tr><th>Template</th><th>Category</th><th>Version</th><th>Owner</th><th>Last updated</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${templates.map(t => `
              <tr>
                <td><b>${esc(t.name)}</b></td>
                <td>${badge(t.category)}</td>
                <td class="mono small">${esc(t.version)}</td>
                <td class="muted small">${esc(t.owner)}</td>
                <td class="muted small">${esc(fmtDate(t.updated))}</td>
                <td>${badge(t.status)}</td>
                <td>
                  <div style="display:flex;gap:4px">
                    <button class="btn btn-ghost btn-sm" data-template-view="${t.id}">${icon('eye')}</button>
                    <button class="btn btn-ghost btn-sm" data-template-duplicate="${t.id}">${icon('file')}</button>
                    <button class="btn btn-ghost btn-sm" data-template-edit="${t.id}">${icon('edit')}</button>
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
};

/* ---------- Audit Log ---------- */
Pages.audit = () => {
  const events = [...Store.get('audit')].sort((a,b) => new Date(b.ts) - new Date(a.ts));
  return `
    <div class="content">
      <div class="page-head">
        <div class="ph-left"><h1 class="h1">Audit Log</h1><p>Immutable record of every significant action across the platform</p></div>
      </div>
      <div class="card">
        <div class="card-pad">
          ${renderAuditTimeline(events)}
        </div>
      </div>
    </div>`;
};

function renderAuditTimeline(events) {
  if (!events.length) return EmptyState('audit','No audit events','');
  return `
    <div class="timeline">
      ${events.map(e => `
        <div class="tl-item">
          <div class="tl-dot done">${icon('check')}</div>
          <div class="tl-head">
            <b>${esc(e.action)}</b>
            <span class="badge badge-neutral">${esc(e.entity)}</span>
          </div>
          <div class="tl-meta">${esc(e.user)} · ${esc(e.role)} · ${esc(fmtDateTime(e.ts))}</div>
          <div class="small muted" style="margin-top:3px">${esc(e.details)}</div>
        </div>`).join('')}
    </div>`;
}

/* ---------- Settings ---------- */
Pages.settings = () => {
  return `
    <div class="content">
      <div class="page-head">
        <div class="ph-left"><h1 class="h1">Settings</h1><p>Workflow rules, evaluation rubrics and demo controls</p></div>
      </div>
      <div class="grid g-2">
        <div class="card">
          <div class="card-head"><h3>Evaluation rubric</h3><p>Configured weights must total 100%</p></div>
          <div class="card-pad">
            ${Store.get('rubric').map(r => `
              <div class="metric-row">
                <span class="mr-label">${esc(r.name)}</span>
                <span class="mr-val">${r.weight}%</span>
              </div>`).join('')}
            <div class="metric-row" style="font-weight:700">
              <span class="mr-label" style="font-weight:700;color:var(--navy)">Total</span>
              <span class="mr-val" style="color:var(--success)">${Store.get('rubric').reduce((a,r)=>a+r.weight,0)}%</span>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-head"><h3>Demo controls</h3><p>Reset or advance the demonstration state</p></div>
          <div class="card-pad">
            <p class="small muted" style="margin-bottom:12px">These controls are for demonstration purposes. Reset restores initial mock data; Advance progresses CH-018 to its next valid stage.</p>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button class="btn btn-secondary" data-reset-demo>${icon('refresh')}Reset demo data</button>
              <button class="btn btn-primary" data-advance-demo>${icon('play')}Advance CH-018 workflow</button>
              <button class="btn btn-secondary" data-run-demo>${icon('zap')}Run full demo</button>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-head"><h3>Departments</h3></div>
          <div class="card-pad">
            ${Store.get('departments').map(d => `
              <div class="metric-row"><span class="mr-label">${esc(d.name)}</span><span class="badge badge-neutral">${esc(d.short)}</span></div>`).join('')}
          </div>
        </div>
        <div class="card">
          <div class="card-head"><h3>Automation vs government decision</h3></div>
          <div class="card-pad">
            <div style="padding:12px;background:var(--primary-50);border-radius:10px;margin-bottom:12px">
              <div class="h4" style="color:var(--primary);margin-bottom:6px">${icon('sparkles')} The platform may:</div>
              <ul style="padding-left:18px;color:var(--text-2);font-size:13px;line-height:1.8">
                <li>Suggest KPIs and structured problem statements</li>
                <li>Compute weighted evaluation scores</li>
                <li>Flag risks and summarise evidence</li>
                <li>Match startups to challenges</li>
              </ul>
            </div>
            <div style="padding:12px;background:var(--success-50);border-radius:10px">
              <div class="h4" style="color:var(--success);margin-bottom:6px">${icon('shield')} Authorised humans decide:</div>
              <ul style="padding-left:18px;color:var(--text-2);font-size:13px;line-height:1.8">
                <li>Eligibility override</li>
                <li>Pilot approval</li>
                <li>Payment approval</li>
                <li>Independent validation</li>
                <li>Scale-up decision</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>`;
};

/* ============================================================
   13. CHALLENGE CREATION WIZARD
   ============================================================ */
const Wizard = {
  step: 1,
  data: {},
  steps: ['Problem','Desired outcome','KPIs','Eligibility','Budget & timeline','Risk & compliance','Review & publish'],
  open() {
    this.step = 1;
    this.data = { kpis: [{name:'', baseline:'', target:''}] };
    this.render();
  },
  render() {
    const d = this.data;
    const s = this.step;
    let body = '';

    if (s === 1) body = `
      <div class="field"><label>Challenge title <span class="req">*</span></label>
        <input class="input" id="w-title" value="${esc(d.title||'')}" placeholder="e.g. Early Flood Alerts for Low-Lying Wards" /></div>
      <div class="grid g-2" style="gap:12px">
        <div class="field"><label>Department <span class="req">*</span></label>
          <select class="select" id="w-dept"><option value="">Select department</option>
            ${Store.get('departments').map(dp => `<option ${d.dept===dp.name?'selected':''}>${esc(dp.name)}</option>`).join('')}
          </select></div>
        <div class="field"><label>District <span class="req">*</span></label>
          <select class="select" id="w-district"><option value="">Select district</option>
            ${DISTRICTS.map(x => `<option ${d.district===x?'selected':''}>${esc(x)}</option>`).join('')}
          </select></div>
      </div>
      <div class="field"><label>Problem description <span class="req">*</span></label>
        <textarea class="textarea" id="w-problem" placeholder="Describe the operational problem in plain language…">${esc(d.problem||'')}</textarea>
        <div class="hint">Write freely — you can use AI assistance to structure this into a formal problem statement.</div>
        <button class="btn btn-secondary btn-sm" style="align-self:flex-start;margin-top:4px" data-ai-improve>${icon('sparkles')}Improve with AI</button>
      </div>
      <div class="field"><label>Current baseline <span class="req">*</span></label>
        <textarea class="textarea" id="w-baseline" placeholder="What are the current measured values?">${esc(d.baseline||'')}</textarea></div>
    `;

    if (s === 2) body = `
      <div class="field"><label>Desired outcome <span class="req">*</span></label>
        <textarea class="textarea" id="w-outcome" placeholder="What measurable outcome should the solution achieve?">${esc(d.outcome||'')}</textarea></div>
      <div class="field"><label>Target population / users</label>
        <textarea class="textarea" id="w-users" placeholder="Who benefits and how many?">${esc(d.users||'')}</textarea></div>
      <div class="field"><label>Expected impact</label>
        <textarea class="textarea" id="w-impact" placeholder="Expected impact on citizens, operations, cost…">${esc(d.impact||'')}</textarea></div>
    `;

    if (s === 3) body = `
      <p class="small muted" style="margin-bottom:12px">Define measurable KPIs. Baselines and targets are required for each.</p>
      <div id="w-kpis">
        ${(d.kpis||[]).map((k,i) => `
          <div class="card card-pad" style="margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <b class="small">KPI ${i+1}</b>
              ${(d.kpis.length > 1) ? `<button class="btn btn-ghost btn-sm" data-remove-kpi="${i}">${icon('x')}</button>` : ''}
            </div>
            <div class="field" style="margin-bottom:8px"><label>Name</label>
              <input class="input kpi-name" data-idx="${i}" value="${esc(k.name)}" placeholder="e.g. Flood warning lead time" /></div>
            <div class="grid g-2" style="gap:8px">
              <div class="field" style="margin-bottom:0"><label>Baseline</label>
                <input class="input kpi-baseline" data-idx="${i}" value="${esc(k.baseline)}" placeholder="e.g. 20 min" /></div>
              <div class="field" style="margin-bottom:0"><label>Target</label>
                <input class="input kpi-target" data-idx="${i}" value="${esc(k.target)}" placeholder="e.g. 120 min" /></div>
            </div>
          </div>`).join('')}
      </div>
      <button class="btn btn-secondary btn-sm" data-add-kpi>${icon('plus')}Add KPI</button>
    `;

    if (s === 4) body = `
      <div class="field"><label>Eligibility requirements</label>
        <textarea class="textarea" id="w-eligibility" placeholder="e.g. DPIIT-recognised startup; prior municipal deployment; ISO 27001">${esc(d.eligibility||'')}</textarea></div>
      <div class="field"><label>Required technology</label>
        <textarea class="textarea" id="w-tech" placeholder="Describe the technology category, not a specific vendor">${esc(d.tech||'')}</textarea></div>
      <div class="field"><label>Data requirements</label>
        <textarea class="textarea" id="w-dataReq" placeholder="What data will the solution need access to?">${esc(d.dataReq||'')}</textarea></div>
      <div class="field"><label>Security requirements</label>
        <textarea class="textarea" id="w-secReq" placeholder="Encryption, access control, incident reporting…">${esc(d.secReq||'')}</textarea></div>
      <div class="field"><label>IP requirements</label>
        <textarea class="textarea" id="w-ipReq" placeholder="IP ownership, licensing, escrow…">${esc(d.ipReq||'')}</textarea></div>
    `;

    if (s === 5) body = `
      <div class="grid g-2" style="gap:12px">
        <div class="field"><label>Estimated budget (₹) <span class="req">*</span></label>
          <input class="input" type="number" id="w-budget" value="${d.budget||''}" placeholder="1800000" /></div>
        <div class="field"><label>Pilot duration (days) <span class="req">*</span></label>
          <input class="input" type="number" id="w-duration" value="${d.duration||''}" placeholder="90" /></div>
      </div>
      <div class="field"><label>Priority</label>
        <select class="select" id="w-priority">
          <option ${d.priority==='Low'?'selected':''}>Low</option>
          <option ${d.priority==='Medium'?'selected':''} ${!d.priority?'selected':''}>Medium</option>
          <option ${d.priority==='High'?'selected':''}>High</option>
        </select></div>
    `;

    if (s === 6) body = `
      <div class="field"><label>Risk level</label>
        <select class="select" id="w-risk-level">
          <option ${d.risk==='Low'?'selected':''}>Low</option>
          <option ${d.risk==='Medium'?'selected':''} ${!d.risk?'selected':''}>Medium</option>
          <option ${d.risk==='High'?'selected':''}>High</option>
        </select></div>
      <div class="card card-pad" style="background:var(--surface-2)">
        <div class="h4" style="margin-bottom:10px">Compliance checklist</div>
        ${[
          ['Data protection review','dataProtection'],
          ['Cybersecurity review','cyber'],
          ['IP clause reviewed','ip'],
          ['Procurement pathway confirmed','procurement'],
          ['Risk assessment completed','riskAssessment']
        ].map(([label,key]) => `
          <label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer">
            <input type="checkbox" id="w-${key}" ${d.compliance && d.compliance[key] ? 'checked' : ''} style="width:16px;height:16px;accent-color:var(--primary)" />
            <span class="small">${esc(label)}</span>
          </label>`).join('')}
      </div>
    `;

    if (s === 7) {
      const kpis = (d.kpis||[]).filter(k => k.name);
      body = `
        <div class="card card-pad" style="margin-bottom:12px">
          <h3 class="h3" style="margin-bottom:12px">${esc(d.title || 'Untitled challenge')}</h3>
          <div class="metric-row"><span class="mr-label">Department</span><span class="mr-val">${esc(d.dept||'—')}</span></div>
          <div class="metric-row"><span class="mr-label">District</span><span class="mr-val">${esc(d.district||'—')}</span></div>
          <div class="metric-row"><span class="mr-label">Budget</span><span class="mr-val">${d.budget ? fmtINR(+d.budget) : '—'}</span></div>
          <div class="metric-row"><span class="mr-label">Duration</span><span class="mr-val">${d.duration ? d.duration + ' days' : '—'}</span></div>
          <div class="metric-row"><span class="mr-label">Priority</span><span class="mr-val">${esc(d.priority||'Medium')}</span></div>
          <div class="metric-row"><span class="mr-label">Risk</span><span class="mr-val">${esc(d.risk||'Medium')}</span></div>
        </div>
        <div class="card card-pad" style="margin-bottom:12px">
          <div class="h4" style="margin-bottom:8px">Problem statement</div>
          <p class="small" style="color:var(--text-2)">${esc(d.problem||'—')}</p>
        </div>
        <div class="card card-pad" style="margin-bottom:12px">
          <div class="h4" style="margin-bottom:8px">Desired outcome</div>
          <p class="small" style="color:var(--text-2)">${esc(d.outcome||'—')}</p>
        </div>
        ${kpis.length ? `<div class="card card-pad">
          <div class="h4" style="margin-bottom:8px">KPIs (${kpis.length})</div>
          ${kpis.map(k => `<div class="metric-row"><span class="mr-label">${esc(k.name)}</span><span class="mr-val">${esc(k.baseline)} → ${esc(k.target)}</span></div>`).join('')}
        </div>` : ''}
      `;
    }

    Modal.open(
      `New Challenge · Step ${s} of 7 — ${esc(this.steps[s-1])}`,
      `<div style="display:flex;gap:6px;margin-bottom:18px">
        ${this.steps.map((st,i) => `<div style="flex:1;height:4px;border-radius:2px;background:${i < s ? 'var(--primary)' : 'var(--border)'}"></div>`).join('')}
      </div>${body}`,
      `<button class="btn btn-secondary" data-wizard-cancel>Cancel</button>
       ${s > 1 ? `<button class="btn btn-secondary" data-wizard-prev>${icon('chevronLeft')}Back</button>` : ''}
       ${s < 7 ? `<button class="btn btn-primary" data-wizard-next>Next${icon('chevronRight')}</button>`
               : `<button class="btn btn-secondary" data-wizard-draft>Save as draft</button>
                  <button class="btn btn-primary" data-wizard-publish>${icon('check')}Publish challenge</button>`}`
    );
  },
  collect() {
    const d = this.data;
    const g = (id) => { const el = $('#'+id); return el ? el.value.trim() : undefined; };
    if (this.step === 1) {
      d.title = g('w-title') ?? d.title;
      d.dept = g('w-dept') ?? d.dept;
      d.district = g('w-district') ?? d.district;
      d.problem = g('w-problem') ?? d.problem;
      d.baseline = g('w-baseline') ?? d.baseline;
    }
    if (this.step === 2) {
      d.outcome = g('w-outcome') ?? d.outcome;
      d.users = g('w-users') ?? d.users;
      d.impact = g('w-impact') ?? d.impact;
    }
    if (this.step === 3) {
      d.kpis = (d.kpis||[]).map((k,i) => {
        const n = $(`.kpi-name[data-idx="${i}"]`);
        const b = $(`.kpi-baseline[data-idx="${i}"]`);
        const t = $(`.kpi-target[data-idx="${i}"]`);
        return { name: n ? n.value.trim() : k.name, baseline: b ? b.value.trim() : k.baseline, target: t ? t.value.trim() : k.target };
      });
    }
    if (this.step === 4) {
      d.eligibility = g('w-eligibility') ?? d.eligibility;
      d.tech = g('w-tech') ?? d.tech;
      d.dataReq = g('w-dataReq') ?? d.dataReq;
      d.secReq = g('w-secReq') ?? d.secReq;
      d.ipReq = g('w-ipReq') ?? d.ipReq;
    }
    if (this.step === 5) {
      d.budget = g('w-budget') ?? d.budget;
      d.duration = g('w-duration') ?? d.duration;
      d.priority = g('w-priority') ?? d.priority;
    }
    if (this.step === 6) {
      d.risk = g('w-risk-level') ?? d.risk;
      d.compliance = {
        dataProtection: $('#w-dataProtection')?.checked || false,
        cyber: $('#w-cyber')?.checked || false,
        ip: $('#w-ip')?.checked || false,
        procurement: $('#w-procurement')?.checked || false,
        risk: $('#w-riskAssessment')?.checked || false
      };
    }
  },
  next() {
    this.collect();
    const d = this.data;
    if (this.step === 1) {
      if (!d.title || !d.dept || !d.district || !d.problem || !d.baseline) { Toast.show('error','Missing fields','Title, department, district, problem and baseline are required.'); return; }
    }
    if (this.step === 2) {
      if (!d.outcome) { Toast.show('error','Missing outcome','A measurable desired outcome is required.'); return; }
    }
    if (this.step === 3) {
      const valid = (d.kpis||[]).filter(k => k.name && k.baseline && k.target);
      if (!valid.length) { Toast.show('error','No KPIs','At least one KPI with name, baseline and target is required.'); return; }
      d.kpis = valid;
    }
    if (this.step === 5) {
      if (!d.budget || !d.duration) { Toast.show('error','Missing budget or duration','Budget and duration are required.'); return; }
    }
    this.step++;
    this.render();
  },
  prev() { this.collect(); this.step--; this.render(); },
  save(publish) {
    this.collect();
    const d = this.data;
    if (!d.title || !d.problem || !d.outcome) { Toast.show('error','Cannot save','Title, problem and outcome are required.'); return; }
    const id = 'CH-' + String(Store.get('challenges').length + 31).padStart(3,'0');
    const challenge = {
      id, title: d.title, dept: d.dept || 'Urban Development', district: d.district || 'Ranipur',
      stage: publish ? 'DISCOVERY' : 'CHALLENGE',
      priority: d.priority || 'Medium', day: 0,
      status: publish ? 'Discovering' : 'Draft',
      problem: d.problem, baseline: d.baseline || '—', outcome: d.outcome,
      users: d.users || '—', budget: +d.budget || 1000000, duration: +d.duration || 90,
      risk: d.risk || 'Medium',
      kpis: (d.kpis||[]).filter(k=>k.name).map(k => ({name:k.name, baseline:k.baseline, target:k.target, current:'—', unit:'', dir:'up'})),
      compliance: d.compliance || {dataProtection:false, cyber:false, ip:false, procurement:false, risk:false},
      tech: d.tech || '—', dataReq: d.dataReq || '—', secReq: d.secReq || '—', ipReq: d.ipReq || '—',
      eligibility: d.eligibility || 'DPIIT-recognised startup.'
    };
    Store.add('challenges', challenge);
    Store.add('audit', {
      ts: new Date().toISOString(), user: Session.persona()?.name || 'Officer', role: 'Government Officer',
      action: publish ? 'Challenge published' : 'Challenge created as draft', entity: id,
      details: `${id} "${challenge.title}" ${publish ? 'published to discovery' : 'saved as draft'}.`
    });
    if (publish) {
      Store.add('notifications', {
        ts: new Date().toISOString(), title:'New challenge published', body:`${id} ${challenge.title} is open for discovery.`,
        type:'info', read:false, link:`#/challenges/${id}`, role:'startup'
      });
    }
    Modal.close();
    Toast.show('success', publish ? 'Challenge published successfully' : 'Draft saved', `${id} · ${challenge.title}`);
    Router.go('challenges/' + id);
  }
};

/* ---------- AI Assistance ---------- */
const AIAssist = {
  improve() {
    const problemEl = $('#w-problem');
    const text = problemEl ? problemEl.value.trim() : '';
    if (!text || text.length < 10) { Toast.show('warning','Not enough detail','Please describe the problem before using AI assistance.'); return; }

    const structured = this.structure(text);
    if ($('#w-problem')) $('#w-problem').value = structured.problem;
    if ($('#w-baseline')) $('#w-baseline').value = structured.baseline;
    Wizard.data.problem = structured.problem;
    Wizard.data.baseline = structured.baseline;
    Wizard.data.outcome = structured.outcome;
    Wizard.data.kpis = structured.kpis;

    Modal.close();
    Modal.open('AI assistance — review required',
      `<div style="padding:12px;background:var(--primary-50);border-radius:10px;margin-bottom:16px">
        <div class="h4" style="color:var(--primary);margin-bottom:4px">${icon('sparkles')} AI-assisted decision support</div>
        <p class="small" style="color:var(--text-2)">The content below was generated from your description. You must review and approve it before publishing. AI does not make government decisions.</p>
      </div>

      <div class="card card-pad" style="margin-bottom:12px">
        <div class="h4" style="margin-bottom:6px">Structured problem statement</div>
        <p class="small" style="color:var(--text-2)">${esc(structured.problem)}</p>
      </div>
      <div class="card card-pad" style="margin-bottom:12px">
        <div class="h4" style="margin-bottom:6px">Suggested measurable outcome</div>
        <p class="small" style="color:var(--text-2)">${esc(structured.outcome)}</p>
      </div>
      <div class="card card-pad" style="margin-bottom:12px">
        <div class="h4" style="margin-bottom:8px">Suggested KPIs</div>
        ${structured.kpis.map(k => `
          <div class="metric-row">
            <div><div class="mr-label" style="font-weight:600;color:var(--navy)">${esc(k.name)}</div>
              <div class="xsmall muted">Baseline ${esc(k.baseline)} → Target ${esc(k.target)}</div>
            </div>
            <span class="badge badge-info">Suggested</span>
          </div>`).join('')}
      </div>
      <div class="card card-pad" style="margin-bottom:12px">
        <div class="h4" style="margin-bottom:6px">Potential risks</div>
        <ul style="padding-left:18px;color:var(--text-2);font-size:13px;line-height:1.8">
          ${structured.risks.map(r => `<li>${esc(r)}</li>`).join('')}
        </ul>
      </div>
      <div class="card card-pad">
        <div class="h4" style="margin-bottom:6px">Suggested eligibility criteria</div>
        <ul style="padding-left:18px;color:var(--text-2);font-size:13px;line-height:1.8">
          ${structured.eligibility.map(r => `<li>${esc(r)}</li>`).join('')}
        </ul>
      </div>`,
      `<button class="btn btn-secondary" data-ai-cancel>Discard</button>
       <button class="btn btn-primary" data-ai-accept>${icon('check')}Accept and continue</button>`
    );
  },
  structure(text) {
    const lower = text.toLowerCase();
    let problem = `High operational inefficiency due to delayed detection and manual processes. ${text}`;
    let outcome = 'Achieve measurable improvement in detection time, coverage and service reliability.';
    let baseline = 'Current baseline to be confirmed by department records.';
    let kpis = [
      {name:'Detection time', baseline:'48 hours', target:'<12 hours'},
      {name:'Coverage', baseline:'55%', target:'>90%'},
      {name:'Error rate', baseline:'28%', target:'<10%'}
    ];
    let risks = ['Data availability and quality from legacy systems','Integration with existing departmental workflows','Cybersecurity review timeline'];
    let eligibility = ['DPIIT-recognised startup','Prior deployment in a relevant government domain','ISO 27001 or equivalent security certification'];

    if (lower.includes('leak') || lower.includes('water')) {
      problem = 'High non-revenue water loss due to delayed leak detection and unmetered flow in ward supply networks.';
      outcome = 'Reduce non-revenue water loss below 20% and cut leak response time under 12 hours.';
      baseline = 'Water loss 31.4%; response time 48 hours; coverage 55%.';
      kpis = [
        {name:'Water loss percentage', baseline:'31.4%', target:'<20%'},
        {name:'Response time', baseline:'48 hours', target:'<12 hours'},
        {name:'Network coverage', baseline:'55%', target:'>90%'}
      ];
      risks = ['Sensor placement access in dense wards','Integration with existing SCADA systems','Monsoon-related installation delays'];
      eligibility = ['DPIIT-recognised startup','Prior water utility deployment','ISO 27001 certification'];
    } else if (lower.includes('flood') || lower.includes('water level')) {
      problem = 'Low-lying wards experience delayed flood warnings, resulting in avoidable disruption and emergency response delays.';
      outcome = 'Provide actionable flood alerts at least 2 hours before critical water-level thresholds are breached.';
      baseline = 'Warning lead time 20 minutes; false alert rate 28%; ward coverage 55%.';
      kpis = [
        {name:'Flood warning lead time', baseline:'20 min', target:'120 min'},
        {name:'False alert rate', baseline:'28%', target:'<10%'},
        {name:'Ward coverage', baseline:'55%', target:'>90%'}
      ];
      risks = ['Sensor vandalism and maintenance','Rainfall data sharing with meteorological agencies','False alert management and public trust'];
      eligibility = ['DPIIT-recognised startup','Prior disaster management or municipal deployment','ISO 27001 certification'];
    }

    return { problem, outcome, baseline, kpis, risks, eligibility };
  }
};

/* ============================================================
   14. COMMAND PALETTE
   ============================================================ */
const CmdK = {
  open() {
    const el = $('#cmdk');
    el.innerHTML = `
      <div class="cmdk-input">${icon('search')}<input id="cmdk-input" placeholder="Search challenges, startups, pilots, contracts, evidence…" autocomplete="off" /><kbd style="font-size:10px;background:var(--surface-2);border:1px solid var(--border);border-radius:4px;padding:2px 6px;color:var(--text-4)">ESC</kbd></div>
      <div class="cmdk-results" id="cmdk-results"></div>`;
    el.classList.add('open');
    Overlay.open();
    setTimeout(() => $('#cmdk-input')?.focus(), 30);
    this.search('');
    $('#cmdk-input')?.addEventListener('input', (e) => this.search(e.target.value));
  },
  close() { $('#cmdk').classList.remove('open'); Overlay.close(); },
  search(q) {
    const query = q.trim().toLowerCase();
    const groups = [];
    const match = (s) => !query || String(s).toLowerCase().includes(query);

    const challenges = Store.get('challenges').filter(c => match(c.id) || match(c.title) || match(c.dept) || match(c.district)).slice(0,5);
    if (challenges.length) groups.push({ label:'Challenges', items: challenges.map(c => ({ icon:'challenge', title:c.title, meta:c.id, link:`#/challenges/${c.id}` })) });

    const startups = Store.get('startups').filter(s => match(s.name) || match(s.tech) || match(s.industry)).slice(0,4);
    if (startups.length) groups.push({ label:'Startups', items: startups.map(s => ({ icon:'startup', title:s.name, meta:s.id, link:`#/startups/${s.id}` })) });

    const pilots = Store.get('pilots').filter(p => match(p.id) || match(p.title)).slice(0,4);
    if (pilots.length) groups.push({ label:'Pilots', items: pilots.map(p => ({ icon:'pilot', title:p.title, meta:p.id, link:`#/pilots/${p.id}` })) });

    const contracts = Store.get('contracts').filter(c => match(c.id)).slice(0,3);
    if (contracts.length) groups.push({ label:'Contracts', items: contracts.map(c => ({ icon:'contract', title:c.id, meta:fmtINR(c.value), link:`#/contracts/${c.id}` })) });

    const evidence = Store.get('evidence').filter(e => match(e.name) || match(e.type)).slice(0,4);
    if (evidence.length) groups.push({ label:'Evidence', items: evidence.map(e => ({ icon:'evidence', title:e.name, meta:e.type, link:`#/evidence` })) });

    const pages = [
      { label:'Dashboard', link:'#/dashboard', icon:'dashboard' },
      { label:'Pathway Board', link:'#/pathway', icon:'pathway' },
      { label:'Public Value', link:'#/publicvalue', icon:'trendingUp' },
      { label:'Analytics', link:'#/analytics', icon:'analytics' },
      { label:'Audit Trail', link:'#/audit', icon:'audit' }
    ].filter(p => match(p.label));

    if (pages.length) groups.push({ label:'Pages', items: pages.map(p => ({ icon:p.icon, title:p.label, meta:'', link:p.link })) });

    const results = $('#cmdk-results');
    if (!results) return;
    if (!groups.length) {
      results.innerHTML = `<div style="padding:30px;text-align:center;color:var(--text-3);font-size:13px">No results for "${esc(query)}"</div>`;
      return;
    }
    results.innerHTML = groups.map(g => `
      <div class="cmdk-group-label">${esc(g.label)}</div>
      ${g.items.map(it => `
        <div class="cmdk-item" data-cmdk-link="${it.link}">
          ${icon(it.icon)}
          <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(it.title)}</span>
          ${it.meta ? `<span class="ci-meta">${esc(it.meta)}</span>` : ''}
        </div>`).join('')}
    `).join('');
  }
};

/* ============================================================
   15. NOTIFICATIONS PANEL
   ============================================================ */
function openNotifications() {
  const notifs = [...Store.get('notifications')].sort((a,b) => new Date(b.ts) - new Date(a.ts));
  const toneIcon = t => t === 'success' ? 'checkCircle' : t === 'error' ? 'alert' : t === 'warning' ? 'alertTriangle' : 'info';
  const toneColor = t => t === 'success' ? 'var(--success)' : t === 'error' ? 'var(--danger)' : t === 'warning' ? 'var(--warning)' : 'var(--primary)';
  Drawer.open('Notifications',
    notifs.length ? notifs.map(n => `
      <div class="attention-item" data-notif="${n.id}" data-link="${esc(n.link)}" style="${n.read ? 'opacity:.7' : ''}">
        <div class="ai-icon" style="background:var(--surface-2);color:${toneColor(n.type)}">${icon(toneIcon(n.type))}</div>
        <div class="ai-body">
          <b>${esc(n.title)}</b>
          <span>${esc(n.body)}</span>
          <div class="xsmall muted" style="margin-top:3px">${timeAgo(n.ts)}</div>
        </div>
        ${!n.read ? '<span class="badge-dot" style="position:static"></span>' : ''}
      </div>`).join('') : EmptyState('bell','No notifications','You are all caught up.'),
    `<button class="btn btn-secondary btn-block" data-mark-all-read>Mark all as read</button>`
  );
}

/* ============================================================
   16. DEMO RUNNER
   ============================================================ */
const Demo = {
  running: false,
  async run() {
    if (this.running) return;
    const c = Store.find('challenges', 'CH-018');
    if (!c) { Toast.show('error','Demo challenge missing','Reset the demo data first.'); return; }
    this.running = true;

    const steps = [
      { role:'gov',       view:'challenges/CH-018', msg:'CH-018 · Early Flood Alerts',        sub:'Government Officer — problem statement published' },
      { role:'gov',       view:'challenges/CH-018', msg:'3 startups discovered',                sub:'FloodSense Labs, AirVeda, RouteMinds matched' },
      { role:'gov',       view:'challenges/CH-018', msg:'Eligibility screening complete',       sub:'2 startups eligible for expert evaluation' },
      { role:'evaluator', view:'evaluations',        msg:'Expert evaluation',                    sub:'Weighted rubric scoring across 5 criteria' },
      { role:'gov',       view:'challenges/CH-018', msg:'FloodSense Labs selected for pilot',   sub:'Pilot design approved with 4 milestones' },
      { role:'accounts',  view:'contracts/CT-018',   msg:'Contract CT-018 signed',               sub:'IP retained by startup; government licence granted' },
      { role:'gov',       view:'pilots/PL-018',      msg:'Pilot monitoring active',              sub:'KPI telemetry streaming from 14 wards' },
      { role:'startup',   view:'evidence',           msg:'Evidence uploaded',                    sub:'KPI dataset, field inspection and sensor logs submitted' },
      { role:'validator', view:'validation',         msg:'Independent validation',               sub:'Baseline vs actual comparison verified' },
      { role:'accounts',  view:'payments',           msg:'Milestone payment released',           sub:'Evidence-gated approval of ₹4,00,000' },
      { role:'gov',       view:'scaleup',            msg:'Scale-up decision ready',              sub:'Evidence supports multi-ward procurement' }
    ];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const persona = PERSONAS.find(p => p.role === step.role);
      if (persona) { Session.role = step.role; Session.personaId = persona.id; Session.save(); }
      Router.go(step.view);
      await new Promise(r => setTimeout(r, 900));
      Toast.show('info', step.msg, step.sub);
      if (i === 4) {
        const app = Store.get('applications').find(a => a.challengeId === 'CH-018' && a.status === 'Shortlisted');
        if (app) Store.update('applications', app.id, { status: 'Pilot' });
      }
      if (i === 5 && !Store.get('contracts').find(ct => ct.id === 'CT-018')) {
        Store.add('contracts', {
          id:'CT-018', challengeId:'CH-018', startupId:'ST-02', value:1800000,
          start:'2026-09-25', end:'2026-12-24', status:'Active', signedAt:'2026-09-23',
          ipClause:'Startup retains foreground IP. Department receives non-exclusive perpetual licence.',
          dataClause:'Sensor and alert data belongs to the Urban Development Department.',
          securityClause:'ISO 27001; encrypted telemetry; quarterly VAPT; incident reporting within 24 hours.',
          termination:'30-day written notice; immediate termination for breach or security incident.'
        });
      }
      if (i === 6 && !Store.get('pilots').find(pl => pl.id === 'PL-018')) {
        Store.add('pilots', {
          id:'PL-018', challengeId:'CH-018', startupId:'ST-02', contractId:'CT-018',
          title:'Early Flood Alerts — Ranipur Wards 3–16',
          startDate:'2026-09-25', endDate:'2026-12-24', duration:90, budget:1800000,
          status:'Active', progress:45, riskLevel:'Medium',
          geography:'Ranipur Wards 3–16', users:'14 low-lying wards',
          milestones:[
            {id:'M1', name:'Deployment', amount:400000, due:'2026-10-15', status:'PAID', paidAt:'2026-10-18', deliverables:'Sensor installation in 14 wards.', evidence:'Installation report', evidenceRequired:true},
            {id:'M2', name:'Operational pilot', amount:500000, due:'2026-11-10', status:'PAID', paidAt:'2026-11-13', deliverables:'Alerting engine live; ward officers trained.', evidence:'Ops report, training log', evidenceRequired:true},
            {id:'M3', name:'Performance target', amount:500000, due:'2026-12-05', status:'AWAITING_VALIDATION', paidAt:null, deliverables:'Lead time >120 min; false alerts <10%.', evidence:'KPI dataset', evidenceRequired:true},
            {id:'M4', name:'Final validation', amount:400000, due:'2026-12-24', status:'LOCKED', paidAt:null, deliverables:'Validated report + certificate.', evidence:'Validation certificate', evidenceRequired:true}
          ],
          kpis:[
            {name:'Flood warning lead time', baseline:20, current:128, target:120, unit:' min', dir:'up', status:'ACHIEVED'},
            {name:'False alert rate', baseline:28, current:8.4, target:10, unit:'%', dir:'down', status:'ACHIEVED'},
            {name:'Ward coverage', baseline:55, current:94, target:90, unit:'%', dir:'up', status:'ACHIEVED'}
          ],
          trend:[
            {week:'W1', loss:22, response:26, coverage:57},
            {week:'W2', loss:38, response:24, coverage:62},
            {week:'W3', loss:58, response:18, coverage:71},
            {week:'W4', loss:76, response:14, coverage:78},
            {week:'W5', loss:92, response:11, coverage:84},
            {week:'W6', loss:108, response:9, coverage:88},
            {week:'W7', loss:118, response:9, coverage:91},
            {week:'W8', loss:128, response:8, coverage:94}
          ],
          risks:[
            {name:'Budget variance', value:'4%', level:'ok', detail:'Within tolerance.'},
            {name:'Timeline', value:'3 days delayed', level:'warn', detail:'Monsoon access restrictions in Ward 11.'},
            {name:'KPI achievement', value:'100%', level:'ok', detail:'All three KPIs exceeded target.'},
            {name:'Data completeness', value:'97%', level:'ok', detail:'Two offline nodes in Ward 9.'},
            {name:'Security review', value:'Cleared', level:'ok', detail:'VAPT passed with no critical findings.'},
            {name:'Incident count', value:'0', level:'ok', detail:'No incidents.'}
          ]
        });
      }
      if (i === 9) {
        const pl = Store.find('pilots', 'PL-018');
        if (pl) {
          const m3 = pl.milestones.find(m => m.id === 'M3');
          if (m3) Store.update('pilots', pl.id, {
            milestones: pl.milestones.map(m => m.id === 'M3' ? {...m, status:'PAID', paidAt:new Date().toISOString()} : m)
          });
        }
      }
    }
    Toast.show('success','Demo complete','CH-018 has progressed from challenge to scale-up decision across six role perspectives.');
    this.running = false;
  },
  advance() {
    const c = Store.find('challenges', 'CH-018');
    if (!c) { Toast.show('error','Demo challenge missing','Reset the demo data first.'); return; }
    const next = Workflow.nextStage(c.stage);
    if (!next) { Toast.show('info','Already at final stage','CH-018 is at Scale-up.'); return; }
    const guard = Workflow.guard(c);
    if (!guard.ok) { Toast.show('warning','Cannot advance', guard.reason); return; }

    if (c.stage === 'EVALUATION') {
      const app = Store.get('applications').find(a => a.challengeId === c.id && a.status === 'Shortlisted');
      if (app) Store.update('applications', app.id, { status: 'Pilot' });
    }
    if (c.stage === 'PILOT_DESIGN') {
      if (!Store.get('contracts').find(ct => ct.challengeId === c.id)) {
        Store.add('contracts', {
          id:'CT-018', challengeId:c.id, startupId:'ST-02', value:c.budget, start:'2026-09-25', end:'2026-12-24',
          status:'Active', signedAt:'2026-09-23',
          ipClause:'Startup retains foreground IP. Department receives non-exclusive perpetual licence.',
          dataClause:'Sensor and alert data belongs to the Urban Development Department.',
          securityClause:'ISO 27001; encrypted telemetry; quarterly VAPT; incident reporting within 24 hours.',
          termination:'30-day written notice; immediate termination for breach or security incident.'
        });
      }
    }
    Store.update('challenges', c.id, { stage: next, status: next === 'SCALE_UP' ? 'Decision pending' : next === 'EVALUATION' ? 'Needs action' : 'In progress' });
    Store.add('audit', {
      ts: new Date().toISOString(), user: Session.persona()?.name || 'Officer', role: 'Government Officer',
      action: `Stage advanced to ${STAGES.find(s=>s.key===next)?.name}`, entity: c.id,
      details: `CH-018 moved from ${STAGES.find(s=>s.key===c.stage)?.name} to ${STAGES.find(s=>s.key===next)?.name}.`
    });
    Toast.show('success','Workflow advanced', `CH-018 → ${STAGES.find(s=>s.key===next)?.name}`);
    render();
  }
};

/* ============================================================
   17. RENDER
   ============================================================ */
function render() {
  document.documentElement.setAttribute('data-theme', Session.theme);
  const { path, param } = Router.parse();
  const app = $('#app');

  if (path === 'role-select' || !Session.role) {
    app.innerHTML = Pages.roleSelect();
    return;
  }

  let allowed = true;
  if (['dashboard','pathway','challenges','startups','evaluations','pilots','contracts','monitoring','payments','validation','scaleup','evidence','analytics','publicvalue','templates','audit','settings'].includes(path)) {
    allowed = can(Session.role, path);
  }

  const contentHtml = allowed ? renderPage(path, param) : AccessRestricted();

  app.innerHTML = `
    <div class="shell ${Session.sidebarCollapsed ? 'collapsed' : ''}">
      ${Sidebar(Session.role, path)}
      <div class="main">
        ${Topbar(Session.role)}
        ${contentHtml}
      </div>
    </div>`;
}

function renderPage(path, param) {
  switch (path) {
    case 'dashboard': return Pages.dashboard();
    case 'pathway': return Pages.pathway();
    case 'challenges':
      if (param === 'new') return Pages.challenges();
      if (param) return Pages.challengeDetail(param);
      return Pages.challenges();
    case 'startups': return param ? Pages.startupDetail(param) : Pages.startups();
    case 'evaluations': return Pages.evaluations();
    case 'pilots': return param ? Pages.pilotDetail(param) : Pages.pilots();
    case 'contracts': return param ? Pages.contractDetail(param) : Pages.contracts();
    case 'monitoring': return Pages.monitoring();
    case 'payments': return Pages.payments();
    case 'validation': return Pages.validation();
    case 'scaleup': return Pages.scaleup();
    case 'evidence': return Pages.evidence();
    case 'analytics': return Pages.analytics();
    case 'publicvalue': return Pages.publicValue();
    case 'templates': return Pages.templates();
    case 'audit': return Pages.audit();
    case 'settings': return Pages.settings();
    default: return Pages.dashboard();
  }
}

/* ============================================================
   18. EVENT DELEGATION
   ============================================================ */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-persona],[data-nav],[data-challenge],[data-startup],[data-pilot],[data-contract],[data-evaluation],[data-evidence],[data-tab],[data-pilot-tab],[data-clear-filters],[data-toggle-sidebar],[data-open-sidebar],[data-toggle-theme],[data-toggle-lang],[data-open-notifications],[data-open-role-switcher],[data-close-drawer],[data-close-modal],[data-approve-payment],[data-hold-payment],[data-payment-detail],[data-confirm-approve],[data-confirm-hold],[data-validate-pilot],[data-confirm-validation],[data-request-evidence],[data-reject-validation],[data-scaleup-decision],[data-confirm-scaleup],[data-advance-challenge],[data-advance-demo],[data-reset-demo],[data-confirm-reset],[data-run-demo],[data-export-challenge],[data-open-cmdk],[data-cmdk-link],[data-notif],[data-mark-all-read],[data-ai-improve],[data-ai-accept],[data-ai-cancel],[data-wizard-next],[data-wizard-prev],[data-wizard-cancel],[data-wizard-draft],[data-wizard-publish],[data-add-kpi],[data-remove-kpi],[data-template-view],[data-template-duplicate],[data-template-edit],[data-risk],[data-noop],[data-public-dashboard],[data-select-startup],[data-open-score],[data-save-score],[data-verify-evidence],[data-reject-evidence]');
  if (!el) return;

  if (el.dataset.persona) {
    const p = PERSONAS.find(x => x.id === el.dataset.persona);
    Session.role = p.role; Session.personaId = p.id; Session.save();
    Toast.show('success', `Signed in as ${p.name}`, `${p.title} · ${p.org}`);
    Router.go('dashboard');
    return;
  }

  if (el.hasAttribute('data-public-dashboard')) {
    Session.role = 'gov'; Session.personaId = 'P1'; Session.save();
    Toast.show('info','Viewing public dashboard','Signed in as Government Officer (demo).');
    Router.go('dashboard');
    return;
  }

  if (el.dataset.nav) { Router.go(el.dataset.nav.replace('#/','')); return; }

  if (el.dataset.toggleSidebar !== undefined) {
    Session.sidebarCollapsed = !Session.sidebarCollapsed; Session.save(); render(); return;
  }
  if (el.dataset.openSidebar !== undefined) { $('#sidebar')?.classList.add('open'); Overlay.open(); return; }

  if (el.dataset.toggleTheme !== undefined) {
    Session.theme = Session.theme === 'dark' ? 'light' : 'dark'; Session.save();
    document.documentElement.setAttribute('data-theme', Session.theme); render(); return;
  }
  if (el.dataset.toggleLang !== undefined) {
    Session.lang = Session.lang === 'EN' ? 'हिंदी' : 'EN'; Session.save();
    Toast.show('info', `Language: ${Session.lang}`, 'Interface language preference saved.');
    render(); return;
  }

  if (el.dataset.openNotifications !== undefined) { openNotifications(); return; }
  if (el.dataset.markAllRead !== undefined) {
    Store.get('notifications').forEach(n => n.read = true); Store.save();
    Drawer.close(); Toast.show('success','All notifications marked as read'); render(); return;
  }
  if (el.dataset.notif) {
    const n = Store.find('notifications', el.dataset.notif);
    if (n) { n.read = true; Store.save(); }
    Drawer.close();
    if (el.dataset.link) Router.go(el.dataset.link.replace('#/',''));
    return;
  }

  if (el.dataset.openRoleSwitcher !== undefined) {
    Drawer.open('Switch role',
      `<p class="small muted" style="margin-bottom:14px">Choose a different persona to explore Pilot Bridge from another perspective.</p>
       ${PERSONAS.map(p => `
        <button class="attention-item" data-persona="${p.id}" style="width:100%;text-align:left">
          <div class="ai-icon" style="background:${p.color};color:#fff;font-weight:700;font-size:12px">${initials(p.name)}</div>
          <div class="ai-body"><b>${esc(p.name)}</b><span>${esc(p.title)} · ${esc(p.org)}</span></div>
          ${icon('chevronRight','arrow')}
        </button>`).join('')}
       <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border)">
         <a class="btn btn-secondary btn-block" href="#/role-select">${icon('users')}Back to role selection</a>
       </div>`);
    return;
  }

  if (el.dataset.closeDrawer !== undefined) { Drawer.close(); return; }
  if (el.dataset.closeModal !== undefined) { Modal.close(); return; }

  if (el.dataset.challenge) { Router.go('challenges/' + el.dataset.challenge); return; }
  if (el.dataset.startup) { Router.go('startups/' + el.dataset.startup); return; }
  if (el.dataset.pilot) { Router.go('pilots/' + el.dataset.pilot); return; }
  if (el.dataset.contract) { Router.go('contracts/' + el.dataset.contract); return; }

  if (el.dataset.tab) { Router.tab = el.dataset.tab; render(); return; }
  if (el.dataset.pilotTab) { Router.tab = el.dataset.pilotTab; render(); return; }

  if (el.dataset.selectStartup) {
    const app = Store.find('applications', el.dataset.selectStartup);
    if (app) {
      Store.update('applications', app.id, { status:'Pilot' });
      const startup = Store.find('startups', app.startupId);
      Store.add('audit', {
        ts:new Date().toISOString(), user:Session.persona()?.name, role:'Government Officer',
        action:'Startup selected for pilot', entity:app.challengeId,
        details:`${startup?.name || app.startupId} selected for pilot from application ${app.id}.`
      });
      Toast.show('success','Startup selected', `${startup?.name || ''} is now the pilot vendor for this challenge.`);
      render();
    }
    return;
  }

  if (el.dataset.openScore) {
    const ev = Store.find('evaluations', el.dataset.openScore);
    if (!ev) return;
    const rubric = Store.get('rubric');
    Modal.open('Score evaluation',
      `<div class="small muted" style="margin-bottom:16px">Score each criterion from 0–100. Weighted consensus is calculated automatically.</div>
       ${rubric.map(r => `
         <div class="field">
           <label>${esc(r.name)} <span class="muted">(${r.weight}%)</span></label>
           <div style="display:flex;align-items:center;gap:10px">
             <input type="range" min="0" max="100" value="${ev.scores[r.key]||75}" data-score-range="${r.key}" style="flex:1;accent-color:var(--primary)" />
             <input type="number" min="0" max="100" value="${ev.scores[r.key]||75}" data-score-num="${r.key}" style="width:70px;padding:6px;border:1px solid var(--border);border-radius:6px;text-align:center" />
           </div>
         </div>`).join('')}
       <div class="field">
         <label>Comments <span class="req">*</span></label>
         <textarea class="textarea" id="eval-comments">${esc(ev.comments||'')}</textarea>
       </div>
       <div style="padding:12px;background:var(--primary-50);border-radius:10px;text-align:center">
         <div class="xsmall muted">Weighted score</div>
         <div class="h2" id="eval-weighted" style="color:var(--primary)">${Scoring.weighted(ev.scores, rubric)}</div>
       </div>`,
      `<button class="btn btn-secondary" data-close-modal>Cancel</button>
       <button class="btn btn-primary" data-save-score="${ev.id}">${icon('check')}Save & submit</button>`
    );
    const recompute = () => {
      const scores = {};
      rubric.forEach(r => {
        const num = $(`[data-score-num="${r.key}"]`);
        scores[r.key] = num ? parseInt(num.value) || 0 : 0;
      });
      const el = $('#eval-weighted');
      if (el) el.textContent = Scoring.weighted(scores, rubric);
    };
    $$('#modal [data-score-range]').forEach(inp => {
      inp.addEventListener('input', e => {
        const key = e.target.dataset.scoreRange;
        const num = $(`[data-score-num="${key}"]`);
        if (num) num.value = e.target.value;
        recompute();
      });
    });
    $$('#modal [data-score-num]').forEach(inp => {
      inp.addEventListener('input', e => {
        const key = e.target.dataset.scoreNum;
        const range = $(`[data-score-range="${key}"]`);
        if (range) range.value = e.target.value;
        recompute();
      });
    });
    return;
  }

  if (el.dataset.saveScore) {
    const ev = Store.find('evaluations', el.dataset.saveScore);
    const rubric = Store.get('rubric');
    const scores = {};
    rubric.forEach(r => {
      const num = $(`[data-score-num="${r.key}"]`);
      scores[r.key] = num ? parseInt(num.value) || 0 : 0;
    });
    const comments = $('#eval-comments')?.value.trim();
    if (!comments) { Toast.show('error','Comments required','Evaluator comments are mandatory.'); return; }
    Store.update('evaluations', ev.id, { scores, comments, status:'Submitted', submittedAt:new Date().toISOString() });
    Store.add('audit', {
      ts:new Date().toISOString(), user:Session.persona()?.name, role:'External Evaluator',
      action:'Evaluation submitted', entity:ev.id,
      details:`Evaluation locked after submission. Weighted score: ${Scoring.weighted(scores, rubric)}.`
    });
    Modal.close();
    Toast.show('success','Evaluation submitted','The evaluation is now locked and cannot be edited.');
    render();
    return;
  }

  if (el.dataset.evaluation) {
    const ev = Store.find('evaluations', el.dataset.evaluation);
    if (!ev) return;
    const app = Store.find('applications', ev.applicationId);
    const startup = app ? Store.find('startups', app.startupId) : null;
    const challenge = app ? Store.find('challenges', app.challengeId) : null;
    const rubric = Store.get('rubric');
    const score = Scoring.weighted(ev.scores, rubric);
    Drawer.open('Evaluation ' + ev.id,
      `<div style="margin-bottom:16px">
        <div class="h3">${esc(startup?.name || '')}</div>
        <div class="small muted">${esc(challenge?.title || '')}</div>
      </div>
      <div class="grid g-2" style="gap:12px;margin-bottom:16px">
        <div><div class="xsmall muted">Evaluator</div><div class="h4">${esc(ev.evaluator)}</div></div>
        <div><div class="xsmall muted">Status</div><div>${badge(ev.status)}</div></div>
        <div><div class="xsmall muted">Weighted score</div><div class="h2" style="color:var(--primary)">${score}</div></div>
        <div><div class="xsmall muted">Submitted</div><div class="h4">${ev.submittedAt ? esc(fmtDate(ev.submittedAt)) : '—'}</div></div>
      </div>
      <div class="h4" style="margin-bottom:10px">Criteria scores</div>
      ${rubric.map(r => `
        <div class="score-bar">
          <div class="sb-label">${esc(r.name)} <span class="muted">(${r.weight}%)</span></div>
          <div class="sb-track"><span style="width:${ev.scores[r.key]||0}%;background:var(--primary)"></span></div>
          <div class="sb-val">${ev.scores[r.key]||0}</div>
        </div>`).join('')}
      <div class="h4" style="margin:16px 0 8px">Comments</div>
      <p class="small" style="color:var(--text-2)">${esc(ev.comments || 'No comments provided.')}</p>`
    );
    return;
  }

  if (el.dataset.evidence) {
    const ev = Store.find('evidence', el.dataset.evidence);
    if (!ev) return;
    const pilot = Store.find('pilots', ev.pilotId);
    Drawer.open('Evidence detail',
      `<div style="margin-bottom:16px">
        <div class="h3">${esc(ev.name)}</div>
        <div class="small muted">${esc(ev.id)} · ${esc(ev.type)}</div>
      </div>
      <div class="grid g-2" style="gap:12px;margin-bottom:16px">
        <div><div class="xsmall muted">Status</div><div>${badge(ev.status)}</div></div>
        <div><div class="xsmall muted">Size</div><div class="h4">${esc(ev.size)}</div></div>
        <div><div class="xsmall muted">Uploaded by</div><div class="h4">${esc(ev.uploadedBy)}</div></div>
        <div><div class="xsmall muted">Uploaded at</div><div class="h4">${esc(fmtDateTime(ev.uploadedAt))}</div></div>
        <div><div class="xsmall muted">Milestone</div><div class="h4">${esc(ev.milestone)}</div></div>
        <div><div class="xsmall muted">Related KPI</div><div class="h4">${esc(ev.kpi)}</div></div>
      </div>
      <div class="card card-pad" style="margin-bottom:12px">
        <div class="h4" style="margin-bottom:4px">What this supports</div>
        <p class="small" style="color:var(--text-2)">${esc(ev.supports)}</p>
      </div>
      <div class="card card-pad" style="margin-bottom:12px">
        <div class="h4" style="margin-bottom:4px">Verification</div>
        ${ev.verifiedBy ? `<p class="small" style="color:var(--text-2)">Verified by <b>${esc(ev.verifiedBy)}</b> on ${esc(fmtDateTime(ev.verifiedAt))}.</p>`
          : `<p class="small" style="color:var(--text-3)">Not yet verified.</p>`}
      </div>
      <div class="card card-pad">
        <div class="h4" style="margin-bottom:4px">Pilot</div>
        <p class="small" style="color:var(--text-2)">${esc(pilot?.title || ev.pilotId)}</p>
      </div>`,
      Session.role === 'validator' || Session.role === 'accounts'
        ? `${ev.status !== 'Verified' ? `<button class="btn btn-success" data-verify-evidence="${ev.id}">${icon('check')}Verify</button>
             <button class="btn btn-danger" data-reject-evidence="${ev.id}">${icon('x')}Reject</button>` : ''}
           <button class="btn btn-secondary" data-close-drawer>Close</button>`
        : `<button class="btn btn-secondary" data-close-drawer>Close</button>`
    );
    return;
  }

  if (el.dataset.verifyEvidence) {
    const ev = Store.find('evidence', el.dataset.verifyEvidence);
    if (!ev) return;
    Store.update('evidence', ev.id, { status:'Verified', verifiedBy: Session.persona()?.name, verifiedAt: new Date().toISOString() });
    Store.add('audit', { ts:new Date().toISOString(), user:Session.persona()?.name, role:Session.role === 'validator' ? 'Principal Validator' : 'Accounts Officer', action:'Evidence verified', entity:ev.id, details:`${ev.name} verified for milestone ${ev.milestone}.` });
    Drawer.close();
    Toast.show('success','Evidence verified', ev.name);
    render();
    return;
  }

  if (el.dataset.rejectEvidence) {
    const ev = Store.find('evidence', el.dataset.rejectEvidence);
    if (!ev) return;
    Store.update('evidence', ev.id, { status:'Rejected', verifiedBy: Session.persona()?.name, verifiedAt: new Date().toISOString() });
    Drawer.close();
    Toast.show('warning','Evidence rejected', ev.name);
    render();
    return;
  }

  if (el.dataset.approvePayment) {
    const p = Store.find('payments', el.dataset.approvePayment);
    if (!p) return;
    Modal.open('Approve payment',
      `<p class="small muted" style="margin-bottom:14px">You are about to approve ${fmtINR(p.amount)} for milestone <b>${esc(p.milestone)}</b>. A reason is required.</p>
       <div class="field"><label>Reason <span class="req">*</span></label>
         <textarea class="textarea" id="pay-reason" placeholder="e.g. Milestone evidence verified; validation certificate on file."></textarea></div>`,
      `<button class="btn btn-secondary" data-close-modal>Cancel</button>
       <button class="btn btn-success" data-confirm-approve="${p.id}">${icon('check')}Confirm approval</button>`
    );
    return;
  }

  if (el.dataset.confirmApprove) {
    const p = Store.find('payments', el.dataset.confirmApprove);
    const reason = $('#pay-reason')?.value.trim();
    if (!reason) { Toast.show('error','Reason required','A reason is mandatory for payment approval.'); return; }
    Store.update('payments', p.id, { status:'PAID', approvedBy: Session.persona()?.name, approvedAt: new Date().toISOString(), paidAt: new Date().toISOString(), reason });
    Store.add('audit', { ts:new Date().toISOString(), user:Session.persona()?.name, role:'Accounts Officer', action:'Payment approved', entity:p.id, details:`${p.milestone} payment of ${fmtINR(p.amount)} approved. Reason: ${reason}` });
    Modal.close();
    Toast.show('success','Payment approved', `${p.milestone} · ${fmtINR(p.amount)}`);
    render();
    return;
  }

  if (el.dataset.holdPayment) {
    const p = Store.find('payments', el.dataset.holdPayment);
    if (!p) return;
    Modal.open('Hold payment',
      `<p class="small muted" style="margin-bottom:14px">Place ${esc(p.milestone)} payment of ${fmtINR(p.amount)} on hold. A reason is required.</p>
       <div class="field"><label>Reason <span class="req">*</span></label>
         <textarea class="textarea" id="hold-reason" placeholder="e.g. Evidence incomplete; awaiting validator confirmation."></textarea></div>`,
      `<button class="btn btn-secondary" data-close-modal>Cancel</button>
       <button class="btn btn-danger" data-confirm-hold="${p.id}">${icon('pause')}Hold payment</button>`
    );
    return;
  }

  if (el.dataset.confirmHold) {
    const p = Store.find('payments', el.dataset.confirmHold);
    const reason = $('#hold-reason')?.value.trim();
    if (!reason) { Toast.show('error','Reason required','A reason is mandatory for placing a payment on hold.'); return; }
    Store.update('payments', p.id, { status:'PENDING_EVIDENCE', reason });
    Store.add('audit', { ts:new Date().toISOString(), user:Session.persona()?.name, role:'Accounts Officer', action:'Payment placed on hold', entity:p.id, details:`${p.milestone} payment of ${fmtINR(p.amount)} placed on hold. Reason: ${reason}` });
    Modal.close();
    Toast.show('warning','Payment placed on hold', `${p.milestone} · ${fmtINR(p.amount)}`);
    render();
    return;
  }

  if (el.dataset.paymentDetail) {
    const p = Store.find('payments', el.dataset.paymentDetail);
    if (!p) return;
    Drawer.open('Payment ' + p.id,
      `<div class="grid g-2" style="gap:12px;margin-bottom:16px">
        <div><div class="xsmall muted">Amount</div><div class="h2">${fmtINR(p.amount)}</div></div>
        <div><div class="xsmall muted">Status</div><div>${badge(p.status)}</div></div>
        <div><div class="xsmall muted">Milestone</div><div class="h4">${esc(p.milestone)}</div></div>
        <div><div class="xsmall muted">Contract</div><div class="h4">${esc(p.contractId)}</div></div>
      </div>
      <div class="card card-pad"><div class="h4" style="margin-bottom:4px">Reason / note</div><p class="small">${esc(p.reason)}</p></div>`,
      `<button class="btn btn-secondary" data-close-drawer>Close</button>`
    );
    return;
  }

  if (el.dataset.validatePilot) {
    const v = Store.find('validations', el.dataset.validatePilot);
    if (!v) return;
    Modal.open('Issue validation certificate',
      `<p class="small muted" style="margin-bottom:14px">Approve pilot results and issue a validation certificate. Validator comments are required.</p>
       <div class="field"><label>Validator comments <span class="req">*</span></label>
         <textarea class="textarea" id="val-comments" placeholder="Verified against sensor telemetry and field inspection…"></textarea></div>
       <div class="field"><label>Verified values (one per line, matching KPI order)</label>
         <textarea class="textarea" id="val-values" placeholder="${v.kpis.map(k=>k.startupReported).join('\n')}"></textarea>
         <div class="hint">Leave as-is to accept startup-reported values, or enter independently verified values.</div>
       </div>`,
      `<button class="btn btn-secondary" data-close-modal>Cancel</button>
       <button class="btn btn-success" data-confirm-validation="${v.id}">${icon('award')}Issue certificate</button>`
    );
    return;
  }

  if (el.dataset.confirmValidation) {
    const v = Store.find('validations', el.dataset.confirmValidation);
    const comments = $('#val-comments')?.value.trim();
    if (!comments) { Toast.show('error','Comments required','Validator comments are mandatory.'); return; }
    const values = ($('#val-values')?.value || '').split('\n').map(s => s.trim()).filter(Boolean);
    const kpis = v.kpis.map((k,i) => ({...k, verified: values[i] || k.startupReported, status:'Verified'}));
    const updated = { ...v, kpis, status:'Validated', validatedAt:new Date().toISOString(), validator:Session.persona()?.name, comments, verifiedValue: values[0] || v.claimedValue, variance:'0.0%', evidenceCount: Math.max(v.evidenceCount, 3) };
    Store.update('validations', v.id, updated);
    Store.add('audit', { ts:new Date().toISOString(), user:Session.persona()?.name, role:'Principal Validator', action:'Validation completed', entity:v.id, details:`Validation certificate issued for ${v.pilotId}.` });
    if (v.pilotId) {
      const pilot = Store.find('pilots', v.pilotId);
      if (pilot) Store.update('pilots', pilot.id, { status:'Validated', progress:100 });
    }
    Modal.close();
    Toast.show('success','Validation certificate issued', v.id);
    render();
    return;
  }

  if (el.dataset.requestEvidence) {
    Toast.show('info','Evidence request sent','The startup has been notified to submit additional evidence.');
    return;
  }

  if (el.dataset.rejectValidation) {
    Toast.show('warning','Validation rejected','The pilot has been returned to the startup for remediation.');
    return;
  }

  if (el.dataset.scaleupDecision) {
    const d = Store.find('scaleup', el.dataset.scaleupDecision);
    const decision = el.dataset.decision;
    Modal.open('Record scale-up decision',
      `<div style="padding:12px;background:var(--warning-50);border-radius:10px;margin-bottom:16px">
        <div class="h4" style="color:var(--warning);margin-bottom:4px">${icon('alertTriangle')} Government decision</div>
        <p class="small" style="color:var(--text-2)">You are recording an official procurement decision. This will be permanently recorded in the audit log.</p>
      </div>
      <div class="field"><label>Selected pathway</label>
        <input class="input" value="${esc(decision)}" readonly /></div>
      <div class="field"><label>Reason <span class="req">*</span></label>
        <textarea class="textarea" id="su-reason" placeholder="Explain the basis for this decision with reference to KPI performance, validation and risk."></textarea></div>
      <div class="field"><label>Evidence reference <span class="req">*</span></label>
        <input class="input" id="su-evidence" placeholder="e.g. VL-022 validation certificate; KPI dataset" /></div>`,
      `<button class="btn btn-secondary" data-close-modal>Cancel</button>
       <button class="btn btn-primary" data-confirm-scaleup="${d.id}" data-decision="${esc(decision)}">${icon('check')}Record decision</button>`
    );
    return;
  }

  if (el.dataset.confirmScaleup) {
    const d = Store.find('scaleup', el.dataset.confirmScaleup);
    const reason = $('#su-reason')?.value.trim();
    const evidenceRef = $('#su-evidence')?.value.trim();
    if (!reason || !evidenceRef) { Toast.show('error','Required fields','Reason and evidence reference are mandatory.'); return; }
    const decision = el.dataset.decision;
    Store.update('scaleup', d.id, { status:'Decided', decision, reason, evidenceRef, officer: Session.persona()?.name, decidedAt: new Date().toISOString() });
    Store.add('audit', { ts:new Date().toISOString(), user:Session.persona()?.name, role:'Government Officer', action:'Scale-up decision recorded', entity:d.id, details:`Decision: ${decision}. Reason: ${reason}. Evidence: ${evidenceRef}` });
    Modal.close();
    Toast.show('success','Scale-up decision recorded', decision);
    render();
    return;
  }

  if (el.dataset.advanceChallenge) {
    const c = Store.find('challenges', el.dataset.advanceChallenge);
    if (!c) return;
    const next = Workflow.nextStage(c.stage);
    const guard = Workflow.guard(c);
    if (!guard.ok) { Toast.show('warning','Cannot advance', guard.reason); return; }
    Store.update('challenges', c.id, { stage: next, status: next === 'SCALE_UP' ? 'Decision pending' : 'In progress' });
    Store.add('audit', { ts:new Date().toISOString(), user:Session.persona()?.name, role:'Government Officer', action:`Stage advanced to ${STAGES.find(s=>s.key===next)?.name}`, entity:c.id, details:guard.reason });
    Toast.show('success','Workflow advanced', `${c.id} → ${STAGES.find(s=>s.key===next)?.name}`);
    render();
    return;
  }

  if (el.dataset.advanceDemo !== undefined) { Demo.advance(); return; }
  if (el.dataset.runDemo !== undefined) { Demo.run(); return; }
  if (el.dataset.resetDemo !== undefined) {
    Modal.open('Reset demo data',
      `<p class="small muted">This will restore all challenges, pilots, payments, evidence and audit events to their original demonstration state. Any changes you have made will be lost.</p>`,
      `<button class="btn btn-secondary" data-close-modal>Cancel</button>
       <button class="btn btn-danger" data-confirm-reset>${icon('refresh')}Reset demo data</button>`
    );
    return;
  }
  if (el.dataset.confirmReset !== undefined) {
    Store.reset();
    Modal.close();
    Toast.show('success','Demo data reset','All records restored to the original demonstration state.');
    render();
    return;
  }

  if (el.dataset.exportChallenge) {
    Toast.show('success','Export queued','Challenge summary will be downloaded as PDF.');
    return;
  }

  if (el.dataset.openCmdk !== undefined) { CmdK.open(); return; }
  if (el.dataset.cmdkLink) { CmdK.close(); Router.go(el.dataset.cmdkLink.replace('#/','')); return; }

  if (el.dataset.aiImprove !== undefined) { AIAssist.improve(); return; }
  if (el.dataset.aiAccept !== undefined) {
    Modal.close();
    Toast.show('success','AI suggestions accepted','Review the fields and continue the wizard.');
    Wizard.render();
    return;
  }
  if (el.dataset.aiCancel !== undefined) { Modal.close(); Wizard.render(); return; }

  if (el.dataset.wizardNext !== undefined) { Wizard.next(); return; }
  if (el.dataset.wizardPrev !== undefined) { Wizard.prev(); return; }
  if (el.dataset.wizardCancel !== undefined) { Modal.close(); return; }
  if (el.dataset.wizardDraft !== undefined) { Wizard.save(false); return; }
  if (el.dataset.wizardPublish !== undefined) { Wizard.save(true); return; }

  if (el.dataset.addKpi !== undefined) {
    Wizard.collect();
    Wizard.data.kpis = Wizard.data.kpis || [];
    Wizard.data.kpis.push({name:'', baseline:'', target:''});
    Wizard.render(); return;
  }
  if (el.dataset.removeKpi !== undefined) {
    Wizard.collect();
    Wizard.data.kpis.splice(+el.dataset.removeKpi, 1);
    Wizard.render(); return;
  }

  if (el.dataset.risk) {
    const [pilotId, idx] = el.dataset.risk.split('-');
    const pilot = Store.find('pilots', pilotId);
    const risk = pilot?.risks?.[+idx];
    if (risk) {
      Drawer.open(risk.name,
        `<div style="margin-bottom:16px">
          <div class="h2" style="color:${risk.level==='warn'?'var(--warning)':risk.level==='danger'?'var(--danger)':'var(--success)'}">${esc(risk.value)}</div>
          <div class="small muted">Current risk indicator</div>
        </div>
        <div class="card card-pad"><div class="h4" style="margin-bottom:6px">Explanation</div><p class="small" style="color:var(--text-2)">${esc(risk.detail)}</p></div>
        <div class="card card-pad" style="margin-top:12px">
          <div class="h4" style="margin-bottom:6px">Recommended action</div>
          <p class="small" style="color:var(--text-2)">${risk.level === 'ok' ? 'No action required. Continue monitoring.' : 'Review with the pilot team and record a mitigation note in the audit log.'}</p>
        </div>`,
        `<button class="btn btn-secondary" data-close-drawer>Close</button>`
      );
    }
    return;
  }

  if (el.dataset.templateView !== undefined) {
    const tpl = Store.find('templates', el.dataset.templateView);
    if (tpl) {
      Drawer.open(tpl.name,
        `<div class="grid g-2" style="gap:12px;margin-bottom:16px">
          <div><div class="xsmall muted">Category</div><div>${badge(tpl.category)}</div></div>
          <div><div class="xsmall muted">Version</div><div class="h4">${esc(tpl.version)}</div></div>
          <div><div class="xsmall muted">Owner</div><div class="h4">${esc(tpl.owner)}</div></div>
          <div><div class="xsmall muted">Last updated</div><div class="h4">${esc(fmtDate(tpl.updated))}</div></div>
        </div>
        <div class="card card-pad" style="background:var(--surface-2)">
          <div class="h4" style="margin-bottom:8px">Template preview</div>
          <p class="small" style="color:var(--text-2);line-height:1.7">This template is maintained by ${esc(tpl.owner)} and is used across all departments for ${esc(tpl.category.toLowerCase())} workflows. It includes standard clauses reviewed by the Legal Cell and the CISO Office.</p>
        </div>`,
        `<button class="btn btn-secondary" data-close-drawer>Close</button>`
      );
    }
    return;
  }
  if (el.dataset.templateDuplicate !== undefined) {
    const tpl = Store.find('templates', el.dataset.templateDuplicate);
    const newTpl = { ...tpl, id: uid('TP'), name: tpl.name + ' (copy)', version:'v1.0', updated:new Date().toISOString().slice(0,10), status:'Draft' };
    Store.add('templates', newTpl);
    Toast.show('success','Template duplicated', newTpl.name);
    render();
    return;
  }
  if (el.dataset.templateEdit !== undefined) {
    Toast.show('info','Template editor','Template editing is available to the Innovation Cell Admin.');
    return;
  }

  if (el.dataset.noop !== undefined) { Toast.show('info','Not available in demo','This action is disabled in the prototype.'); return; }
});

/* Input filters */
document.addEventListener('input', (e) => {
  const el = e.target;
  if (el.dataset && el.dataset.filter) {
    Router.filters = Router.filters || {};
    const v = el.value.trim();
    if (v) Router.filters[el.dataset.filter] = v; else delete Router.filters[el.dataset.filter];
    clearTimeout(window.__filterTimer);
    window.__filterTimer = setTimeout(() => render(), 250);
  }
});
document.addEventListener('change', (e) => {
  const el = e.target;
  if (el.dataset && el.dataset.filter) {
    Router.filters = Router.filters || {};
    const v = el.value;
    if (v) Router.filters[el.dataset.filter] = v; else delete Router.filters[el.dataset.filter];
    render();
  }
});

/* Clear filters */
document.addEventListener('click', (e) => {
  if (e.target.closest('[data-clear-filters]')) {
    Router.filters = {};
    render();
  }
});

/* Pipeline stage click → filter dashboard challenges */
document.addEventListener('click', (e) => {
  const stageEl = e.target.closest('[data-stage]');
  if (stageEl && Router.current === 'dashboard') {
    const key = stageEl.dataset.stage;
    const challenges = Store.get('challenges').filter(c => c.stage === key);
    const target = $('#dash-challenges');
    if (target) {
      target.innerHTML = challenges.length
        ? `<div class="grid g-3">${challenges.map(c => ChallengeCard(c)).join('')}</div>`
        : EmptyState('challenge','No challenges in this stage','Select another stage to view challenges.');
      $$('.pipe-stage').forEach(s => s.classList.toggle('active', s.dataset.stage === key));
    }
  }
});

/* Overlay click */
$('#overlay').addEventListener('click', () => { Drawer.close(); Modal.close(); CmdK.close(); $('#sidebar')?.classList.remove('open'); });

/* Keyboard shortcuts */
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); CmdK.open(); return; }
  if (e.key === 'Escape') { Drawer.close(); Modal.close(); CmdK.close(); $('#sidebar')?.classList.remove('open'); return; }
  const cmdkInput = $('#cmdk-input');
  if (cmdkInput && document.activeElement === cmdkInput) {
    const items = $$('#cmdk-results .cmdk-item');
    if (!items.length) return;
    const current = items.findIndex(i => i.classList.contains('sel'));
    if (e.key === 'ArrowDown') { e.preventDefault(); items.forEach(i=>i.classList.remove('sel')); items[Math.min(current+1, items.length-1)].classList.add('sel'); }
    if (e.key === 'ArrowUp') { e.preventDefault(); items.forEach(i=>i.classList.remove('sel')); items[Math.max(current-1, 0)].classList.add('sel'); }
    if (e.key === 'Enter') { const sel = $('.cmdk-item.sel') || items[0]; if (sel) { CmdK.close(); Router.go(sel.dataset.cmdkLink.replace('#/','')); } }
  }
});

/* Handle "New Challenge" route */
window.addEventListener('hashchange', () => {
  if (location.hash === '#/challenges/new') setTimeout(() => Wizard.open(), 100);
});

/* ============================================================
   19. BOOT
   ============================================================ */
Session.load();
Store.load();
document.documentElement.setAttribute('data-theme', Session.theme);
if (!location.hash) location.hash = Session.role ? '#/dashboard' : '#/role-select';
Router.render();

if (location.hash === '#/challenges/new') {
  setTimeout(() => Wizard.open(), 200);
}

console.log('%cPilot Bridge','font-size:16px;font-weight:800;color:#1B4D89','— Government Innovation Procurement & Pilot Management Platform');
console.log('%cDemo data loaded. Use ⌘K to search, or "Run Demo" on the dashboard.','color:#64748B');

})();
