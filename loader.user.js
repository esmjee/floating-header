/**
 * CCV Floating Header Toolbar - Universal Loader
 * 
 * For use with "User JavaScript and CSS" extension or similar.
 * Paste this into your extension's JavaScript section.
 * 
 * This loader:
 * - Fetches script.js, style.css, and languages from GitHub
 * - Caches them in localStorage for fast loading
 * - Auto-updates when you click "Check for Updates" in the toolbar
 */

(async function() {
    'use strict';

    const CONFIG = {
        GITHUB_BASE: 'https://raw.githubusercontent.com/esmjee/floating-header/main',
        CACHE_KEY: 'ccv_toolbar_cache',
        SUPPORTED_LANGUAGES: ['nl']
    };

    const getCache = () => {
        try {
            const cached = localStorage.getItem(CONFIG.CACHE_KEY);
            return cached ? JSON.parse(cached) : null;
        } catch (e) {
            return null;
        }
    };

    const setCache = (data) => {
        try {
            localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('[CCV Loader] Failed to cache:', e);
        }
    };

    const fetchFile = async (url) => {
        const response = await fetch(url + '?t=' + Date.now(), { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
    };

    const fetchLanguages = async () => {
        const languages = {};
        for (const lang of CONFIG.SUPPORTED_LANGUAGES) {
            try {
                languages[lang] = await fetchFile(`${CONFIG.GITHUB_BASE}/languages/${lang}.json`);
            } catch (e) {
                console.warn(`[CCV Loader] Failed to fetch language ${lang}`);
            }
        }
        return languages;
    };

    const fetchAllFiles = async () => {
        const [script, css] = await Promise.all([
            fetchFile(`${CONFIG.GITHUB_BASE}/script.js`),
            fetchFile(`${CONFIG.GITHUB_BASE}/style.css`)
        ]);
        const languages = await fetchLanguages();
        return { script, css, languages, timestamp: Date.now() };
    };

    const injectCSS = (css) => {
        if (!css) return;
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    };

    const injectScript = (script, languages) => {
        if (!script) return;

        if (languages && Object.keys(languages).length > 0) {
            window.__CCV_TOOLBAR_LANGUAGES__ = languages;
        }

        window.__CCV_LOADER_PRESENT__ = true;

        const scriptEl = document.createElement('script');
        scriptEl.textContent = script;
        document.head.appendChild(scriptEl);
    };

    const handleFetchRequest = async () => {
        try {
            const files = await fetchAllFiles();
            setCache(files);
            
            window.dispatchEvent(new CustomEvent('ccv-loader-response', {
                detail: { success: true, script: files.script, css: files.css, languages: files.languages }
            }));
        } catch (error) {
            window.dispatchEvent(new CustomEvent('ccv-loader-response', {
                detail: { success: false, error: error.message }
            }));
        }
    };

    const initialize = async () => {
        window.addEventListener('ccv-loader-fetch', handleFetchRequest);

        let cache = getCache();
        
        if (!cache) {
            try {
                cache = await fetchAllFiles();
                setCache(cache);
            } catch (error) {
                console.error('[CCV Loader] Failed to fetch files:', error);
                return;
            }
        }

        const inject = () => {
            injectCSS(cache.css);
            injectScript(cache.script, cache.languages);
        };

        inject();
    };

    initialize();
})();
