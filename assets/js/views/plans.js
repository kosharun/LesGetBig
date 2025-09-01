import { getSession } from '../auth.js';
import { generateId } from '../storage.js';
import { showToast } from '../ui/toast.js';

export async function render(root, { Storage }) {
	const session = getSession();
	const users = await Storage.getAll('users');
	const plans = await Storage.getAll('plans');
	const isTrainer = session.role === 'trainer';
	root.innerHTML = `
		<div class="row g-3">
			<div class="col-lg-5">
				<div class="card h-100"><div class="card-body">
					<h2 class="h5">${isTrainer ? 'Kreiraj plan' : 'Dodijeljeni planovi'}</h2>
					${isTrainer ? planForm(users) : ''}
				</div></div>
			</div>
			<div class="col-lg-7">
				<div class="card h-100"><div class="card-body">
					<h2 class="h5">Planovi</h2>
					<div class="list-group" id="planList"></div>
				</div></div>
			</div>
		</div>`;

	const visible = isTrainer ? plans : plans.filter(p => p.clientId === session.userId);
	const list = document.getElementById('planList');
	list.innerHTML = visible.map(p => planRow(users, p, isTrainer)).join('') || `<div class="text-muted">No plans</div>`;

	if (isTrainer) bindForm(Storage);
}

function planForm(users) {
	const clientOpts = users.filter(u => u.role === 'client').map(u => `<option value="${u.id}">${escape(u.name)} (${escape(u.email)})</option>`).join('');
	return `
		<form id="planForm" class="mt-2" novalidate>
			<div class="mb-2">
				<label class="form-label">Klijent</label>
				<select class="form-select" id="plClientId">${clientOpts}</select>
			</div>
			<div class="mb-2">
				<label class="form-label">Tip</label>
				<select class="form-select" id="plType">
					<option value="training">Trening</option>
					<option value="nutrition">Ishrana</option>
				</select>
			</div>
			<div class="mb-2">
				<label class="form-label">Naslov</label>
				<input class="form-control" id="plTitle" required />
			</div>
			<div class="mb-2">
				<label class="form-label">Detalji</label>
				<textarea class="form-control" rows="5" id="plDetails" placeholder="Markdown/plaintext"></textarea>
			</div>
			<div class="d-grid">
				<button class="btn btn-primary" type="submit">Sačuvaj plan</button>
			</div>
		</form>`;
}

function planRow(users, p, isTrainer) {
	const client = users.find(u => u.id === p.clientId);
	return `
		<div class="list-group-item">
			<div class="d-flex justify-content-between">
				<div>
					<div class="fw-semibold">${escape(p.title)} <span class="badge text-bg-secondary">${p.type}</span></div>
					<small class="text-muted">Klijent: ${escape(client?.name || 'Nepoznato')}</small>
				</div>
				${isTrainer ? `<button class="btn btn-sm btn-outline-danger" data-id="${p.id}" data-action="delete">Obriši</button>` : ''}
			</div>
			<div class="mt-2 small">${escapeMultiline(p.details || '')}</div>
		</div>`;
}

function bindForm(Storage) {
	const form = document.getElementById('planForm');
	form?.addEventListener('submit', async (e) => {
		e.preventDefault();
		const clientId = document.getElementById('plClientId').value;
		const type = document.getElementById('plType').value;
		const title = document.getElementById('plTitle').value.trim();
		const details = document.getElementById('plDetails').value.trim();
		if (!clientId || !title) return showToast('Popunite obavezna polja', 'danger');
		await Storage.put('plans', { id: generateId('plan'), clientId, type, title, details, createdAt: new Date().toISOString() });
		showToast('Plan sačuvan');
		location.reload();
	});

	document.getElementById('planList')?.addEventListener('click', async (e) => {
		const btn = e.target.closest('[data-action="delete"]');
		if (!btn) return;
		await Storage.delete('plans', btn.dataset.id);
		showToast('Plan obrisan');
		location.reload();
	});
}

function escape(s) { return (s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }
function escapeMultiline(s) { return escape(s).replace(/\n/g, '<br>'); }


