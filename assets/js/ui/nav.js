import { getSession } from '../auth.js';

export function renderNav() {
	const nav = document.getElementById('nav-links');
	if (!nav) return;
	const session = getSession();
	let links = [];
	if (!session) {
		links = [
			['Prijava', '#/login'],
			['Registracija', '#/register'],
		];
	} else if (session.role === 'trainer') {
		links = [
			['Kontrolna tabla', '#/dashboard'],
			['Profili', '#/profiles'],
			['Raspored', '#/schedule'],
			['Napredak', '#/progress'],
			['Planovi', '#/plans'],
			['Poruke', '#/chat'],
		];
	} else {
		links = [
			['Kontrolna tabla', '#/dashboard'],
			['Profil', '#/profiles'],
			['Raspored', '#/schedule'],
			['Napredak', '#/progress'],
			['Planovi', '#/plans'],
			['Poruke', '#/chat'],
		];
	}
	nav.innerHTML = links.map(([label, href]) => `<li class="nav-item"><a class="nav-link" href="${href}">${label}</a></li>`).join('');
}


