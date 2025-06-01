// Countdown Widget for Scriptable
const KEYS = {
    theme: "countdownTheme",
    title: "countdownTitle",
    targetDate: "countdownTargetDate",
    installDate: "countdownInstallDate",
};

// iPhone 13 mini size
const CONFIG = {
    padding: 8,
    leftMargin: 0,
    spacing: 3,
    rows: 3,
    cornerRadius: 4,
    widgetWidth: 342,
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

// Formats a Date as "YYYY-MM-DD" in local time
function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

// Parses a "YYYY-MM-DD" string into a local Date
function parseDateYMD(str) {
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
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

async function promptChoice(title, message, options) {
    const alert = new Alert();
    alert.title = title;
    if (message) alert.message = message;
    options.forEach((o) => alert.addAction(o));
    alert.addCancelAction("Cancel");
    const idx = await alert.presentSheet();
    return idx >= 0 && idx < options.length ? options[idx] : null;
}

// 1) Theme (dark/light)
async function ensureTheme() {
    let theme = loadKey("theme");
    if (!theme) {
        const choice = await promptChoice("Choose Theme", null, [
            "🕶️ Dark",
            "💡 Light",
        ]);
        if (choice) {
            theme = choice.startsWith("🕶️") ? "dark" : "light";
            saveKey("theme", theme);
        }
    }
    return theme || "light";
}

// 2) Custom title
async function ensureTitle() {
    let title = loadKey("title");
    if (!title) {
        const input = await promptInput("Widget Title", "e.g. My Project");
        if (!input) return null;
        title = input;
        saveKey("title", title);
    }
    return title;
}

// 3) Target date + record install date (local time)
async function ensureTargetDate() {
    let target = loadKey("targetDate");
    if (!target) {
        const input = await promptInput("Target Date (YYYY-MM-DD)", "2025-12-31");
        if (!input || !/^\d{4}-\d{2}-\d{2}$/.test(input)) return null;
        target = input;
        saveKey("targetDate", target);
        saveKey("installDate", formatDate(new Date()));
    }
    return target;
}

// Calculates the number of whole days between two dates
function daysBetween(d1, d2) {
    const ms = 1000 * 60 * 60 * 24;
    return Math.max(0, Math.floor((d2 - d1) / ms));
}

function createWidget(theme, titleText, targetDateStr, installDateStr) {
    const widget = new ListWidget();
    widget.setPadding(
        CONFIG.padding,
        CONFIG.padding + CONFIG.leftMargin,
        CONFIG.padding,
        CONFIG.padding
    );
    widget.backgroundColor =
        theme === "dark" ? new Color("#242424") : new Color("#FFFFFF");

    // — Title
    const title = widget.addText(titleText);
    title.font = Font.boldSystemFont(16);
    title.leftAlignText();
    title.textColor = theme === "dark" ? Color.white() : Color.black();

    widget.addSpacer(CONFIG.spacing);

    // — Countdown calculation
    const now = new Date();
    const installDt = parseDateYMD(installDateStr);
    const targetDt = parseDateYMD(targetDateStr);
    const totalDays = daysBetween(installDt, targetDt) + 1;
    const elapsed = daysBetween(installDt, now);
    const remaining = Math.max(0, totalDays - elapsed);

    // — Display "D-X"
    const subtitle = widget.addText(`D-${remaining}`);
    subtitle.font = Font.systemFont(14);
    subtitle.leftAlignText();
    subtitle.textColor = theme === "dark" ? Color.lightGray() : Color.gray();
    widget.addSpacer(CONFIG.spacing);

    // — 3×N grid
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
            const idx = r * cols + c;
            const cell = row.addStack();
            cell.size = new Size(cellSize, cellSize);
            const done = idx < elapsed;
            cell.backgroundColor = done ? new Color("#FF4500") : new Color("#E5E5EA");
            cell.cornerRadius = CONFIG.cornerRadius;
            if (c < count - 1) row.addSpacer(CONFIG.spacing);
        }
        if (r < CONFIG.rows - 1) widget.addSpacer(CONFIG.spacing);
    }

    return widget;
}

async function run() {
    const theme = await ensureTheme();
    const titleText = await ensureTitle();
    const targetDate = await ensureTargetDate();
    const installDate = loadKey("installDate");

    if (!titleText || !targetDate || !installDate) {
        Script.complete();
        return;
    }

    const w = createWidget(theme, titleText, targetDate, installDate);
    if (config.runsInApp) {
        await w.presentMedium();
    } else {
        Script.setWidget(w);
    }
    Script.complete();
}

if (config.runsInApp) {
    await run();
} else {
    const theme = loadKey("theme") || "light";
    const titleText = loadKey("title") || "Countdown";
    const targetDate = loadKey("targetDate");
    const installDate = loadKey("installDate");
    if (targetDate && installDate) {
        Script.setWidget(createWidget(theme, titleText, targetDate, installDate));
    }
    Script.complete();
}
