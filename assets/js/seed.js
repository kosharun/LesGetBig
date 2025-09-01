import { generateId } from './storage.js';
import { showToast } from './ui/toast.js';

const SEED_FLAG = 'lg-seeded-v1';

export async function seedIfNeeded(Storage) {
	const seeded = localStorage.getItem(SEED_FLAG);
	if (seeded) return;
	const datasets = await loadSeeds();
	// Ensure demo users have a default hashed password if missing
	if (Array.isArray(datasets.users) && datasets.users.length) {
		const demoHash = await sha256('demo123');
		datasets.users = datasets.users.map(u => ({ ...u, passwordHash: u.passwordHash && u.passwordHash.length ? u.passwordHash : demoHash }));
	}
	for (const [store, items] of Object.entries(datasets)) {
		for (const item of items) {
			if (!item.id) item.id = generateId(store);
			await Storage.put(store, item);
		}
	}
	localStorage.setItem(SEED_FLAG, '1');
}

async function loadSeeds() {
	const files = [
		['users', 'data/users.json'],
		['profiles', 'data/profiles.json'],
		['workouts', 'data/workouts.json'],
		['nutrition', 'data/nutrition.json'],
		['schedules', 'data/schedules.json'],
		['progress', 'data/progress.json'],
		['messages', 'data/messages.json'],
		['plans', 'data/plans.json'],
	];
	const out = {};
	await Promise.all(files.map(async ([key, path]) => {
		try {
			const res = await fetch(path);
			out[key] = await res.json();
		} catch {
			out[key] = [];
		}
	}));
	return out;
}

export async function exportDb(Storage) {
	const data = {};
	for (const store of Storage.stores) {
		data[store] = await Storage.getAll(store);
	}
	return new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), data }, null, 2)], { type: 'application/json' });
}

export async function importDb(Storage, jsonText) {
	const parsed = JSON.parse(jsonText);
	const data = parsed.data || {};
	for (const [store, items] of Object.entries(data)) {
		for (const item of items) {
			await Storage.put(store, item);
		}
	}
	localStorage.setItem(SEED_FLAG, '1');
	showToast('Import complete');
}

async function sha256(text) {
	const enc = new TextEncoder().encode(text);
	const buf = await crypto.subtle.digest('SHA-256', enc);
	return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}


