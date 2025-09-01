export async function render(root) {
	const theme = document.documentElement.getAttribute('data-bs-theme') || 'light';
	root.innerHTML = `
		<div class="row justify-content-center">
			<div class="col-md-8 col-lg-6">
				<div class="card"><div class="card-body">
					<h1 class="h4">App Settings</h1>
					<div class="mt-3">
						<label class="form-label">Theme</label>
						<div class="btn-group" role="group">
							<button class="btn btn-outline-secondary" id="setLight">Light</button>
							<button class="btn btn-outline-secondary" id="setDark">Dark</button>
						</div>
					</div>
				</div></div>
			</div>
		</div>`;
	document.getElementById('setLight').addEventListener('click', () => { document.documentElement.setAttribute('data-bs-theme', 'light'); localStorage.setItem('lg-theme', 'light'); });
	document.getElementById('setDark').addEventListener('click', () => { document.documentElement.setAttribute('data-bs-theme', 'dark'); localStorage.setItem('lg-theme', 'dark'); });
}


