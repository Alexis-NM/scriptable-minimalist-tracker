/*
 * Single Habit Tracker for Scriptable
 * Interactive settings and daily check-in with a 3×12 grid.
 */

// Keychain keys and layout configuration
const KEYS = {
  theme: "habitTrackerTheme",
  habit: "habitTrackerName",
  dates: "singleHabitTrackerDates",
};
const CONFIG = {
  padding: 8,
  spacing: 3,
  rows: 3,
  cols: 12,
  cornerRadius: 4,
  widgetWidth: 364,
};

// --- Keychain Helpers ---------------------------------------------------
function loadKey(name) {
  try {
    return Keychain.get(KEYS[name]) || null;
  } catch {
    return null;
  }
}
function saveKey(name, value) {
  try {
    Keychain.set(KEYS[name], value);
  } catch {}
}
function removeKey(name) {
  try {
    Keychain.remove(KEYS[name]);
  } catch {}
}

// --- Date Utilities ------------------------------------------------------
const formatDate = (date) => date.toISOString().slice(0, 10);
const daysInMonth = (month, year) => new Date(year, month, 0).getDate();
const getCellSize = () => {
  const usable =
    CONFIG.widgetWidth -
    2 * CONFIG.padding -
    (CONFIG.cols - 1) * CONFIG.spacing;
  return Math.floor(usable / CONFIG.cols);
};

// --- Prompt Utilities ----------------------------------------------------
async function promptChoice(title, message, options) {
  const alert = new Alert();
  alert.title = title;
  if (message) alert.message = message;
  options.forEach((opt) => alert.addAction(opt));
  alert.addCancelAction("Cancel");
  const idx = await alert.presentSheet();
  return idx >= 0 && idx < options.length ? options[idx] : null;
}
async function promptInput(title, placeholder) {
  const alert = new Alert();
  alert.title = title;
  alert.addTextField(placeholder);
  alert.addAction("OK");
  alert.addCancelAction("Cancel");
  const idx = await alert.presentAlert();
  return idx === 0 ? alert.textFieldValue(0).trim() : null;
}

// --- Ensure Settings -----------------------------------------------------
async function ensureTheme() {
  let theme = loadKey("theme");
  if (!theme) {
    const choice = await promptChoice(
      "Choose theme",
      "Select dark or light mode",
      ["dark", "light"]
    );
    if (choice) {
      theme = choice;
      saveKey("theme", theme);
    }
  }
  return theme;
}
async function ensureHabit() {
  let habit = loadKey("habit");
  if (!habit) {
    const name = await promptInput("What do you want to track?", "habit name");
    if (name) {
      habit = name.toLowerCase();
      saveKey("habit", habit);
    }
  }
  return habit;
}

// --- Data Management -----------------------------------------------------
function loadDates() {
  try {
    const raw = Keychain.get(KEYS.dates);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveDates(dates) {
  try {
    Keychain.set(KEYS.dates, JSON.stringify(dates));
  } catch {}
}
async function resetData() {
  saveDates([]);
}

// --- Widget Builder ------------------------------------------------------
function createWidget(habit, dates, theme) {
  const widget = new ListWidget();
  widget.setPadding(
    CONFIG.padding,
    CONFIG.padding,
    CONFIG.padding,
    CONFIG.padding
  );
  widget.backgroundColor =
    theme === "dark" ? new Color("#242424") : new Color("#FFFFFF");

  // Title
  const title = widget.addText(habit);
  title.font = Font.boldSystemFont(16);
  title.textColor = theme === "dark" ? Color.white() : Color.black();
  title.leftAlignText();
  widget.addSpacer(4);

  // Grid
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const totalDays = daysInMonth(month, year);
  const size = getCellSize();

  for (let r = 0; r < CONFIG.rows; r++) {
    const row = widget.addStack();
    row.layoutHorizontally();
    for (let c = 0; c < CONFIG.cols; c++) {
      const idx = r * CONFIG.cols + c + 1;
      const cell = row.addStack();
      cell.size = new Size(size, size);
      const done =
        idx <= totalDays &&
        dates.includes(formatDate(new Date(year, month - 1, idx)));
      cell.backgroundColor = done ? new Color("#4CD964") : new Color("#E5E5EA");
      cell.cornerRadius = CONFIG.cornerRadius;
      if (c < CONFIG.cols - 1) row.addSpacer(CONFIG.spacing);
    }
    if (r < CONFIG.rows - 1) widget.addSpacer(CONFIG.spacing);
  }

  return widget;
}

// --- Main Execution ------------------------------------------------------
if (config.runsInApp) {
  const theme = await ensureTheme();
  const habit = await ensureHabit();
  if (!theme || !habit) return Script.complete();

  // Main menu
  const action = await promptChoice(habit, null, ["Check-in", "Settings"]);
  const dates = loadDates();

  if (action === "Check-in") {
    const today = formatDate(new Date());
    const idx = dates.indexOf(today);
    if (idx >= 0) dates.splice(idx, 1);
    else dates.push(today);
    saveDates(dates);
    const alert = new Alert();
    alert.title = habit;
    alert.message =
      idx >= 0 ? "❌ Removed today's entry" : "✅ Added today's entry";
    alert.addAction("OK");
    await alert.presentAlert();
  } else if (action === "Settings") {
    const choice = await promptChoice("Settings", null, [
      "Change Theme",
      "Change Habit",
      "Reset Data",
    ]);
    if (choice === "Change Theme") {
      const newTheme = await promptForTheme();
      if (newTheme) saveKey("theme", newTheme);
    } else if (choice === "Change Habit") {
      const newHabit = await promptForHabit();
      if (newHabit) saveKey("habit", newHabit);
    } else if (choice === "Reset Data") {
      await resetData();
    }
  }

  const widget = createWidget(habit, loadDates(), theme);
  await widget.presentMedium();
  Script.complete();
} else {
  const theme = loadKey("theme") || "light";
  const habit = loadKey("habit") || "habit";
  const dates = loadDates();
  Script.setWidget(createWidget(habit, dates, theme));
  Script.complete();
}
