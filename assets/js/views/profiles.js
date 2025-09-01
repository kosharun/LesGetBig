import { getSession } from '../auth.js';
import { generateId } from '../storage.js';
import { showToast } from '../ui/toast.js';

export async function render(root, { Storage }) {
	const session = getSession();
	const isTrainer = session.role === 'trainer';
	const users = await Storage.getAll('users');
	const profiles = await Storage.getAll('profiles');

	if (isTrainer) {
		root.innerHTML = `
			<div class="d-flex justify-content-between align-items-center mb-3">
				<h1 class="h4 mb-0">Profili</h1>
				<div class="input-group" style="max-width:340px">
					<span class="input-group-text">Pretraga</span>
					<input class="form-control" id="searchInput" placeholder="Ime ili email" />
				</div>
			</div>
			<div class="row g-3" id="profileGrid"></div>`;
		const grid = document.getElementById('profileGrid');
		renderGrid(grid, users, profiles, '');
		document.getElementById('searchInput').addEventListener('input', (e) => {
			renderGrid(grid, users, profiles, e.target.value.toLowerCase());
		});
	} else {
		const myProfile = profiles.find(p => p.userId === session.userId) || { id: generateId('profile'), userId: session.userId };
		root.innerHTML = `
			<div class="row justify-content-center">
				<div class="col-md-8">
					<div class="card">
						<div class="card-body">
							<h1 class="h4">Moj profil</h1>
							<form id="profileForm" class="mt-3" novalidate>
								<div class="row g-3">
									<div class="col-md-6">
										<label class="form-label">Godine</label>
										<input type="number" min="10" max="100" class="form-control" id="pAge" value="${safe(myProfile.age)}" />
									</div>
									<div class="col-md-6">
										<label class="form-label">Visina (cm)</label>
										<input type="number" min="100" max="250" class="form-control" id="pHeight" value="${safe(myProfile.heightCm)}" />
									</div>
									<div class="col-md-6">
										<label class="form-label">Težina (kg)</label>
										<input type="number" min="30" max="300" class="form-control" id="pWeight" value="${safe(myProfile.weightKg)}" />
									</div>
									<div class="col-12">
										<label class="form-label">Opis</label>
										<textarea class="form-control" rows="3" id="pBio">${safe(myProfile.bio)}</textarea>
									</div>
								</div>
								<div class="mt-3 d-grid">
									<button class="btn btn-primary" type="submit">Sačuvaj</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>`;
		document.getElementById('profileForm').addEventListener('submit', async (e) => {
			e.preventDefault();
			const age = numOrNull(document.getElementById('pAge').value);
			const heightCm = numOrNull(document.getElementById('pHeight').value);
			const weightKg = numOrNull(document.getElementById('pWeight').value);
			const bio = document.getElementById('pBio').value.trim();
			if (age && (age < 10 || age > 100)) return showToast('Neispravne godine', 'danger');
			if (heightCm && (heightCm < 100 || heightCm > 250)) return showToast('Neispravna visina', 'danger');
			if (weightKg && (weightKg < 30 || weightKg > 300)) return showToast('Neispravna težina', 'danger');
			await Storage.put('profiles', { ...myProfile, age, heightCm, weightKg, bio });
			showToast('Profil sačuvan');
		});
	}
}

function renderGrid(grid, users, profiles, q) {
	const rows = users
		.filter(u => u.role === 'client')
		.filter(u => (u.name + ' ' + u.email).toLowerCase().includes(q))
		.map(u => {
			const p = profiles.find(p => p.userId === u.id) || {};
			return `
				<div class="col-md-6 col-lg-4">
					<div class="card h-100">
						<div class="card-body">
							<h3 class="h6 mb-1">${escape(u.name)}</h3>
							<div class="text-muted small mb-2">${escape(u.email)}</div>
							<div class="small">Godine: ${safe(p.age) || '-'} | V: ${safe(p.heightCm) || '-'}cm | T: ${safe(p.weightKg) || '-'}kg</div>
							<div class="small text-truncate">${escape(p.bio || '')}</div>
						</div>
					</div>
				</div>`;
		}).join('');
	grid.innerHTML = rows || `<div class="col-12"><div class="card card-empty"><div class="card-body text-center text-muted">Nema klijenata</div></div></div>`;
}

function numOrNull(v) { const n = Number(v); return Number.isFinite(n) ? n : null; }
function safe(v) { return v == null ? '' : String(v); }
function escape(s) { return (s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }


