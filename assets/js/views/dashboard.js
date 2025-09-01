import { getSession } from '../auth.js';

export async function render(root, { Storage }) {
	const session = getSession();
	if (session.role === 'trainer') {
		await renderTrainer(root, Storage, session);
	} else {
		await renderClient(root, Storage, session);
	}
}

async function renderTrainer(root, Storage, session) {
	const users = await Storage.getAll('users');
	const clients = users.filter(u => u.role === 'client');
	const schedules = await Storage.getAll('schedules');
	const today = new Date().toISOString().slice(0,10);
	const todaySessions = schedules.filter(s => s.date === today);
	root.innerHTML = `
		<div class="row g-3">
			<div class="col-12 col-lg-4">
				<div class="card h-100"><div class="card-body">
					<h2 class="h5">Klijenti</h2>
					<p class="display-6">${clients.length}</p>
				</div></div>
			</div>
			<div class="col-12 col-lg-4">
				<div class="card h-100"><div class="card-body">
					<h2 class="h5">Današnji treninzi</h2>
					<p class="display-6">${todaySessions.length}</p>
				</div></div>
			</div>
			<div class="col-12 col-lg-4">
				<div class="card h-100"><div class="card-body">
					<h2 class="h5">Brze akcije</h2>
					<div class="d-grid gap-2">
						<a class="btn btn-primary" href="#/schedule">Kreiraj termin</a>
						<a class="btn btn-outline-primary" href="#/plans">Novi plan</a>
					</div>
				</div></div>
			</div>
		</div>
		<div class="row mt-3">
			<div class="col-12">
				<div class="card"><div class="card-body">
					<h2 class="h5 mb-3">Danas</h2>
					<div class="list-group">
						${todaySessions.map(s => `<div class="list-group-item d-flex justify-content-between align-items-center">
							<div>
								<div class="fw-semibold">${formatTime(s.time)} • ${escapeHtml(s.title || 'Session')}</div>
								<small>Klijent: ${userName(users, s.clientId)}</small>
							</div>
							<a class="btn btn-sm btn-outline-secondary" href="#/schedule">Uredi</a>
						</div>`).join('') || '<div class="text-muted">Nema termina</div>'}
					</div>
				</div></div>
			</div>
		</div>`;
}

async function renderClient(root, Storage, session) {
	const schedules = await Storage.getAll('schedules');
	const upcoming = schedules
		.filter(s => s.clientId === session.userId)
		.sort((a,b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
	const progress = await Storage.getAll('progress');
	const myProg = progress.filter(p => p.userId === session.userId);
	root.innerHTML = `
		<div class="row g-3">
			<div class="col-12 col-lg-6">
				<div class="card h-100"><div class="card-body">
					<h2 class="h5">Sljedeći trening</h2>
					${upcoming ? `
						<div>${upcoming.date} ${formatTime(upcoming.time)} – ${escapeHtml(upcoming.title || 'Termin')}</div>
					` : '<div class="text-muted">Nema zakazanih termina</div>'}
				</div></div>
			</div>
			<div class="col-12 col-lg-6">
				<div class="card h-100"><div class="card-body">
					<h2 class="h5">Napredak (zapisi)</h2>
					<p class="display-6">${myProg.length}</p>
				</div></div>
			</div>
		</div>`;
}

function formatTime(t) { return (t || '').slice(0,5); }
function escapeHtml(s) { return (s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }
function userName(users, id) { return users.find(u => u.id === id)?.name || 'Unknown'; }


