import { getSession } from '../auth.js';
import { generateId } from '../storage.js';
import { showToast } from '../ui/toast.js';

const METRICS = ['weightKg', 'bodyFatPercent', 'chestCm', 'waistCm'];

export async function render(root, { Storage }) {
	const session = getSession();
	const users = await Storage.getAll('users');
	const isTrainer = session.role === 'trainer';
	const targetUserId = isTrainer ? (users.find(u => u.role === 'client')?.id || session.userId) : session.userId;
	const progress = (await Storage.getAll('progress')).filter(p => p.userId === targetUserId).sort((a,b) => a.date.localeCompare(b.date));

	root.innerHTML = `
		<div class="row g-3">
			<div class="col-lg-5">
				<div class="card h-100"><div class="card-body">
					<h2 class="h5">Dodaj napredak</h2>
					<form id="progForm" class="mt-2" novalidate>
						<div class="row g-2">
							<div class="col-6">
								<label class="form-label">Datum</label>
								<input type="date" class="form-control" id="pgDate" required />
							</div>
							<div class="col-6">
								<label class="form-label">Metrika</label>
								<select class="form-select" id="pgMetric">${METRICS.map(m => `<option>${m}</option>`).join('')}</select>
							</div>
							<div class="col-12">
								<label class="form-label">Vrijednost</label>
								<input type="number" step="0.1" class="form-control" id="pgValue" required />
							</div>
							<div class="col-12 d-grid">
								<button class="btn btn-primary" type="submit">Sačuvaj</button>
							</div>
						</div>
					</form>
				</div></div>
			</div>
			<div class="col-lg-7">
				<div class="card h-100"><div class="card-body">
					<div class="d-flex justify-content-between align-items-center">
						<h2 class="h5 mb-0">Trendovi</h2>
						<select class="form-select form-select-sm" style="max-width:200px" id="chartMetric">${METRICS.map(m => `<option>${m}</option>`).join('')}</select>
					</div>
					<div class="chart-container mt-3">
						<canvas id="progChart"></canvas>
					</div>
				</div></div>
			</div>
		</div>`;

	const chartMetric = document.getElementById('chartMetric');
	const chart = buildChart(progress, chartMetric.value);
	chartMetric.addEventListener('change', () => updateChart(chart, progress, chartMetric.value));

	document.getElementById('progForm').addEventListener('submit', async (e) => {
		e.preventDefault();
		const date = document.getElementById('pgDate').value;
		const metric = document.getElementById('pgMetric').value;
		const value = Number(document.getElementById('pgValue').value);
		if (!date || !metric || !Number.isFinite(value)) return showToast('Ispravno popunite formu', 'danger');
		const rec = { id: generateId('prog'), userId: targetUserId, date, metric, value };
		await Storage.put('progress', rec);
		showToast('Napredak sačuvan');
		location.reload();
	});
}

function buildChart(progress, metric) {
	const ctx = document.getElementById('progChart');
	return new Chart(ctx, {
		type: 'line',
		data: { labels: labels(progress), datasets: [{ label: metric, data: values(progress, metric), borderColor: '#0d6efd' }] },
		options: { responsive: true, scales: { y: { beginAtZero: false } } }
	});
}

function updateChart(chart, progress, metric) {
	chart.data.labels = labels(progress);
	chart.data.datasets[0].label = metric;
	chart.data.datasets[0].data = values(progress, metric);
	chart.update();
}

function labels(progress) { return progress.map(p => p.date); }
function values(progress, metric) { return progress.filter(p => p.metric === metric).map(p => p.value); }


