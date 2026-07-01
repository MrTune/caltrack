const KEYS = {
  SETTINGS: 'caltrack_settings',
  FOOD_LOGS: 'caltrack_food_logs',
  WEIGHTS: 'caltrack_weights'
};

const DEFAULT_SETTINGS = {
  calorieGoal: 2000,
  proteinGoal: 100,
  darkMode: false
};

const Storage = {
  getSettings() {
    try {
      const d = localStorage.getItem(KEYS.SETTINGS);
      return d ? { ...DEFAULT_SETTINGS, ...JSON.parse(d) } : { ...DEFAULT_SETTINGS };
    } catch { return { ...DEFAULT_SETTINGS }; }
  },
  saveSettings(s) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(s));
  },
  getFoodLogs() {
    try {
      const d = localStorage.getItem(KEYS.FOOD_LOGS);
      return d ? JSON.parse(d) : [];
    } catch { return []; }
  },
  saveFoodLogs(logs) {
    localStorage.setItem(KEYS.FOOD_LOGS, JSON.stringify(logs));
  },
  addFoodLog(entry) {
    const logs = this.getFoodLogs();
    const newLog = { ...entry, id: crypto.randomUUID() };
    logs.push(newLog);
    this.saveFoodLogs(logs);
    return newLog;
  },
  removeFoodLog(id) {
    const logs = this.getFoodLogs().filter(l => l.id !== id);
    this.saveFoodLogs(logs);
  },
  getWeights() {
    try {
      const d = localStorage.getItem(KEYS.WEIGHTS);
      return d ? JSON.parse(d) : [];
    } catch { return []; }
  },
  saveWeights(weights) {
    localStorage.setItem(KEYS.WEIGHTS, JSON.stringify(weights));
  },
  addWeight(entry) {
    const weights = this.getWeights();
    const newW = { ...entry, id: crypto.randomUUID() };
    weights.push(newW);
    weights.sort((a, b) => new Date(a.date) - new Date(b.date));
    this.saveWeights(weights);
    return newW;
  },
  removeWeight(id) {
    const weights = this.getWeights().filter(w => w.id !== id);
    this.saveWeights(weights);
  },
  exportData() {
    return JSON.stringify({
      settings: this.getSettings(),
      foodLogs: this.getFoodLogs(),
      weights: this.getWeights(),
      exportedAt: new Date().toISOString()
    }, null, 2);
  },
  importData(json) {
    try {
      const data = JSON.parse(json);
      if (data.settings) this.saveSettings({ ...DEFAULT_SETTINGS, ...data.settings });
      if (Array.isArray(data.foodLogs)) this.saveFoodLogs(data.foodLogs);
      if (Array.isArray(data.weights)) this.saveWeights(data.weights);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Invalid file format' };
    }
  },
  clearAll() {
    localStorage.removeItem(KEYS.SETTINGS);
    localStorage.removeItem(KEYS.FOOD_LOGS);
    localStorage.removeItem(KEYS.WEIGHTS);
  }
};
