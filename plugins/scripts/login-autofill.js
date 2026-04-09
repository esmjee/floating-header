/**
 * Auto login helper – for onderhoud/Login.php
 * Automatically fills in username and password fields on the maintenance login page.
 */

class LoginAutofillScript extends CCVScriptBase {
    constructor() {
        super();
        this.enabled = true;
    }

    _getSubdomainFromHostname(hostname) {
        const parts = hostname.split('.');
        if (parts.length < 3) return '';
        return parts[0];
    }

    _autofillLoginFields() {
        const currentPath = window.location.pathname.toLowerCase();
        if (!currentPath.includes('/onderhoud/login.php')) return;

        const hostname = window.location.hostname;
        const subdomain = this._getSubdomainFromHostname(hostname);

        if (subdomain === 'biedmeersystem') return;

        const usernameInput = document.querySelector('#Username');
        const passwordInput = document.querySelector('#Password');
        if (!usernameInput || !passwordInput) return;

        const usernameEmpty = usernameInput.value.trim() === '';
        const passwordEmpty = passwordInput.value.trim() === '';
        if (!usernameEmpty || !passwordEmpty) return;

        if (subdomain.endsWith('-ctf')) {
            usernameInput.value = 'demo';
        } else {
            usernameInput.value = subdomain || 'demo';
        }
        passwordInput.value = 'demo';
    }

    onEnable() {
        super.onEnable();

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this._autofillLoginFields(), { once: true });
        } else {
            this._autofillLoginFields();
        }
    }
}

if (typeof window !== 'undefined') {
    window.__CCV_SCRIPT_INSTANCE__ = new LoginAutofillScript();
}

