import { getSession } from '../auth.js';
import { generateId } from '../storage.js';
import { showToast } from '../ui/toast.js';

export async function render(root, { Storage }) {
	const session = getSession();
	const users = await Storage.getAll('users');
	const messages = await Storage.getAll('messages');
	const peers = users.filter(u => u.id !== session.userId && (session.role === 'trainer' ? u.role === 'client' : u.role === 'trainer'));
	const activePeerId = peers[0]?.id || null;
	root.innerHTML = `
		<div class="row g-3">
			<div class="col-md-4">
				<div class="card h-100"><div class="card-body">
					<h2 class="h6">Kontakti</h2>
					<div class="list-group" id="peerList">
						${peers.map(p => `<button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center ${p.id===activePeerId?'active':''}" data-id="${p.id}">${escape(p.name)}<small class="text-muted">${escape(p.email)}</small></button>`).join('') || '<div class="text-muted">No contacts</div>'}
					</div>
				</div></div>
			</div>
			<div class="col-md-8">
				<div class="card h-100 d-flex"><div class="card-body d-flex flex-column">
					<h2 class="h6" id="chatTitle">Razgovor</h2>
					<div class="chat-thread d-flex flex-column gap-2 mb-2" id="chatThread"></div>
					<form id="chatForm" class="d-flex gap-2 mt-auto">
						<input class="form-control" id="chatInput" placeholder="Upišite poruku" />
						<button class="btn btn-primary" type="submit">Pošalji</button>
					</form>
				</div></div>
			</div>
		</div>`;

	let active = activePeerId;
	const threadEl = document.getElementById('chatThread');
	const peerList = document.getElementById('peerList');
	const titleEl = document.getElementById('chatTitle');
	peerList?.addEventListener('click', (e) => {
		const btn = e.target.closest('[data-id]');
		if (!btn) return;
		active = btn.dataset.id;
		[...peerList.querySelectorAll('.list-group-item')].forEach(el => el.classList.remove('active'));
		btn.classList.add('active');
		renderThread();
	});

	function renderThread() {
		const peer = users.find(u => u.id === active);
		titleEl.textContent = peer ? `Razgovor sa ${peer.name}` : 'Razgovor';
		const thread = messages
			.filter(m => (m.fromId === session.userId && m.toId === active) || (m.fromId === active && m.toId === session.userId))
			.sort((a,b) => a.sentAt.localeCompare(b.sentAt));
		threadEl.innerHTML = thread.map(m => `
			<div class="message-bubble ${m.fromId===session.userId?'trainer':'client'}">
				<div class="message-text">${escape(m.text)}</div>
				<div class="message-meta">${new Date(m.sentAt).toLocaleString()}</div>
			</div>`).join('');
		threadEl.scrollTop = threadEl.scrollHeight;
	}

	renderThread();

	document.getElementById('chatForm').addEventListener('submit', async (e) => {
		e.preventDefault();
		const input = document.getElementById('chatInput');
		const text = input.value.trim();
		if (!text || !active) return;
		const msg = { id: generateId('msg'), fromId: session.userId, toId: active, text, sentAt: new Date().toISOString() };
		await Storage.put('messages', msg);
		messages.push(msg);
		input.value = '';
		renderThread();
	});
}

function escape(s) { return (s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }


