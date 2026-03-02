/**
 * Base class for CCV Header scripts.
 * Scripts in ./scripts/ should extend this and export a class that implements:
 * - constructor() — can set this.enabled (default true)
 * - onEnable() — called when script is loaded or toggled on
 * - onDisable() — called when script is toggled off
 * - view() — optional; returns HTML string for the script's settings UI in the Scripts tab
 */
class Script {
    constructor() {
        this.enabled = true;
    }

    onEnable() {
        // Override: runs when page is loaded or script gets enabled
    }

    onDisable() {
        // Override: cleanup when script is disabled
    }

    /**
     * Override to provide a settings UI fragment (HTML string).
     * Rendered inside the script detail panel when user clicks the script.
     * @returns {string} HTML string
     */
    view() {
        return '';
    }
}

// For scripts that load as modules (if needed later)
if (typeof window !== 'undefined') {
    window.CCVScriptBase = Script;
}
