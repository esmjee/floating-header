# CCV Floating Header Toolbar

A customizable floating toolbar for CCV webshop developers to quickly navigate between domains, URLs, and switch webshop themes.

![Version](https://img.shields.io/badge/version-2.0.0-blue)

## Features

- **Quick Domain Switching** - Jump between webshops with one click
- **URL Shortcuts** - Fast access to frequently used pages
- **Webshop Theme Switching** - Change webshop templates instantly
- **Dark/Light Mode** - Choose your preferred theme
- **Compact Layouts** - Multiple compact view styles (Default, Circles, Bar, Dots)
- **Automatic Updates** - Files are fetched and cached automatically
- **Import/Export** - Share configurations with colleagues
- **Cookie Management** - Clear cookie preferences with one click

## Installation

### Recommended: Tampermonkey (Auto-Updates)

This method provides **automatic updates** - the script fetches and caches the latest version automatically.

1. Install [Tampermonkey](https://www.tampermonkey.net/) browser extension
2. Click [here to install the loader script](https://raw.githubusercontent.com/esmjee/floating-header/main/loader.user.js) (or create a new script in Tampermonkey and paste the contents of `loader.user.js`)
3. Done! The loader will automatically fetch and cache the latest `script.js` and `style.css`

#### How Auto-Updates Work

- **First run**: The loader fetches `script.js`, `style.css`, and language files from GitHub and caches them
- **Subsequent visits**: The cached version is used instantly (no network requests)
- **Manual update**: Click "Check for Updates" in the toolbar Settings tab
- **Cross-site consistency**: The same cached version is used across all CCV websites in your browser

### Alternative: Manual Installation (Legacy)

For users who prefer manual control or cannot use Tampermonkey:

1. Install the [User JavaScript and CSS](https://chrome.google.com/webstore/detail/user-javascript-and-css/nbhcbdghjpllgmfilhnhkllmkecfmpld) extension
2. Go to your CCV webshop
3. Click the extension icon → "Add new"
4. Copy the contents of `script.js` into the JavaScript section
5. Copy the contents of `style.css` into the CSS section
6. Save and enjoy

> **Note**: With manual installation, you'll need to copy/paste new versions when updates are available.

## Usage

### Toolbar Controls
- **Drag** the header to reposition it anywhere on screen
- **Click** the CCV logo to show/hide the toolbar
- **Right-click** on domains, URLs, or themes for context menu options

### Tabs
- **Links** - Manage your domains and URL shortcuts
- **Actions** - Switch webshop themes and clear cookies
- **Settings** - Customize appearance, layout, and manage data

### Keyboard Shortcuts
- **Ctrl/Cmd + Click** on a domain/URL opens it in a new tab

## Configuration

### Adding Domains
1. Go to Links tab
2. Click "+ Add Domain"
3. Enter name, URL, choose an icon and color
4. Check "Show in compact" to display in compact view

### Adding URLs
1. Go to Links tab
2. Click "+ Add URL"
3. Enter name, path (e.g., `/onderhoud`), choose an icon
4. URLs open relative to the current domain

### Adding Webshop Themes
1. Go to Actions tab
2. Click "+ Add Theme"
3. Enter theme ID (e.g., "Oliver"), display name, and color
4. Drag themes to reorder them

## Updating

### With Tampermonkey (Recommended)

1. Go to Settings tab
2. Click "Check for Updates"
3. If an update is available, it will be downloaded and applied automatically
4. The page will reload with the new version

You can also use the Tampermonkey menu (right-click icon) for update options.

### With Manual Installation (Legacy)

1. Go to Settings tab
2. Click "Check for Updates"
3. If an update is available, click "Copy JavaScript" and "Copy CSS"
4. Paste into your extension to update

## Sharing Configuration

Export your configuration to share with colleagues:
1. Settings → Export
2. Send the JSON file to your colleague
3. They can import it via Settings → Import

## Cross-Domain Defaults

Save your preferred layout settings to apply automatically on new webshops:
1. Configure your preferred theme, color, and layout
2. Settings → "Save as Default"
3. New domains will automatically use these settings

## Customization

### Theme Colors
- Default (Indigo)
- Aesthetic (Purple)
- Ocean (Blue)
- Forest (Green)
- Sunset (Orange)

### Compact Layouts
- **Default** - List view with icons
- **Circles** - 2-column grid
- **Bar** - Horizontal strip
- **Dots** - Minimal floating dots

## Architecture

### Files

| File | Purpose |
|------|---------|
| `loader.user.js` | **Minimal, stable** - Only fetches, caches, and injects files. Do not modify! |
| `script.js` | Main toolbar + all update logic (version comparison, UI, reload decision) |
| `style.css` | Toolbar styles (fetched by loader) |
| `languages/*.json` | Translation files (fetched by loader) |
| `index.html` | Local development/testing only |

### Design Principles

**The loader is intentionally minimal and should never need updates:**
- It only handles `GM_*` APIs that require Tampermonkey (fetch, cache, inject)
- All update logic, version comparison, and UI feedback is in `script.js`
- When you push updates to `script.js`, users get the new logic automatically

**Communication flow:**
1. User clicks "Check for Updates" in toolbar
2. `script.js` dispatches `ccv-loader-fetch` event
3. Loader fetches fresh files from GitHub, caches them
4. Loader dispatches `ccv-loader-response` with the fetched script
5. `script.js` compares versions and decides whether to reload

### Caching Strategy

The loader uses Tampermonkey's `GM_setValue`/`GM_getValue` for persistent storage:
- Cached data is stored per-script (not per-domain)
- All CCV websites share the same cached version
- Cache includes: script code, CSS, and language files
- Updates only occur when explicitly requested by the user

## Development

To modify the toolbar:

1. Clone this repository
2. Edit `script.js` and `style.css`
3. Increment the `VERSION` constant in `script.js`
4. If adding a new language, add it to `SUPPORTED_LANGUAGES` in `loader.user.js`
5. Push to GitHub
6. Users will get the update when they click "Check for Updates"

### Local Testing

Open `index.html` in a browser to test changes locally without affecting the cached version.

### Version Format

Use semantic versioning: `MAJOR.MINOR.PATCH`
- MAJOR: Breaking changes
- MINOR: New features
- PATCH: Bug fixes

## License

MIT License - Feel free to modify and share!

---

Made with ❤️ for CCV Shop developers
