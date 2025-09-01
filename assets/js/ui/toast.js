export function showToast(message, variant = 'success', delay = 2500) {
	const container = document.getElementById('toastContainer');
	const wrapper = document.createElement('div');
	wrapper.innerHTML = `
		<div class="toast align-items-center text-bg-${variant} border-0" role="status" aria-live="polite" aria-atomic="true">
			<div class="d-flex">
				<div class="toast-body">${message}</div>
				<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
			</div>
		</div>`;
	const toastEl = wrapper.firstElementChild;
	container.appendChild(toastEl);
	const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay });
	toast.show();
	toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}


