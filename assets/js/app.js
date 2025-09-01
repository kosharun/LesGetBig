import { initRouter } from './router.js';
import { Storage } from './storage.js';
import { seedIfNeeded } from './seed.js';
import { renderNav } from './ui/nav.js';
import { showToast } from './ui/toast.js';
import { getSession, logout, initAuth } from './auth.js';

window.app = { Storage };

async function bootstrap() {
	try {
		await Storage.init();
		await seedIfNeeded(Storage);
		initAuth(Storage);
		renderNav();
		initRouter(Storage);
		bindGlobalUI();
	} catch (err) {
		console.error(err);
		showToast('Initialization error', 'danger');
	}
}

function bindGlobalUI() {
	// Theme toggle
	const themeToggle = document.getElementById('themeToggle');
	const root = document.documentElement;
	const savedTheme = localStorage.getItem('lg-theme') || 'light';
	root.setAttribute('data-bs-theme', savedTheme);
	if (themeToggle) themeToggle.checked = savedTheme === 'dark';
	themeToggle?.addEventListener('change', () => {
		const next = themeToggle.checked ? 'dark' : 'light';
		root.setAttribute('data-bs-theme', next);
		localStorage.setItem('lg-theme', next);
	});

	// Export/Import
	// Removed export/import UI

	// Logout
	document.getElementById('logoutBtn')?.addEventListener('click', () => {
		if (getSession()) {
			logout();
			showToast('Logged out');
			location.hash = '#/login';
		}
	});
}

bootstrap();


