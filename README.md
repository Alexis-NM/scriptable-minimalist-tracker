# Single Habit Tracker for Scriptable

A customizable medium-sized iOS widget (using Scriptable) to track a single daily habit in a GitHub-like 3×12 grid. Offers theme selection (dark/light) and stores data in Keychain.

---

## Features

- **Interactive Setup**: First run prompts for:
  - Theme: Dark (`#242424` background, white text) or Light (`#FFFFFF` background, black text).
  - Habit name (stored and displayed in lowercase).
- **Daily Check-In**: Tap the widget, then confirm to add/remove today’s date.
- **GitHub-Style Grid**: 3 rows × 12 columns of squares representing days 1–31.
- **Responsive Layout**: Squares auto-size to fill the medium widget width (≈364pt).
- **Rounded Corners**: Lightly rounded squares (4pt radius).
- **Persistent Storage**: Theme, habit name, and dates saved in iOS Keychain.

---

## Requirements

- iOS device with Scriptable installed (https://scriptable.app).
- iOS 14 or later for widgets.

---

## Installation

1. **Open Scriptable** and create a new script.
2. **Copy & paste** the contents of `habit_tracker.js` into the new script.
3. **Save** the script (e.g., name it `HabitTracker`).
4. On your home screen, **add a Scriptable widget** of size **Medium**.
5. In the widget configuration, select your `HabitTracker` script.

---

## Usage

1. **First Launch** (in-app):
   - Choose your **theme** (Dark or Light).
   - Enter your **habit name** (lowercase only).
2. **Daily Check-In**:
   - Tap the widget → Scriptable opens → confirms theme/habit (if already set), then toggles today’s entry.
   - A confirmation alert indicates "✅ Added today's entry" or "❌ Removed today's entry".
3. **Home Screen**:
   - The medium widget displays the habit name and a 3×12 grid:
     - **Green** squares: days you checked in.
     - **Gray** squares: days not yet checked in or beyond current month.

---

## Configuration

You can customize:

- **Padding, spacing, rows, columns** by editing constants at the top of the script (`PADDING`, `SPACING`, `ROWS`, `COLS`).
- **Corner radius** (`CORNER_RADIUS`).
- **Key names** (`THEME_KEY`, `HABIT_KEY`, `STORAGE_KEY`).

---

## Contributing

Feel free to open issues or submit pull requests:

1. Fork the repository or create a copy of the script.
2. Make your changes.
3. Submit a PR or share the updated script.

---

## License

This project is released under the [MIT License](LICENSE).