const $ = (q, el=document) => el.querySelector(q);
const $$ = (q, el=document) => [...el.querySelectorAll(q)];
const cfg = window.DAEDALIUM_CONFIG || {};
const state = { faq: [], destinations: [], rooms: [], itineraries: [], deferredInstall: null };

const NAV = [
  ['home','Home','⌂'], ['booking','Prenota','↗'], ['rooms','Camere','▣'], ['spaces','Spazi','◒'],
  ['ai','Concierge IA','✦'], ['destinations','Destinazioni','⌖'], ['offers','Offerte','◇'], ['contact','Contatti','☎']
];

async function loadJSON(path, fallback){
  try { const r = await fetch(path); if(!r.ok) throw new Error(path); return await r.json(); }
  catch(e){ console.warn(e); return fallback; }
}

function bookingUrl(){ return cfg.bookingUrl || 'https://daedalium-1.amenitiz.io/'; }
function waUrl(text='Ciao Daedalium, vorrei informazioni per un soggiorno.'){
  const n = (cfg.whatsappNumber || '').replace(/\D/g,'');
  if(!n || n === '390000000000') return `mailto:${cfg.email || 'info@daedalium.it'}?subject=Richiesta soggiorno Daedalium&body=${encodeURIComponent(text)}`;
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}
function pageTitle(id){ return (NAV.find(n=>n[0]===id)||[])[1] || 'Home'; }
function navTo(id){ location.hash = id; }
function img(name){ return `assets/photos/${name}`; }

function layout(html){ $('#app').innerHTML = `<section class="view">${html}</section>`; setActive(); window.scrollTo({top:0, behavior:'instant'}); }

function hero(){
  return `<div class="hero"><div class="hero-card glass">
    <span class="hero-kicker">✦ Boutique cultural resort · Sicilia sud-occidentale</span>
    <h1>La tua oasi tra ulivi, mare e cultura.</h1>
    <p>Daedalium accompagna l’ospite dalla scoperta alla prenotazione: piscina, terrazza, colazione siciliana e un concierge IA che crea itinerari verso Scala dei Turchi, Punta Bianca e Valle dei Templi.</p>
    <div class="cta-row">
      <a class="btn primary" href="${bookingUrl()}" target="_blank" rel="noopener">Prenota diretto ↗</a>
      <button class="btn secondary" data-go="ai">Chiedi al Concierge IA ✦</button>
      <a class="btn ghost" href="${waUrl()}" target="_blank" rel="noopener">Richiedi su WhatsApp</a>
    </div>
    <div class="stat-row" style="margin-top:20px">
      <div class="stat"><b>Pool</b><span>Relax e atmosfera resort</span></div>
      <div class="stat"><b>Terrace</b><span>Vista, sole e momenti lenti</span></div>
      <div class="stat"><b>3 giorni</b><span>Itinerario IA consigliato</span></div>
      <div class="stat"><b>Direct</b><span>CTA sempre visibile</span></div>
    </div>
  </div></div>`;
}

function home(){
  layout(`${hero()}
  <div class="section"><div class="section-head"><div><h2>Scegli cosa vuoi fare</h2><p>Interfaccia da webapp: pochi tocchi, sezioni chiare e percorsi pensati per trasformare curiosità in prenotazione.</p></div></div>
  <div class="grid">
    ${tile('Prenota ora','Verifica disponibilità sul booking engine ufficiale.','↗','booking','span-3')}
    ${tile('Concierge IA','Itinerari, camere, FAQ e preventivo guidato.','✦','ai','span-3')}
    ${tile('Camere','Proposta camere orientata a coppie, famiglie e gruppi.','▣','rooms','span-3')}
    ${tile('Destinazioni','Scala dei Turchi, Punta Bianca, Valle dei Templi.','⌖','destinations','span-3')}
    <div class="span-8 photo-card glass" style="background-image:url('${img('pool.jpg')}')"><div class="overlay"><h3>Oasis of beauty</h3><p>Piscina, natura e silenzio come leva principale per coppie e ospiti in cerca di relax.</p></div></div>
    <div class="span-4 card glass"><h3>Messaggio vendita</h3><p>Daedalium non vende solo una camera: vende una base elegante tra mare e cultura, con itinerari personalizzati e prenotazione diretta.</p><div class="chips"><span class="chip">Relax</span><span class="chip">Mare</span><span class="chip">Cultura</span><span class="chip">Boutique</span></div></div>
  </div></div>
  ${leadBlock()}`);
}

