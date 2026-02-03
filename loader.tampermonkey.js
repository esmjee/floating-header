// ==UserScript==
// @name         CCV Floating Header Toolbar Loader
// @namespace    https://github.com/esmjee/floating-header
// @version      1.0.0
// @description  Loader for CCV Toolbar - fetches and caches script/CSS files
// @author       CCV Shop
// @match        *://*.ccvshop.nl/*
// @match        *://*.ccvdev.nl/*
// @match        *://*.ccv.eu/*
// @match        *://*.ccvwebservices.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      raw.githubusercontent.com
// @connect      github.com
// @run-at       document-start
// @noframes
// ==/UserScript==

(function() {
    'use strict';

    const CONFIG = {
        GITHUB_BASE: 'https://raw.githubusercontent.com/esmjee/floating-header/main',
        CACHE_KEY_SCRIPT: 'ccv_toolbar_script',
        CACHE_KEY_CSS: 'ccv_toolbar_css',
        CACHE_KEY_LANGUAGES: 'ccv_toolbar_languages',
        SUPPORTED_LANGUAGES: ['nl']
    };

    const fetchFile = (url) => {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: url + '?t=' + Date.now(),
                onload: (response) => {
                    if (response.status >= 200 && response.status < 300) {
                        resolve(response.responseText);
                    } else {
                        reject(new Error(`HTTP ${response.status}`));
                    }
                },
                onerror: () => reject(new Error('Network error')),
                ontimeout: () => reject(new Error('Timeout'))
            });
        });
    };

    const getCache = () => ({
        script: GM_getValue(CONFIG.CACHE_KEY_SCRIPT, null),
        css: GM_getValue(CONFIG.CACHE_KEY_CSS, null),
        languages: GM_getValue(CONFIG.CACHE_KEY_LANGUAGES, {})
    });

    const setCache = (script, css, languages) => {
        GM_setValue(CONFIG.CACHE_KEY_SCRIPT, script);
        GM_setValue(CONFIG.CACHE_KEY_CSS, css);
        GM_setValue(CONFIG.CACHE_KEY_LANGUAGES, languages);
    };

    const hasCache = () => {
        const cache = getCache();
        return cache.script && cache.css;
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
        return { script, css, languages };
    };

    const injectCSS = (css) => {
        if (css) GM_addStyle(css);
    };

    const injectScript = (script, languages) => {
        if (!script) return;

        if (languages && Object.keys(languages).length > 0) {
            const langScript = document.createElement('script');
            langScript.textContent = `window.__CCV_TOOLBAR_LANGUAGES__ = ${JSON.stringify(languages)};`;
            document.documentElement.appendChild(langScript);
            langScript.remove();
        }

        const markerScript = document.createElement('script');
        markerScript.textContent = 'window.__CCV_LOADER_PRESENT__ = true;';
        document.documentElement.appendChild(markerScript);
        markerScript.remove();

        const mainScript = document.createElement('script');
        mainScript.textContent = script;
        document.documentElement.appendChild(mainScript);
        mainScript.remove();
    };

    const handleFetchRequest = async () => {
        try {
            const files = await fetchAllFiles();
            setCache(files.script, files.css, files.languages);
            
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

        if (!hasCache()) {
            try {
                const files = await fetchAllFiles();
                setCache(files.script, files.css, files.languages);
            } catch (error) {
                console.error('[CCV Loader] Failed to fetch files:', error);
                return;
            }
        }

        const cache = getCache();
        
        const inject = () => {
            injectCSS(cache.css);
            injectScript(cache.script, cache.languages);
        };

        inject();
    };

    initialize();
})();
