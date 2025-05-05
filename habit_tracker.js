/*
 * Single Habit Tracker for Scriptable
 * Interactive settings and daily check-in with a dynamic 3×N grid per month.
 */

const KEYS = {
  theme: "habitTrackerTheme",
  habit: "habitTrackerName",
  dates: "singleHabitTrackerDates",
};
const CONFIG = {
  padding: 8,
  spacing: 3,
  rows: 3,
  cornerRadius: 4,
  widgetWidth: 364,
};

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

const formatDate = (date) => date.toISOString().slice(0, 10);
const daysInMonth = (month, year) => new Date(year, month, 0).getDate();

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

async function ensureTheme() {
  let theme = loadKey("theme");
  if (!theme) {
    const choice = await promptChoice(
      "Choose theme",
      "Select dark or light mode",
      ["dark", "light"]
    );
    if (choice) {
      saveKey("theme", choice);
      theme = choice;
    }
  }
  return theme;
}
async function ensureHabit() {
  let habit = loadKey("habit");
  if (!habit) {
    const name = await promptInput("What do you want to track?", "habit name");
    if (name) {
      saveKey("habit", name.toLowerCase());
      habit = name.toLowerCase();
    }
  }
  return habit;
}

function loadDates() {
  try {
    const raw = Keychain.get(KEYS.dates);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveDates(arr) {
  try {
    Keychain.set(KEYS.dates, JSON.stringify(arr));
  } catch {}
}

function createWidget(habit, dates, theme) {
  const widget = new ListWidget();
  widget.setPadding(
    CONFIG.padding,
    CONFIG.padding + 3,
    CONFIG.padding,
    CONFIG.padding
  );
  widget.backgroundColor =
    theme === "dark" ? new Color("#242424") : new Color("#FFFFFF");

  const title = widget.addText(habit);
  title.font = Font.boldSystemFont(16);
  title.textColor = theme === "dark" ? Color.white() : Color.black();
  title.leftAlignText();
  widget.addSpacer(CONFIG.spacing);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const totalDays = daysInMonth(month, year);

  const cols = Math.ceil(totalDays / CONFIG.rows);
  const lastRowCount = totalDays - (CONFIG.rows - 1) * cols;
  const cellSize = Math.floor(
    (CONFIG.widgetWidth - 2 * CONFIG.padding - (cols - 1) * CONFIG.spacing) /
      cols
  );

  for (let r = 0; r < CONFIG.rows; r++) {
    const row = widget.addStack();
    row.layoutHorizontally();
    const count = r < CONFIG.rows - 1 ? cols : lastRowCount;
    for (let c = 0; c < count; c++) {
      const idx = r * cols + c + 1;
      const cell = row.addStack();
      cell.size = new Size(cellSize, cellSize);
      const done = dates.includes(formatDate(new Date(year, month - 1, idx)));
      cell.backgroundColor = done ? new Color("#4CD964") : new Color("#E5E5EA");
      cell.cornerRadius = CONFIG.cornerRadius;
      if (c < count - 1) row.addSpacer(CONFIG.spacing);
    }
    if (r < CONFIG.rows - 1) widget.addSpacer(CONFIG.spacing);
  }

  return widget;
}

async function runApp() {
  const theme = await ensureTheme();
  const habit = await ensureHabit();
  if (!theme || !habit) {
    Script.complete();
    return;
  }

  const action = await promptChoice(habit, null, ["Check-in", "Settings"]);
  let dates = loadDates();

  if (action === "Check-in") {
    const today = formatDate(new Date());
    const i = dates.indexOf(today);
    if (i >= 0) dates.splice(i, 1);
    else dates.push(today);
    saveDates(dates);
    const a = new Alert();
    a.title = habit;
    a.message = i >= 0 ? "❌ Removed today's entry" : "✅ Added today's entry";
    a.addAction("OK");
    await a.presentAlert();
  } else if (action === "Settings") {
    const choice = await promptChoice("Settings", null, [
      "Change Theme",
      "Change Habit",
      "Reset Data",
    ]);
    if (choice === "Change Theme") await ensureTheme();
    else if (choice === "Change Habit") await ensureHabit();
    else if (choice === "Reset Data") saveDates([]);
  }

  const w = createWidget(habit, dates, theme);
  await w.presentMedium();
  Script.complete();
}

if (config.runsInApp) {
  await runApp();
} else {
  const theme = loadKey("theme") || "light";
  const habit = loadKey("habit") || "habit";
  const dates = loadDates();
  Script.setWidget(createWidget(habit, dates, theme));
  Script.complete();
}