function tile(title, text, icon, target, span='span-4'){
  return `<button class="${span} card tile glass" data-go="${target}"><span class="emoji">${icon}</span><span><h3>${title}</h3><p>${text}</p></span></button>`;
}

function booking(){
  layout(`<div class="section"><div class="section-head"><div><h2>Prenota diretto</h2><p>Pagina ponte per ridurre l’abbandono: prima rassicura, poi apre il booking engine ufficiale.</p></div></div>
  <div class="grid">
    <div class="span-7 card glass"><h3>Perché prenotare dal sito</h3><p>Il percorso diretto permette di parlare con la struttura, ricevere consigli personalizzati e scegliere meglio soggiorno, camera e itinerario.</p><div class="cta-row"><a class="btn primary" href="${bookingUrl()}" target="_blank" rel="noopener">Apri disponibilità ↗</a><button class="btn secondary" data-go="ai">Non so che date scegliere</button></div></div>
    <div class="span-5 card glass"><h3>Preventivo rapido</h3>${requestForm()}</div>
  </div></div>`);
  bindForms();
}

function rooms(){
  layout(`<div class="section"><div class="section-head"><div><h2>Camere</h2><p>Copy commerciale modulare: ogni camera viene raccontata per tipologia di ospite, non solo per dotazioni.</p></div></div>
  <div class="grid">
    <div class="span-5 photo-card glass" style="background-image:url('${img('rooms.jpg')}')"><div class="overlay"><h3>Rooms</h3><p>Spazi essenziali, atmosfera boutique, base comoda per esplorare.</p></div></div>
    <div class="span-7 grid">${state.rooms.map(r=>`<div class="span-12 card glass"><h3>${r.name}</h3><p>${r.text}</p><span class="chip">Ideale per ${r.ideal}</span><div class="cta-row"><a class="btn secondary" href="${waUrl('Ciao, mi consigliate la camera migliore per il mio soggiorno?')}" target="_blank">Chiedi consiglio</a></div></div>`).join('')}</div>
  </div></div>`);
}

function spaces(){
  const spaces = [
    ['Hall','Breakfast & Relax','hall.jpg','Uno spazio di accoglienza da trasformare in racconto: arrivo, colazione, attesa, conversazione.'],
    ['Terrazza','Sun, Sea view & Relax','terrace.jpg','La terrazza è perfetta per contenuti romantici: aperitivo, tramonto, lettura e vista.'],
    ['Piscina','Oasis of beauty','pool.jpg','La piscina è la leva visuale più forte per campagne social e booking diretto.'],
    ['Colazione','Sicilian Flavors','breakfast.jpg','La colazione può diventare promessa di territorio: sapori siciliani e inizio lento della giornata.']
  ];
  layout(`<div class="section"><div class="section-head"><div><h2>Spazi</h2><p>Le sezioni originali vengono mantenute e trasformate in pagine persuasive con CTA.</p></div></div><div class="grid">
  ${spaces.map(s=>`<div class="span-6 photo-card glass" style="background-image:url('${img(s[2])}')"><div class="overlay"><h3>${s[0]}</h3><p><b>${s[1]}</b><br>${s[3]}</p></div></div>`).join('')}
  </div></div>`);
}

