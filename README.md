# Minimalist Habit Tracker for Scriptable

## Project Description

Minimalist Habit Tracker is an iOS widget script built with Scriptable that enables you to set up, customize, and track a single daily habit using a GitHub-style 3×12 grid interface. Featuring theme selection, interactive daily check-ins, and secure storage via Keychain, it's a lightweight and flexible solution to visualize your habit progress directly on your home screen.

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
   - Choose your **theme** and enter your **habit name**.
2. **In-App Menu**:
   - **Check-in**: toggle today's entry.
   - **Settings**: change theme, change habit, or reset all tracked data.
3. **Home Screen**:
   - Medium widget displays habit name and 3×12 grid:
     - **Green** squares: days checked in.
     - **Gray** squares: days not checked or beyond current month.

---

## Screenshots

![Light Theme Example](path/to/light-theme.png)  
Light theme displaying the habit grid.

![Dark Theme Example](path/to/dark-theme.png)  
Dark theme displaying the habit grid.

---

## Contributing

Contributions are welcome! For major changes, please open an issue or submit a pull request:

1. Fork the script or create a copy.
2. Make your improvements.
3. Share via PR or gist.

---

## License

This project is released under the [MIT License](LICENSE).
