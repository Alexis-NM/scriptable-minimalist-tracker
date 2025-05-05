/*
 * Single Habit Tracker for Scriptable
 * Theme & habit setup, then 3×12 grid for daily check-ins.
 */

const THEME_KEY = "habitTrackerTheme";
const HABIT_KEY = "habitTrackerName";
const STORAGE_KEY = "singleHabitTrackerDates";
const PADDING = 8;
const SPACING = 3;
const ROWS = 3;
const COLS = 12;
const CORNER_RADIUS = 4;

/**
 * formatDate: Returns date as YYYY-MM-DD string
 */
function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * daysInMonth: Returns the number of days in the specified month
 */
function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

/**
 * getCellSize: Calculates square size to fill medium widget width
 */
function getCellSize() {
  const totalWidth = 364 - 2 * PADDING;
  const usable = totalWidth - (COLS - 1) * SPACING;
  return Math.floor(usable / COLS);
}

/**
 * loadThemeName: Retrieves the theme ('dark' or 'light') from Keychain
 */
function loadThemeName() {
  try {
    return Keychain.get(THEME_KEY) || null;
  } catch (e) {
    return null;
  }
}

/**
 * saveThemeName: Saves the theme to Keychain
 */
function saveThemeName(name) {
  try {
    Keychain.set(THEME_KEY, name);
  } catch (e) {}
}

/**
 * promptForTheme: Prompts user to choose Dark or Light theme on first run
 */
async function promptForTheme() {
  const alert = new Alert();
  alert.title = "Choose theme";
  alert.message = "Dark or Light?";
  alert.addAction("🌙 Dark");
  alert.addAction("☀️ Light");
  const idx = await alert.presentAlert();
  if (idx === 0) {
    saveThemeName("dark");
    return "dark";
  }
  if (idx === 1) {
    saveThemeName("light");
    return "light";
  }
  return null;
}

/**
 * loadHabitName: Retrieves the habit name from Keychain (lowercase)
 */
function loadHabitName() {
  try {
    const n = Keychain.get(HABIT_KEY);
    return n ? n.toLowerCase() : null;
  } catch (e) {
    return null;
  }
}

/**
 * saveHabitName: Saves the habit name to Keychain in lowercase
 */
function saveHabitName(name) {
  try {
    Keychain.set(HABIT_KEY, name.toLowerCase());
  } catch (e) {}
}

/**
 * promptForHabit: Prompts user to enter the habit name on first run
 */
async function promptForHabit() {
  const alert = new Alert();
  alert.title = "What do you want to track?";
  alert.addTextField("Enter habit name");
  alert.addAction("Save");
  alert.addCancelAction("Cancel");
  const idx = await alert.presentAlert();
  if (idx === 0) {
    const raw = alert.textFieldValue(0).trim();
    if (raw) {
      saveHabitName(raw);
      return raw.toLowerCase();
    }
  }
  return null;
}

/**
 * loadDates: Loads the list of tracked dates from Keychain
 */
function loadDates() {
  try {
    const r = Keychain.get(STORAGE_KEY);
    return r ? JSON.parse(r) : [];
  } catch (e) {
    return [];
  }
}

/**
 * saveDates: Saves the list of tracked dates to Keychain
 */
function saveDates(arr) {
  try {
    Keychain.set(STORAGE_KEY, JSON.stringify(arr));
  } catch (e) {}
}

/**
 * createWidget: Builds the ListWidget with title, theme, and 3×12 grid
 */
function createWidget(habitName, dates, theme) {
  const widget = new ListWidget();
  widget.setPadding(PADDING, PADDING, PADDING, PADDING);
  widget.backgroundColor =
    theme === "dark" ? new Color("#242424") : new Color("#FFFFFF");

  const title = widget.addText(habitName);
  title.font = Font.boldSystemFont(16);
  title.textColor =
    theme === "dark" ? new Color("#FFFFFF") : new Color("#000000");
  title.leftAlignText();
  widget.addSpacer(4);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const totalDays = daysInMonth(month, year);
  const cellSize = getCellSize();

  for (let r = 0; r < ROWS; r++) {
    const row = widget.addStack();
    row.layoutHorizontally();
    for (let c = 0; c < COLS; c++) {
      const idx = r * COLS + c + 1;
      const cell = row.addStack();
      cell.size = new Size(cellSize, cellSize);
      const done =
        idx <= totalDays &&
        dates.includes(formatDate(new Date(year, month - 1, idx)));
      cell.backgroundColor = done ? new Color("#4CD964") : new Color("#E5E5EA");
      cell.cornerRadius = CORNER_RADIUS;
      if (c < COLS - 1) row.addSpacer(SPACING);
    }
    if (r < ROWS - 1) widget.addSpacer(SPACING);
  }

  return widget;
}

if (config.runsInApp) {
  // Theme selection and saving
  let theme = loadThemeName();
  if (!theme) {
    theme = await promptForTheme();
    if (!theme) {
      Script.complete();
      return;
    }
  }
  // Habit name selection and saving
  let habit = loadHabitName();
  if (!habit) {
    habit = await promptForHabit();
    if (!habit) {
      Script.complete();
      return;
    }
  }
  // Toggle today's date
  const dates = loadDates();
  const today = formatDate(new Date());
  const i = dates.indexOf(today);
  if (i >= 0) dates.splice(i, 1);
  else dates.push(today);
  saveDates(dates);
  // Confirmation alert
  const alert = new Alert();
  alert.title = habit;
  alert.message =
    i >= 0 ? "❌ Removed today's entry" : "✅ Added today's entry";
  alert.addAction("OK");
  await alert.presentAlert();
  // Preview widget
  await createWidget(habit, dates, theme).presentMedium();
  Script.complete();
} else {
  // Render on home screen
  const theme = loadThemeName() || "light";
  const habit = loadHabitName() || "habit";
  const dates = loadDates();
  Script.setWidget(createWidget(habit, dates, theme));
  Script.complete();
}
