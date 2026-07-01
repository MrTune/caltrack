function loadSettings() {
  const s = Storage.getSettings();
  const calInput = document.getElementById('cal-goal');
  const proInput = document.getElementById('pro-goal');
  const darkToggle = document.getElementById('dark-toggle');
  if (calInput) calInput.value = s.calorieGoal;
  if (proInput) proInput.value = s.proteinGoal;
  if (darkToggle) darkToggle.checked = !!s.darkMode;
  renderCurrentGoals(s);
}

function renderCurrentGoals(s) {
  const el = document.getElementById('current-goals');
  if (!el) return;
  el.innerHTML = `<span style="color:var(--text-muted);font-size:.8rem">Current targets: &nbsp;</span>
    <span style="color:var(--calories);font-weight:700">${s.calorieGoal} kcal</span>
    <span style="color:var(--text-muted)"> &nbsp;·&nbsp; </span>
    <span style="color:var(--protein);font-weight:700">${s.proteinGoal}g protein</span>`;
}

function saveGoals() {
  const cal = parseInt(document.getElementById('cal-goal').value, 10);
  const pro = parseInt(document.getElementById('pro-goal').value, 10);
  if (!cal || cal < 1 || !pro || pro < 1) {
    showToast('Please enter valid positive numbers', 'error'); return;
  }
  const s = Storage.getSettings();
  s.calorieGoal = cal;
  s.proteinGoal = pro;
  Storage.saveSettings(s);
  renderCurrentGoals(s);
  showToast('✨ Goals saved!');
}

function toggleDark(checked) {
  const s = Storage.getSettings();
  s.darkMode = checked;
  Storage.saveSettings(s);
  // Site is always dark — toggle just persists user preference
  document.documentElement.classList.toggle('dark', checked);
}

function exportData() {
  const json = Storage.exportData();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `caltrack-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('✨ Data exported!');
}

function importData(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const result = Storage.importData(e.target.result);
    if (result.success) {
      loadSettings();
      showToast('✨ Data imported!');
    } else {
      showToast(result.error || 'Import failed', 'error');
    }
  };
  reader.readAsText(file);
  input.value = '';
}

function clearAll() {
  if (!confirm('This will permanently delete ALL your food logs, weight history, and settings. This cannot be undone. Are you sure?')) return;
  Storage.clearAll();
  loadSettings();
  showToast('All data cleared.');
}

document.addEventListener('DOMContentLoaded', loadSettings);
