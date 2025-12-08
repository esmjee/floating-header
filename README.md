# CCV Floating Header Toolbar

A customizable floating toolbar for CCV webshop developers to quickly navigate between domains, URLs, and switch webshop themes.

![Version](https://img.shields.io/badge/version-1.2.0-blue)

## Features

- **Quick Domain Switching** - Jump between webshops with one click
- **URL Shortcuts** - Fast access to frequently used pages
- **Webshop Theme Switching** - Change webshop templates instantly
- **Dark/Light Mode** - Choose your preferred theme
- **Compact Layouts** - Multiple compact view styles (Default, Circles, Bar, Dots)
- **Auto-Updates** - Check for and install updates easily
- **Import/Export** - Share configurations with colleagues
- **Cookie Management** - Clear cookie preferences with one click

## Installation

### Using "User JavaScript and CSS" Chrome Extension

1. Install the [User JavaScript and CSS](https://chrome.google.com/webstore/detail/user-javascript-and-css/nbhcbdghjpllgmfilhnhkllmkecfmpld) extension
2. Go to your CCV webshop
3. Click the extension icon → "Add new"
4. Copy the contents of `script.js` into the JavaScript section
5. Copy the contents of `style.css` into the CSS section
6. Save and enjoy

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

## Development

To modify the toolbar:

1. Clone this repository
2. Edit `script.js` and `style.css`
3. Increment the `VERSION` constant in `script.js`
4. Push to GitHub
5. Users can update via the "Check for Updates" button

## License

MIT License - Feel free to modify and share!

---

Made with ❤️ for CCV Shop developers

