let calYear = new Date().getFullYear();
let calMonth = new Date().getMonth();

function changeMonth(delta) {
  calMonth += delta;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendar();
}

function renderCalendar() {
  const settings = Storage.getSettings();
  const logs = Storage.getFoodLogs();
  const { calorieGoal } = settings;
  const today = todayStr();

  // Header
  const label = document.getElementById('month-label');
  if (label) label.textContent = new Date(calYear, calMonth, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  // Build map of date → total calories
  const calMap = {};
  logs.forEach(l => {
    calMap[l.date] = (calMap[l.date] || 0) + l.calories;
  });

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDay = new Date(calYear, calMonth, 1).getDay();

  const grid = document.getElementById('cal-grid');
  if (!grid) return;

  let html = '';
  // Blanks
  for (let i = 0; i < firstDay; i++) html += '<div class="cal-day empty"></div>';

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const cals = calMap[dateStr] || 0;
    const isToday = dateStr === today;

    let cls = 'cal-day ';
    let calText = '';
    if (cals === 0) {
      cls += 'none';
    } else {
      const pct = cals / calorieGoal;
      if (pct >= 0.9) cls += 'high';
      else if (pct >= 0.6) cls += 'mid';
      else cls += 'low';
      calText = `<div class="cal-cal">${Math.round(cals)}c</div>`;
    }
    if (isToday) cls += ' today';

    html += `<div class="${cls}" title="${dateStr}: ${Math.round(cals)} kcal">
      <span>${d}</span>
      ${cals > 0 ? '<div class="dot"></div>' : ''}
      ${calText}
    </div>`;
  }
  grid.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', renderCalendar);
