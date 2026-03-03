/**
 * Lorem ipsum generator – all pages
 * Type e.g. "Lorem20" (case-insensitive) and press Enter to replace it with 20 lorem ipsum words.
 * Works in normal text inputs/areas and CKEditor instances.
 */

class LoremAutofillScript extends CCVScriptBase {
    constructor() {
        super();
        this.enabled = true;
        this._domKeydownHandler = null;
        this._ckeditorInstanceReadyHandler = null;
        this._ckeditorKeyHandlers = new Map();
    }

    _getLoremText() {
        return `Lorem ipsum dolor sit amet, 
consectetur adipiscing elit. Pellentesque malesuada viverra quam at mattis. 
Pellentesque posuere, risus sed ornare convallis, mi tortor tempus nisi, 
sit amet malesuada nunc lectus finibus lectus. Pellentesque rhoncus ante et porttitor mollis. 
Curabitur felis enim, accumsan in sollicitudin eu, laoreet a enim. 
Nunc id massa eu velit convallis faucibus. Maecenas cursus nisi quis nunc commodo vehicula. 
Maecenas molestie eros vel augue tempus elementum. Vivamus pretium tortor suscipit venenatis tempor. 
Quisque convallis massa sed eros fringilla, non lacinia est eleifend. 
Donec sit amet ligula auctor leo rutrum mattis. Cras hendrerit enim eu nisl dignissim, vitae viverra mi suscipit. 
Morbi vel bibendum massa. Phasellus ipsum erat, ornare sed malesuada vel, egestas quis purus. 
Suspendisse ex dui, pellentesque sit amet sodales eget, congue et risus. 
Mauris fringilla risus vitae augue aliquam, a mollis tellus gravida. Nulla facilisi. 
Aenean et nisi in sem elementum eleifend. Sed ac pharetra purus, non feugiat ipsum. 
Suspendisse cursus augue eu felis pharetra, eu volutpat libero cursus. 
Interdum et malesuada fames ac ante ipsum primis in faucibus. In hac habitasse platea dictumst. 
Nunc et mi finibus massa placerat porttitor. Quisque pretium porta suscipit. 
Sed posuere orci erat, eu cursus risus pellentesque non. In hac habitasse platea dictumst. 
Nullam tempor tristique dolor, vel vestibulum quam varius non. Integer fringilla lacus in enim tristique cursus. 
Morbi consectetur vestibulum ipsum a ultricies. Nunc porta cursus commodo. 
Nullam aliquet lobortis sapien, at mattis lectus tristique quis.`;
    }

    _generateLorem(wordCount) {
        const words = this._getLoremText().split(' ');
        const result = [];
        for (let i = 0; i < wordCount; i++) {
            result.push(words[i % words.length]);
        }
        return result.join(' ');
    }

    _handleDomKeydown(event) {
        if (event.key !== 'Enter') return;

        const activeElement = document.activeElement;
        if (!activeElement) return;

        const raw = activeElement.value != null ? activeElement.value : activeElement.textContent || '';
        const value = raw.trim();
        const match = value.match(/lorem(\d{1,3})$/i);
        if (!match) return;

        event.preventDefault();

        let wordCount = parseInt(match[1], 10);
        if (isNaN(wordCount)) return;
        if (wordCount > 500) wordCount = 500;

        const newText = this._generateLorem(wordCount);
        const replaced = raw.replace(/lorem\d+$/i, newText);

        if (activeElement.value != null) {
            activeElement.value = replaced;
            activeElement.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
            activeElement.textContent = replaced;
        }
    }

    _attachDomListener() {
        if (this._domKeydownHandler) return;
        this._domKeydownHandler = this._handleDomKeydown.bind(this);
        document.addEventListener('keydown', this._domKeydownHandler);
    }

    _detachDomListener() {
        if (!this._domKeydownHandler) return;
        document.removeEventListener('keydown', this._domKeydownHandler);
        this._domKeydownHandler = null;
    }

    _attachCKEditorListeners() {
        if (typeof CKEDITOR === 'undefined') return;

        const makeKeyHandler = (editor) => {
            return (keyEvt) => {
                if (keyEvt.data.keyCode !== 13) return;

                const data = editor.getData();
                const textContent = data.replace(/<[^>]*>/g, '').trim();
                const match = textContent.match(/lorem(\d{1,3})$/i);
                if (!match) return;

                keyEvt.cancel();

                let wordCount = parseInt(match[1], 10);
                if (isNaN(wordCount)) return;
                if (wordCount > 500) wordCount = 500;

                const newText = this._generateLorem(wordCount);
                const newData = data.replace(/lorem\d+/i, newText);
                editor.setData(newData);
            };
        };

        this._ckeditorInstanceReadyHandler = (evt) => {
            const editor = evt.editor;
            if (!editor || this._ckeditorKeyHandlers.has(editor.name)) return;
            const handler = makeKeyHandler(editor);
            this._ckeditorKeyHandlers.set(editor.name, handler);
            editor.on('key', handler);
        };

        CKEDITOR.on('instanceReady', this._ckeditorInstanceReadyHandler);

        for (const name in CKEDITOR.instances) {
            const editor = CKEDITOR.instances[name];
            if (!editor || this._ckeditorKeyHandlers.has(name)) continue;
            const handler = makeKeyHandler(editor);
            this._ckeditorKeyHandlers.set(name, handler);
            editor.on('key', handler);
        }
    }

    _detachCKEditorListeners() {
        if (typeof CKEDITOR === 'undefined') return;

        if (this._ckeditorInstanceReadyHandler) {
            CKEDITOR.removeListener('instanceReady', this._ckeditorInstanceReadyHandler);
            this._ckeditorInstanceReadyHandler = null;
        }

        for (const name in CKEDITOR.instances) {
            const editor = CKEDITOR.instances[name];
            const handler = this._ckeditorKeyHandlers.get(name);
            if (editor && handler) {
                editor.removeListener('key', handler);
            }
        }

        this._ckeditorKeyHandlers.clear();
    }

    onEnable() {
        super.onEnable();
        this._attachDomListener();
        this._attachCKEditorListeners();
    }

    onDisable() {
        this._detachDomListener();
        this._detachCKEditorListeners();
        super.onDisable();
    }
}

if (typeof window !== 'undefined') {
    window.__CCV_SCRIPT_INSTANCE__ = new LoremAutofillScript();
}

