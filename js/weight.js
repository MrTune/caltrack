let weightChart = null;

function logWeight() {
  const val = parseFloat(document.getElementById('w-input').value);
  const date = document.getElementById('w-date').value || todayStr();
  if (!val || val <= 0) { showToast('Enter a valid weight', 'error'); return; }
  Storage.addWeight({ weight: val, date });
  document.getElementById('w-input').value = '';
  showToast('✨ Weight logged');
  renderWeight();
}

function deleteWeight(id) {
  if (!confirm('Delete this entry?')) return;
  Storage.removeWeight(id);
  showToast('Entry deleted');
  renderWeight();
}

function renderWeight() {
  const weights = Storage.getWeights();
  const start = weights.length ? weights[0].weight : null;
  const current = weights.length ? weights[weights.length - 1].weight : null;
  const change = (start != null && current != null) ? (current - start).toFixed(1) : null;
  const isLoss = change !== null && Number(change) <= 0;

  document.getElementById('w-current').textContent = current != null ? current + ' kg' : '—';
  document.getElementById('w-start').textContent = start != null ? start + ' kg' : '—';
  const changeEl = document.getElementById('w-change');
  if (changeEl) {
    changeEl.textContent = change !== null ? (Number(change) > 0 ? '+' : '') + change + ' kg' : '—';
    changeEl.style.color = change !== null ? (isLoss ? '#34d399' : '#f87171') : '';
  }

  const chartCard = document.getElementById('weight-chart-card');
  if (weights.length > 1) {
    if (chartCard) chartCard.style.display = '';
    const labels = weights.map(w => new Date(w.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
    const data = weights.map(w => w.weight);
    if (weightChart) { weightChart.destroy(); weightChart = null; }
    const ctx = document.getElementById('weight-chart');
    if (ctx) {
      const gridColor = 'rgba(168,85,247,0.08)';
      const textColor = '#71717a';
      weightChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            data,
            borderColor: '#a855f7',
            borderWidth: 2.5,
            pointRadius: 4,
            pointBackgroundColor: '#a855f7',
            pointBorderColor: 'rgba(168,85,247,0.3)',
            pointBorderWidth: 4,
            fill: { target: 'origin', above: 'rgba(168,85,247,0.06)' },
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(12,8,24,0.95)',
              titleColor: '#71717a',
              bodyColor: '#e5e7eb',
              borderColor: 'rgba(168,85,247,0.3)',
              borderWidth: 1,
              padding: 10,
              cornerRadius: 10
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: textColor, font: { family: "'Space Grotesk', sans-serif", size: 11 }, maxTicksLimit: 8 },
              border: { display: false }
            },
            y: {
              grid: { color: gridColor, lineWidth: 1 },
              ticks: { color: textColor, font: { family: "'Space Grotesk', sans-serif", size: 11 } },
              border: { display: false }
            }
          }
        }
      });
    }
  } else {
    if (chartCard) chartCard.style.display = 'none';
  }

  const hist = document.getElementById('weight-history');
  if (!hist) return;
  if (weights.length === 0) {
    hist.innerHTML = '<div class="empty-state">No weight entries yet.<br>Log your first one above!</div>';
    return;
  }
  hist.innerHTML = [...weights].reverse().map(w => `
    <div class="weight-item">
      <div>
        <div class="w-val">${w.weight} kg</div>
        <div class="w-date">${new Date(w.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
      </div>
      <button class="delete-btn" onclick="deleteWeight('${w.id}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
      </button>
    </div>`).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('w-date').value = todayStr();
  renderWeight();
});
