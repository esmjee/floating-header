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

/**
 * MINIMAL LOADER - Do not add update logic here!
 * 
 * This loader only handles:
 * 1. Fetching files from GitHub (requires GM_xmlhttpRequest for CORS)
 * 2. Caching files (requires GM_setValue/GM_getValue)
 * 3. Injecting cached files into the page
 * 4. Responding to fetch requests from script.js
 * 
 * All update logic, version comparison, and UI is handled in script.js
 */

(function() {
    'use strict';

    const CONFIG = {
        GITHUB_BASE: 'https://raw.githubusercontent.com/esmjee/floating-header/main',
        CACHE_KEY_SCRIPT: 'ccv_toolbar_script',
        CACHE_KEY_CSS: 'ccv_toolbar_css',
        CACHE_KEY_LANGUAGES: 'ccv_toolbar_languages',
        SUPPORTED_LANGUAGES: ['nl']
    };

    // ============ CORE FUNCTIONS (GM_* APIs) ============

    /**
     * Fetch a file using GM_xmlhttpRequest (bypasses CORS)
     */
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

    /**
     * Get all cached data
     */
    const getCache = () => ({
        script: GM_getValue(CONFIG.CACHE_KEY_SCRIPT, null),
        css: GM_getValue(CONFIG.CACHE_KEY_CSS, null),
        languages: GM_getValue(CONFIG.CACHE_KEY_LANGUAGES, {})
    });

    /**
     * Save data to cache
     */
    const setCache = (script, css, languages) => {
        GM_setValue(CONFIG.CACHE_KEY_SCRIPT, script);
        GM_setValue(CONFIG.CACHE_KEY_CSS, css);
        GM_setValue(CONFIG.CACHE_KEY_LANGUAGES, languages);
    };

    /**
     * Check if cache has required files
     */
    const hasCache = () => {
        const cache = getCache();
        return cache.script && cache.css;
    };

    // ============ FETCH FUNCTIONS ============

    /**
     * Fetch all language files
     */
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

    /**
     * Fetch all files from GitHub
     */
    const fetchAllFiles = async () => {
        const [script, css] = await Promise.all([
            fetchFile(`${CONFIG.GITHUB_BASE}/script.js`),
            fetchFile(`${CONFIG.GITHUB_BASE}/style.css`)
        ]);
        const languages = await fetchLanguages();
        return { script, css, languages };
    };

    // ============ INJECTION FUNCTIONS ============

    /**
     * Inject CSS into page
     */
    const injectCSS = (css) => {
        if (css) GM_addStyle(css);
    };

    /**
     * Inject and execute script
     */
    const injectScript = (script, languages) => {
        if (!script) return;

        // Make languages available to script.js
        if (languages && Object.keys(languages).length > 0) {
            const langScript = document.createElement('script');
            langScript.textContent = `window.__CCV_TOOLBAR_LANGUAGES__ = ${JSON.stringify(languages)};`;
            document.documentElement.appendChild(langScript);
            langScript.remove();
        }

        // Mark that loader is present
        const markerScript = document.createElement('script');
        markerScript.textContent = 'window.__CCV_LOADER_PRESENT__ = true;';
        document.documentElement.appendChild(markerScript);
        markerScript.remove();

        // Execute main script
        const mainScript = document.createElement('script');
        mainScript.textContent = script;
        document.documentElement.appendChild(mainScript);
        mainScript.remove();
    };

    // ============ EVENT HANDLERS ============

    /**
     * Handle fetch request from script.js
     * Script.js dispatches 'ccv-loader-fetch' and loader responds with 'ccv-loader-response'
     */
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

    // ============ INITIALIZATION ============

    const initialize = async () => {
        // Listen for fetch requests from script.js
        window.addEventListener('ccv-loader-fetch', handleFetchRequest);

        // First run: fetch and cache files
        if (!hasCache()) {
            try {
                const files = await fetchAllFiles();
                setCache(files.script, files.css, files.languages);
            } catch (error) {
                console.error('[CCV Loader] Failed to fetch files:', error);
                return;
            }
        }

        // Inject cached files
        const cache = getCache();
        
        const inject = () => {
            injectCSS(cache.css);
            injectScript(cache.script, cache.languages);
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', inject);
        } else {
            inject();
        }
    };

    initialize();
})();
