const DEFAULT_STATE = {
  points: 95,
  completed: ['welcome', 'refuse-cutlery'],
  redeemed: [],
  onboardingSeen: false
};

const missions = [
  { id:'bramante', title:'Discover Via Bramante', category:'explore', points:20, icon:'⌖', location:'Via Bramante', description:"Step away from the busiest axis and discover another side of Chinatown.", detail:"Walk to the checkpoint on Via Bramante and scan the Sarpi Quest code. The mission encourages visitors to explore beyond Via Paolo Sarpi." },
  { id:'fabbrica', title:'Visit Fabbrica del Vapore', category:'explore', points:20, icon:'◇', location:'Fabbrica del Vapore', description:'Discover a cultural landmark just beyond the busiest part of Sarpi.', detail:'Reach the cultural checkpoint and scan the local code to confirm the discovery mission.' },
  { id:'canonico', title:'Explore Via Canonica', category:'explore', points:20, icon:'⌖', location:'Via Canonica', description:'Follow a secondary route and discover shops beyond the main visitor axis.', detail:'This mission distributes exploration across nearby streets and gives visitors a reason to move beyond the main corridor.' },
  { id:'rosmini', title:'Explore Via Rosmini', category:'explore', points:20, icon:'⌖', location:'Via Rosmini', description:'Add another lesser-known stop to your Chinatown journey.', detail:'Reach the checkpoint, learn one local fact and verify your visit with a scan.' },
  { id:'refuse-cutlery', title:'Refuse disposable cutlery', category:'refuse', points:10, icon:'✋', location:'Participating food partner', description:'Already have what you need? Skip unnecessary disposable cutlery.', detail:'At a participating business, choose not to take disposable cutlery when you do not need it. The business QR acts as prototype verification.' },
  { id:'own-bag', title:'Bring your own shopping bag', category:'refuse', points:10, icon:'▣', location:'Participating shop', description:'Avoid an unnecessary single-use bag during your visit.', detail:'Show your reusable bag at a participating shop and scan the local Sarpi Quest code.' },
  { id:'reusable-cup', title:'Use a reusable cup or bottle', category:'reuse', points:15, icon:'◒', location:'Participating café', description:'Choose a reusable option instead of a single-use cup or bottle.', detail:'Select the reusable option and verify the action at a participating location.' },
  { id:'return-container', title:'Return reusable packaging', category:'reuse', points:30, icon:'↺', location:'Return point', description:'Return a reusable container to a participating collection point.', detail:'This higher-value mission rewards the full return step, not just choosing the reusable item.' },
  { id:'eat-in', title:'Choose reusable tableware', category:'reuse', points:15, icon:'♨', location:'Participating restaurant', description:'Eat in and use reusable tableware instead of disposable takeaway packaging.', detail:'Complete this mission at a participating restaurant when reusable tableware is available.' },
  { id:'sort-plastic', title:'Sort eligible plastic packaging', category:'sort', points:15, icon:'♻', location:'Verified collection point', description:'Check the material, empty food residue and use the correct collection point.', detail:'Not every food package follows the same route. This mission only applies to eligible plastic packaging and uses a verified collection point.' },
  { id:'sort-glass', title:'Sort glass correctly', category:'sort', points:15, icon:'◉', location:'Verified collection point', description:'Empty the container and use the appropriate glass collection point.', detail:'Different materials require different disposal routes. Scan at the verified point after choosing the correct route.' },
  { id:'find-bin', title:'Find the correct collection point', category:'sort', points:10, icon:'▤', location:'Sarpi area', description:'Use the guide to identify the right disposal option for your item.', detail:'This mission focuses on making correct disposal easier rather than rewarding disposal without verification.' }
];

const rewards = [
  { id:'sample', cost:50, title:'Local food sample', partner:'Participating food partner', icon:'🥟' },
  { id:'drink', cost:80, title:'Small coffee / drink', partner:'Participating local business', icon:'☕' },
  { id:'discount', cost:100, title:'10% local discount', partner:'Selected participating business', icon:'%' },
  { id:'pin', cost:150, title:'Limited Sarpi pin', partner:'Collectible local souvenir', icon:'★' }
];

const badges = [
  { id:'first', title:'First Step', icon:'✓', text:'Complete your first mission.', check:s=>s.completed.length>=1 },
  { id:'side', title:'Side Street Seeker', icon:'⌖', text:'Complete 3 exploration missions.', check:s=>countCategory(s,'explore')>=3 },
  { id:'reuse', title:'Reuse Rookie', icon:'↺', text:'Complete your first reuse action.', check:s=>countCategory(s,'reuse')>=1 },
  { id:'wise', title:'Waste Wise', icon:'♻', text:'Complete 3 responsible missions.', check:s=>countResponsible(s)>=3 }
];

function loadState(){
  const saved = localStorage.getItem('sarpiQuestState');
  if(!saved) return {...DEFAULT_STATE};
  try { return {...DEFAULT_STATE, ...JSON.parse(saved)}; } catch { return {...DEFAULT_STATE}; }
}
let state = loadState();
let pendingMission = null;
let currentCategory = 'all';

