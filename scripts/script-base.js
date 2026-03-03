/**
 * Base class for CCV Header scripts.
 * Scripts in ./scripts/ should extend this and export a class that implements:
 * - constructor() — can set this.enabled (default true)
 * - onEnable() — called when script is loaded or toggled on
 * - onDisable() — called when script is toggled off
 * - view() — optional; returns HTML string for the script's settings UI in the Scripts tab
 * - styles() — optional; returns CSS string to inject when the script is enabled
 */
class Script {
    constructor() {
        this.enabled = true;
        this._injectedStyleElement = null;
    }

    /**
     * Override to return CSS to inject on the page when the script is enabled.
     * Injected styles are removed when the script is disabled.
     * @returns {string} CSS string, or empty string for none
     */
    styles() {
        return '';
    }

    injectStyles() {
        const css = this.styles();
        if (!css || this._injectedStyleElement) return;
        const el = document.createElement('style');
        el.setAttribute('data-ccv-script-styles', '1');
        el.textContent = css;
        (document.head || document.documentElement).appendChild(el);
        this._injectedStyleElement = el;
    }

    removeStyles() {
        if (this._injectedStyleElement && this._injectedStyleElement.parentNode) {
            this._injectedStyleElement.remove();
            this._injectedStyleElement = null;
        }
    }

    onEnable() {
        // Override: runs when page is loaded or script gets enabled
        this.injectStyles();
    }

    onDisable() {
        // Override: cleanup when script is disabled
        this.removeStyles();
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
