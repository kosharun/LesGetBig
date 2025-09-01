import { showToast } from '../ui/toast.js';

export async function render(root) {
	root.innerHTML = `
		<div class="row justify-content-center">
			<div class="col-md-6 col-lg-5">
				<div class="card shadow-sm">
					<div class="card-body">
						<h1 class="h4 mb-3">Dobrodošli nazad</h1>
						<form id="loginForm" novalidate>
							<div class="mb-3">
								<label class="form-label">Email</label>
								<input type="email" class="form-control" id="loginEmail" required />
							</div>
							<div class="mb-3">
								<label class="form-label">Lozinka</label>
								<input type="password" class="form-control" id="loginPassword" required />
							</div>
							<button class="btn btn-primary w-100" type="submit">Prijava</button>
						</form>
						<div class="mt-3 text-center">
							<a href="#/register">Kreiraj nalog</a>
						</div>
					</div>
				</div>
			</div>
		</div>`;

	const form = document.getElementById('loginForm');
	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		const email = document.getElementById('loginEmail').value.trim();
		const password = document.getElementById('loginPassword').value;
		try {
			await window.Auth.login(email, password);
			showToast('Dobrodošli');
			location.hash = '#/dashboard';
		} catch (err) {
			showToast('Neuspješna prijava', 'danger');
		}
	});
}