function saveState(){ localStorage.setItem('sarpiQuestState', JSON.stringify(state)); }
function countCategory(s, category){ return s.completed.filter(id => missions.find(m=>m.id===id)?.category===category).length; }
function countResponsible(s){ return s.completed.filter(id => ['refuse','reuse','sort'].includes(missions.find(m=>m.id===id)?.category)).length; }
function placesCount(){ return countCategory(state,'explore'); }
function missionById(id){ return missions.find(m=>m.id===id); }
function categoryLabel(cat){ return ({explore:'EXPLORE',refuse:'REFUSE / REDUCE',reuse:'REUSE',sort:'SORT'})[cat] || cat.toUpperCase(); }
function categoryClass(cat){ return ({explore:'explore-tag',refuse:'refuse-tag',reuse:'reuse-tag',sort:'sort-tag'})[cat]; }

function updateStats(){
  const els = {
    headerPoints:state.points, homePoints:state.points, rewardPoints:state.points, profilePoints:state.points,
    homeCompleted:state.completed.filter(id=>id!=='welcome').length,
    homePlaces:placesCount(), profileMissions:state.completed.filter(id=>id!=='welcome').length,
    profilePlaces:placesCount(), profileActions:countResponsible(state),
    profileLevel: Math.max(1, Math.floor(state.completed.filter(id=>id!=='welcome').length / 3)+1)
  };
  Object.entries(els).forEach(([id,val])=>{ const el=document.getElementById(id); if(el) el.textContent=val; });
}

function renderMissions(){
  const list = document.getElementById('missionsList');
  const filtered = currentCategory==='all' ? missions : missions.filter(m=>m.category===currentCategory);
  list.innerHTML = filtered.map(m=>{
    const done = state.completed.includes(m.id);
    return `<article class="mission-card ${done?'completed':''}" data-open-mission="${m.id}">
      <div>
        <span class="tag ${categoryClass(m.category)}">${categoryLabel(m.category)}</span>
        <h3>${m.icon} ${m.title}</h3>
        <p>${m.description}</p>
      </div>
      <div class="points">+${m.points} PTS</div>
    </article>`;
  }).join('');
}

function renderExplore(){
  const ids = ['bramante','fabbrica','canonico','rosmini'];
  document.getElementById('exploreList').innerHTML = ids.map((id,i)=>{
    const m=missionById(id); const done=state.completed.includes(id);
    return `<article class="mini-item" data-open-mission="${id}">
      <span class="mini-index">${done?'✓':i+1}</span>
      <span><strong>${m.title}</strong><small>${m.location}</small></span>
      <b>${done?'DONE':'+'+m.points}</b>
    </article>`;
  }).join('');
  ids.forEach((id,i)=>{
    const pin=[...document.querySelectorAll('.map-pin[data-open-mission]')].find(p=>p.dataset.openMission===id);
    if(pin && state.completed.includes(id)) pin.querySelector('span').style.background='var(--green)';
  });
}

function renderRewards(){
  const list=document.getElementById('rewardsList');
  list.innerHTML = rewards.map(r=>{
    const redeemed=state.redeemed.includes(r.id);
    const can=state.points>=r.cost && !redeemed;
    return `<article class="reward-card">
      <div class="reward-art">${r.icon}</div>
      <div class="reward-body">
        <span class="cost">${r.cost} POINTS</span>
        <h3>${r.title}</h3>
        <p>${r.partner}</p>
        <button class="${can?'primary-btn':'secondary-btn'} full" data-redeem="${r.id}" ${(!can)?'disabled':''}>${redeemed?'Redeemed':state.points<r.cost?'Need more points':'Redeem'}</button>
      </div>
    </article>`;
  }).join('');
}

function renderProfile(){
  document.getElementById('badgesGrid').innerHTML = badges.map(b=>{
    const unlocked=b.check(state);
    return `<div class="badge ${unlocked?'':'locked'}"><div class="badge-icon">${unlocked?b.icon:'🔒'}</div><strong>${b.title}</strong><small>${b.text}</small></div>`;
  }).join('');
  const completed = state.completed.filter(id=>id!=='welcome').map(missionById).filter(Boolean);
  document.getElementById('historyList').innerHTML = completed.length ? completed.map(m=>`<div class="history-item"><span class="history-check">✓</span><span><strong>${m.title}</strong><small>${categoryLabel(m.category)}</small></span><b>+${m.points}</b></div>`).join('') : `<p class="fine-print">No missions completed yet.</p>`;
}

function renderAll(){ updateStats(); renderMissions(); renderExplore(); renderRewards(); renderProfile(); }

function routeTo(route){
  document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active', s.dataset.screen===route));
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active', b.dataset.route===route));
  window.scrollTo({top:0,behavior:'smooth'});
  renderAll();
}

