const CCVToolbar = (() => {
    const VERSION = '1.2.3';
    const UPDATE_URL_JS = 'https://raw.githubusercontent.com/esmjee/floating-header/main/script.js';
    const UPDATE_URL_CSS = 'https://raw.githubusercontent.com/esmjee/floating-header/main/style.css';
    const LANGUAGES_URL = 'https://raw.githubusercontent.com/esmjee/floating-header/main/languages';
    
    let translations = {};
    
    const t = (key, ...args) => {
        let text = translations[key] || key;
        args.forEach((arg, i) => {
            text = text.replace(new RegExp(`\\{${i}\\}`, 'g'), arg);
        });
        return text;
    };
    
    const loadTranslations = async (lang) => {
        if (lang === 'en') {
            translations = {};
            return;
        }
        try {
            const response = await fetch(`${LANGUAGES_URL}/${lang}.json`);
            if (response.ok) {
                translations = await response.json();
            }
        } catch (e) {
            console.warn('Failed to load translations:', e);
            translations = {};
        }
    };
    
    const defaultConfig = {
        mode: 'light',
        color: 'default',
        position: { x: 20, y: 20 },
        visible: true,
        expanded: true,
        initialView: 'compact',
        compactLayout: 'default',
        customColors: [],
        usesDefaultConfig: true,
        language: 'en',
        domains: [
            { id: '1', name: 'Hoofd Webshop', url: 'https://ejansen.ccvdev.nl', icon: 'globe', showInCompact: true, color: '' },
            { id: '2', name: 'Admin', url: 'https://ejansen-admin.ccvdev.nl', icon: 'users', showInCompact: false, color: '' },
            { id: '3', name: 'Wiki', url: 'https://wiki.devdev.nl/index.php/BiedMeer_Wiki', icon: 'code', showInCompact: false, color: '' }
        ],
        urls: [
            { id: '1', name: 'Onderhoud Panel', url: '/onderhoud', icon: 'settings', showInCompact: true, color: '' },
            { id: '2', name: 'Basket', url: '/website/index.php?Show=WebShopBasket', icon: 'cart', showInCompact: true, color: '' },
            { id: '8', name: 'API Docs', url: '/API/Docs', icon: 'code', showInCompact: false, color: '' }
        ],
        webshopThemes: [
            { id: 'Oliver', name: 'Oliver', color: '#eee600' },
            { id: 'Macro', name: 'Macro', color: '#566627' },
            { id: 'Exo', name: 'Exo', color: '#34495e' },
            { id: 'Levi', name: 'Levi', color: '#8e44ad' },
            { id: 'Ivy', name: 'Ivy', color: '#a295d6' },
            { id: 'Tailor', name: 'Tailor', color: '#c21e56' },
            { id: 'Mila', name: 'Mila', color: '#34495e' },
            { id: 'Ceyda', name: 'Ceyda', color: '#808080' },
            { id: 'Martoni', name: 'Martoni', color: '#f7e7ce' },
            { id: 'Sensa', name: 'Sensa', color: '#dc5a5d' }
        ]
    };

    const itemColors = [
        { id: '', name: 'Default', color: '' },
        { id: 'red', name: 'Red', color: '#ef4444' },
        { id: 'orange', name: 'Orange', color: '#f97316' },
        { id: 'amber', name: 'Amber', color: '#f59e0b' },
        { id: 'yellow', name: 'Yellow', color: '#eab308' },
        { id: 'lime', name: 'Lime', color: '#84cc16' },
        { id: 'green', name: 'Green', color: '#22c55e' },
        { id: 'emerald', name: 'Emerald', color: '#10b981' },
        { id: 'teal', name: 'Teal', color: '#14b8a6' },
        { id: 'cyan', name: 'Cyan', color: '#06b6d4' },
        { id: 'sky', name: 'Sky', color: '#0ea5e9' },
        { id: 'blue', name: 'Blue', color: '#3b82f6' },
        { id: 'indigo', name: 'Indigo', color: '#6366f1' },
        { id: 'violet', name: 'Violet', color: '#8b5cf6' },
        { id: 'purple', name: 'Purple', color: '#a855f7' },
        { id: 'fuchsia', name: 'Fuchsia', color: '#d946ef' },
        { id: 'pink', name: 'Pink', color: '#ec4899' },
        { id: 'rose', name: 'Rose', color: '#f43f5e' }
    ];

    const getItemColor = (colorId) => {
        if (!colorId) return '';
        if (colorId.startsWith('#')) return colorId;
        return itemColors.find(c => c.id === colorId)?.color || '';
    };

    let config = { ...defaultConfig };
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
    let elements = {};

    const icons = {
        // https://lucide.dev/icons
        globe: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`,
        logo: `<svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
        collapse: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/></svg>`,
        expand: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>`,
        close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`,
        edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
        delete: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>`,
        add: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>`,
        copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`,
        link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>`,
        settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
        palette: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="12" r="1.5" fill="currentColor"/><circle cx="16" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="16" r="1.5" fill="currentColor"/></svg>`,
        box: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/></svg>`,
        cart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>`,
        users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>`,
        chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>`,
        gear: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
        code: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/></svg>`,
        upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>`,
        download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>`,
        open: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>`,
        star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
        starFilled: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
        menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>`,
        home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
        file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
        folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>`,
        image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
        heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
        mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>`,
        phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>`,
        calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
        clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
        search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
        zap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
        tag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
        bookmark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>`,
        flag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`,
        bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>`,
        message: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`,
        send: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
        lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>`,
        unlock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 019.9-1"/></svg>`,
        key: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,
        shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
        eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
        eyeOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
        check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
        x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
        alert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
        info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
        help: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
        refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>`,
        rotate: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>`,
        arrowUp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>`,
        arrowDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>`,
        arrowLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
        arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
        chevronUp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>`,
        chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`,
        chevronLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>`,
        chevronRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`,
        plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
        minus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
        grid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
        list: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
        layers: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
        layout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`,
        database: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
        server: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`,
        cloud: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/></svg>`,
        wifi: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0114.08 0"/><path d="M1.42 9a16 16 0 0121.16 0"/><path d="M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
        cpu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`,
        terminal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
        activity: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
        package: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
        truck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
        creditCard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
        dollar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>`,
        percent: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>`,
        gift: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>`,
        award: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
        target: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
        compass: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
        map: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>`,
        mapPin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
        navigation: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>`,
        music: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
        video: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`,
        camera: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
        mic: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
        volume: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>`,
        printer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`,
        save: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
        trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>`,
        archive: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`,
        filter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
        sort: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="11" y2="6"/><line x1="4" y1="12" x2="11" y2="12"/><line x1="4" y1="18" x2="13" y2="18"/><polyline points="15 15 18 18 21 15"/><line x1="18" y1="6" x2="18" y2="18"/></svg>`,
        sliders: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`,
        tool: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>`,
        wrench: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>`,
        user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
        userPlus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>`,
        userMinus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/></svg>`,
        userCheck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>`,
        store: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
        shoppingBag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`,
        receipt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/><path d="M14 8H8"/><path d="M16 12H8"/><path d="M13 16H8"/></svg>`,
        clipboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`,
        clipboardCheck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14l2 2 4-4"/></svg>`,
        fileText: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
        filePlus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>`,
        folderPlus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>`,
        folderOpen: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,
        share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
        externalLink: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
        power: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 11-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>`,
        logOut: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
        logIn: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>`,
        moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`,
        sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
        droplet: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>`,
        flame: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>`,
        snowflake: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/><path d="M20 16l-4-4 4-4"/><path d="M4 8l4 4-4 4"/><path d="M16 4l-4 4-4-4"/><path d="M8 20l4-4 4 4"/></svg>`,
        wind: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2"/></svg>`,
        cookie: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1010 10 4 4 0 01-5-5 4 4 0 01-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/></svg>`,
        flask: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6"/><path d="M10 3v7.31a.72.72 0 01-.28.56l-5.6 4.48c-1.17.93-.58 2.65.88 2.65h14c1.46 0 2.05-1.72.88-2.65l-5.6-4.48a.72.72 0 01-.28-.56V3"/></svg>`,
        bug: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="8" height="14" x="8" y="6" rx="4"/><path d="M19 7l-3 2"/><path d="M5 7l3 2"/><path d="M19 19l-3-2"/><path d="M5 19l3-2"/><path d="M20 13h-4"/><path d="M4 13h4"/><path d="M10 4l1 2"/><path d="M14 4l-1 2"/></svg>`,
        rocket: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,
        sparkles: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>`,
        crown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11.562 3.266a.5.5 0 01.876 0L15.39 8.87a1 1 0 001.516.294L21.183 5.5a.5.5 0 01.798.519l-2.834 10.246a1 1 0 01-.956.734H5.81a1 1 0 01-.957-.734L2.02 6.02a.5.5 0 01.798-.519l4.276 3.664a1 1 0 001.516-.294z"/><path d="M5 21h14"/></svg>`,
        gem: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M11 3l1 10l-9-4"/><path d="M13 3l-1 10l9-4"/><path d="M2 9h20"/></svg>`,
        fingerprint: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 10a2 2 0 00-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0118-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 01.34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 019 5.2c0 .47 0 1.17-.02 2"/></svg>`,
        handshake: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 17a4 4 0 01-8 0V5a2 2 0 012-2h4a2 2 0 012 2z"/><path d="M17 17a4 4 0 01-4 4H9"/><path d="M13 13l4-2 4 2v4a4 4 0 01-4 4H9"/><path d="M9 7l4-2 4 2"/><path d="M9 11l4-2 4 2"/></svg>`
    };

    const themeModes = [
        { id: 'dark', name: 'Dark' },
        { id: 'light', name: 'Light' }
    ];

    const builtInColors = [
        { id: 'default', name: 'Default', color: '#6366f1', preview: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
        { id: 'aesthetic', name: 'Aesthetic', color: '#a78bfa', preview: 'linear-gradient(135deg, #a78bfa, #f472b6)' },
        { id: 'ocean', name: 'Ocean', color: '#38bdf8', preview: 'linear-gradient(135deg, #38bdf8, #06b6d4)' },
        { id: 'forest', name: 'Forest', color: '#4ade80', preview: 'linear-gradient(135deg, #4ade80, #22c55e)' },
        { id: 'sunset', name: 'Sunset', color: '#fb923c', preview: 'linear-gradient(135deg, #fb923c, #f97316)' }
    ];

    const getThemeColors = () => {
        const customColors = (config.customColors || []).map(c => ({
            ...c,
            preview: c.color,
            isCustom: true
        }));
        return [...builtInColors, ...customColors];
    };

    const compactLayouts = [
        { 
            id: 'default', 
            name: 'List',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="4" rx="1"/><rect x="4" y="10" width="16" height="4" rx="1"/><rect x="4" y="17" width="16" height="4" rx="1"/></svg>`
        },
        { 
            id: 'circles', 
            name: 'Circles',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7" cy="8" r="3"/><circle cx="17" cy="8" r="3"/><circle cx="7" cy="16" r="3"/><circle cx="17" cy="16" r="3"/></svg>`
        },
        { 
            id: 'horizontal', 
            name: 'Bar',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="8" width="20" height="8" rx="4"/><circle cx="7" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="17" cy="12" r="1.5" fill="currentColor"/></svg>`
        },
        { 
            id: 'minimal', 
            name: 'Dots',
            icon: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="4.5" r="3"/><circle cx="12" cy="12" r="3"/><circle cx="12" cy="19.5" r="3"/></svg>`
        }
    ];

    const getBaseDomain = () => {
        const hostname = window.location.hostname;
        const parts = hostname.split('.');
        if (parts.length > 2) {
            return '.' + parts.slice(-2).join('.');
        }
        return hostname;
    };

    const getDefaultsFromCookie = () => {
        const match = document.cookie.match(/ccv-toolbar-defaults=([^;]+)/);
        if (match) {
            try {
                return JSON.parse(decodeURIComponent(match[1]));
            } catch (e) {
                return null;
            }
        }
        return null;
    };

    const isCurrentMatchingDefaults = () => {
        const defaults = getDefaultsFromCookie();
        if (!defaults) return null;
        return (
            config.mode === defaults.mode &&
            config.color === defaults.color &&
            config.compactLayout === defaults.compactLayout &&
            config.initialView === defaults.initialView &&
            JSON.stringify(config.customColors || []) === JSON.stringify(defaults.customColors || [])
        );
    };

    const saveDefaultsToCookie = () => {
        const defaults = {
            mode: config.mode,
            color: config.color,
            compactLayout: config.compactLayout,
            initialView: config.initialView,
            customColors: config.customColors,
            position: config.position
        };
        const value = encodeURIComponent(JSON.stringify(defaults));
        const domain = getBaseDomain();
        const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `ccv-toolbar-defaults=${value}; domain=${domain}; path=/; expires=${expires}; SameSite=Lax`;
        showToast(t('Default settings saved for all domains'));
    };

    const loadConfig = () => {
        const saved = localStorage.getItem('ccv-toolbar-config');
        if (saved) {
            try {
                config = { ...defaultConfig, ...JSON.parse(saved) };
            } catch (e) {
                config = { ...defaultConfig };
            }
        } else {
            const defaults = getDefaultsFromCookie();
            if (defaults) {
                config = { ...defaultConfig, ...defaults };
                saveConfig();
            }
        }
        
        if (config.usesDefaultConfig) {
            const defaults = getDefaultsFromCookie();
            if (defaults) {
                config.mode = defaults.mode ?? config.mode;
                config.color = defaults.color ?? config.color;
                config.compactLayout = defaults.compactLayout ?? config.compactLayout;
                config.initialView = defaults.initialView ?? config.initialView;
                config.customColors = defaults.customColors ?? config.customColors;
                config.position = defaults.position ?? config.position;
            }
        }
    };

    const saveConfig = () => {
        localStorage.setItem('ccv-toolbar-config', JSON.stringify(config));
    };

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const showToast = (message, doRenderHtml = false) => {
        const existing = document.querySelector('.ccv-toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = 'ccv-toast';
        toast.setAttribute('data-mode', config.mode);
        toast.setAttribute('data-color', config.color === 'default' ? '' : config.color);
        
        if (doRenderHtml) {
            toast.innerHTML = `
                <span class="ccv-toast-message">${message}</span>
                <button class="ccv-toast-close">${icons.close}</button>
            `;
            toast.querySelector('.ccv-toast-close').onclick = () => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            };
        } else {
            toast.textContent = message;
        }
        document.body.appendChild(toast);
        
        requestAnimationFrame(() => toast.classList.add('show'));
        
        if (!doRenderHtml) {
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 2000);
        }
    };

    let tooltipElement = null;
    let tooltipTimeout = null;
    
    const createTooltip = () => {
        if (tooltipElement) return tooltipElement;
        tooltipElement = document.createElement('div');
        tooltipElement.className = 'ccv-tooltip';
        tooltipElement.setAttribute('data-mode', config.mode);
        document.body.appendChild(tooltipElement);
        return tooltipElement;
    };
    
    const showTooltip = (target, text) => {
        if (!text) return;
        clearTimeout(tooltipTimeout);
        
        tooltipTimeout = setTimeout(() => {
            const tooltip = createTooltip();
            tooltip.textContent = text;
            tooltip.setAttribute('data-mode', config.mode);
            tooltip.classList.add('visible');
            
            const rect = target.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            
            let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
            let top = rect.top - tooltipRect.height - 8;
            
            if (left < 8) left = 8;
            if (left + tooltipRect.width > window.innerWidth - 8) {
                left = window.innerWidth - tooltipRect.width - 8;
            }
            if (top < 8) {
                top = rect.bottom + 8;
                tooltip.classList.add('below');
            } else {
                tooltip.classList.remove('below');
            }
            
            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
        }, 400);
    };
    
    const hideTooltip = () => {
        clearTimeout(tooltipTimeout);
        if (tooltipElement) {
            tooltipElement.classList.remove('visible');
        }
    };
    
    const setupTooltips = (container) => {
        container.querySelectorAll('[data-tooltip]').forEach(el => {
            el.addEventListener('mouseenter', (e) => {
                showTooltip(e.target.closest('[data-tooltip]'), e.target.closest('[data-tooltip]').dataset.tooltip);
            });
            el.addEventListener('mouseleave', hideTooltip);
            el.addEventListener('mousedown', hideTooltip);
        });
    };

    const showContextMenu = (e, menuItems) => {
        e.preventDefault();
        e.stopPropagation();
        hideTooltip();
        
        const existing = document.querySelector('.ccv-context-menu');
        if (existing) existing.remove();

        const menu = document.createElement('div');
        menu.className = 'ccv-context-menu';
        menu.setAttribute('data-mode', config.mode);
        menu.setAttribute('data-color', config.color === 'default' ? '' : config.color);
        
        menu.innerHTML = menuItems.map(item => {
            if (item.separator) {
                return '<div class="ccv-context-separator"></div>';
            }
            return `<button class="ccv-context-item ${item.danger ? 'danger' : ''}">${item.icon || ''}${item.label}</button>`;
        }).join('');

        document.body.appendChild(menu);

        const rect = menu.getBoundingClientRect();
        let x = e.clientX;
        let y = e.clientY;
        
        if (x + rect.width > window.innerWidth) {
            x = window.innerWidth - rect.width - 8;
        }
        if (y + rect.height > window.innerHeight) {
            y = window.innerHeight - rect.height - 8;
        }
        
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;

        const buttons = menu.querySelectorAll('.ccv-context-item');
        let itemIndex = 0;
        menuItems.forEach((item, i) => {
            if (!item.separator) {
                buttons[itemIndex].onclick = () => {
                    menu.remove();
                    if (item.action) item.action();
                };
                itemIndex++;
            }
        });

        const closeMenu = (ev) => {
            if (!menu.contains(ev.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
                document.removeEventListener('contextmenu', closeMenu);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
            document.addEventListener('contextmenu', closeMenu);
        }, 0);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => showToast(t('Copied to clipboard')));
    };

    const parseVersion = (versionStr) => {
        const match = versionStr.match(/VERSION\s*=\s*['"]([^'"]+)['"]/);
        return match ? match[1] : null;
    };

    const compareVersions = (v1, v2) => {
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);
        for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
            const p1 = parts1[i] || 0;
            const p2 = parts2[i] || 0;
            if (p1 > p2) return 1;
            if (p1 < p2) return -1;
        }
        return 0;
    };

    const checkForUpdates = async () => {
        if (!UPDATE_URL_JS) {
            showUpdateModal(null, null, null, t('No update URL configured in the script.'));
            return;
        }

        showToast(t('Checking for updates...'));

        try {
            const jsResponse = await fetch(UPDATE_URL_JS + '?t=' + Date.now(), { cache: 'no-store' });
            if (!jsResponse.ok) throw new Error('Failed to fetch script');
            const remoteScript = await jsResponse.text();
            const remoteVersion = parseVersion(remoteScript);
            
            if (!remoteVersion) {
                showUpdateModal(null, null, null, t('Could not determine remote version. The script URL may be invalid.'));
                return;
            }

            let remoteCss = null;
            if (UPDATE_URL_CSS) {
                try {
                    const cssResponse = await fetch(UPDATE_URL_CSS + '?t=' + Date.now(), { cache: 'no-store' });
                    if (cssResponse.ok) {
                        remoteCss = await cssResponse.text();
                    }
                } catch (e) {
                    console.warn('Failed to fetch CSS:', e);
                }
            }

            const comparison = compareVersions(remoteVersion, VERSION);
            
            if (comparison > 0) {
                showUpdateModal(remoteVersion, remoteScript, remoteCss);
            } else if (comparison === 0) {
                showToast(t('You have the latest version!') + ' (v' + VERSION + ')');
            } else {
                showToast(t('Your version is newer than remote') + ' (v' + VERSION + ' > v' + remoteVersion + ')');
            }
        } catch (error) {
            showUpdateModal(null, null, null, t('Failed to check for updates: {0}', error.message));
        }
    };

    const showUpdateModal = (newVersion, newScript, newCss, errorMessage = null) => {
        let content;
        
        if (errorMessage) {
            content = `
                <div style="text-align: center; padding: 20px 0;">
                    <div style="color: #ef4444; margin-bottom: 12px;">${icons.alert}</div>
                    <p style="margin: 0; color: var(--ccv-text);">${errorMessage}</p>
                </div>
            `;
            createModal(t('Update Error'), content, null);
            return;
        }

        const hasCss = newCss && newCss.trim().length > 0;
        const iconStyle = 'width: 14px; height: 14px; flex-shrink: 0;';

        content = `
            <div style="text-align: center; padding: 10px 0;">
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <p style="margin: 0 0 8px 0; color: var(--ccv-text); font-weight: 600;">${t('Update available')}!</p>
                    <p style="margin: 0 0 16px 0; color: var(--ccv-text-muted); font-size: 12px;">v${VERSION} → v${newVersion}</p>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <button class="ccv-btn ccv-btn-primary ccv-copy-js" style="width: 100%; justify-content: center;">
                        <span style="${iconStyle}">${icons.code}</span><span style="margin-left: 6px;">${t('Copy JS')}</span>
                    </button>
                    ${hasCss ? `
                    <button class="ccv-btn ccv-copy-css" style="width: 100%; justify-content: center;">
                        <span style="${iconStyle}">${icons.palette}</span><span style="margin-left: 6px;">${t('Copy CSS')}</span>
                    </button>
                    ` : ''}
                </div>
            </div>
        `;

        const modal = createModal(t('Update available'), content, null);
        
        const saveBtn = modal.querySelector('[data-action="save-modal"]');
        if (saveBtn) saveBtn.style.display = 'none';
        
        const smallIcon = 'width: 14px; height: 14px; flex-shrink: 0;';
        
        const copyJsBtn = modal.querySelector('.ccv-copy-js');
        if (copyJsBtn) {
            copyJsBtn.onclick = () => {
                navigator.clipboard.writeText(newScript).then(() => {
                    showToast(t('JavaScript copied! Paste it in your extension.'));
                    copyJsBtn.innerHTML = `<span style="${smallIcon}">${icons.check}</span><span style="margin-left: 6px;">${t('Copied!')}</span>`;
                    setTimeout(() => {
                        copyJsBtn.innerHTML = `<span style="${smallIcon}">${icons.code}</span><span style="margin-left: 6px;">${t('Copy JS')}</span>`;
                    }, 2000);
                });
            };
        }
        
        const copyCssBtn = modal.querySelector('.ccv-copy-css');
        if (copyCssBtn && hasCss) {
            copyCssBtn.onclick = () => {
                navigator.clipboard.writeText(newCss).then(() => {
                    showToast(t('CSS copied! Paste it in your extension.'));
                    copyCssBtn.innerHTML = `<span style="${smallIcon}">${icons.check}</span><span style="margin-left: 6px;">${t('Copied!')}</span>`;
                    setTimeout(() => {
                        copyCssBtn.innerHTML = `<span style="${smallIcon}">${icons.palette}</span><span style="margin-left: 6px;">${t('Copy CSS')}</span>`;
                    }, 2000);
                });
            };
        }
    };

    const navigateUrl = (url, domain = null) => {
        const fullUrl = domain ? `${domain}${url}` : url;
        window.location.href = fullUrl;
    };

    const openUrlNewTab = (url, domain = null) => {
        const fullUrl = domain ? `${domain}${url}` : url;
        window.open(fullUrl, '_blank');
    };

    const clearCookiePreferences = () => {
        const cookiesToClear = ['CCVGoPopUpClicked', 'cookie_preference'];
        cookiesToClear.forEach(name => {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
        });
        showToast(t('Cookie preferences cleared - <a href="javascript:window.location.reload()">refresh</a> the page to see the modal again.'), true);
    };

    let themeSwitchingInProgress = false;

    const checkBackendLogin = async () => {
        try {
            const loginUrl = `${window.location.origin}/onderhoud/Login.php`;
            const response = await fetch(loginUrl, {
                method: 'GET',
                credentials: 'include',
                redirect: 'follow'
            });
            
            const finalUrl = response.url;
            const isLoginPage = finalUrl.includes('/onderhoud/Login.php');
            
            return !isLoginPage;
        } catch (error) {
            console.error('Login check failed:', error);
            return false;
        }
    };

    const switchWebshopTheme = async (themeId) => {
        if (themeSwitchingInProgress) return;
        
        const theme = config.webshopThemes.find(t => t.id === themeId);
        if (!theme) return;
        
        themeSwitchingInProgress = true;
        const container = document.getElementById('ccv-webshop-themes');
        if (container) {
            container.classList.add('disabled');
            const clickedBtn = container.querySelector(`[data-webshop-theme="${themeId}"]`);
            if (clickedBtn) clickedBtn.classList.add('loading');
        }
        
        const isLoggedIn = await checkBackendLogin();
        if (!isLoggedIn) {
            themeSwitchingInProgress = false;
            if (container) {
                container.classList.remove('disabled');
                const clickedBtn = container.querySelector(`[data-webshop-theme="${themeId}"]`);
                if (clickedBtn) clickedBtn.classList.remove('loading');
            }
            const loginUrl = `${window.location.origin}/onderhoud/Login.php`;
            showToast(t('You are required to login <a href="{0}" target="_blank">here</a> to use this feature.', loginUrl), true);
            return;
        }
        
        const endpoint = `/onderhoud/AdminItems/Settings/TemplateChoice.ajax.php`;
        const formData = new FormData();
        formData.append('xajax', 'SelectTemplate');
        formData.append('xajaxr', Date.now());
        formData.append('xajaxargs[]', theme.id);
        formData.append('xajaxargs[]', '<xjxobj></xjxobj>');

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (response.ok) {
                showToast(t('Switched to {0} theme', theme.name));
                setTimeout(() => {
                    window.location.reload();
                }, 150);
            } else {
                showToast(t('Failed to switch theme ({0})', response.status));
                themeSwitchingInProgress = false;
                if (container) {
                    container.classList.remove('disabled');
                    container.querySelectorAll('.loading').forEach(btn => btn.classList.remove('loading'));
                }
            }
        } catch (error) {
            showToast(t('Failed to switch theme - check console'));
            console.error('Theme switch error:', error);
            themeSwitchingInProgress = false;
            if (container) {
                container.classList.remove('disabled');
                container.querySelectorAll('.loading').forEach(btn => btn.classList.remove('loading'));
            }
        }
    };

    const createExpandedPanel = () => {
        const panel = document.createElement('div');
        panel.className = 'ccv-panel ccv-expanded';
        panel.style.width = '340px';
        
        const getConfigStatusIcon = () => {
            const hasDefaults = getDefaultsFromCookie() !== null;
            if (!hasDefaults) {
                return `<div class="ccv-config-status ccv-config-none" data-tooltip="${t('No defaults saved')}">${icons.info}</div>`;
            } else if (config.usesDefaultConfig) {
                return `<div class="ccv-config-status ccv-config-synced" data-tooltip="${t('Synced with defaults')}">${icons.check}</div>`;
            } else {
                return `<div class="ccv-config-status ccv-config-custom" data-tooltip="${t('Custom config')}">${icons.alert}</div>`;
            }
        };
        
        panel.innerHTML = `
            <div class="ccv-header">
                <div class="ccv-logo">${icons.logo}<span>CCV Dev Tools</span>${getConfigStatusIcon()}</div>
                <div class="ccv-header-actions">
                    <button class="ccv-btn-icon" data-action="collapse" data-tooltip="${t('Compact view')}">${icons.collapse}</button>
                    <button class="ccv-btn-icon" data-action="hide" data-tooltip="${t('Hide')}">${icons.close}</button>
                </div>
            </div>
            <div class="ccv-tabs">
                <button class="ccv-tab active" data-tab="links">${t('Links')}</button>
                <button class="ccv-tab" data-tab="actions">${t('Actions')}</button>
                <button class="ccv-tab" data-tab="settings">${t('Settings')}</button>
            </div>
            <div class="ccv-content">
                <div class="ccv-tab-content active" data-content="links">
                    <div class="ccv-section">
                        <div class="ccv-section-header">
                            <span class="ccv-section-title">${t('Quick Links')}</span>
                            <button class="ccv-btn-icon" data-action="add-url" data-tooltip="${t('Add URL')}">${icons.add}</button>
                        </div>
                        <div class="ccv-url-grid" id="ccv-urls-list"></div>
                    </div>
                    <div class="ccv-section">
                        <div class="ccv-section-header">
                            <span class="ccv-section-title">${t('Domains')}</span>
                            <button class="ccv-btn-icon" data-action="add-domain" data-tooltip="${t('Add Domain')}">${icons.add}</button>
                        </div>
                        <div class="ccv-list" id="ccv-domains-list"></div>
                    </div>
                </div>
                <div class="ccv-tab-content" data-content="actions">
                    <div class="ccv-section">
                        <div class="ccv-section-header">
                            <span class="ccv-section-title">${t('Webshop Themes')}</span>
                            <button class="ccv-btn-icon" data-action="add-webshop-theme" data-tooltip="${t('Add Theme')}">${icons.add}</button>
                        </div>
                        <div class="ccv-webshop-themes" id="ccv-webshop-themes"></div>
                    </div>
                    <div class="ccv-section">
                        <div class="ccv-section-header">
                            <span class="ccv-section-title">${t('Cookies')}</span>
                        </div>
                        <button class="ccv-btn ccv-btn-full" data-action="clear-cookies">
                            ${icons.delete}
                            <span>${t('Clear cookie preferences')}</span>
                        </button>
                        <p class="ccv-hint">${t('Removes CCVGoPopUpClicked and cookie_preference to show the cookie modal again.')}</p>
                    </div>
                </div>
                <div class="ccv-tab-content" data-content="settings">
                    <div class="ccv-settings-group">
                        <label class="ccv-settings-label">${t('Theme')}</label>
                        <div class="ccv-theme-grid" style="grid-template-columns: repeat(2, 1fr);" id="ccv-mode-grid"></div>
                    </div>
                    <div class="ccv-settings-group">
                        <label class="ccv-settings-label">${t('Color')}</label>
                        <div class="ccv-theme-grid" id="ccv-color-grid"></div>
                    </div>
                    <div class="ccv-settings-group">
                        <label class="ccv-settings-label">${t('Compact Layout')}</label>
                        <div class="ccv-theme-grid" style="grid-template-columns: repeat(4, 1fr);" id="ccv-layout-grid"></div>
                    </div>
                    <div class="ccv-settings-group">
                        <label class="ccv-settings-label">${t('Initial State')}</label>
                        <div class="ccv-theme-grid" style="grid-template-columns: repeat(3, 1fr);">
                            <div class="ccv-theme-option ${config.initialView === 'hidden' ? 'active' : ''}" data-initial-view="hidden">
                                <div class="preview" style="background: var(--ccv-surface-hover);">${icons.close}</div>
                                <span class="name">${t('Hidden')}</span>
                            </div>
                            <div class="ccv-theme-option ${config.initialView === 'expanded' ? 'active' : ''}" data-initial-view="expanded">
                                <div class="preview" style="background: var(--ccv-accent);">${icons.expand}</div>
                                <span class="name">${t('Expanded')}</span>
                            </div>
                            <div class="ccv-theme-option ${config.initialView === 'compact' ? 'active' : ''}" data-initial-view="compact">
                                <div class="preview" style="background: var(--ccv-accent);">${icons.collapse}</div>
                                <span class="name">${t('Compact')}</span>
                            </div>
                        </div>
                    </div>
                    <div class="ccv-settings-group">
                        <label class="ccv-settings-label">${t('Language')}</label>
                        <div class="ccv-theme-grid" style="grid-template-columns: repeat(2, 1fr);">
                            <div class="ccv-theme-option ${config.language === 'en' ? 'active' : ''}" data-language="en">
                                <div class="preview" style="background: var(--ccv-surface-hover); font-size: 22px;">🇬🇧</div>
                                <span class="name">English</span>
                            </div>
                            <div class="ccv-theme-option ${config.language === 'nl' ? 'active' : ''}" data-language="nl">
                                <div class="preview" style="background: var(--ccv-surface-hover); font-size: 22px;">🇳🇱</div>
                                <span class="name">Nederlands</span>
                            </div>
                        </div>
                    </div>
                    <div class="ccv-settings-group">
                        <label class="ccv-settings-label">${t('Updates')}</label>
                        <span class="ccv-hint">${t('Current version')}: v${VERSION}</span>
                        <button class="ccv-btn ccv-btn-primary" data-action="check-updates" style="margin-top: 8px; width: 100%; justify-content: center;">${icons.refresh}<span>${t('Check for Updates')}</span></button>
                    </div>
                    <div class="ccv-settings-group">
                        <label class="ccv-settings-label">${t('Cross-Domain Defaults')}</label>
                        <div class="ccv-defaults-card">
                            <div class="ccv-defaults-toggle-row">
                                <div class="ccv-defaults-toggle-info">
                                    <span class="ccv-defaults-toggle-title">${t('Sync with defaults')}</span>
                                    <span class="ccv-defaults-toggle-desc">${t('Layout settings sync across domains')}</span>
                                </div>
                                <label class="ccv-toggle">
                                    <input type="checkbox" id="ccv-uses-default-config" ${config.usesDefaultConfig ? 'checked' : ''}>
                                    <span class="ccv-toggle-slider"></span>
                                </label>
                            </div>
                            ${(() => {
                                const hasDefaults = getDefaultsFromCookie() !== null;
                                if (!hasDefaults) {
                                    return `<div class="ccv-defaults-status ccv-defaults-none">${icons.info}<span>${t('No defaults saved yet')}</span></div>`;
                                } else if (config.usesDefaultConfig) {
                                    return `<div class="ccv-defaults-status ccv-defaults-match">${icons.check}<span>${t('Using synced defaults')}</span></div>`;
                                } else {
                                    return `<div class="ccv-defaults-status ccv-defaults-different">${icons.alert}<span>${t('Custom settings for this domain')}</span></div>`;
                                }
                            })()}
                            <button class="ccv-btn ccv-btn-primary ccv-btn-full" data-action="save-defaults">${icons.star}<span>${t('Save Current as Default')}</span></button>
                        </div>
                    </div>
                    <div class="ccv-settings-group">
                        <label class="ccv-settings-label">${t('Data')}</label>
                        <div class="ccv-btn-group">
                            <button class="ccv-btn" data-action="export">${icons.download}<span>${t('Export')}</span></button>
                            <button class="ccv-btn" data-action="import">${icons.upload}<span>${t('Import')}</span></button>
                        </div>
                        <button class="ccv-btn ccv-btn-danger" data-action="reset" style="margin-top: 8px;">${icons.trash}<span>${t('Reset Configuration')}</span></button>
                    </div>
                </div>
            </div>
        `;
        
        return panel;
    };

    const createCompactPanel = () => {
        const panel = document.createElement('div');
        panel.className = 'ccv-panel';
        
        const compactDomains = config.domains.filter(d => d.showInCompact);
        const compactUrls = config.urls.filter(u => u.showInCompact);
        
        const renderItems = () => {
            const urlBtn = (u, cls) => {
                const color = getItemColor(u.color);
                const style = color ? `style="--item-color: ${color}"` : '';
                const fullUrl = u.url.startsWith('http') ? u.url : window.location.origin + u.url;
                return `<a href="${fullUrl}" class="${cls} ${color ? 'has-color' : ''}" data-url-id="${u.id}" data-tooltip="${u.name}" ${style}>${icons[u.icon] || icons.link}${cls.includes('circle') || cls.includes('minimal') ? '' : `<span>${u.name}</span>`}</a>`;
            };
            const domainBtn = (d, cls) => {
                const color = getItemColor(d.color);
                const style = color ? `style="--item-color: ${color}"` : '';
                return `<a href="${d.url}" class="${cls} ${color ? 'has-color' : ''}" data-domain-id="${d.id}" data-tooltip="${d.name}" ${style}>${icons[d.icon] || icons.globe}${cls.includes('circle') || cls.includes('minimal') ? '' : `<span>${d.name}</span>`}</a>`;
            };

            switch (config.compactLayout) {
                case 'circles':
                    return `
                        <div class="ccv-compact-circles">
                            ${compactUrls.map(u => urlBtn(u, 'ccv-circle-btn')).join('')}
                            ${compactDomains.map(d => domainBtn(d, 'ccv-circle-btn')).join('')}
                        </div>
                    `;
                case 'horizontal':
                    return `
                        <div class="ccv-compact-horizontal">
                            ${compactUrls.map(u => urlBtn(u, 'ccv-horizontal-btn')).join('')}
                            ${compactDomains.map(d => domainBtn(d, 'ccv-horizontal-btn')).join('')}
                        </div>
                    `;
                case 'minimal':
                    return `
                        <div class="ccv-compact-minimal">
                            <button class="ccv-minimal-btn ccv-minimal-control" data-action="expand" data-tooltip="Expand">${icons.expand}</button>
                            ${compactUrls.map(u => urlBtn(u, 'ccv-minimal-btn')).join('')}
                            ${compactDomains.map(d => domainBtn(d, 'ccv-minimal-btn')).join('')}
                            <button class="ccv-minimal-btn ccv-minimal-control" data-action="hide" data-tooltip="Hide">${icons.close}</button>
                        </div>
                    `;
                default:
                    return `
                        <div class="ccv-compact-items">
                            ${compactUrls.map(u => urlBtn(u, 'ccv-compact-btn')).join('')}
                            ${compactDomains.map(d => domainBtn(d, 'ccv-compact-btn')).join('')}
                        </div>
                    `;
            }
        };
        
        if (config.compactLayout === 'minimal') {
            panel.innerHTML = renderItems();
        } else {
            panel.innerHTML = `
                <div class="ccv-header ccv-header-compact">
                    <div class="ccv-logo">${icons.logo}</div>
                    <div class="ccv-header-actions">
                        <button class="ccv-btn-icon" data-action="expand" data-tooltip="Expand">${icons.expand}</button>
                        <button class="ccv-btn-icon" data-action="hide" data-tooltip="Hide">${icons.close}</button>
                    </div>
                </div>
                ${renderItems()}
            `;
        }
        
        panel.querySelectorAll('a[data-url-id], a[data-domain-id]').forEach(link => {
            link.onclick = (e) => {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(link.href, '_blank');
                    return false;
                }
            };
            
            link.oncontextmenu = (e) => {
                const domainId = link.dataset.domainId;
                const urlId = link.dataset.urlId;
                
                if (domainId) {
                    const domain = config.domains.find(d => d.id === domainId);
                    if (!domain) return;
                    
                    showContextMenu(e, [
                        { icon: icons.open, label: t('Open'), action: () => window.location.href = domain.url },
                        { icon: icons.externalLink, label: t('Open in new tab'), action: () => window.open(domain.url, '_blank') },
                        { icon: icons.copy, label: t('Copy URL'), action: () => copyToClipboard(domain.url) },
                        { separator: true },
                        { icon: icons.edit, label: t('Edit'), action: () => showDomainModal(domain) },
                        { icon: icons.delete, label: t('Delete'), danger: true, action: () => {
                            showDeleteConfirmation('Domain', domain.name, () => {
                                config.domains = config.domains.filter(d => d.id !== domain.id);
                                saveConfig();
                                render();
                                showToast(t('Domain deleted'));
                            });
                        }}
                    ]);
                } else if (urlId) {
                    const url = config.urls.find(u => u.id === urlId);
                    if (!url) return;
                    
                    const fullUrl = url.url.startsWith('http') ? url.url : window.location.origin + url.url;
                    showContextMenu(e, [
                        { icon: icons.open, label: t('Open'), action: () => window.location.href = fullUrl },
                        { icon: icons.externalLink, label: t('Open in new tab'), action: () => window.open(fullUrl, '_blank') },
                        { icon: icons.copy, label: t('Copy URL'), action: () => copyToClipboard(url.url) },
                        { separator: true },
                        { icon: icons.edit, label: t('Edit'), action: () => showUrlModal(url) },
                        { icon: icons.delete, label: t('Delete'), danger: true, action: () => {
                            showDeleteConfirmation('URL', url.name, () => {
                                config.urls = config.urls.filter(u => u.id !== url.id);
                                saveConfig();
                                render();
                                showToast(t('URL deleted'));
                            });
                        }}
                    ]);
                }
            };
        });
        
        return panel;
    };

    const createModal = (title, content, onSave, onDelete = null) => {
        const overlay = document.createElement('div');
        overlay.className = 'ccv-modal-overlay';
        overlay.setAttribute('data-mode', config.mode);
        overlay.setAttribute('data-color', config.color === 'default' ? '' : config.color);
        
        overlay.innerHTML = `
            <div class="ccv-modal">
                <div class="ccv-modal-header">
                    <span class="ccv-modal-title">${title}</span>
                    <button class="ccv-btn-icon" data-action="close-modal">${icons.close}</button>
                </div>
                <div class="ccv-modal-body">${content}</div>
                <div class="ccv-modal-footer">
                    ${onDelete ? `<button class="ccv-btn danger" data-action="delete-modal">${icons.delete} ${t('Delete')}</button>` : ''}
                    <button class="ccv-btn" data-action="cancel-modal">${t('Cancel')}</button>
                    <button class="ccv-btn primary" data-action="save-modal">${t('Save')}</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        setupTooltips(overlay);
        requestAnimationFrame(() => overlay.classList.add('active'));

        const closeModal = () => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 200);
        };

        overlay.querySelector('[data-action="close-modal"]').onclick = closeModal;
        overlay.querySelector('[data-action="cancel-modal"]').onclick = closeModal;
        overlay.querySelector('[data-action="save-modal"]').onclick = () => {
            if (onSave()) closeModal();
        };
        if (onDelete) {
            overlay.querySelector('[data-action="delete-modal"]').onclick = onDelete;
        }
        overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };

        return overlay;
    };

    const showDomainModal = (domain = null) => {
        const isEdit = !!domain;
        const iconOptions = Object.keys(icons).filter(k => !['logo', 'collapse', 'expand', 'close', 'edit', 'delete', 'add', 'copy', 'upload', 'download', 'star', 'starFilled'].includes(k));
        const selectedIcon = domain?.icon || 'globe';
        const selectedColor = domain?.color || '';
        
        const content = `
            <div class="ccv-input-group">
                <label class="ccv-input-label">${t('Name')}</label>
                <input type="text" class="ccv-input" id="ccv-domain-name" placeholder="e.g. Production" value="${domain?.name || ''}">
            </div>
            <div class="ccv-input-group">
                <label class="ccv-input-label">${t('URL')}</label>
                <input type="text" class="ccv-input" id="ccv-domain-url" placeholder="e.g. https://myshop.ccvshop.nl" value="${domain?.url || ''}">
            </div>
            <div class="ccv-input-group">
                <label class="ccv-input-label">${t('Icon')}</label>
                <input type="hidden" id="ccv-domain-icon" value="${selectedIcon}">
                <div class="ccv-picker-toggle" id="ccv-domain-icon-toggle">
                    <div class="ccv-picker-preview">
                        ${icons[selectedIcon]}
                        <span>${selectedIcon}</span>
                    </div>
                    <div class="ccv-picker-arrow">${icons.chevronDown}</div>
                </div>
                <div class="ccv-icon-picker" id="ccv-domain-icon-picker">
                    ${iconOptions.map(i => `
                        <button type="button" class="ccv-icon-option ${selectedIcon === i ? 'active' : ''}" data-icon="${i}" data-tooltip="${i}">
                            ${icons[i]}
                        </button>
                    `).join('')}
                </div>
            </div>
            <div class="ccv-input-group">
                <label class="ccv-input-label">${t('Color')}</label>
                <input type="hidden" id="ccv-domain-color" value="${selectedColor}">
                <div class="ccv-color-picker" id="ccv-domain-color-picker">
                    ${itemColors.map(c => `
                        <button type="button" class="ccv-color-option ${selectedColor === c.id ? 'active' : ''}" data-color="${c.id}" data-tooltip="${c.name}" style="${c.color ? `--item-color: ${c.color}` : ''}">
                            ${c.color ? '' : '×'}
                        </button>
                    `).join('')}
                    <div class="ccv-color-custom-wrapper">
                        <input type="color" class="ccv-color-custom-input" id="ccv-domain-color-custom" value="${selectedColor && selectedColor.startsWith('#') ? selectedColor : '#6366f1'}" data-tooltip="${t('Custom color')}">
                        <button type="button" class="ccv-color-option ccv-color-custom-btn ${selectedColor && selectedColor.startsWith('#') ? 'active' : ''}" data-color="custom" data-tooltip="${t('Custom color')}" style="${selectedColor && selectedColor.startsWith('#') ? `--item-color: ${selectedColor}` : ''}">
                            ${icons.palette}
                        </button>
                    </div>
                </div>
            </div>
            <div class="ccv-input-group">
                <label class="ccv-checkbox-label">
                    <input type="checkbox" id="ccv-domain-compact" ${domain?.showInCompact ? 'checked' : ''}>
                    <span>${t('Show in compact view')}</span>
                </label>
            </div>
        `;

        const modal = createModal(isEdit ? t('Edit Domain') : t('Add Domain'), content, () => {
            const name = document.getElementById('ccv-domain-name').value.trim();
            const url = document.getElementById('ccv-domain-url').value.trim();
            const icon = document.getElementById('ccv-domain-icon').value;
            const color = document.getElementById('ccv-domain-color').value;
            const showInCompact = document.getElementById('ccv-domain-compact').checked;

            if (!name || !url) {
                showToast(t('Please fill in all fields'));
                return false;
            }

            if (isEdit) {
                const idx = config.domains.findIndex(d => d.id === domain.id);
                if (idx !== -1) config.domains[idx] = { ...domain, name, url, icon, color, showInCompact };
            } else {
                config.domains.push({ id: generateId(), name, url, icon, color, showInCompact });
            }

            saveConfig();
            render();
            return true;
        });

        const domainIconToggle = modal.querySelector('#ccv-domain-icon-toggle');
        const domainIconPicker = modal.querySelector('#ccv-domain-icon-picker');
        
        domainIconToggle.addEventListener('click', () => {
            domainIconToggle.classList.toggle('expanded');
            domainIconPicker.classList.toggle('expanded');
        });

        domainIconPicker.addEventListener('click', (e) => {
            const btn = e.target.closest('.ccv-icon-option');
            if (btn) {
                modal.querySelectorAll('.ccv-icon-option').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const iconName = btn.dataset.icon;
                document.getElementById('ccv-domain-icon').value = iconName;
                domainIconToggle.querySelector('.ccv-picker-preview').innerHTML = `${icons[iconName]}<span>${iconName}</span>`;
            }
        });

        const domainColorPicker = modal.querySelector('#ccv-domain-color-picker');
        const domainColorCustomInput = modal.querySelector('#ccv-domain-color-custom');
        const domainColorCustomBtn = modal.querySelector('.ccv-color-custom-btn');
        
        domainColorPicker.addEventListener('click', (e) => {
            const btn = e.target.closest('.ccv-color-option');
            if (btn) {
                modal.querySelectorAll('.ccv-color-option').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (btn.dataset.color === 'custom') {
                    document.getElementById('ccv-domain-color').value = domainColorCustomInput.value;
                    domainColorCustomBtn.style.setProperty('--item-color', domainColorCustomInput.value);
                } else {
                    document.getElementById('ccv-domain-color').value = btn.dataset.color;
                }
            }
        });
        
        domainColorCustomInput.addEventListener('input', (e) => {
            domainColorCustomBtn.style.setProperty('--item-color', e.target.value);
            if (domainColorCustomBtn.classList.contains('active')) {
                document.getElementById('ccv-domain-color').value = e.target.value;
            }
        });
        
        domainColorCustomInput.addEventListener('click', (e) => {
            e.stopPropagation();
            modal.querySelectorAll('.ccv-color-option').forEach(b => b.classList.remove('active'));
            domainColorCustomBtn.classList.add('active');
            document.getElementById('ccv-domain-color').value = e.target.value;
            domainColorCustomBtn.style.setProperty('--item-color', e.target.value);
        });
    };

    const showUrlModal = (urlItem = null) => {
        const isEdit = !!urlItem;
        const iconOptions = Object.keys(icons).filter(k => !['logo', 'collapse', 'expand', 'close', 'edit', 'delete', 'add', 'copy', 'upload', 'download', 'star', 'starFilled'].includes(k));
        const selectedIcon = urlItem?.icon || iconOptions[0];
        const selectedColor = urlItem?.color || '';
        
        const content = `
            <div class="ccv-input-group">
                <label class="ccv-input-label">${t('Name')}</label>
                <input type="text" class="ccv-input" id="ccv-url-name" placeholder="e.g. Admin Panel" value="${urlItem?.name || ''}">
            </div>
            <div class="ccv-input-group">
                <label class="ccv-input-label">${t('Path')}</label>
                <input type="text" class="ccv-input" id="ccv-url-path" placeholder="e.g. /admin" value="${urlItem?.url || ''}">
            </div>
            <div class="ccv-input-group">
                <label class="ccv-input-label">${t('Icon')}</label>
                <input type="hidden" id="ccv-url-icon" value="${selectedIcon}">
                <div class="ccv-picker-toggle" id="ccv-url-icon-toggle">
                    <div class="ccv-picker-preview">
                        ${icons[selectedIcon]}
                        <span>${selectedIcon}</span>
                    </div>
                    <div class="ccv-picker-arrow">${icons.chevronDown}</div>
                </div>
                <div class="ccv-icon-picker" id="ccv-icon-picker">
                    ${iconOptions.map(i => `
                        <button type="button" class="ccv-icon-option ${selectedIcon === i ? 'active' : ''}" data-icon="${i}" data-tooltip="${i}">
                            ${icons[i]}
                        </button>
                    `).join('')}
                </div>
            </div>
            <div class="ccv-input-group">
                <label class="ccv-input-label">${t('Color')}</label>
                <input type="hidden" id="ccv-url-color" value="${selectedColor}">
                <div class="ccv-color-picker" id="ccv-url-color-picker">
                    ${itemColors.map(c => `
                        <button type="button" class="ccv-color-option ${selectedColor === c.id ? 'active' : ''}" data-color="${c.id}" data-tooltip="${c.name}" style="${c.color ? `--item-color: ${c.color}` : ''}">
                            ${c.color ? '' : '×'}
                        </button>
                    `).join('')}
                    <div class="ccv-color-custom-wrapper">
                        <input type="color" class="ccv-color-custom-input" id="ccv-url-color-custom" value="${selectedColor && selectedColor.startsWith('#') ? selectedColor : '#6366f1'}" data-tooltip="${t('Custom color')}">
                        <button type="button" class="ccv-color-option ccv-color-custom-btn ${selectedColor && selectedColor.startsWith('#') ? 'active' : ''}" data-color="custom" data-tooltip="${t('Custom color')}" style="${selectedColor && selectedColor.startsWith('#') ? `--item-color: ${selectedColor}` : ''}">
                            ${icons.palette}
                        </button>
                    </div>
                </div>
            </div>
            <div class="ccv-input-group">
                <label class="ccv-checkbox-label">
                    <input type="checkbox" id="ccv-url-compact" ${urlItem?.showInCompact ? 'checked' : ''}>
                    <span>${t('Show in compact view')}</span>
                </label>
            </div>
        `;

        const modal = createModal(isEdit ? t('Edit URL') : t('Add URL'), content, () => {
            const name = document.getElementById('ccv-url-name').value.trim();
            const url = document.getElementById('ccv-url-path').value.trim();
            const icon = document.getElementById('ccv-url-icon').value;
            const color = document.getElementById('ccv-url-color').value;
            const showInCompact = document.getElementById('ccv-url-compact').checked;

            if (!name || !url) {
                showToast(t('Please fill in all fields'));
                return false;
            }

            if (isEdit) {
                const idx = config.urls.findIndex(u => u.id === urlItem.id);
                if (idx !== -1) config.urls[idx] = { ...urlItem, name, url, icon, color, showInCompact };
            } else {
                config.urls.push({ id: generateId(), name, url, icon, color, showInCompact });
            }

            saveConfig();
            render();
            return true;
        });

        const urlIconToggle = modal.querySelector('#ccv-url-icon-toggle');
        const urlIconPicker = modal.querySelector('#ccv-icon-picker');
        
        urlIconToggle.addEventListener('click', () => {
            urlIconToggle.classList.toggle('expanded');
            urlIconPicker.classList.toggle('expanded');
        });

        urlIconPicker.addEventListener('click', (e) => {
            const btn = e.target.closest('.ccv-icon-option');
            if (btn) {
                modal.querySelectorAll('.ccv-icon-option').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const iconName = btn.dataset.icon;
                document.getElementById('ccv-url-icon').value = iconName;
                urlIconToggle.querySelector('.ccv-picker-preview').innerHTML = `${icons[iconName]}<span>${iconName}</span>`;
            }
        });

        const urlColorPicker = modal.querySelector('#ccv-url-color-picker');
        const urlColorCustomInput = modal.querySelector('#ccv-url-color-custom');
        const urlColorCustomBtn = urlColorPicker.querySelector('.ccv-color-custom-btn');
        
        urlColorPicker.addEventListener('click', (e) => {
            const btn = e.target.closest('.ccv-color-option');
            if (btn) {
                modal.querySelectorAll('.ccv-color-option').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (btn.dataset.color === 'custom') {
                    document.getElementById('ccv-url-color').value = urlColorCustomInput.value;
                    urlColorCustomBtn.style.setProperty('--item-color', urlColorCustomInput.value);
                } else {
                    document.getElementById('ccv-url-color').value = btn.dataset.color;
                }
            }
        });
        
        urlColorCustomInput.addEventListener('input', (e) => {
            urlColorCustomBtn.style.setProperty('--item-color', e.target.value);
            if (urlColorCustomBtn.classList.contains('active')) {
                document.getElementById('ccv-url-color').value = e.target.value;
            }
        });
        
        urlColorCustomInput.addEventListener('click', (e) => {
            e.stopPropagation();
            modal.querySelectorAll('.ccv-color-option').forEach(b => b.classList.remove('active'));
            urlColorCustomBtn.classList.add('active');
            document.getElementById('ccv-url-color').value = e.target.value;
            urlColorCustomBtn.style.setProperty('--item-color', e.target.value);
        });
    };

    const exportConfig = () => {
        const data = JSON.stringify({
            domains: config.domains,
            urls: config.urls,
            mode: config.mode,
            color: config.color,
            compactLayout: config.compactLayout,
            initialView: config.initialView,
            webshopThemes: config.webshopThemes,
            customColors: config.customColors,
            position: config.position,
            usesDefaultConfig: config.usesDefaultConfig
        }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ccv-toolbar-config.json';
        a.click();
        URL.revokeObjectURL(url);
        showToast(t('Configuration exported'));
    };

    const importConfig = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (data.domains) config.domains = data.domains;
                    if (data.urls) config.urls = data.urls;
                    if (data.mode) config.mode = data.mode;
                    if (data.color) config.color = data.color;
                    if (data.compactLayout) config.compactLayout = data.compactLayout;
                    if (data.initialView) config.initialView = data.initialView;
                    if (data.webshopThemes) config.webshopThemes = data.webshopThemes;
                    if (data.customColors) config.customColors = data.customColors;
                    if (data.position) config.position = data.position;
                    if (typeof data.usesDefaultConfig === 'boolean') config.usesDefaultConfig = data.usesDefaultConfig;
                    applyTheme();
                    saveConfig();
                    render();
                    showToast(t('Configuration imported'));
                } catch (err) {
                    showToast(t('Invalid configuration file'));
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    const renderDomainsList = () => {
        const container = document.getElementById('ccv-domains-list');
        if (!container) return;

        container.innerHTML = config.domains.map(domain => {
            const color = getItemColor(domain.color);
            const colorStyle = color ? `style="--item-color: ${color}"` : '';
            return `
            <a href="${domain.url}" class="ccv-domain-item ${color ? 'has-color' : ''}" data-domain-id="${domain.id}" ${colorStyle}>
                <div class="ccv-domain-main">
                    ${icons[domain.icon] || icons.globe}
                    <span>${domain.name}</span>
                    ${domain.showInCompact ? `<span class="ccv-compact-badge">${icons.star}</span>` : ''}
                </div>
            </a>
        `}).join('');

        container.querySelectorAll('.ccv-domain-item').forEach(item => {
            item.onclick = (e) => {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(item.href, '_blank');
                    return false;
                }
            };
            item.oncontextmenu = (e) => {
                const domain = config.domains.find(d => d.id === item.dataset.domainId);
                if (!domain) return;
                
                showContextMenu(e, [
                    { icon: icons.open, label: t('Open'), action: () => navigateUrl('/', domain.url) },
                    { icon: icons.externalLink, label: t('Open in new tab'), action: () => openUrlNewTab('/', domain.url) },
                    { icon: icons.copy, label: t('Copy URL'), action: () => copyToClipboard(domain.url) },
                    { separator: true },
                    { icon: icons.edit, label: t('Edit'), action: () => showDomainModal(domain) },
                    { icon: icons.delete, label: t('Delete'), danger: true, action: () => {
                        showDeleteConfirmation('Domain', domain.name, () => {
                            config.domains = config.domains.filter(d => d.id !== domain.id);
                            saveConfig();
                            renderDomainsList();
                            showToast(t('Domain deleted'));
                        });
                    }}
                ]);
            };
        });
    };

    const renderUrlsList = () => {
        const container = document.getElementById('ccv-urls-list');
        if (!container) return;

        container.innerHTML = config.urls.map(url => {
            const color = getItemColor(url.color);
            const colorStyle = color ? `style="--item-color: ${color}"` : '';
            const fullUrl = url.url.startsWith('http') ? url.url : window.location.origin + url.url;
            return `
            <a href="${fullUrl}" class="ccv-url-item ${color ? 'has-color' : ''}" data-url-id="${url.id}" ${colorStyle}>
                <div class="ccv-url-main">
                    ${icons[url.icon] || icons.link}
                    <span>${url.name}</span>
                    ${url.showInCompact ? `<span class="ccv-compact-badge">${icons.star}</span>` : ''}
                </div>
            </a>
        `}).join('');

        container.querySelectorAll('.ccv-url-item').forEach(item => {
            item.onclick = (e) => {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(item.href, '_blank');
                    return false;
                }
            };
            item.oncontextmenu = (e) => {
                const url = config.urls.find(u => u.id === item.dataset.urlId);
                if (!url) return;
                
                showContextMenu(e, [
                    { icon: icons.open, label: t('Open'), action: () => navigateUrl(url.url) },
                    { icon: icons.externalLink, label: t('Open in new tab'), action: () => openUrlNewTab(url.url) },
                    { icon: icons.copy, label: t('Copy URL'), action: () => copyToClipboard(url.url) },
                    { separator: true },
                    { icon: icons.edit, label: t('Edit'), action: () => showUrlModal(url) },
                    { icon: icons.delete, label: t('Delete'), danger: true, action: () => {
                        showDeleteConfirmation('URL', url.name, () => {
                            config.urls = config.urls.filter(u => u.id !== url.id);
                            saveConfig();
                            renderUrlsList();
                            showToast(t('URL deleted'));
                        });
                    }}
                ]);
            };
        });
    };

    const renderThemeGrid = () => {
        const modeContainer = document.getElementById('ccv-mode-grid');
        const colorContainer = document.getElementById('ccv-color-grid');
        const layoutContainer = document.getElementById('ccv-layout-grid');
        
        if (modeContainer) {
            modeContainer.innerHTML = themeModes.map(mode => `
                <div class="ccv-theme-option ${config.mode === mode.id ? 'active' : ''}" data-mode="${mode.id}">
                    <div class="preview" style="background: ${mode.id === 'dark' ? 'linear-gradient(135deg, #18181b, #27272a)' : 'linear-gradient(135deg, #f4f4f5, #e4e4e7)'}"></div>
                    <span class="name">${mode.name}</span>
                </div>
            `).join('');
        }
        
        if (colorContainer) {
            const themeColors = getThemeColors();
            colorContainer.innerHTML = themeColors.map(color => `
                <div class="ccv-theme-option ${config.color === color.id ? 'active' : ''} ${color.isCustom ? 'ccv-custom-color' : ''}" 
                     data-color="${color.id}" ${color.isCustom ? 'data-custom="true"' : ''}>
                    <div class="preview" style="background: ${color.preview}"></div>
                    <span class="name">${color.name}</span>
                    ${color.isCustom ? `<button class="ccv-color-edit" data-edit-color="${color.id}">${icons.edit}</button>` : ''}
                </div>
            `).join('') + `
                <div class="ccv-theme-option ccv-add-color" data-action="add-custom-color">
                    <div class="preview">${icons.add}</div>
                    <span class="name">Custom</span>
                </div>
            `;
            
            colorContainer.querySelectorAll('.ccv-color-edit').forEach(btn => {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    const colorId = btn.dataset.editColor;
                    const customColor = config.customColors.find(c => c.id === colorId);
                    if (customColor) showCustomColorModal(customColor);
                };
            });
            
            colorContainer.querySelectorAll('.ccv-custom-color').forEach(el => {
                el.oncontextmenu = (e) => {
                    const colorId = el.dataset.color;
                    const customColor = config.customColors.find(c => c.id === colorId);
                    if (!customColor) return;
                    
                    showContextMenu(e, [
                        { icon: icons.check, label: t('Apply'), action: () => {
                            config.color = customColor.id;
                            applyTheme();
                            saveConfig();
                            renderThemeGrid();
                        }},
                        { separator: true },
                        { icon: icons.edit, label: t('Edit'), action: () => showCustomColorModal(customColor) },
                        { icon: icons.delete, label: t('Delete'), danger: true, action: () => {
                            showDeleteConfirmation(t('Color'), customColor.name, () => {
                                config.customColors = config.customColors.filter(c => c.id !== customColor.id);
                                if (config.color === customColor.id) {
                                    config.color = 'default';
                                    applyTheme();
                                }
                                saveConfig();
                                renderThemeGrid();
                                showToast(t('Color deleted'));
                            });
                        }}
                    ]);
                };
            });
        }

        if (layoutContainer) {
            layoutContainer.innerHTML = compactLayouts.map(layout => `
                <div class="ccv-theme-option ccv-layout-option ${config.compactLayout === layout.id ? 'active' : ''}" data-layout="${layout.id}">
                    <div class="preview">${layout.icon}</div>
                    <span class="name">${layout.name}</span>
                </div>
            `).join('');
        }
    };

    const showCustomColorModal = (customColor = null) => {
        const isEdit = !!customColor;
        
        const content = `
            <div class="ccv-input-group">
                <label class="ccv-input-label">${t('Name')}</label>
                <input type="text" class="ccv-input" id="ccv-custom-color-name" value="${customColor?.name || ''}" placeholder="My Color">
            </div>
            <div class="ccv-input-group">
                <label class="ccv-input-label">${t('Color')}</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="color" id="ccv-custom-color-value" value="${customColor?.color || '#6366f1'}" style="width: 50px; height: 36px; border: none; border-radius: 6px; cursor: pointer;">
                    <input type="text" class="ccv-input" id="ccv-custom-color-hex" value="${customColor?.color || '#6366f1'}" placeholder="#6366f1" style="flex: 1; font-family: monospace;">
                </div>
            </div>
        `;

        const modal = createModal(isEdit ? t('Edit Color') : t('Add Color'), content, () => {
            const name = document.getElementById('ccv-custom-color-name').value.trim();
            const color = document.getElementById('ccv-custom-color-value').value;
            
            if (!name) {
                showToast(t('Please enter a name'));
                return false;
            }

            if (!config.customColors) config.customColors = [];

            if (isEdit) {
                const idx = config.customColors.findIndex(c => c.id === customColor.id);
                if (idx !== -1) {
                    config.customColors[idx] = { ...config.customColors[idx], name, color };
                }
                showToast(t('Color updated'));
            } else {
                const id = 'custom_' + generateId();
                config.customColors.push({ id, name, color });
                showToast(t('Color added'));
            }
            
            saveConfig();
            renderThemeGrid();
            
            if (isEdit && config.color === customColor.id) {
                applyTheme();
            }
            
            return true;
        }, isEdit ? () => {
            config.customColors = config.customColors.filter(c => c.id !== customColor.id);
            if (config.color === customColor.id) {
                config.color = 'default';
                applyTheme();
            }
            saveConfig();
            renderThemeGrid();
            showToast(t('Color deleted'));
        } : null);

        const colorPicker = modal.querySelector('#ccv-custom-color-value');
        const hexInput = modal.querySelector('#ccv-custom-color-hex');
        
        colorPicker.oninput = () => {
            hexInput.value = colorPicker.value;
        };
        
        hexInput.oninput = () => {
            if (/^#[0-9A-Fa-f]{6}$/.test(hexInput.value)) {
                colorPicker.value = hexInput.value;
            }
        };
    };

    const showWebshopThemeModal = (theme = null) => {
        const isEdit = !!theme;
        
        const content = `
            <div class="ccv-input-group">
                <label class="ccv-input-label">${t('Name')}</label>
                <input type="text" class="ccv-input" id="ccv-theme-name" placeholder="e.g. Oliver" value="${theme?.name || ''}">
            </div>
            <div class="ccv-input-group">
                <label class="ccv-input-label">${t('Theme ID')} (case-sensitive)</label>
                <input type="text" class="ccv-input" id="ccv-theme-id" placeholder="e.g. oliver" value="${theme?.id || ''}" ${isEdit ? 'disabled' : ''}>
            </div>
            <div class="ccv-input-group">
                <label class="ccv-input-label">${t('Color')}</label>
                <input type="color" class="ccv-input ccv-input-color" id="ccv-theme-color" value="${theme?.color || '#6366f1'}">
            </div>
        `;

        const modal = createModal(isEdit ? t('Edit Theme') : t('Add Theme'), content, () => {
            const name = document.getElementById('ccv-theme-name').value.trim();
            const id = document.getElementById('ccv-theme-id').value.trim();
            const color = document.getElementById('ccv-theme-color').value;

            if (!name || !id) {
                showToast(t('Please fill in all fields'));
                return;
            }

            if (isEdit) {
                const index = config.webshopThemes.findIndex(t => t.id === theme.id);
                if (index !== -1) {
                    config.webshopThemes[index] = { ...config.webshopThemes[index], name, color };
                }
                showToast(t('Theme updated'));
            } else {
                if (config.webshopThemes.some(t => t.id === id)) {
                    showToast(t('Theme ID already exists'));
                    return;
                }
                config.webshopThemes.push({ id, name, color });
                showToast(t('Theme added'));
            }
            
            saveConfig();
            renderWebshopThemes();
            modal.remove();
        }, isEdit ? () => {
            config.webshopThemes = config.webshopThemes.filter(t => t.id !== theme.id);
            saveConfig();
            renderWebshopThemes();
            modal.remove();
            showToast('Theme deleted');
        } : null);
    };

    const renderWebshopThemes = () => {
        const container = document.getElementById('ccv-webshop-themes');
        if (!container) return;

        container.innerHTML = config.webshopThemes.map((theme, index) => `
            <div class="ccv-webshop-theme-btn" data-webshop-theme="${theme.id}" data-theme-index="${index}">
                <span class="ccv-webshop-drag">${icons.menu}</span>
                <span class="ccv-webshop-color" style="background: ${theme.color}"></span>
                <span class="ccv-webshop-name">${theme.name}</span>
            </div>
        `).join('');

        let draggedElement = null;
        let wasDragged = false;

        container.querySelectorAll('.ccv-webshop-theme-btn').forEach(btn => {
            btn.draggable = true;
            
            btn.ondragstart = (e) => {
                draggedElement = btn;
                wasDragged = true;
                setTimeout(() => btn.classList.add('dragging'), 0);
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', '');
            };

            btn.ondragend = () => {
                btn.classList.remove('dragging');
                draggedElement = null;
                setTimeout(() => wasDragged = false, 100);
                
                const newOrder = [];
                container.querySelectorAll('.ccv-webshop-theme-btn').forEach(item => {
                    const theme = config.webshopThemes.find(t => t.id === item.dataset.webshopTheme);
                    if (theme) newOrder.push(theme);
                });
                config.webshopThemes = newOrder;
                saveConfig();
                
                container.querySelectorAll('.ccv-webshop-theme-btn').forEach((item, idx) => {
                    item.dataset.themeIndex = idx;
                });
            };

            btn.ondragover = (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                if (!draggedElement || draggedElement === btn) return;
                
                const items = [...container.querySelectorAll('.ccv-webshop-theme-btn')];
                const draggedIdx = items.indexOf(draggedElement);
                const targetIdx = items.indexOf(btn);
                
                if (draggedIdx < targetIdx) {
                    btn.parentNode.insertBefore(draggedElement, btn.nextSibling);
                } else {
                    btn.parentNode.insertBefore(draggedElement, btn);
                }
            };

            btn.ondrop = (e) => {
                e.preventDefault();
                e.stopPropagation();
            };

            btn.onclick = (e) => {
                if (wasDragged) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                switchWebshopTheme(btn.dataset.webshopTheme);
            };
            
            btn.oncontextmenu = (e) => {
                const theme = config.webshopThemes.find(t => t.id === btn.dataset.webshopTheme);
                if (!theme) return;
                
                showContextMenu(e, [
                    { icon: icons.palette, label: t('Apply theme'), action: () => switchWebshopTheme(theme.id) },
                    { separator: true },
                    { icon: icons.edit, label: t('Edit'), action: () => showWebshopThemeModal(theme) },
                    { icon: icons.delete, label: t('Delete'), danger: true, action: () => {
                        showDeleteConfirmation(t('Theme'), theme.name, () => {
                            config.webshopThemes = config.webshopThemes.filter(t => t.id !== theme.id);
                            saveConfig();
                            renderWebshopThemes();
                            showToast(t('Theme deleted'));
                        });
                    }}
                ]);
            };
        });
    };

    const applyTheme = () => {
        const mode = config.mode;
        const isCustomColor = config.color?.startsWith('custom_');
        const color = config.color === 'default' ? '' : (isCustomColor ? '' : config.color);
        
        let customColorValue = null;
        if (isCustomColor && config.customColors) {
            const customColor = config.customColors.find(c => c.id === config.color);
            if (customColor) {
                customColorValue = customColor.color;
            }
        }
        
        const applyToElement = (el) => {
            if (!el) return;
            el.setAttribute('data-mode', mode);
            el.setAttribute('data-color', color);
            
            if (customColorValue) {
                el.style.setProperty('--ccv-accent', customColorValue);
                el.style.setProperty('--ccv-accent-glow', customColorValue + '4d');
            } else {
                el.style.removeProperty('--ccv-accent');
                el.style.removeProperty('--ccv-accent-glow');
            }
        };
        
        applyToElement(elements.toolbar);
        applyToElement(elements.toggleBtn);
        
        document.querySelectorAll('.ccv-modal-overlay').forEach(applyToElement);
        document.querySelectorAll('.ccv-toast').forEach(applyToElement);
        document.querySelectorAll('.ccv-context-menu').forEach(applyToElement);
    };

    const setMode = (modeId) => {
        config.mode = modeId;
        applyTheme();
        saveConfig();
        renderThemeGrid();
    };

    const setColor = (colorId) => {
        config.color = colorId;
        applyTheme();
        saveConfig();
        renderThemeGrid();
    };

    const constrainPosition = () => {
        if (!elements.toolbar) return;
        const rect = elements.toolbar.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;
        const x = Math.max(0, Math.min(maxX, config.position.x));
        const y = Math.max(0, Math.min(maxY, config.position.y));
        elements.toolbar.style.left = `${x}px`;
        elements.toolbar.style.top = `${y}px`;
    };

    const setupDrag = (header) => {
        if (!header) return;
        header.onmousedown = (e) => {
            if (e.target.closest('.ccv-btn-icon') || e.target.closest('.ccv-compact-btn') || e.target.closest('.ccv-circle-btn') || e.target.closest('.ccv-horizontal-btn') || e.target.closest('.ccv-minimal-btn')) return;
            isDragging = true;
            dragOffset = {
                x: e.clientX - elements.toolbar.offsetLeft,
                y: e.clientY - elements.toolbar.offsetTop
            };
            document.body.style.userSelect = 'none';
        };
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const x = Math.max(0, Math.min(window.innerWidth - elements.toolbar.offsetWidth, e.clientX - dragOffset.x));
        const y = Math.max(0, Math.min(window.innerHeight - elements.toolbar.offsetHeight, e.clientY - dragOffset.y));
        elements.toolbar.style.left = `${x}px`;
        elements.toolbar.style.top = `${y}px`;
        config.position = { x, y };
    };

    const handleMouseUp = () => {
        if (isDragging) {
            isDragging = false;
            document.body.style.userSelect = '';
            saveConfig();
        }
    };

    const handleClick = (e) => {
        const action = e.target.closest('[data-action]')?.dataset.action;
        const tab = e.target.closest('[data-tab]')?.dataset.tab;
        const domainId = e.target.closest('[data-domain-id]')?.dataset.domainId;
        const urlId = e.target.closest('[data-url-id]')?.dataset.urlId;
        const id = e.target.closest('[data-id]')?.dataset.id;

        if (tab) {
            elements.toolbar.querySelectorAll('.ccv-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
            elements.toolbar.querySelectorAll('.ccv-tab-content').forEach(c => c.classList.toggle('active', c.dataset.content === tab));
            return;
        }


        const themeOption = e.target.closest('.ccv-theme-option');
        if (themeOption) {
            if (themeOption.dataset.mode) {
                setMode(themeOption.dataset.mode);
                return;
            }
            if (themeOption.dataset.color) {
                setColor(themeOption.dataset.color);
                return;
            }
            if (themeOption.dataset.layout) {
                config.compactLayout = themeOption.dataset.layout;
                saveConfig();
                elements.toolbar.querySelectorAll('.ccv-layout-option').forEach(o => o.classList.toggle('active', o.dataset.layout === themeOption.dataset.layout));
                return;
            }
            if (themeOption.dataset.initialView) {
                config.initialView = themeOption.dataset.initialView;
                saveConfig();
                elements.toolbar.querySelectorAll('[data-initial-view]').forEach(o => o.classList.toggle('active', o.dataset.initialView === themeOption.dataset.initialView));
                return;
            }
            if (themeOption.dataset.language) {
                const newLang = themeOption.dataset.language;
                if (newLang !== config.language) {
                    config.language = newLang;
                    saveConfig();
                    loadTranslations(newLang).then(() => render());
                }
                return;
            }
        }


        if (urlId && !action && !e.target.closest('.ccv-url-actions')) {
            const url = config.urls.find(u => u.id === urlId);
            if (url) navigateUrl(url.url, window.location.origin);
            return;
        }

        if (domainId && !action && !e.target.closest('.ccv-domain-actions')) {
            const domain = config.domains.find(d => d.id === domainId);
            if (domain) navigateUrl(domain.url);
            return;
        }

        switch (action) {
            case 'collapse':
                config.expanded = false;
                saveConfig();
                render();
                break;
            case 'expand':
                config.expanded = true;
                saveConfig();
                render();
                break;
            case 'hide':
                config.visible = false;
                saveConfig();
                elements.toolbar.classList.add('hidden');
                elements.toggleBtn.classList.add('visible');
                break;
            case 'show':
                config.visible = true;
                config.expanded = config.initialView !== 'compact';
                saveConfig();
                elements.toolbar.classList.remove('hidden');
                render();
                elements.toggleBtn.classList.remove('visible');
                break;
            case 'add-domain':
                showDomainModal();
                break;
            case 'edit-domain':
                const editDomain = config.domains.find(d => d.id === id);
                if (editDomain) showDomainModal(editDomain);
                break;
            case 'delete-domain':
                config.domains = config.domains.filter(d => d.id !== id);
                saveConfig();
                render();
                showToast(t('Domain deleted'));
                break;
            case 'copy-domain':
                const copyDomain = config.domains.find(d => d.id === id);
                if (copyDomain) copyToClipboard(copyDomain.url);
                break;
            case 'open-domain':
                const openDomain = config.domains.find(d => d.id === id);
                if (openDomain) openUrlNewTab(openDomain.url);
                break;
            case 'add-url':
                showUrlModal();
                break;
            case 'edit-url':
                const editUrl = config.urls.find(u => u.id === id);
                if (editUrl) showUrlModal(editUrl);
                break;
            case 'delete-url':
                config.urls = config.urls.filter(u => u.id !== id);
                saveConfig();
                render();
                showToast(t('URL deleted'));
                break;
            case 'copy-url':
                const copyUrl = config.urls.find(u => u.id === id);
                if (copyUrl) {
                    copyToClipboard(`${window.location.origin}${copyUrl.url}`);
                }
                break;
            case 'open-url':
                const openUrlItem = config.urls.find(u => u.id === id);
                if (openUrlItem) openUrlNewTab(openUrlItem.url, window.location.origin);
                break;
            case 'export':
                exportConfig();
                break;
            case 'import':
                importConfig();
                break;
            case 'clear-cookies':
                clearCookiePreferences();
                break;
            case 'add-custom-color':
                showCustomColorModal();
                break;
            case 'add-webshop-theme':
                showWebshopThemeModal();
                break;
            case 'check-updates':
                checkForUpdates();
                break;
            case 'save-defaults':
                saveDefaultsToCookie();
                break;
            case 'reset':
                showResetConfirmation();
                break;
        }
    };

    const showDeleteConfirmation = (itemType, itemName, onConfirm) => {
        const content = `
            <p style="margin: 0 0 12px 0; color: var(--ccv-text);">${t('Are you sure you want to delete')} "${itemName}"?</p>
            <p style="margin: 0; color: var(--ccv-text-muted); font-size: 11px;">${t('This action cannot be undone.')}</p>
        `;

        const modal = createModal(`${t('Delete')} ${itemType}`, content, () => {
            onConfirm();
            return true;
        });

        const saveBtn = modal.querySelector('[data-action="save-modal"]');
        saveBtn.textContent = t('Delete');
        saveBtn.classList.remove('primary');
        saveBtn.classList.add('danger');
    };

    const showResetConfirmation = () => {
        const content = `
            <p style="margin: 0 0 12px 0; color: var(--ccv-text);">${t('Are you sure you want to reset all settings to default?')}</p>
            <p style="margin: 0; color: var(--ccv-text-muted); font-size: 11px;">${t('This will remove all your domains, URLs, webshop themes, and preferences. This action cannot be undone.')}</p>
        `;

        const modal = createModal(t('Reset Configuration'), content, () => {
            localStorage.removeItem('ccv-toolbar-config');
            config = { ...defaultConfig };
            applyTheme();
            render();
            showToast(t('Configuration reset to default'));
            return true;
        });

        const saveBtn = modal.querySelector('[data-action="save-modal"]');
        saveBtn.textContent = t('Reset');
        saveBtn.classList.remove('primary');
        saveBtn.classList.add('danger');
    };

    const render = () => {
        const existingPanel = elements.toolbar.querySelector('.ccv-panel');
        if (existingPanel) existingPanel.remove();

        elements.toolbar.classList.remove('ccv-compact', 'ccv-compact-default', 'ccv-compact-circles', 'ccv-compact-horizontal', 'ccv-compact-minimal');
        
        if (!config.expanded) {
            elements.toolbar.classList.add('ccv-compact', `ccv-compact-${config.compactLayout}`);
        }

        const panel = config.expanded ? createExpandedPanel() : createCompactPanel();
        elements.toolbar.appendChild(panel);

        const dragTarget = panel.querySelector('.ccv-header') || panel.querySelector('.ccv-compact-minimal');
        if (dragTarget) setupDrag(dragTarget);

        if (config.expanded) {
            renderDomainsList();
            renderUrlsList();
            renderThemeGrid();
            renderWebshopThemes();
        }

        setupTooltips(elements.toolbar);
        requestAnimationFrame(constrainPosition);
    };

    const init = async () => {
        loadConfig();
        await loadTranslations(config.language);

        const shouldBeHidden = config.initialView === 'hidden' || !config.visible;
        config.expanded = config.initialView !== 'compact';

        elements.toolbar = document.createElement('div');
        elements.toolbar.id = 'ccv-toolbar';
        elements.toolbar.style.left = `${config.position.x}px`;
        elements.toolbar.style.top = `${config.position.y}px`;
        if (shouldBeHidden) elements.toolbar.classList.add('hidden');

        elements.toggleBtn = document.createElement('button');
        elements.toggleBtn.className = `ccv-toggle-btn ${shouldBeHidden ? 'visible' : ''}`;
        elements.toggleBtn.innerHTML = icons.logo;
        elements.toggleBtn.onclick = () => handleClick({ target: { closest: (s) => s === '[data-action]' ? { dataset: { action: 'show' } } : null } });

        document.body.appendChild(elements.toolbar);
        document.body.appendChild(elements.toggleBtn);

        applyTheme();

        render();

        elements.toolbar.addEventListener('click', handleClick);
        elements.toolbar.addEventListener('change', (e) => {
            if (e.target.id === 'ccv-uses-default-config') {
                config.usesDefaultConfig = e.target.checked;
                saveConfig();
                
                const updateDefaultsStatus = () => {
                    const hasDefaults = getDefaultsFromCookie() !== null;
                    
                    const statusContainer = elements.toolbar.querySelector('.ccv-defaults-card .ccv-defaults-status');
                    if (statusContainer) {
                        if (!hasDefaults) {
                            statusContainer.className = 'ccv-defaults-status ccv-defaults-none';
                            statusContainer.innerHTML = `${icons.info}<span>${t('No defaults saved yet')}</span>`;
                        } else if (config.usesDefaultConfig) {
                            statusContainer.className = 'ccv-defaults-status ccv-defaults-match';
                            statusContainer.innerHTML = `${icons.check}<span>${t('Using synced defaults')}</span>`;
                        } else {
                            statusContainer.className = 'ccv-defaults-status ccv-defaults-different';
                            statusContainer.innerHTML = `${icons.alert}<span>${t('Custom settings for this domain')}</span>`;
                        }
                    }
                    
                    const headerIcon = elements.toolbar.querySelector('.ccv-config-status');
                    if (headerIcon) {
                        if (!hasDefaults) {
                            headerIcon.className = 'ccv-config-status ccv-config-none';
                            headerIcon.dataset.tooltip = t('No defaults saved');
                            headerIcon.innerHTML = icons.info;
                        } else if (config.usesDefaultConfig) {
                            headerIcon.className = 'ccv-config-status ccv-config-synced';
                            headerIcon.dataset.tooltip = t('Synced with defaults');
                            headerIcon.innerHTML = icons.check;
                        } else {
                            headerIcon.className = 'ccv-config-status ccv-config-custom';
                            headerIcon.dataset.tooltip = t('Custom config');
                            headerIcon.innerHTML = icons.alert;
                        }
                    }
                };
                
                if (config.usesDefaultConfig) {
                    const defaults = getDefaultsFromCookie();
                    if (defaults) {
                        config.mode = defaults.mode ?? config.mode;
                        config.color = defaults.color ?? config.color;
                        config.compactLayout = defaults.compactLayout ?? config.compactLayout;
                        config.initialView = defaults.initialView ?? config.initialView;
                        config.customColors = defaults.customColors ?? config.customColors;
                        config.position = defaults.position ?? config.position;
                        saveConfig();
                        applyTheme();
                        renderThemeGrid();
                        updateDefaultsStatus();
                        showToast(t('Now using default config'));
                    } else {
                        showToast(t('No defaults saved yet - save defaults first'));
                        updateDefaultsStatus();
                    }
                } else {
                    updateDefaultsStatus();
                    showToast(t('Using custom config for this domain'));
                }
            }
        });
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('resize', constrainPosition);
    };

    init();

    return { init, showToast };
})();
