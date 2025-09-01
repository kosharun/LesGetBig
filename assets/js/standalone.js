(function(){
	// --- UI Utils ---
	function showToast(message, variant = 'success', delay = 2500) {
		const container = document.getElementById('toastContainer');
		const wrapper = document.createElement('div');
		wrapper.innerHTML = `
			<div class="toast align-items-center text-bg-${variant} border-0" role="status" aria-live="polite" aria-atomic="true">
				<div class="d-flex">
					<div class="toast-body">${message}</div>
					<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
				</div>
			</div>`;
		const toastEl = wrapper.firstElementChild;
		container.appendChild(toastEl);
		const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay });
		toast.show();
		toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
	}

	function renderNav() {
		const nav = document.getElementById('nav-links');
		if (!nav) return;
		const session = getSession();
		let links = [];
		if (!session) {
			links = [ ['Prijava', '#/login'], ['Registracija', '#/register'] ];
		} else if (session.role === 'trainer') {
			links = [ ['Kontrolna tabla', '#/dashboard'], ['Profili', '#/profiles'], ['Raspored', '#/schedule'], ['Napredak', '#/progress'], ['Planovi', '#/plans'], ['Poruke', '#/chat'] ];
		} else {
			links = [ ['Kontrolna tabla', '#/dashboard'], ['Profil', '#/profiles'], ['Raspored', '#/schedule'], ['Napredak', '#/progress'], ['Planovi', '#/plans'], ['Poruke', '#/chat'] ];
		}
		nav.innerHTML = links.map(([label, href]) => `<li class="nav-item"><a class="nav-link" href="${href}">${label}</a></li>`).join('');
	}

	// --- Storage ---
	const DB_NAME = 'lesgetbig';
	const DB_VERSION = 1;
	const STORE_NAMES = ['users','profiles','workouts','nutrition','schedules','progress','messages','plans'];

	class IndexedDbDriver {
		constructor(){ this.db = null; }
		init(){
			return new Promise((resolve,reject)=>{
				const req = indexedDB.open(DB_NAME, DB_VERSION);
				req.onupgradeneeded = (e)=>{
					const db = e.target.result;
					for (const name of STORE_NAMES){
						if (!db.objectStoreNames.contains(name)){
							const store = db.createObjectStore(name, { keyPath: 'id' });
							store.createIndex('by_ownerId','ownerId',{unique:false});
							store.createIndex('by_userId','userId',{unique:false});
						}
					}
				};
				req.onsuccess = () => { this.db = req.result; resolve(); };
				req.onerror = () => reject(req.error);
			});
		}
		_tx(store, mode='readonly'){ return this.db.transaction(store, mode).objectStore(store); }
		getAll(store){ return new Promise((res,rej)=>{ const r=this._tx(store).getAll(); r.onsuccess=()=>res(r.result||[]); r.onerror=()=>rej(r.error); }); }
		get(store,id){ return new Promise((res,rej)=>{ const r=this._tx(store).get(id); r.onsuccess=()=>res(r.result||null); r.onerror=()=>rej(r.error); }); }
		put(store,val){ return new Promise((res,rej)=>{ const r=this._tx(store,'readwrite').put(val); r.onsuccess=()=>res(val); r.onerror=()=>rej(r.error); }); }
		delete(store,id){ return new Promise((res,rej)=>{ const r=this._tx(store,'readwrite').delete(id); r.onsuccess=()=>res(); r.onerror=()=>rej(r.error); }); }
	}

	class LocalStorageDriver {
		constructor(){ this.prefix = `${DB_NAME}:`; }
		async init(){}
		_allKey(s){ return `${this.prefix}${s}`; }
		_read(s){ const raw = localStorage.getItem(this._allKey(s)); return raw?JSON.parse(raw):[]; }
		_write(s, items){ localStorage.setItem(this._allKey(s), JSON.stringify(items)); }
		async getAll(s){ return this._read(s); }
		async get(s,id){ return this._read(s).find(i=>i.id===id)||null; }
		async put(s,val){ const items=this._read(s); const idx=items.findIndex(i=>i.id===val.id); if(idx>=0) items[idx]=val; else items.push(val); this._write(s,items); return val; }
		async delete(s,id){ const items=this._read(s).filter(i=>i.id!==id); this._write(s,items); }
	}

	const Storage = {
		driver:null,
		async init(){
			try{
				if(!('indexedDB' in window)) throw new Error('no idb');
				this.driver = new IndexedDbDriver();
				await this.driver.init();
			}catch{
				this.driver = new LocalStorageDriver();
				await this.driver.init();
			}
		},
		getAll(store){ return this.driver.getAll(store); },
		get(store,id){ return this.driver.get(store,id); },
		put(store,val){ return this.driver.put(store,val); },
		delete(store,id){ return this.driver.delete(store,id); },
		stores: STORE_NAMES,
	};

	function generateId(prefix='id'){ return `${prefix}_${Math.random().toString(36).slice(2,10)}_${Date.now().toString(36)}`; }

	// --- Seeds (inline) ---
	const INLINE_SEEDS = {
		users:[
			{ id:'user_trainer_1', name:'Alex Coach', email:'trainer@demo.app', role:'trainer', passwordHash:'' },
			{ id:'user_client_1', name:'Chris Client', email:'client@demo.app', role:'client', passwordHash:'' },
		],
		profiles:[
			{ id:'profile_trainer_1', userId:'user_trainer_1', bio:'Certified strength coach.', age:32, heightCm:180, weightKg:82 },
			{ id:'profile_client_1', userId:'user_client_1', bio:'New to lifting.', age:27, heightCm:175, weightKg:72 },
		],
		workouts:[ { id:'workout_1', ownerId:'user_trainer_1', title:'Full Body A', exercises:[{name:'Squat',sets:3,reps:'6-8'},{name:'Bench Press',sets:3,reps:'6-8'},{name:'Row',sets:3,reps:'8-10'}] } ],
		nutrition:[ { id:'nutrition_1', ownerId:'user_trainer_1', title:'Cutting Plan', calories:2200, protein:180, carbs:200, fat:70 } ],
		schedules:[ { id:'sess_1', clientId:'user_client_1', date:'2025-09-01', time:'09:00', title:'Lower Body' }, { id:'sess_2', clientId:'user_client_1', date:'2025-09-03', time:'09:00', title:'Upper Body' } ],
		progress:[ { id:'prog_1', userId:'user_client_1', date:'2025-08-20', metric:'weightKg', value:72.5 }, { id:'prog_2', userId:'user_client_1', date:'2025-08-27', metric:'weightKg', value:72.0 } ],
		messages:[ { id:'msg_1', fromId:'user_trainer_1', toId:'user_client_1', text:'Welcome to Forma+!', sentAt:'2025-08-25T10:00:00.000Z' }, { id:'msg_2', fromId:'user_client_1', toId:'user_trainer_1', text:'Thanks coach!', sentAt:'2025-08-25T10:05:00.000Z' } ],
		plans:[ { id:'plan_1', clientId:'user_client_1', type:'training', title:'4-week Strength', details:'Week 1-4: Progression on compound lifts.' }, { id:'plan_2', clientId:'user_client_1', type:'nutrition', title:'High Protein Meal Plan', details:'Aim 180g protein daily. Hydrate well.' } ],
	};

	const SEED_FLAG = 'lg-seeded-v1';
	async function sha256(text){ const enc=new TextEncoder().encode(text); const buf=await crypto.subtle.digest('SHA-256', enc); return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join(''); }
	async function seedIfNeeded(){
		if (localStorage.getItem(SEED_FLAG)) return;
		const data = JSON.parse(JSON.stringify(INLINE_SEEDS));
		const demoHash = await sha256('demo123');
		data.users = data.users.map(u => ({...u, passwordHash: u.passwordHash && u.passwordHash.length ? u.passwordHash : demoHash }));
		for (const [store, items] of Object.entries(data)){
			for (const item of items){ if (!item.id) item.id = generateId(store); await Storage.put(store, item); }
		}
		localStorage.setItem(SEED_FLAG, '1');
	}

	async function exportDb(){
		const data={};
		for (const store of Storage.stores){ data[store] = await Storage.getAll(store); }
		return new Blob([JSON.stringify({version:1, exportedAt:new Date().toISOString(), data}, null, 2)], { type:'application/json' });
	}

	async function importDb(text){
		const parsed = JSON.parse(text);
		const data = parsed.data || {};
		for (const [store, items] of Object.entries(data)){
			for (const item of items){ await Storage.put(store, item); }
		}
		localStorage.setItem(SEED_FLAG,'1');
		showToast('Import complete');
	}

	// --- Auth ---
	const SESSION_KEY = 'lg-session';
	function getSession(){ const raw=sessionStorage.getItem(SESSION_KEY); return raw?JSON.parse(raw):null; }
	function setSession(s){ sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
	function logout(){ sessionStorage.removeItem(SESSION_KEY); }
	async function register(payload){
		const { name, email, password, role } = payload;
		const users = await Storage.getAll('users');
		if (users.some(u=>u.email.toLowerCase()===email.toLowerCase())) throw new Error('Email already registered');
		const id = generateId('user');
		const user = { id, name, email, role, passwordHash: await sha256(password), createdAt: new Date().toISOString() };
		await Storage.put('users', user);
		await Storage.put('profiles', { id: generateId('profile'), userId: id, bio:'', age:null, heightCm:null, weightKg:null });
		setSession({ userId:id, role, name, email });
		return user;
	}
	async function login(email,password){
		const users = await Storage.getAll('users');
		const user = users.find(u=>u.email.toLowerCase()===email.toLowerCase());
		if(!user) throw new Error('Invalid credentials');
		const hash = await sha256(password);
		if (user.passwordHash !== hash) throw new Error('Invalid credentials');
		setSession({ userId:user.id, role:user.role, name:user.name, email:user.email });
		return user;
	}

	// --- Router ---
	const routes = {
		'/login': renderLogin,
		'/register': renderRegister,
		'/dashboard': renderDashboard,
		'/profiles': renderProfiles,
		'/schedule': renderSchedule,
		'/progress': renderProgress,
		'/plans': renderPlans,
		'/chat': renderChat,
		'/settings': renderSettings,
	};
	const publicRoutes = new Set(['/login','/register']);
	function parseHash(){ const hash=location.hash||'#/dashboard'; const [path,qs]=hash.replace(/^#/,'').split('?'); const params=new URLSearchParams(qs||''); return { path, params }; }
	async function handleRoute(){
		const root=document.getElementById('app-root');
		const { path, params } = parseHash();
		const session=getSession();
		if (!publicRoutes.has(path) && !session){ location.hash = '#/login'; return; }
		try{ const render = routes[path] || routes['/dashboard']; await render(root,{Storage,params}); renderNav(); }catch(err){ console.error(err); showToast('Page failed to load','danger'); }
	}
	function initRouter(){ window.addEventListener('hashchange', handleRoute); handleRoute(); }

	// --- Views ---
	function renderLogin(root){
		root.innerHTML = `
			<div class="row justify-content-center">
				<div class="col-md-6 col-lg-5">
					<div class="card shadow-sm"><div class="card-body">
						<h1 class="h4 mb-3">Dobrodošli nazad</h1>
						<form id="loginForm" novalidate>
							<div class="mb-3"><label class="form-label">Email</label><input type="email" class="form-control" id="loginEmail" required /></div>
							<div class="mb-3"><label class="form-label">Lozinka</label><input type="password" class="form-control" id="loginPassword" required /></div>
							<button class="btn btn-primary w-100" type="submit">Prijava</button>
						</form>
						<div class="mt-3 text-center"><a href="#/register">Kreiraj nalog</a></div>
					</div></div>
				</div>
			</div>`;
		document.getElementById('loginForm').addEventListener('submit', async (e)=>{
			e.preventDefault();
			const email = document.getElementById('loginEmail').value.trim();
			const password = document.getElementById('loginPassword').value;
			try{ await login(email,password); showToast('Dobrodošli'); location.hash = '#/dashboard'; }catch(err){ showToast('Neuspješna prijava','danger'); }
		});
	}

	function renderRegister(root){
		root.innerHTML = `
			<div class="row justify-content-center">
				<div class="col-md-7 col-lg-6">
					<div class="card shadow-sm"><div class="card-body">
						<h1 class="h4 mb-3">Kreiraj nalog</h1>
						<form id="regForm" novalidate>
							<div class="row g-3">
								<div class="col-12"><label class="form-label">Ime i prezime</label><input type="text" class="form-control" id="regName" required /></div>
								<div class="col-md-6"><label class="form-label">Email</label><input type="email" class="form-control" id="regEmail" required /></div>
								<div class="col-md-6"><label class="form-label">Uloga</label><select class="form-select" id="regRole" required><option value="trainer">Trener</option><option value="client" selected>Klijent</option></select></div>
								<div class="col-md-6"><label class="form-label">Lozinka</label><input type="password" class="form-control" id="regPassword" minlength="6" required /></div>
								<div class="col-md-6"><label class="form-label">Potvrdi lozinku</label><input type="password" class="form-control" id="regPassword2" minlength="6" required /></div>
							</div>
							<div class="mt-3 d-grid"><button class="btn btn-primary" type="submit">Kreiraj nalog</button></div>
						</form>
						<div class="mt-3 text-center"><a href="#/login">Imate nalog? Prijavite se</a></div>
					</div></div>
				</div>
			</div>`;
		document.getElementById('regForm').addEventListener('submit', async (e)=>{
			e.preventDefault();
			const name=document.getElementById('regName').value.trim();
			const email=document.getElementById('regEmail').value.trim();
			const role=document.getElementById('regRole').value;
			const pw=document.getElementById('regPassword').value;
			const pw2=document.getElementById('regPassword2').value;
			if (pw!==pw2) return showToast('Lozinke se ne podudaraju','danger');
			try{ await register({name,email,password:pw,role}); showToast('Nalog kreiran'); location.hash = '#/dashboard'; }catch(err){ showToast('Neuspješna registracija','danger'); }
		});
	}

	async function renderDashboard(root){
		const session=getSession();
		if (session.role==='trainer') return renderTrainerDash(root);
		return renderClientDash(root);
	}
	async function renderTrainerDash(root){
		const users=await Storage.getAll('users');
		const clients=users.filter(u=>u.role==='client');
		const schedules=await Storage.getAll('schedules');
		const today=new Date().toISOString().slice(0,10);
		const todaySessions=schedules.filter(s=>s.date===today);
		root.innerHTML=`
			<div class="row g-3">
				<div class="col-12 col-lg-4"><div class="card h-100"><div class="card-body"><h2 class="h5">Klijenti</h2><p class="display-6">${clients.length}</p></div></div></div>
				<div class="col-12 col-lg-4"><div class="card h-100"><div class="card-body"><h2 class="h5">Današnji treninzi</h2><p class="display-6">${todaySessions.length}</p></div></div></div>
				<div class="col-12 col-lg-4"><div class="card h-100"><div class="card-body"><h2 class="h5">Brze akcije</h2><div class="d-grid gap-2"><a class="btn btn-primary" href="#/schedule">Kreiraj termin</a><a class="btn btn-outline-primary" href="#/plans">Novi plan</a></div></div></div></div>
			</div>
			<div class="row mt-3"><div class="col-12"><div class="card"><div class="card-body"><h2 class="h5 mb-3">Danas</h2><div class="list-group">${todaySessions.map(s=>`<div class=\"list-group-item d-flex justify-content-between align-items-center\"><div><div class=\"fw-semibold\">${(s.time||'').slice(0,5)} • ${esc(s.title||'Termin')}</div><small>Klijent: ${userName(users,s.clientId)}</small></div><a class=\"btn btn-sm btn-outline-secondary\" href=\"#/schedule\">Uredi</a></div>`).join('')||'<div class="text-muted">Nema termina</div>'}</div></div></div></div></div>`;
	}
	async function renderClientDash(root){
		const session=getSession();
		const schedules=await Storage.getAll('schedules');
		const upcoming=schedules.filter(s=>s.clientId===session.userId).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))[0];
		const progress=await Storage.getAll('progress');
		const myProg=progress.filter(p=>p.userId===session.userId);
		root.innerHTML=`
			<div class="row g-3">
				<div class="col-12 col-lg-6"><div class="card h-100"><div class="card-body"><h2 class="h5">Sljedeći trening</h2>${upcoming?`<div>${upcoming.date} ${(upcoming.time||'').slice(0,5)} – ${esc(upcoming.title||'Termin')}</div>`:'<div class="text-muted">Nema zakazanih termina</div>'}</div></div></div>
				<div class="col-12 col-lg-6"><div class="card h-100"><div class="card-body"><h2 class="h5">Napredak (zapisi)</h2><p class="display-6">${myProg.length}</p></div></div></div>
			</div>`;
	}

	async function renderProfiles(root){
		const session=getSession();
		const isTrainer=session.role==='trainer';
		const users=await Storage.getAll('users');
		const profiles=await Storage.getAll('profiles');
		if (isTrainer){
			root.innerHTML=`
				<div class="d-flex justify-content-between align-items-center mb-3"><h1 class="h4 mb-0">Profiles</h1><div class="input-group" style="max-width:340px"><span class="input-group-text">Search</span><input class="form-control" id="searchInput" placeholder="Name or email" /></div></div>
				<div class="row g-3" id="profileGrid"></div>`;
			const grid=document.getElementById('profileGrid');
			renderGrid(grid,users,profiles,'');
			document.getElementById('searchInput').addEventListener('input',e=>renderGrid(grid,users,profiles,e.target.value.toLowerCase()));
		}else{
			const myProfile = profiles.find(p=>p.userId===session.userId) || { id: generateId('profile'), userId: session.userId };
			root.innerHTML=`
				<div class="row justify-content-center"><div class="col-md-8"><div class="card"><div class="card-body"><h1 class="h4">My Profile</h1><form id="profileForm" class="mt-3" novalidate>
					<div class="row g-3">
						<div class="col-md-6"><label class="form-label">Age</label><input type="number" min="10" max="100" class="form-control" id="pAge" value="${safe(myProfile.age)}" /></div>
						<div class="col-md-6"><label class="form-label">Height (cm)</label><input type="number" min="100" max="250" class="form-control" id="pHeight" value="${safe(myProfile.heightCm)}" /></div>
						<div class="col-md-6"><label class="form-label">Weight (kg)</label><input type="number" min="30" max="300" class="form-control" id="pWeight" value="${safe(myProfile.weightKg)}" /></div>
						<div class="col-12"><label class="form-label">Bio</label><textarea class="form-control" rows="3" id="pBio">${safe(myProfile.bio)}</textarea></div>
					</div>
					<div class="mt-3 d-grid"><button class="btn btn-primary" type="submit">Save</button></div>
				</form></div></div></div></div>`;
			document.getElementById('profileForm').addEventListener('submit', async (e)=>{
				e.preventDefault();
				const age=numOrNull(document.getElementById('pAge').value);
				const heightCm=numOrNull(document.getElementById('pHeight').value);
				const weightKg=numOrNull(document.getElementById('pWeight').value);
				const bio=document.getElementById('pBio').value.trim();
				if (age && (age<10||age>100)) return showToast('Invalid age','danger');
				if (heightCm && (heightCm<100||heightCm>250)) return showToast('Invalid height','danger');
				if (weightKg && (weightKg<30||weightKg>300)) return showToast('Invalid weight','danger');
				await Storage.put('profiles', { ...myProfile, age, heightCm, weightKg, bio });
				showToast('Profile saved');
			});
		}

		function renderGrid(grid, users, profiles, q){
			const rows=users.filter(u=>u.role==='client').filter(u=>(u.name+' '+u.email).toLowerCase().includes(q)).map(u=>{
				const p=profiles.find(p=>p.userId===u.id)||{};
				return `<div class="col-md-6 col-lg-4"><div class="card h-100"><div class="card-body"><h3 class="h6 mb-1">${esc(u.name)}</h3><div class="text-muted small mb-2">${esc(u.email)}</div><div class="small">Age: ${safe(p.age)||'-'} | H: ${safe(p.heightCm)||'-'}cm | W: ${safe(p.weightKg)||'-'}kg</div><div class="small text-truncate">${esc(p.bio||'')}</div></div></div></div>`;
			}).join('');
			grid.innerHTML = rows || `<div class="col-12"><div class="card card-empty"><div class="card-body text-center text-muted">No clients found</div></div></div>`;
		}
	}

	async function renderSchedule(root){
		const session=getSession();
		const users=await Storage.getAll('users');
		const all=await Storage.getAll('schedules');
		const mine=session.role==='trainer'?all:all.filter(s=>s.clientId===session.userId);
		root.innerHTML=`
			<div class="row g-3">
				<div class="col-lg-5"><div class="card h-100"><div class="card-body"><h2 class="h5">${session.role==='trainer'?'Kreiraj / Uredi termin':'Moj raspored'}</h2>${session.role==='trainer'?form(users):''}</div></div></div>
				<div class="col-lg-7"><div class="card h-100"><div class="card-body"><h2 class="h5">Nadolazeće</h2><div class="list-group" id="sessionList"></div></div></div></div>
			</div>`;
		const list=document.getElementById('sessionList');
		const sorted=mine.sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
		list.innerHTML=sorted.map(s=>row(users,s,session)).join('')||`<div class="text-muted">Nema termina</div>`;
		if (session.role==='trainer') bindForm(users,all);

		function form(users){
			const clientOpts=users.filter(u=>u.role==='client').map(u=>`<option value="${u.id}">${esc(u.name)} (${esc(u.email)})</option>`).join('');
			return `<form id="sessForm" class="mt-2" novalidate><div class="row g-2"><div class="col-12"><label class="form-label">Klijent</label><select class="form-select" id="sfClientId" required>${clientOpts}</select></div><div class="col-md-6"><label class="form-label">Datum</label><input type="date" class="form-control" id="sfDate" required /></div><div class="col-md-6"><label class="form-label">Vrijeme</label><input type="time" class="form-control" id="sfTime" required /></div><div class="col-12"><label class="form-label">Naslov</label><input class="form-control" id="sfTitle" placeholder="npr. Donji dio tijela" /></div><div class="col-12 d-grid"><button class="btn btn-primary" type="submit">Sačuvaj termin</button></div></div></form>`;
		}
		function row(users,s,session){ const client=users.find(u=>u.id===s.clientId); return `<div class="list-group-item d-flex justify-content-between align-items-center"><div><div class="fw-semibold">${s.date} ${s.time?.slice(0,5)} • ${esc(s.title||'Termin')}</div><small class="text-muted">Klijent: ${esc(client?.name||'Nepoznato')}</small></div>${session.role==='trainer'?`<button class="btn btn-sm btn-outline-danger" data-id="${s.id}" data-action="delete">Obriši</button>`:''}</div>`; }
		function hasConflict(all,clientId,date,time){ return all.some(s=>s.clientId===clientId && s.date===date && s.time===time); }
		function bindForm(users,all){
			document.getElementById('sessForm')?.addEventListener('submit', async (e)=>{
				e.preventDefault();
				const clientId=document.getElementById('sfClientId').value;
				const date=document.getElementById('sfDate').value;
				const time=document.getElementById('sfTime').value;
				const title=document.getElementById('sfTitle').value.trim();
				if(!clientId||!date||!time) return showToast('Popunite obavezna polja','danger');
				if(hasConflict(all,clientId,date,time)) return showToast('Sukob: klijent već ima termin u to vrijeme','danger');
				const rec={ id:generateId('sess'), clientId, date, time, title };
				await Storage.put('schedules', rec);
				showToast('Termin sačuvan');
				location.reload();
			});
			document.getElementById('sessionList')?.addEventListener('click', async (e)=>{ const btn=e.target.closest('[data-action="delete"]'); if(!btn) return; await Storage.delete('schedules', btn.dataset.id); showToast('Termin obrisan'); location.reload(); });
		}
	}

	async function renderProgress(root){
		const session=getSession();
		const users=await Storage.getAll('users');
		const isTrainer=session.role==='trainer';
		const targetUserId=isTrainer?(users.find(u=>u.role==='client')?.id||session.userId):session.userId;
		const progress=(await Storage.getAll('progress')).filter(p=>p.userId===targetUserId).sort((a,b)=>a.date.localeCompare(b.date));
		const METRICS=['weightKg','bodyFatPercent','chestCm','waistCm'];
		root.innerHTML=`
			<div class="row g-3">
				<div class="col-lg-5"><div class="card h-100"><div class="card-body"><h2 class="h5">Dodaj napredak</h2><form id="progForm" class="mt-2" novalidate><div class="row g-2"><div class="col-6"><label class="form-label">Datum</label><input type="date" class="form-control" id="pgDate" required /></div><div class="col-6"><label class="form-label">Metrika</label><select class="form-select" id="pgMetric">${METRICS.map(m=>`<option>${m}</option>`).join('')}</select></div><div class="col-12"><label class="form-label">Vrijednost</label><input type="number" step="0.1" class="form-control" id="pgValue" required /></div><div class="col-12 d-grid"><button class="btn btn-primary" type="submit">Sačuvaj</button></div></div></form></div></div></div>
				<div class="col-lg-7"><div class="card h-100"><div class="card-body"><div class="d-flex justify-content-between align-items-center"><h2 class="h5 mb-0">Trendovi</h2><select class="form-select form-select-sm" style="max-width:200px" id="chartMetric">${METRICS.map(m=>`<option>${m}</option>`).join('')}</select></div><div class="chart-container mt-3"><canvas id="progChart"></canvas></div></div></div></div>
			</div>`;
		const chartMetric=document.getElementById('chartMetric');
		const chart=buildChart(progress, chartMetric.value);
		chartMetric.addEventListener('change', ()=>updateChart(chart,progress,chartMetric.value));
		document.getElementById('progForm').addEventListener('submit', async (e)=>{
			e.preventDefault();
			const date=document.getElementById('pgDate').value;
			const metric=document.getElementById('pgMetric').value;
			const value=Number(document.getElementById('pgValue').value);
			if(!date||!metric||!Number.isFinite(value)) return showToast('Ispravno popunite formu','danger');
			const rec={ id:generateId('prog'), userId:targetUserId, date, metric, value };
			await Storage.put('progress', rec);
			showToast('Napredak sačuvan');
			location.reload();
		});
		function buildChart(progress,metric){ const ctx=document.getElementById('progChart'); return new Chart(ctx,{ type:'line', data:{ labels:progress.map(p=>p.date), datasets:[{ label:metric, data:progress.filter(p=>p.metric===metric).map(p=>p.value), borderColor:'#0d6efd' }] }, options:{ responsive:true, scales:{ y:{ beginAtZero:false } } } }); }
		function updateChart(chart,progress,metric){ chart.data.labels=progress.map(p=>p.date); chart.data.datasets[0].label=metric; chart.data.datasets[0].data=progress.filter(p=>p.metric===metric).map(p=>p.value); chart.update(); }
	}

	async function renderPlans(root){
		const session=getSession();
		const users=await Storage.getAll('users');
		const plans=await Storage.getAll('plans');
		const isTrainer=session.role==='trainer';
		root.innerHTML=`
			<div class="row g-3">
				<div class="col-lg-5"><div class="card h-100"><div class="card-body"><h2 class="h5">${isTrainer?'Create Plan':'Assigned Plans'}</h2>${isTrainer?planForm(users):''}</div></div></div>
				<div class="col-lg-7"><div class="card h-100"><div class="card-body"><h2 class="h5">Plans</h2><div class="list-group" id="planList"></div></div></div></div>
			</div>`;
		const visible=isTrainer?plans:plans.filter(p=>p.clientId===session.userId);
		const list=document.getElementById('planList');
		list.innerHTML=visible.map(p=>planRow(users,p,isTrainer)).join('')||`<div class="text-muted">No plans</div>`;
		if (isTrainer) bindForm();
		function planForm(users){ const opts=users.filter(u=>u.role==='client').map(u=>`<option value="${u.id}">${esc(u.name)} (${esc(u.email)})</option>`).join(''); return `<form id=\"planForm\" class=\"mt-2\" novalidate><div class=\"mb-2\"><label class=\"form-label\">Client</label><select class=\"form-select\" id=\"plClientId\">${opts}</select></div><div class=\"mb-2\"><label class=\"form-label\">Type</label><select class=\"form-select\" id=\"plType\"><option value=\"training\">Training</option><option value=\"nutrition\">Nutrition</option></select></div><div class=\"mb-2\"><label class=\"form-label\">Title</label><input class=\"form-control\" id=\"plTitle\" required /></div><div class=\"mb-2\"><label class=\"form-label\">Details</label><textarea class=\"form-control\" rows=\"5\" id=\"plDetails\" placeholder=\"Markdown/plaintext\"></textarea></div><div class=\"d-grid\"><button class=\"btn btn-primary\" type=\"submit\">Save plan</button></div></form>`; }
		function planRow(users,p,isTrainer){ const client=users.find(u=>u.id===p.clientId); return `<div class=\"list-group-item\"><div class=\"d-flex justify-content-between\"><div><div class=\"fw-semibold\">${esc(p.title)} <span class=\"badge text-bg-secondary\">${p.type}</span></div><small class=\"text-muted\">Client: ${esc(client?.name||'Unknown')}</small></div>${isTrainer?`<button class=\"btn btn-sm btn-outline-danger\" data-id=\"${p.id}\" data-action=\"delete\">Delete</button>`:''}</div><div class=\"mt-2 small\">${esc(p.details||'').replace(/\n/g,'<br>')}</div></div>`; }
		function bindForm(){
			document.getElementById('planForm')?.addEventListener('submit', async (e)=>{
				e.preventDefault();
				const clientId=document.getElementById('plClientId').value;
				const type=document.getElementById('plType').value;
				const title=document.getElementById('plTitle').value.trim();
				const details=document.getElementById('plDetails').value.trim();
				if(!clientId||!title) return showToast('Please fill required fields','danger');
				await Storage.put('plans', { id:generateId('plan'), clientId, type, title, details, createdAt:new Date().toISOString() });
				showToast('Plan saved');
				location.reload();
			});
			document.getElementById('planList')?.addEventListener('click', async (e)=>{ const btn=e.target.closest('[data-action="delete"]'); if(!btn) return; await Storage.delete('plans', btn.dataset.id); showToast('Plan deleted'); location.reload(); });
		}
	}

	async function renderChat(root){
		const session=getSession();
		const users=await Storage.getAll('users');
		const messages=await Storage.getAll('messages');
		const peers=users.filter(u=>u.id!==session.userId && (session.role==='trainer'?u.role==='client':u.role==='trainer'));
		const activePeerId=peers[0]?.id||null;
		root.innerHTML=`
			<div class="row g-3">
				<div class="col-md-4"><div class="card h-100"><div class="card-body"><h2 class="h6">Contacts</h2><div class="list-group" id="peerList">${peers.map(p=>`<button class=\"list-group-item list-group-item-action d-flex justify-content-between align-items-center ${p.id===activePeerId?'active':''}\" data-id=\"${p.id}\">${esc(p.name)}<small class=\"text-muted\">${esc(p.email)}</small></button>`).join('')||'<div class="text-muted">No contacts</div>'}</div></div></div></div>
				<div class="col-md-8"><div class="card h-100 d-flex"><div class="card-body d-flex flex-column"><h2 class="h6" id="chatTitle">Conversation</h2><div class="chat-thread d-flex flex-column gap-2 mb-2" id="chatThread"></div><form id="chatForm" class="d-flex gap-2 mt-auto"><input class="form-control" id="chatInput" placeholder="Type a message" /><button class="btn btn-primary" type="submit">Send</button></form></div></div></div>
			</div>`;
		let active=activePeerId; const threadEl=document.getElementById('chatThread'); const peerList=document.getElementById('peerList'); const titleEl=document.getElementById('chatTitle');
		peerList?.addEventListener('click',(e)=>{ const btn=e.target.closest('[data-id]'); if(!btn) return; active=btn.dataset.id; [...peerList.querySelectorAll('.list-group-item')].forEach(el=>el.classList.remove('active')); btn.classList.add('active'); renderThread(); });
		function renderThread(){ const peer=users.find(u=>u.id===active); titleEl.textContent=peer?`Conversation with ${peer.name}`:'Conversation'; const thread=messages.filter(m=>(m.fromId===getSession().userId&&m.toId===active)||(m.fromId===active&&m.toId===getSession().userId)).sort((a,b)=>a.sentAt.localeCompare(b.sentAt)); threadEl.innerHTML=thread.map(m=>`<div class=\"message-bubble ${m.fromId===getSession().userId?'trainer':'client'}\"><div class=\"message-text\">${esc(m.text)}</div><div class=\"message-meta\">${new Date(m.sentAt).toLocaleString()}</div></div>`).join(''); threadEl.scrollTop=threadEl.scrollHeight; }
		renderThread();
		document.getElementById('chatForm').addEventListener('submit', async (e)=>{ e.preventDefault(); const input=document.getElementById('chatInput'); const text=input.value.trim(); if(!text||!active) return; const msg={ id:generateId('msg'), fromId:getSession().userId, toId:active, text, sentAt:new Date().toISOString() }; await Storage.put('messages', msg); messages.push(msg); input.value=''; renderThread(); });
	}

	function renderSettings(root){
		const theme=document.documentElement.getAttribute('data-bs-theme')||'light';
		root.innerHTML=`<div class="row justify-content-center"><div class="col-md-8 col-lg-6"><div class="card"><div class="card-body"><h1 class="h4">Postavke aplikacije</h1><div class="mt-3"><label class="form-label">Tema</label><div class="btn-group" role="group"><button class="btn btn-outline-secondary" id="setLight">Svijetla</button><button class="btn btn-outline-secondary" id="setDark">Tamna</button></div></div></div></div></div></div>`;
		document.getElementById('setLight').addEventListener('click',()=>{ document.documentElement.setAttribute('data-bs-theme','light'); localStorage.setItem('lg-theme','light'); });
		document.getElementById('setDark').addEventListener('click',()=>{ document.documentElement.setAttribute('data-bs-theme','dark'); localStorage.setItem('lg-theme','dark'); });
	}

	// --- Helpers ---
	function esc(s){ return (s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }
	function safe(v){ return v==null?'':String(v); }
	function numOrNull(v){ const n=Number(v); return Number.isFinite(n)?n:null; }
	function userName(users,id){ return users.find(u=>u.id===id)?.name||'Unknown'; }

	// --- Bootstrap ---
	(async function bootstrap(){
		try{
			await Storage.init();
			await seedIfNeeded();
			bindGlobalUI();
			renderNav();
			initRouter();
		}catch(err){ console.error(err); showToast('Initialization error','danger'); }
	})();

	function bindGlobalUI(){
		const themeToggle=document.getElementById('themeToggle');
		const root=document.documentElement;
		const savedTheme=localStorage.getItem('lg-theme')||'light';
		root.setAttribute('data-bs-theme', savedTheme);
		if(themeToggle) themeToggle.checked = savedTheme==='dark';
		themeToggle?.addEventListener('change',()=>{ const next=themeToggle.checked?'dark':'light'; root.setAttribute('data-bs-theme', next); localStorage.setItem('lg-theme', next); });
		// Export/Import removed per request
		document.getElementById('logoutBtn')?.addEventListener('click', ()=>{ if(getSession()){ logout(); showToast('Logged out'); location.hash = '#/login'; }});
	}
})();


