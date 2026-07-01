// ─── Particles ──────────────────────────────────────────────
function initParticles() {
  const canvas = document.createElement('canvas');
  canvas.id = 'particles-bg';
  document.body.insertBefore(canvas, document.body.firstChild);
  const ctx = canvas.getContext('2d');

  let W, H, particles;
  const COLORS = ['168,85,247', '124,58,237', '192,132,252', '109,40,217'];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.8 + 0.4,
      dx: (Math.random() - 0.5) * 0.25,
      dy: (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.5 + 0.1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.opacity})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = `rgba(${p.color},0.6)`;
      ctx.fill();
      ctx.shadowBlur = 0;

      p.x += p.dx;
      p.y += p.dy;
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;
    });
    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();
  window.addEventListener('resize', () => { resize(); createParticles(); });
}

// ─── Count-up animation ─────────────────────────────────────
function countUp(el, target, duration = 800, suffix = '') {
  if (!el) return;
  const start = performance.now();
  const startVal = 0;
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(startVal + (target - startVal) * eased);
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ─── Theme ──────────────────────────────────────────────────
function applyTheme() {
  const s = Storage.getSettings();
  // Always apply dark as base; darkMode toggle just controls preference
  document.documentElement.classList.toggle('dark', !!s.darkMode);
}

// ─── Active nav ─────────────────────────────────────────────
function initNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-page]').forEach(el => {
    const p = el.dataset.page;
    const matches =
      (p === 'dashboard' && (page === '' || page === 'index.html')) ||
      (p !== 'dashboard' && page === p + '.html');
    el.classList.toggle('active', matches);
  });
}

// ─── Toast ──────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = 'toast' }, 2800);
}

// ─── SVG progress ring ───────────────────────────────────────
function makeSVGRing(value, max, size, color) {
  const stroke = Math.round(size * 0.083);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circ - pct * circ;
  const cx = size / 2;
  const filterId = 'glow-' + Math.random().toString(36).slice(2,7);
  return `<svg width="${size}" height="${size}" style="transform:rotate(-90deg);display:block">
    <defs>
      <filter id="${filterId}" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="${stroke}"/>
    <circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}"
      stroke-dasharray="${circ.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"
      stroke-linecap="round" filter="url(#${filterId})"
      style="transition:stroke-dashoffset 0.9s cubic-bezier(0.16,1,0.3,1)"/>
  </svg>`;
}

// ─── Date helpers ────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().split('T')[0];
}
function formatDateLabel(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric'
  });
}
function nDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

// ─── Add Food Modal ──────────────────────────────────────────
const PRESETS = {
  Breakfast: [
    { name: 'Idli', cal: 39, pro: 2 },
    { name: 'Dosa', cal: 133, pro: 3 },
    { name: 'Upma', cal: 190, pro: 5 },
    { name: 'Poha', cal: 270, pro: 5 },
    { name: 'Vada', cal: 97, pro: 3 }
  ],
  Lunch: [
    { name: 'Rice (1 cup)', cal: 206, pro: 4 },
    { name: 'Dal (1 cup)', cal: 150, pro: 9 },
    { name: 'Chapati', cal: 104, pro: 3 },
    { name: 'Paneer Curry', cal: 250, pro: 14 },
    { name: 'Chicken Curry', cal: 240, pro: 25 },
    { name: 'Chicken Breast (100g)', cal: 165, pro: 31 },
    { name: 'Egg', cal: 78, pro: 6 },
    { name: 'Biryani', cal: 290, pro: 15 }
  ],
  Dinner: [
    { name: 'Rice (1 cup)', cal: 206, pro: 4 },
    { name: 'Dal (1 cup)', cal: 150, pro: 9 },
    { name: 'Chapati', cal: 104, pro: 3 },
    { name: 'Paneer Curry', cal: 250, pro: 14 },
    { name: 'Chicken Curry', cal: 240, pro: 25 },
    { name: 'Chicken Breast (100g)', cal: 165, pro: 31 },
    { name: 'Egg', cal: 78, pro: 6 },
    { name: 'Biryani', cal: 290, pro: 15 }
  ],
  Snack: [
    { name: 'Samosa', cal: 262, pro: 5 },
    { name: 'Maggi', cal: 350, pro: 8 },
    { name: 'Tea', cal: 30, pro: 1 },
    { name: 'Coffee', cal: 35, pro: 1 }
  ]
};

function openAddFoodModal(defaultMeal, defaultDate) {
  const m = document.getElementById('add-food-modal');
  if (!m) return;
  const mealSel = m.querySelector('#modal-meal');
  const dateSel = m.querySelector('#modal-date');
  if (mealSel && defaultMeal) mealSel.value = defaultMeal;
  if (dateSel) dateSel.value = defaultDate || todayStr();
  m.querySelector('#modal-name').value = '';
  m.querySelector('#modal-calories').value = '';
  m.querySelector('#modal-protein').value = '';
  m.querySelector('#modal-qty').value = '1';
  updateModalPresets();
  m.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAddFoodModal() {
  const m = document.getElementById('add-food-modal');
  if (m) m.classList.remove('open');
  document.body.style.overflow = '';
}

function updateModalPresets() {
  const m = document.getElementById('add-food-modal');
  if (!m) return;
  const meal = m.querySelector('#modal-meal').value;
  const presets = PRESETS[meal] || [];
  const container = m.querySelector('#modal-presets');
  if (!container) return;
  container.innerHTML = presets.map(p =>
    `<button class="preset-chip" onclick="applyPreset('${p.name.replace(/'/g,"\\'")}',${p.cal},${p.pro})">${p.name}</button>`
  ).join('');
}

function applyPreset(name, cal, pro) {
  const m = document.getElementById('add-food-modal');
  if (!m) return;
  m.querySelector('#modal-name').value = name;
  m.querySelector('#modal-calories').value = cal;
  m.querySelector('#modal-protein').value = pro;
  m.querySelector('#modal-qty').value = '1';
}

function saveFood() {
  const m = document.getElementById('add-food-modal');
  if (!m) return;
  const name = m.querySelector('#modal-name').value.trim();
  const cal = parseFloat(m.querySelector('#modal-calories').value);
  const pro = parseFloat(m.querySelector('#modal-protein').value);
  const qty = parseFloat(m.querySelector('#modal-qty').value) || 1;
  const meal = m.querySelector('#modal-meal').value;
  const date = m.querySelector('#modal-date').value || todayStr();
  if (!name || isNaN(cal) || isNaN(pro)) {
    showToast('Please fill all fields', 'error'); return;
  }
  Storage.addFoodLog({ name, calories: Math.round(cal * qty), protein: parseFloat((pro * qty).toFixed(1)), quantity: qty, mealType: meal, date });
  closeAddFoodModal();
  showToast('✨ Food added!');
  if (typeof onFoodAdded === 'function') onFoodAdded();
}

// ─── Init ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  applyTheme();
  initNav();

  const m = document.getElementById('add-food-modal');
  if (m) {
    m.addEventListener('click', e => { if (e.target === m) closeAddFoodModal() });
    m.querySelector('#modal-meal')?.addEventListener('change', updateModalPresets);
  }
});