function aiPage(){
  layout(`<div class="section"><div class="section-head"><div><h2>Concierge IA</h2><p>Versione pronta per GitHub Pages: risposte locali basate su FAQ e itinerari. Può diventare IA generativa collegando un endpoint serverless in config.js.</p></div></div>
    <div class="grid"><div class="span-8 card glass ai-box">
      <div class="quick">${['Weekend romantico','Itinerario 3 giorni','Quanto dista la Valle dei Templi?','Camera per coppia','Voglio prenotare'].map(x=>`<button data-ask="${x}">${x}</button>`).join('')}</div>
      <div class="chat" id="chat"></div>
      <form class="chat-input" id="chatForm"><input id="chatInput" placeholder="Scrivi una domanda: es. consigliami un soggiorno di 3 giorni"><button>Invia</button></form>
    </div><div class="span-4 card glass"><h3>Obiettivo commerciale</h3><p>Il concierge non deve solo rispondere: deve portare l’utente verso prenotazione, WhatsApp o itinerario personalizzato.</p><div class="notice">Per OpenAI reale: crea una Function su Vercel/Netlify che chiama l’API, poi inserisci l’URL in <b>config.js</b>.</div></div></div>
  </div>`);
  initChat();
}

function destinations(){
  const filters = ['Tutte','Southwest','Northwest','Northeast','Southeast'];
  layout(`<div class="section"><div class="section-head"><div><h2>Destinazioni</h2><p>Le mete diventano contenuti SEO e micro-landing, utili per campagne e ricerche tipo “dove dormire vicino Scala dei Turchi”.</p></div></div>
  <div class="chips" style="margin-bottom:12px">${filters.map(f=>`<button class="chip" data-filter="${f}">${f}</button>`).join('')}</div><div class="grid" id="destGrid"></div></div>`);
  renderDest('Tutte');
  $$('[data-filter]').forEach(b=>b.onclick=()=>renderDest(b.dataset.filter));
}
function renderDest(f){
  const list = f==='Tutte'?state.destinations:state.destinations.filter(d=>d.area===f);
  $('#destGrid').innerHTML = list.map(d=>`<div class="span-4 card tile glass"><span class="emoji">⌖</span><span><h3>${d.name}</h3><p>${d.text}</p><span class="chip">${d.tag}</span></span></div>`).join('');
}

function offers(){
  layout(`<div class="section"><div class="section-head"><div><h2>Offerte e landing</h2><p>Pacchetti pensati per domanda reale: weekend, coppie, feriali, itinerari culturali.</p></div></div><div class="grid">
    ${tile('Weekend romantico','2 notti, tramonto, piscina e Scala dei Turchi.','♡','booking','span-4')}
    ${tile('Mare + Cultura','3 notti tra Punta Bianca, Valle dei Templi e relax.','⌖','ai','span-4')}
    ${tile('Feriale Relax','Per riempire date a bassa domanda con valore percepito.','☼','contact','span-4')}
    <div class="span-12 card glass"><h3>Landing SEO consigliate</h3><div class="chips"><span class="chip">B&B con piscina vicino Scala dei Turchi</span><span class="chip">Resort romantico Agrigento</span><span class="chip">Dove dormire vicino Valle dei Templi</span><span class="chip">Weekend relax Sicilia sud-occidentale</span></div></div>
  </div></div>`);
}

function contact(){
  layout(`<div class="section"><div class="section-head"><div><h2>Contatti</h2><p>Palma di Montechiaro, provincia di Agrigento. Contrada Gibildolce a Capreria, sulle colline che costeggiano la costa.</p></div></div>
  <div class="grid"><div class="span-6 card glass"><h3>Scrivici</h3>${requestForm()}</div>
  <div class="span-6 card glass"><h3>Azioni rapide</h3><div class="cta-row"><a class="btn primary" href="${bookingUrl()}" target="_blank">Prenota diretto</a><a class="btn secondary" href="${waUrl()}" target="_blank">WhatsApp / Email</a><a class="btn ghost" href="${cfg.mapsUrl || '#'}" target="_blank">Apri mappa</a></div><div class="notice" style="margin-top:16px">Sostituisci numero WhatsApp ed email in <b>config.js</b>. Il modulo funziona anche senza backend perché genera un messaggio precompilato.</div></div>
  <div class="span-12 card glass"><h3>FAQ</h3><div class="accordion">${state.faq.map((f,i)=>`<div class="faq-item"><button class="faq-q">${f.q}<span>+</span></button><div class="faq-a">${f.a}</div></div>`).join('')}</div></div></div></div>`);
  bindForms(); initFAQ();
}

