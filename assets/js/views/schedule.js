import { getSession } from '../auth.js';
import { generateId } from '../storage.js';
import { showToast } from '../ui/toast.js';

export async function render(root, { Storage }) {
	const session = getSession();
	const users = await Storage.getAll('users');
	const all = await Storage.getAll('schedules');
	const mine = session.role === 'trainer' ? all : all.filter(s => s.clientId === session.userId);
	root.innerHTML = `
		<div class="row g-3">
			<div class="col-lg-5">
				<div class="card h-100">
					<div class="card-body">
						<h2 class="h5">${session.role === 'trainer' ? 'Kreiraj / Uredi termin' : 'Moj raspored'}</h2>
						${session.role === 'trainer' ? form(users) : ''}
					</div>
				</div>
			</div>
			<div class="col-lg-7">
				<div class="card h-100"><div class="card-body">
					<h2 class="h5">Nadolazeće</h2>
					<div class="list-group" id="sessionList"></div>
				</div></div>
			</div>
		</div>`;
	const list = document.getElementById('sessionList');
	const sorted = mine.sort((a,b) => (a.date + a.time).localeCompare(b.date + b.time));
	list.innerHTML = sorted.map(s => row(users, s, session)).join('') || `<div class="text-muted">Nema termina</div>`;

	if (session.role === 'trainer') {
		bindForm(Storage, users, all);
	}
}

function form(users) {
	const clientOpts = users.filter(u => u.role === 'client').map(u => `<option value="${u.id}">${escape(u.name)} (${escape(u.email)})</option>`).join('');
	return `
		<form id="sessForm" class="mt-2" novalidate>
			<div class="row g-2">
				<div class="col-12">
					<label class="form-label">Klijent</label>
					<select class="form-select" id="sfClientId" required>${clientOpts}</select>
				</div>
				<div class="col-md-6">
					<label class="form-label">Datum</label>
					<input type="date" class="form-control" id="sfDate" required />
				</div>
				<div class="col-md-6">
					<label class="form-label">Vrijeme</label>
					<input type="time" class="form-control" id="sfTime" required />
				</div>
				<div class="col-12">
					<label class="form-label">Naslov</label>
					<input class="form-control" id="sfTitle" placeholder="npr. Donji dio tijela" />
				</div>
				<div class="col-12 d-grid">
					<button class="btn btn-primary" type="submit">Sačuvaj termin</button>
				</div>
			</div>
		</form>`;
}

function row(users, s, session) {
	const client = users.find(u => u.id === s.clientId);
	return `
		<div class="list-group-item d-flex justify-content-between align-items-center">
			<div>
				<div class="fw-semibold">${s.date} ${s.time?.slice(0,5)} • ${escape(s.title || 'Termin')}</div>
				<small class="text-muted">Klijent: ${escape(client?.name || 'Nepoznato')}</small>
			</div>
			${session.role === 'trainer' ? `<button class="btn btn-sm btn-outline-danger" data-id="${s.id}" data-action="delete">Obriši</button>` : ''}
		</div>`;
}

function hasConflict(all, clientId, date, time) {
	return all.some(s => s.clientId === clientId && s.date === date && s.time === time);
}

function bindForm(Storage, users, all) {
	const form = document.getElementById('sessForm');
	form?.addEventListener('submit', async (e) => {
		e.preventDefault();
		const clientId = document.getElementById('sfClientId').value;
		const date = document.getElementById('sfDate').value;
		const time = document.getElementById('sfTime').value;
		const title = document.getElementById('sfTitle').value.trim();
		if (!clientId || !date || !time) return showToast('Popunite obavezna polja', 'danger');
		if (hasConflict(all, clientId, date, time)) return showToast('Sukob: klijent već ima termin u to vrijeme', 'danger');
		const rec = { id: generateId('sess'), clientId, date, time, title };
		await Storage.put('schedules', rec);
		showToast('Termin sačuvan');
		location.reload();
	});

	document.getElementById('sessionList')?.addEventListener('click', async (e) => {
		const btn = e.target.closest('[data-action="delete"]');
		if (!btn) return;
		await Storage.delete('schedules', btn.dataset.id);
		showToast('Termin obrisan');
		location.reload();
	});
}

function escape(s) { return (s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }


