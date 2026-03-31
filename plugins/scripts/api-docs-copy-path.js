class ApiDocsCopyPathScript extends CCVScriptBase {
    constructor() {
        super();
        this.enabled = true;
        this._injectedButtons = [];
    }

    styles() {
        return `
            .ccv-copy-path-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin-left: 6px;
                padding: 2px;
                border: none;
                background: none;
                cursor: pointer;
                opacity: 0.5;
                vertical-align: middle;
                transition: opacity 0.15s ease;
            }
            .ccv-copy-path-btn:hover {
                opacity: 1;
            }
            .ccv-copy-path-btn svg {
                width: 14px;
                height: 14px;
                fill: none;
                stroke: currentColor;
                stroke-width: 2;
                stroke-linecap: round;
                stroke-linejoin: round;
            }
        `;
    }

    _clipboardSvg() {
        return '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    }

    _checkmarkSvg() {
        return '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>';
    }

    _injectCopyButtons() {
        document.querySelectorAll('span.path').forEach(pathSpan => {
            if (pathSpan.nextElementSibling?.classList.contains('ccv-copy-path-btn')) return;

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'ccv-copy-path-btn';
            btn.title = 'Copy path';
            btn.innerHTML = this._clipboardSvg();

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const text = pathSpan.textContent.trim();
                navigator.clipboard.writeText(text).then(() => {
                    btn.innerHTML = this._checkmarkSvg();
                    setTimeout(() => { btn.innerHTML = this._clipboardSvg(); }, 1500);
                });
            });

            pathSpan.insertAdjacentElement('afterend', btn);
            this._injectedButtons.push(btn);
        });
    }

    _removeCopyButtons() {
        this._injectedButtons.forEach(btn => btn.remove());
        this._injectedButtons = [];
    }

    onEnable() {
        super.onEnable();
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this._injectCopyButtons(), { once: true });
        } else {
            this._injectCopyButtons();
        }
    }

    onDisable() {
        this._removeCopyButtons();
        super.onDisable();
    }
}

if (typeof window !== 'undefined') {
    window.__CCV_SCRIPT_INSTANCE__ = new ApiDocsCopyPathScript();
}
