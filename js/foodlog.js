let currentDate = todayStr();

function onFoodAdded() { renderFoodLog(); }

function changeDay(delta) {
  const d = new Date(currentDate + 'T00:00:00');
  d.setDate(d.getDate() + delta);
  currentDate = d.toISOString().split('T')[0];
  renderFoodLog();
}

function deleteFood(id) {
  if (!confirm('Delete this food entry?')) return;
  Storage.removeFoodLog(id);
  showToast('Entry deleted');
  renderFoodLog();
}

function renderFoodLog() {
  const today = todayStr();
  const search = (document.getElementById('search-input')?.value || '').toLowerCase();
  const logs = Storage.getFoodLogs().filter(l => l.date === currentDate && l.name.toLowerCase().includes(search));

  // Date nav label
  const label = document.getElementById('date-label');
  if (label) label.textContent = formatDateLabel(currentDate);
  const nextBtn = document.getElementById('btn-next-day');
  if (nextBtn) nextBtn.disabled = currentDate >= today;

  // Summary
  const totalCal = logs.reduce((s, l) => s + l.calories, 0);
  const totalPro = logs.reduce((s, l) => s + l.protein, 0);
  const calEl = document.getElementById('total-cal');
  const proEl = document.getElementById('total-pro');
  if (calEl) calEl.textContent = Math.round(totalCal);
  if (proEl) proEl.textContent = Math.round(totalPro) + 'g';

  // Meals
  const meals = ['Breakfast','Lunch','Dinner','Snack'];
  const container = document.getElementById('meals-container');
  if (!container) return;
  container.innerHTML = meals.map(meal => {
    const ml = logs.filter(l => l.mealType === meal);
    const mCal = ml.reduce((s, l) => s + l.calories, 0);
    return `
      <div class="meal-section">
        <div class="meal-header">
          <h3>${meal}</h3>
          <div class="meal-meta">
            <span>${Math.round(mCal)} kcal</span>
            <button class="meal-add-btn" onclick="openAddFoodModal('${meal}','${currentDate}')">+ Add</button>
          </div>
        </div>
        ${ml.length === 0
          ? `<div class="meal-empty">Nothing logged for ${meal.toLowerCase()}</div>`
          : ml.map(log => `
            <div class="food-item">
              <div>
                <div class="food-item-name">${log.name}</div>
                <div class="food-item-sub">${log.quantity} serving · ${Math.round(log.protein)}g protein</div>
              </div>
              <div class="food-item-right">
                <span class="food-item-kcal">${Math.round(log.calories)} kcal</span>
                <button class="delete-btn" onclick="deleteFood('${log.id}')" title="Delete">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              </div>
            </div>`).join('')}
      </div>`;
  }).join('');
}

document.addEventListener('DOMContentLoaded', renderFoodLog);