function leadBlock(){
  return `<div class="section"><div class="grid"><div class="span-7 card glass"><h2>Ti consigliamo il soggiorno ideale in 30 secondi</h2><p>Raccoglie lead caldi da utenti indecisi e genera una richiesta WhatsApp/email già personalizzata.</p></div><div class="span-5 card glass">${requestForm()}</div></div></div>`;
}
function requestForm(){
  return `<form class="form leadForm"><div class="field"><label>Date indicative</label><input name="dates" placeholder="Es. 12-15 luglio"></div><div class="field"><label>Tipo viaggio</label><select name="type"><option>Coppia</option><option>Famiglia</option><option>Amici</option><option>Solo relax</option><option>Evento / shooting</option></select></div><div class="field"><label>Interesse principale</label><select name="interest"><option>Relax e piscina</option><option>Mare</option><option>Cultura</option><option>Weekend romantico</option><option>Itinerario completo</option></select></div><div class="field"><label>Messaggio</label><textarea name="message" placeholder="Numero ospiti, preferenze, orario arrivo..."></textarea></div><button class="btn primary" type="submit">Genera richiesta</button></form>`;
}

function bindForms(){
  $$('.leadForm').forEach(form=>form.onsubmit=(e)=>{
    e.preventDefault(); const fd = new FormData(form);
    const text = `Ciao Daedalium, vorrei un consiglio per un soggiorno. Date: ${fd.get('dates')||'flessibili'}. Tipo viaggio: ${fd.get('type')}. Interesse: ${fd.get('interest')}. Note: ${fd.get('message')||'-'}`;
    localStorage.setItem('daedalium_last_lead', JSON.stringify(Object.fromEntries(fd.entries())));
    window.open(waUrl(text),'_blank');
  });
}

