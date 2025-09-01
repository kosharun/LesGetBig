import { generateId } from './storage.js';
import { showToast } from './ui/toast.js';

const SESSION_KEY = 'lg-session';

export function initAuth(Storage) {
	window.Auth = {
		register: (payload) => register(Storage, payload),
		login: (email, password) => login(Storage, email, password),
		logout,
		getSession,
		requireRole: (roles) => requireRole(roles),
	};
}

export function getSession() {
	const raw = sessionStorage.getItem(SESSION_KEY);
	return raw ? JSON.parse(raw) : null;
}

export function setSession(session) {
	sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function logout() {
	sessionStorage.removeItem(SESSION_KEY);
}

async function hashPassword(password) {
	const enc = new TextEncoder().encode(password);
	const buf = await crypto.subtle.digest('SHA-256', enc);
	return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function register(Storage, { name, email, password, role }) {
	const users = await Storage.getAll('users');
	if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
		throw new Error('Email already registered');
	}
	const id = generateId('user');
	const user = { id, name, email, role, passwordHash: await hashPassword(password), createdAt: new Date().toISOString() };
	await Storage.put('users', user);
	await Storage.put('profiles', { id: generateId('profile'), userId: id, bio: '', age: null, heightCm: null, weightKg: null });
	setSession({ userId: id, role, name, email });
	return user;
}

async function login(Storage, email, password) {
	const users = await Storage.getAll('users');
	const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
	if (!user) throw new Error('Invalid credentials');
	const hash = await hashPassword(password);
	if (user.passwordHash !== hash) throw new Error('Invalid credentials');
	setSession({ userId: user.id, role: user.role, name: user.name, email: user.email });
	return user;
}

export function requireRole(roles) {
	const s = getSession();
	if (!s) return false;
	if (Array.isArray(roles)) return roles.includes(s.role);
	return s.role === roles;
}