function openMission(id){
  const m=missionById(id); if(!m) return;
  const done=state.completed.includes(id);
  document.getElementById('missionModalContent').innerHTML = `
    <div class="mission-modal-icon">${m.icon}</div>
    <span class="tag ${categoryClass(m.category)}">${categoryLabel(m.category)}</span>
    <h2>${m.title}</h2>
    <p>${m.detail}</p>
    <div class="mission-meta">
      <div class="meta-box"><small>Reward</small><strong>+${m.points} Sarpi Points</strong></div>
      <div class="meta-box"><small>Where</small><strong>${m.location}</strong></div>
    </div>
    ${done ? `<button class="secondary-btn full" disabled>Mission completed ✓</button>` : `<button class="primary-btn full" data-scan-mission="${m.id}">Scan to verify</button>`}`;
  openModal('missionModal');
}

function openModal(id){ const el=document.getElementById(id); el.classList.add('open'); el.setAttribute('aria-hidden','false'); }
function closeModal(id){ const el=document.getElementById(id); el.classList.remove('open'); el.setAttribute('aria-hidden','true'); }

function startScan(id){ pendingMission=id; closeModal('missionModal'); openModal('scanModal'); }
function completePending(){
  if(!pendingMission) return;
  const m=missionById(pendingMission);
  if(!state.completed.includes(m.id)){
    state.completed.push(m.id);
    state.points += m.points;
    saveState();
  }
  closeModal('scanModal');
  document.getElementById('successTitle').textContent=`+${m.points} Sarpi Points`;
  document.getElementById('successText').textContent = m.category==='explore' ? 'New place discovered. Keep exploring beyond the main street.' : 'Responsible action verified. Your points have been added.';
  document.getElementById('successBalance').textContent=state.points;
  openModal('successModal');
  renderAll();
  pendingMission=null;
}

function redeemReward(id){
  const r=rewards.find(x=>x.id===id); if(!r || state.points<r.cost || state.redeemed.includes(id)) return;
  state.points-=r.cost; state.redeemed.push(id); saveState(); renderAll();
  document.getElementById('rewardModalTitle').textContent=r.title;
  document.getElementById('redeemCodeText').textContent='SARPI-'+String(Math.floor(1000+Math.random()*8999));
  openModal('rewardModal');
}

function applyFilter(cat){
  currentCategory=cat;
  document.querySelectorAll('.filter').forEach(f=>f.classList.toggle('active',f.dataset.category===cat));
  renderMissions(); routeTo('missions');
}

function initEvents(){
  document.addEventListener('click', e=>{
    const route=e.target.closest('[data-route]'); if(route){ routeTo(route.dataset.route); return; }
    const mission=e.target.closest('[data-open-mission]'); if(mission){ openMission(mission.dataset.openMission); return; }
    const scan=e.target.closest('[data-scan-mission]'); if(scan){ startScan(scan.dataset.scanMission); return; }
    const close=e.target.closest('[data-close-modal]'); if(close){ closeModal('missionModal'); return; }
    const closeScan=e.target.closest('[data-close-scan]'); if(closeScan){ closeModal('scanModal'); return; }
    const closeReward=e.target.closest('[data-close-reward]'); if(closeReward){ closeModal('rewardModal'); return; }
    const redeem=e.target.closest('[data-redeem]'); if(redeem){ redeemReward(redeem.dataset.redeem); return; }
    const filter=e.target.closest('.filter'); if(filter){ currentCategory=filter.dataset.category; document.querySelectorAll('.filter').forEach(f=>f.classList.toggle('active',f===filter)); renderMissions(); return; }
    const responsible=e.target.closest('[data-filter="responsible"]'); if(responsible){ applyFilter('refuse'); return; }
    const successRoute=e.target.closest('[data-success-route]'); if(successRoute){ closeModal('successModal'); routeTo(successRoute.dataset.successRoute); return; }
  });
  document.getElementById('simulateScan').addEventListener('click',completePending);
  document.getElementById('resetDemo').addEventListener('click',()=>{
    if(confirm('Reset points, missions and rewards for the demo?')){
      state={...DEFAULT_STATE,onboardingSeen:true,completed:['welcome','refuse-cutlery']}; saveState(); renderAll(); routeTo('home');
    }
  });
  ['missionModal','scanModal','successModal','rewardModal'].forEach(id=>{
    document.getElementById(id).addEventListener('click',e=>{ if(e.target.id===id) closeModal(id); });
  });
}

function initOnboarding(){
  const overlay=document.getElementById('onboarding');
  let step=0;
  if(!state.onboardingSeen) overlay.classList.add('open');
  const update=()=>{
    document.querySelectorAll('.onboarding-step').forEach((el,i)=>el.classList.toggle('active',i===step));
    document.querySelectorAll('.onboarding-dots i').forEach((el,i)=>el.classList.toggle('active',i===step));
    document.getElementById('onboardingNext').textContent=step===2?'Start the quest':'Next';
  };
  document.getElementById('onboardingNext').addEventListener('click',()=>{
    if(step<2){ step++; update(); }
    else { state.onboardingSeen=true; saveState(); overlay.classList.remove('open'); }
  });
  document.getElementById('skipOnboarding').addEventListener('click',()=>{ state.onboardingSeen=true; saveState(); overlay.classList.remove('open'); });
}

initEvents(); initOnboarding(); renderAll();
