function onFoodAdded() { renderDashboard(); }

function renderDashboard() {
  const settings = Storage.getSettings();
  const logs = Storage.getFoodLogs();
  const weights = Storage.getWeights();
  const today = todayStr();

  // Header date
  const el = document.getElementById('today-label');
  if (el) el.textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  const todayLogs = logs.filter(l => l.date === today);
  const totalCal = todayLogs.reduce((s, l) => s + l.calories, 0);
  const totalPro = todayLogs.reduce((s, l) => s + l.protein, 0);
  const { calorieGoal, proteinGoal } = settings;

  // Calorie ring
  const calCard = document.getElementById('cal-card');
  if (calCard) {
    const leftCal = Math.max(0, calorieGoal - Math.round(totalCal));
    calCard.innerHTML = `
      <div class="ring-wrap">
        <div class="ring-label" style="color:var(--calories)">🔥 Calories</div>
        <div style="position:relative;display:inline-block">
          ${makeSVGRing(totalCal, calorieGoal, 132, '#fb923c')}
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
            <span id="cal-num" style="font-size:1.3rem;font-weight:700;letter-spacing:-.02em">0</span>
            <span style="font-size:.65rem;color:var(--text-muted);margin-top:2px">/ ${calorieGoal}</span>
          </div>
        </div>
        <div class="ring-stats">
          <div><span class="stat-label">Goal</span><span class="stat-val">${calorieGoal}</span></div>
          <div><span class="stat-label">Eaten</span><span class="stat-val" id="cal-eaten">0</span></div>
          <div><span class="stat-label" style="color:var(--calories)">Left</span><span class="stat-val" style="color:var(--calories)" id="cal-left">0</span></div>
        </div>
      </div>`;
    countUp(document.getElementById('cal-num'), Math.round(totalCal), 900);
    countUp(document.getElementById('cal-eaten'), Math.round(totalCal), 900);
    countUp(document.getElementById('cal-left'), leftCal, 900);
  }

  // Protein ring
  const proCard = document.getElementById('pro-card');
  if (proCard) {
    const leftPro = Math.max(0, proteinGoal - Math.round(totalPro));
    proCard.innerHTML = `
      <div class="ring-wrap">
        <div class="ring-label" style="color:var(--protein)">💪 Protein</div>
        <div style="position:relative;display:inline-block">
          ${makeSVGRing(totalPro, proteinGoal, 132, '#60a5fa')}
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
            <span id="pro-num" style="font-size:1.3rem;font-weight:700;letter-spacing:-.02em">0g</span>
            <span style="font-size:.65rem;color:var(--text-muted);margin-top:2px">/ ${proteinGoal}g</span>
          </div>
        </div>
        <div class="ring-stats">
          <div><span class="stat-label">Goal</span><span class="stat-val">${proteinGoal}g</span></div>
          <div><span class="stat-label">Eaten</span><span class="stat-val"><span id="pro-eaten">0</span>g</span></div>
          <div><span class="stat-label" style="color:var(--protein)">Left</span><span class="stat-val" style="color:var(--protein)"><span id="pro-left">0</span>g</span></div>
        </div>
      </div>`;
    // Count-up with g suffix
    const proNumEl = document.getElementById('pro-num');
    if (proNumEl) {
      const start = performance.now();
      const target = Math.round(totalPro);
      function step(now) {
        const p = Math.min((now - start) / 900, 1);
        const e = 1 - Math.pow(1 - p, 3);
        proNumEl.textContent = Math.round(target * e) + 'g';
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    countUp(document.getElementById('pro-eaten'), Math.round(totalPro), 900);
    countUp(document.getElementById('pro-left'), leftPro, 900);
  }

  // Quick stats
  const currentW = weights.length ? weights[weights.length - 1].weight : null;
  const streakEl = document.getElementById('stat-streak');
  const mealsEl = document.getElementById('stat-meals');
  const weightEl = document.getElementById('stat-weight');

  if (mealsEl) countUp(mealsEl, todayLogs.length, 700);
  if (weightEl) weightEl.textContent = currentW != null ? currentW + ' kg' : '—';
  if (streakEl) {
    const s = calcStreak(logs, today);
    countUp(streakEl, s, 700, ' 🔥');
  }

  // Quick add protein
  const qaGrid = document.getElementById('quick-add-grid');
  if (qaGrid) {
    const items = [
      { name: 'Egg', p: 6, c: 70 },
      { name: 'Chicken Breast (100g)', p: 31, c: 165 },
      { name: 'Milk (250ml)', p: 8, c: 150 },
      { name: 'Paneer (100g)', p: 18, c: 265 }
    ];
    qaGrid.innerHTML = items.map(item => `
      <button class="quick-add-btn" onclick="quickAdd('${item.name.replace(/'/g,"\\'")}',${item.c},${item.p})">
        <span class="qa-name">${item.name}</span>
        <span class="qa-sub">${item.p}g protein · ${item.c} kcal</span>
      </button>`).join('');
  }

  // Today's meals
  const meals = ['Breakfast','Lunch','Dinner','Snack'];
  const mealsContainer = document.getElementById('todays-meals');
  if (mealsContainer) {
    mealsContainer.innerHTML = meals.map(meal => {
      const mealLogs = todayLogs.filter(l => l.mealType === meal);
      const mCal = mealLogs.reduce((s, l) => s + l.calories, 0);
      const mPro = mealLogs.reduce((s, l) => s + l.protein, 0);
      return `
        <div class="meal-section">
          <div class="meal-header">
            <h3>${meal}</h3>
            <div class="meal-meta">
              <span style="color:var(--calories);font-weight:700">${Math.round(mCal)} kcal</span>
              <span style="opacity:.4">·</span>
              <span style="color:var(--protein);font-weight:700">${Math.round(mPro)}g P</span>
            </div>
          </div>
          ${mealLogs.length === 0
            ? `<div class="meal-empty">Nothing logged yet</div>`
            : mealLogs.map(log => `
              <div class="food-item">
                <div>
                  <div class="food-item-name">${log.name}</div>
                  <div class="food-item-sub">Qty: ${log.quantity}</div>
                </div>
                <div class="food-item-right">
                  <span class="food-item-kcal" style="color:var(--calories)">${Math.round(log.calories)} kcal</span>
                  <span class="food-item-sub">${Math.round(log.protein)}g P</span>
                </div>
              </div>`).join('')}
        </div>`;
    }).join('');
  }
}

function quickAdd(name, cal, pro) {
  Storage.addFoodLog({ name, calories: cal, protein: pro, quantity: 1, mealType: 'Snack', date: todayStr() });
  showToast(`✨ Added ${name}`);
  renderDashboard();
}

function calcStreak(logs, today) {
  const dates = [...new Set(logs.map(l => l.date))].sort().reverse();
  if (!dates.length) return 0;
  let count = 0;
  const cursor = new Date(today + 'T00:00:00');
  for (const d of dates) {
    const cStr = cursor.toISOString().split('T')[0];
    if (d === cStr) { count++; cursor.setDate(cursor.getDate() - 1); }
    else if (count === 0) {
      const y = new Date(today + 'T00:00:00'); y.setDate(y.getDate() - 1);
      if (d === y.toISOString().split('T')[0]) { count++; cursor.setTime(y.getTime()); cursor.setDate(cursor.getDate() - 1); }
      else break;
    } else break;
  }
  return count;
}

document.addEventListener('DOMContentLoaded', renderDashboard);
