import { getSession } from './auth.js';
import { showToast } from './ui/toast.js';
import { renderNav } from './ui/nav.js';

// View loaders
const routes = {
	'/login': () => import('./views/login.js'),
	'/register': () => import('./views/register.js'),
	'/dashboard': () => import('./views/dashboard.js'),
	'/profiles': () => import('./views/profiles.js'),
	'/schedule': () => import('./views/schedule.js'),
	'/progress': () => import('./views/progress.js'),
	'/plans': () => import('./views/plans.js'),
	'/chat': () => import('./views/chat.js'),
	'/settings': () => import('./views/settings.js'),
};

const publicRoutes = new Set(['/login', '/register']);

export function initRouter(Storage) {
	window.addEventListener('hashchange', () => handleRoute(Storage));
	handleRoute(Storage);
}

function parseHash() {
	const hash = location.hash || '#/dashboard';
	const [path, queryString] = hash.replace(/^#/, '').split('?');
	const params = new URLSearchParams(queryString || '');
	return { path, params };
}

async function handleRoute(Storage) {
	const root = document.getElementById('app-root');
	const { path, params } = parseHash();
	const session = getSession();

	if (!publicRoutes.has(path) && !session) {
		location.hash = '#/login';
		return;
	}

	try {
		const loader = routes[path] || routes['/dashboard'];
		const mod = await loader();
		await mod.render(root, { Storage, params });
		renderNav();
		announceRoute(path);
	} catch (err) {
		console.error('Route error', err);
		showToast('Page failed to load', 'danger');
	}
}

function announceRoute(path) {
	const region = document.getElementById('app-root');
	region?.setAttribute('aria-live', 'polite');
	region?.setAttribute('aria-busy', 'false');
}


