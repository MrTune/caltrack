let charts = {};
let activeTab = 'weekly';

function switchTab(tab, btn) {
  activeTab = tab;
  document.getElementById('tab-weekly').style.display = tab === 'weekly' ? '' : 'none';
  document.getElementById('tab-monthly').style.display = tab === 'monthly' ? '' : 'none';
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderCharts();
}

function destroyChart(id) {
  if (charts[id]) { charts[id].destroy(); delete charts[id]; }
}

function chartTheme() {
  return {
    gridColor: 'rgba(168,85,247,0.08)',
    textColor: '#71717a',
    tooltipBg: 'rgba(12,8,24,0.95)',
    tooltipText: '#e5e7eb',
    tooltipBorder: 'rgba(168,85,247,0.3)'
  };
}

function makeBarChart(id, labels, data, color) {
  destroyChart(id);
  const ctx = document.getElementById(id);
  if (!ctx) return;
  const t = chartTheme();
  charts[id] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: color + '99',
        borderColor: color,
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 44
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: t.tooltipBg,
          titleColor: t.textColor,
          bodyColor: t.tooltipText,
          borderColor: t.tooltipBorder,
          borderWidth: 1,
          padding: 10,
          cornerRadius: 10
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: t.textColor, font: { family: "'Space Grotesk', sans-serif", size: 11 } },
          border: { display: false }
        },
        y: {
          grid: { color: t.gridColor, lineWidth: 1 },
          ticks: { color: t.textColor, font: { family: "'Space Grotesk', sans-serif", size: 11 } },
          border: { display: false }
        }
      }
    }
  });
}

function makeLineChart(id, labels, data, color) {
  destroyChart(id);
  const ctx = document.getElementById(id);
  if (!ctx) return;
  const t = chartTheme();
  charts[id] = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: color,
        borderWidth: 2.5,
        pointRadius: 3,
        pointBackgroundColor: color,
        pointBorderColor: 'transparent',
        fill: {
          target: 'origin',
          above: color.replace(')', ',0.06)').replace('rgb', 'rgba')
        },
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: t.tooltipBg,
          titleColor: t.textColor,
          bodyColor: t.tooltipText,
          borderColor: t.tooltipBorder,
          borderWidth: 1,
          padding: 10,
          cornerRadius: 10
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: t.textColor, font: { family: "'Space Grotesk', sans-serif", size: 10 }, maxTicksLimit: 10 },
          border: { display: false }
        },
        y: {
          grid: { color: t.gridColor, lineWidth: 1 },
          ticks: { color: t.textColor, font: { family: "'Space Grotesk', sans-serif", size: 11 } },
          border: { display: false }
        }
      }
    }
  });
}

function renderCharts() {
  const settings = Storage.getSettings();
  const logs = Storage.getFoodLogs();
  const weights = Storage.getWeights();

  if (activeTab === 'weekly') {
    const weekLabels = [], weekCal = [], weekPro = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const dayLogs = logs.filter(l => l.date === ds);
      weekLabels.push(d.toLocaleDateString(undefined, { weekday: 'short' }));
      weekCal.push(dayLogs.reduce((s, l) => s + l.calories, 0));
      weekPro.push(dayLogs.reduce((s, l) => s + l.protein, 0));
    }
    const loggingDays = weekCal.filter(v => v > 0).length || 1;
    const avgC = weekCal.reduce((s, v) => s + v, 0) / loggingDays;
    const avgP = weekPro.reduce((s, v) => s + v, 0) / loggingDays;

    const avgCalEl = document.getElementById('avg-cal');
    const avgProEl = document.getElementById('avg-pro');
    if (avgCalEl) countUp(avgCalEl, Math.round(avgC), 700);
    if (avgProEl) {
      const t = performance.now();
      const val = Math.round(avgP);
      function step(now) {
        const p = Math.min((now - t) / 700, 1);
        const e = 1 - Math.pow(1 - p, 3);
        avgProEl.textContent = Math.round(val * e) + 'g';
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    const goalCalEl = document.getElementById('avg-cal-goal');
    const goalProEl = document.getElementById('avg-pro-goal');
    if (goalCalEl) goalCalEl.textContent = 'goal ' + settings.calorieGoal + ' kcal';
    if (goalProEl) goalProEl.textContent = 'goal ' + settings.proteinGoal + 'g';

    makeBarChart('chart-cal-week', weekLabels, weekCal, '#fb923c');
    makeBarChart('chart-pro-week', weekLabels, weekPro, '#60a5fa');

  } else {
    const labels30 = [], cal30 = [], pro30 = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const dayLogs = logs.filter(l => l.date === ds);
      labels30.push(`${d.getDate()}/${d.getMonth()+1}`);
      cal30.push(dayLogs.reduce((s, l) => s + l.calories, 0));
      pro30.push(dayLogs.reduce((s, l) => s + l.protein, 0));
    }

    const loggingDays30 = cal30.filter(v => v > 0).length || 1;
    const avgCM = cal30.reduce((s, v) => s + v, 0) / loggingDays30;
    const avgPM = pro30.reduce((s, v) => s + v, 0) / loggingDays30;
    const avgCalMEl = document.getElementById('avg-cal-month');
    const avgProMEl = document.getElementById('avg-pro-month');
    if (avgCalMEl) countUp(avgCalMEl, Math.round(avgCM), 700);
    if (avgProMEl) {
      const t = performance.now();
      const val = Math.round(avgPM);
      function step(now) {
        const p = Math.min((now - t) / 700, 1);
        const e = 1 - Math.pow(1 - p, 3);
        avgProMEl.textContent = Math.round(val * e) + 'g';
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    makeLineChart('chart-cal-month', labels30, cal30, '#fb923c');

    const weightCard = document.getElementById('weight-chart-card');
    if (weights.length > 1) {
      if (weightCard) weightCard.style.display = '';
      const wMap = {};
      weights.forEach(w => { wMap[w.date] = w.weight; });
      const wLabels = [], wData = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const ds = d.toISOString().split('T')[0];
        if (wMap[ds] != null) {
          wLabels.push(`${d.getDate()}/${d.getMonth()+1}`);
          wData.push(wMap[ds]);
        }
      }
      if (wLabels.length > 1) makeLineChart('chart-weight-month', wLabels, wData, '#a855f7');
    } else {
      if (weightCard) weightCard.style.display = 'none';
    }
  }
}

document.addEventListener('DOMContentLoaded', renderCharts);
