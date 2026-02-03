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

Both methods support **automatic updates** - click "Check for Updates" in the toolbar to get the latest version.

### Option 1: Tampermonkey

Best for users who work across multiple CCV domains (cache is shared across all sites).

1. Install [Tampermonkey](https://www.tampermonkey.net/) browser extension
2. Click [here to install the loader](https://raw.githubusercontent.com/esmjee/floating-header/main/loader.user.js) (or create a new script and paste `loader.user.js`)
3. Done!

### Option 2: User JavaScript and CSS

Best for users who primarily work on one domain.

1. Install [User JavaScript and CSS](https://chrome.google.com/webstore/detail/user-javascript-and-css/nbhcbdghjpllgmfilhnhkllmkecfmpld) extension
2. Go to your CCV webshop
3. Click the extension icon → "Add new"
4. Copy the contents of `loader.js` into the JavaScript section
5. Leave the CSS section empty (CSS is loaded automatically)
6. Save and enjoy

### How Auto-Updates Work

- **First run**: The loader fetches `script.js`, `style.css`, and language files from GitHub
- **Subsequent visits**: Cached version loads instantly
- **Manual update**: Click "Check for Updates" in Settings → automatically downloads and applies updates
- **Tampermonkey bonus**: Same cached version across all CCV websites

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
| `loader.user.js` | Tampermonkey loader - uses GM_* APIs for cross-site caching |
| `loader.js` | Universal loader - uses localStorage, works with any extension |
| `script.js` | Main toolbar + all update logic (version comparison, UI, reload) |
| `style.css` | Toolbar styles (fetched by loader) |
| `languages/*.json` | Translation files (fetched by loader) |
| `index.html` | Local development/testing only |

### Design Principles

**Loaders are minimal and should never need updates:**
- They only handle fetching, caching, and injecting files
- All update logic, version comparison, and UI feedback is in `script.js`
- When you push updates to `script.js`, users get the new logic automatically

**Communication flow:**
1. User clicks "Check for Updates" in toolbar
2. `script.js` dispatches `ccv-loader-fetch` event
3. Loader fetches fresh files from GitHub, caches them
4. Loader dispatches `ccv-loader-response` with the fetched script
5. `script.js` compares versions and decides whether to reload

### Caching Strategy

| Loader | Storage | Scope |
|--------|---------|-------|
| `loader.user.js` | Tampermonkey's `GM_setValue` | Shared across all CCV domains |
| `loader.js` | `localStorage` | Per-domain (each site caches separately) |

Both loaders cache: script code, CSS, and language files. Updates only occur when explicitly requested.

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
