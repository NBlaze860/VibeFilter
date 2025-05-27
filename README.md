# VibeFilter

**VibeFilter** is a Chrome extension that enhances your LinkedIn search experience by filtering posts based on keywords. It allows users to include, exclude, or match either type of keyword, auto-expands search results, and saves filter settings locally to preserve them between sessions.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Contributing](#contributing)

---

## Features

- ✅ **Keyword Filtering**: Filter LinkedIn search posts by:
  - Keywords to *include*
  - Keywords to *exclude*
  - Keywords to match *either*
- 🗑️ **Interactive UI**: Click the ❌ icon to remove keywords instantly.
- 💾 **Local Storage**: Automatically saves filters locally.
- 🔄 **Auto Expansion**: Automatically clicks the "Show more results" button.
- ⚛️ **React Popup**: UI built with React (popup interface).
- 📦 **Modular Architecture**: React for popup, plain JS for background and content scripts.

---

## Installation

1. **Clone or Download** this repository.

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Build the Extension**:
   ```bash
   npm run build
   ```

4. **Load Unpacked Extension** in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable **Developer mode**
   - Click **Load unpacked** and select the `build` folder

5. **Activate VibeFilter**:
   - Click on the VibeFilter icon in the Chrome toolbar to launch the popup.

---

## Usage

1. Open LinkedIn and perform a search.
2. Click on the **VibeFilter** icon.
3. Add keywords to the relevant fields:
   - **Include**: Posts must contain these.
   - **Exclude**: Posts must not contain these.
   - **Either**: Posts must contain at least one.
4. Remove keywords by clicking the ❌ icon.
5. The extension will automatically apply filters and click "Show more results" as you scroll.

---

## Configuration

- **Keyword Persistence**: Filters are saved using Chrome's `localStorage`, so your settings are retained across sessions.
- **React Popup**: The popup is built using React JSX (`Popup.jsx`).
- **JavaScript Components**: Other functionality is implemented in plain JavaScript files.

---

## Contributing

Contributions are welcome! Feel free to fork the repository and submit pull requests.