function initFAQ(){ $$('.faq-q').forEach(b=>b.onclick=()=>b.closest('.faq-item').classList.toggle('open')); }
function initChat(){
  const chat = $('#chat'); const input = $('#chatInput');
  function add(type, text){ const div=document.createElement('div'); div.className=`msg ${type}`; div.innerHTML=text; chat.appendChild(div); chat.scrollTop=chat.scrollHeight; }
  add('bot','Ciao, sono il Concierge IA di Daedalium. Posso consigliarti soggiorni, itinerari, camere e prossimi passi per prenotare.');
  async function answer(q){
    add('user', q);
    if(cfg.aiEndpoint){
      try{ const r=await fetch(cfg.aiEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q, context:{faq:state.faq,destinations:state.destinations,rooms:state.rooms,itineraries:state.itineraries}})}); const data=await r.json(); if(data.answer) return add('bot', data.answer); }catch(e){ console.warn(e); }
    }
    add('bot', localAnswer(q));
  }
  $('#chatForm').onsubmit=e=>{e.preventDefault(); const q=input.value.trim(); if(q){input.value=''; answer(q)}};
  $$('[data-ask]').forEach(b=>b.onclick=()=>answer(b.dataset.ask));
}
function localAnswer(q){
  const s=q.toLowerCase();
  if(s.includes('3') || s.includes('tre') || s.includes('itinerario')) return `Per 3 giorni consiglierei: <b>Giorno 1</b> arrivo, piscina e terrazza; <b>Giorno 2</b> Valle dei Templi e cena; <b>Giorno 3</b> Scala dei Turchi o Punta Bianca. Vuoi che apra una richiesta personalizzata? <br><br><a class="btn secondary" href="${waUrl('Ciao, vorrei un itinerario personalizzato di 3 giorni a Daedalium')}" target="_blank">Invia richiesta</a>`;
  if(s.includes('romant')) return `Per una coppia punterei su camera confortevole, arrivo nel pomeriggio, tramonto in terrazza, mattina lenta con colazione e mezza giornata tra Scala dei Turchi e piscina. <br><br><a class="btn primary" href="${bookingUrl()}" target="_blank">Verifica disponibilità</a>`;
  if(s.includes('camera')) return `Per una coppia suggerisco una soluzione più silenziosa e luminosa; per famiglia o amici meglio una camera più flessibile. Inserisci date e ospiti: la struttura può consigliarti la soluzione più adatta.`;
  if(s.includes('prenot')) return `Puoi prenotare direttamente dal booking ufficiale. Prima di uscire dalla webapp, valuta date flessibili: spesso aiutano a trovare disponibilità migliore. <br><br><a class="btn primary" href="${bookingUrl()}" target="_blank">Apri booking</a>`;
  if(s.includes('valle') || s.includes('scala') || s.includes('punta')) return `Sono le tre leve territoriali più forti: <b>Valle dei Templi</b> per cultura, <b>Scala dei Turchi</b> per paesaggio iconico, <b>Punta Bianca</b> per natura e mare. Daedalium va raccontato come base relax per scoprirle senza rinunciare alla piscina.`;
  const hit = state.faq.find(f => s.split(/\W+/).some(w => w.length>4 && f.q.toLowerCase().includes(w)));
  return hit ? hit.a : `Posso aiutarti con camere, itinerari, piscina, colazione, distanze e prenotazione diretta. Per convertire meglio ti propongo un percorso: scegli date indicative, tipo di viaggio e interesse principale, poi invia una richiesta personalizzata.`;
}

function route(){
  const id=(location.hash||'#home').replace('#','');
  const map={home,booking,rooms,spaces,ai:aiPage,destinations,offers,contact};
  (map[id]||home)(); document.title = `${pageTitle(id)} | Daedalium Guest App`;
}
function setActive(){ const id=(location.hash||'#home').replace('#',''); $$('[data-nav]').forEach(a=>a.classList.toggle('active',a.dataset.nav===id)); }
function initNav(){
  $('#drawerNav').innerHTML = NAV.map(n=>`<a href="#${n[0]}">${n[2]} ${n[1]}</a>`).join('');
  document.body.addEventListener('click', e=>{ const go=e.target.closest('[data-go]'); if(go) navTo(go.dataset.go); });
  $('#floatingAi').onclick=()=>navTo('ai');
  const drawer=$('#drawer'); $('#menuBtn').onclick=()=>drawer.classList.add('open'); $('#closeDrawer').onclick=()=>drawer.classList.remove('open'); drawer.onclick=e=>{if(e.target===drawer) drawer.classList.remove('open')};
  $('#drawerNav').onclick=()=>drawer.classList.remove('open');
}
async function initPWA(){
  if('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js').catch(console.warn);
  window.addEventListener('beforeinstallprompt', e=>{ e.preventDefault(); state.deferredInstall=e; $('#installBtn').style.display='grid'; });
  $('#installBtn').onclick=async()=>{ if(state.deferredInstall){ state.deferredInstall.prompt(); state.deferredInstall=null; } else alert('Su iPhone: Condividi → Aggiungi alla schermata Home. Su Chrome: menu → Installa app.'); };
}
async function boot(){
  initNav(); initPWA();
  [state.faq,state.destinations,state.rooms,state.itineraries] = await Promise.all([
    loadJSON('data/faq.json',[]), loadJSON('data/destinations.json',[]), loadJSON('data/rooms.json',[]), loadJSON('data/itineraries.json',[])
  ]);
  window.addEventListener('hashchange', route); route();
}
boot();
