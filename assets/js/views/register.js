import { showToast } from '../ui/toast.js';

export async function render(root) {
	root.innerHTML = `
		<div class="row justify-content-center">
			<div class="col-md-7 col-lg-6">
				<div class="card shadow-sm">
					<div class="card-body">
						<h1 class="h4 mb-3">Kreiraj nalog</h1>
						<form id="regForm" novalidate>
							<div class="row g-3">
								<div class="col-12">
									<label class="form-label">Ime i prezime</label>
									<input type="text" class="form-control" id="regName" required />
								</div>
								<div class="col-md-6">
									<label class="form-label">Email</label>
									<input type="email" class="form-control" id="regEmail" required />
								</div>
								<div class="col-md-6">
									<label class="form-label">Uloga</label>
									<select class="form-select" id="regRole" required>
										<option value="trainer">Trener</option>
										<option value="client" selected>Klijent</option>
									</select>
								</div>
								<div class="col-md-6">
									<label class="form-label">Lozinka</label>
									<input type="password" class="form-control" id="regPassword" minlength="6" required />
								</div>
								<div class="col-md-6">
									<label class="form-label">Potvrdi lozinku</label>
									<input type="password" class="form-control" id="regPassword2" minlength="6" required />
								</div>
							</div>
							<div class="mt-3 d-grid">
								<button class="btn btn-primary" type="submit">Kreiraj nalog</button>
							</div>
						</form>
						<div class="mt-3 text-center">
							<a href="#/login">Imate nalog? Prijavite se</a>
						</div>
					</div>
				</div>
			</div>
		</div>`;

	const form = document.getElementById('regForm');
	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		const name = document.getElementById('regName').value.trim();
		const email = document.getElementById('regEmail').value.trim();
		const role = document.getElementById('regRole').value;
		const pw = document.getElementById('regPassword').value;
		const pw2 = document.getElementById('regPassword2').value;
		if (pw !== pw2) { showToast('Lozinke se ne podudaraju', 'danger'); return; }
		try {
			await window.Auth.register({ name, email, password: pw, role });
			showToast('Nalog kreiran');
			location.hash = '#/dashboard';
		} catch (err) {
			showToast('Neuspješna registracija', 'danger');
		}
	});
}


