// IndexedDB wrapper with localStorage fallback

const DB_NAME = 'lesgetbig';
const DB_VERSION = 1;
const STORE_NAMES = [
	'users', 'profiles', 'workouts', 'nutrition', 'schedules', 'progress', 'messages', 'plans'
];

class IndexedDbDriver {
	constructor() { this.db = null; }

	init() {
		return new Promise((resolve, reject) => {
			const req = indexedDB.open(DB_NAME, DB_VERSION);
			req.onupgradeneeded = (e) => {
				const db = e.target.result;
				for (const name of STORE_NAMES) {
					if (!db.objectStoreNames.contains(name)) {
						const store = db.createObjectStore(name, { keyPath: 'id' });
						store.createIndex('by_ownerId', 'ownerId', { unique: false });
						store.createIndex('by_userId', 'userId', { unique: false });
					}
				}
			};
			req.onsuccess = () => { this.db = req.result; resolve(); };
			req.onerror = () => reject(req.error);
		});
	}

	_tx(storeName, mode = 'readonly') {
		const tx = this.db.transaction(storeName, mode);
		return tx.objectStore(storeName);
	}

	async getAll(storeName) {
		return new Promise((resolve, reject) => {
			const store = this._tx(storeName);
			const req = store.getAll();
			req.onsuccess = () => resolve(req.result || []);
			req.onerror = () => reject(req.error);
		});
	}

	async get(storeName, id) {
		return new Promise((resolve, reject) => {
			const store = this._tx(storeName);
			const req = store.get(id);
			req.onsuccess = () => resolve(req.result || null);
			req.onerror = () => reject(req.error);
		});
	}

	async put(storeName, value) {
		return new Promise((resolve, reject) => {
			const store = this._tx(storeName, 'readwrite');
			const req = store.put(value);
			req.onsuccess = () => resolve(value);
			req.onerror = () => reject(req.error);
		});
	}

	async delete(storeName, id) {
		return new Promise((resolve, reject) => {
			const store = this._tx(storeName, 'readwrite');
			const req = store.delete(id);
			req.onsuccess = () => resolve();
			req.onerror = () => reject(req.error);
		});
	}
}

class LocalStorageDriver {
	constructor() { this.prefix = `${DB_NAME}:`; }
	async init() {}

	_allKey(storeName) { return `${this.prefix}${storeName}`; }
	_read(storeName) {
		const raw = localStorage.getItem(this._allKey(storeName));
		return raw ? JSON.parse(raw) : [];
	}
	_write(storeName, items) {
		localStorage.setItem(this._allKey(storeName), JSON.stringify(items));
	}
	async getAll(storeName) { return this._read(storeName); }
	async get(storeName, id) { return this._read(storeName).find(i => i.id === id) || null; }
	async put(storeName, value) {
		const items = this._read(storeName);
		const idx = items.findIndex(i => i.id === value.id);
		if (idx >= 0) items[idx] = value; else items.push(value);
		this._write(storeName, items);
		return value;
	}
	async delete(storeName, id) {
		const items = this._read(storeName).filter(i => i.id !== id);
		this._write(storeName, items);
	}
}

export const Storage = {
	driver: null,
	async init() {
		try {
			if (!('indexedDB' in window)) throw new Error('no idb');
			this.driver = new IndexedDbDriver();
			await this.driver.init();
		} catch {
			this.driver = new LocalStorageDriver();
			await this.driver.init();
		}
	},
	getAll: (store) => Storage.driver.getAll(store),
	get: (store, id) => Storage.driver.get(store, id),
	put: (store, value) => Storage.driver.put(store, value),
	delete: (store, id) => Storage.driver.delete(store, id),
	stores: STORE_NAMES,
};

export function generateId(prefix = 'id') {
	return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}


