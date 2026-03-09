/**
 * Export Compound Products – generate a CSV export of compound products and their child products
 * in the same format as the shop product export (tab-separated, double-quoted fields).
 *
 * To add more: add an entry to PRODUCT_REGISTRY and the product name to the export list.
 */

(function () {
    'use strict';

    const SCRIPT_SETTINGS_KEY_PREFIX = 'ccv-script-settings:';

    // CSV column headers matching shop product export (Export (6).csv)
    const CSV_HEADERS = [
        'Naam', 'Artikelnummer', 'EAN Nummer', 'MPN Nummer', 'Gewicht', 'Omschrijving', 'Specificatie',
        'Categorie ID', 'Prijs', 'Inkoopprijs', 'btw-percentage', 'Verkocht Per', 'Voorraad', 'Merk', 'Staat',
        'Hoofdcategorie', 'Subcategorie', 'Trefwoorden', 'Verpakking', 'TradeTrackerId', 'HoofdImage',
        'Aantal Verkocht', 'Korting', 'Locatie', 'Leverancier',
        'Vaste Staffels', 'Staffel aantal 1', 'Staffel prijs 1', 'Staffel korting 1', 'Staffel aantal 2', 'Staffel prijs 2', 'Staffel korting 2',
        'Staffel aantal 3', 'Staffel prijs 3', 'Staffel korting 3', 'Staffel aantal 4', 'Staffel prijs 4', 'Staffel korting 4',
        'Staffel aantal 5', 'Staffel prijs 5', 'Staffel korting 5',
        'Aantal decimalen', 'Minimale Afname Product', 'Pagina titel', 'Meta sleutelwoorden', 'Meta beschrijving', 'SEO Alias',
        'Image 2', 'Image 2 Alt tekst', 'Image 3', 'Image 3 Alt tekst', 'Image 4', 'Image 4 Alt tekst',
        'Spaarpunten', 'Korte Omschrijving', 'HoofdImage Alt tekst', 'Actief', 'Levertijd', 'Google Shopping Categorie', 'Multishop Product',
        'Borg', 'Statiegeld', 'Btw-tarief', 'Meenemen in exportbestand', 'Memo voor intern gebruik',
        'Upload (1)', 'Upload naam (1)', 'Upload (2)', 'Upload naam (2)', 'Upload (3)', 'Upload naam (3)', 'Upload (4)', 'Upload naam (4)',
        'Leeftijdsverificatie', 'Grootboek naam', 'Grootboek code'
    ];

    function csvEscape(val) {
        let s = (val === undefined || val === null) ? '' : String(val);
        if (/["\t\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
        else if (s.length > 0) s = '"' + s + '"';
        return s;
    }

    function formatPrice(price) {
        return Number(price) == null || isNaN(Number(price)) ? '0,00' : Number(price).toFixed(2).replace('.', ',');
    }

    function getBaseUrl() {
        if (typeof window === 'undefined' || !window.location) return '';
        const origin = window.location.origin || '';
        const pathname = window.location.pathname || '';
        const prefix = pathname.indexOf('/onderhoud') !== -1 ? '/onderhoud' : '';
        return origin + prefix;
    }

    /** Return a random placeholder image URL for CSV HoofdImage (same seed = same image per photoId). */
    function getPhotoUrl(photoId) {
        if (!photoId) return '';
        return 'https://picsum.photos/seed/' + String(photoId) + '/800/800';
    }

    function getAddCompoundProductUrl() {
        return getBaseUrl() + '/AdminItems/ProductManagement/AddCompoundProduct.php?AdminItem=4';
    }
    function getAddProductUrl() {
        return getBaseUrl() + '/AdminItems/ProductManagement/AddProduct.php?AdminItem=4';
    }

    function getSettingsLanguagesUrl() {
        return getBaseUrl() + '/AdminItems/Settings/ShowSettings.php?SettingsCat=200&AdminItem=7&Mode=Modify';
    }

    /**
     * Fetch shop settings page and parse enabled languages from #MultiLanguageTable (checked select_language checkboxes).
     * @returns {Promise<string[]>} e.g. ['nl', 'de'] or ['nl', 'de', 'en']
     */
    function getEnabledShopLanguages() {
        const url = getSettingsLanguagesUrl();
        return fetch(url, { credentials: 'same-origin', cache: 'no-store' })
            .then(function (res) { return res.text(); })
            .then(function (html) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const table = doc.getElementById('MultiLanguageTable');
                if (!table) return ['nl', 'de'];
                const inputs = table.querySelectorAll('input.select_language');
                const langs = [];
                for (let i = 0; i < inputs.length; i++) {
                    const input = inputs[i];
                    if (input.getAttribute('checked') !== null && input.getAttribute('checked') !== 'false' || input.checked) {
                        const code = (input.getAttribute('id') || input.getAttribute('value') || input.name.replace('Language_', '') || '').trim();
                        if (code) langs.push(code);
                    }
                }
                return langs.length > 0 ? langs : ['nl', 'de'];
            })
            .catch(function () { return ['nl', 'de']; });
    }

    const DEFAULT_LANGUAGE_TEMPLATES = {
        nl: { name: 'Eigen X samenstellen', short: 'Stel je eigen X samen', desc: 'Je kan hier je eigen X samenstellen.' },
        de: { name: 'Eigen X zusammenstellen', short: 'Stell deinen eigenen X zusammen', desc: 'Hier kannst du deinen eigenen X zusammenstellen.' },
        en: { name: 'Configure your X', short: 'Build your own X', desc: 'Configure and order your X here.' },
        fr: { name: 'Composez votre X', short: 'Composez votre X', desc: 'Composez votre X ici.' },
        tr: { name: 'X oluşturun', short: 'Kendi X oluşturun', desc: 'Burada X oluşturabilirsiniz.' },
        it: { name: 'Configura il tuo X', short: 'Configura il tuo X', desc: 'Configura qui il tuo X.' },
        es: { name: 'Configura tu X', short: 'Configura tu X', desc: 'Configura aquí tu X.' },
        dk: { name: 'Sammenlæg din X', short: 'Byg din egen X', desc: 'Sammenlæg din X her.' }
    };

    function generateDisplayNames(productName, enabledLangs) {
        if (!enabledLangs || enabledLangs.length === 0) enabledLangs = ['nl', 'de'];
        const slug = String(productName).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
        const X = productName;
        const name = {};
        const short = {};
        const desc = {};
        for (let i = 0; i < enabledLangs.length; i++) {
            const code = enabledLangs[i];
            const t = DEFAULT_LANGUAGE_TEMPLATES[code] || DEFAULT_LANGUAGE_TEMPLATES.en || DEFAULT_LANGUAGE_TEMPLATES.nl;
            name[code] = (t.name || '').replace(/X/g, X);
            short[code] = (t.short || '').replace(/X/g, X);
            desc[code] = (t.desc || '').replace(/X/g, X);
        }
        return { productNumber: productName, aliasSlug: slug || productName, name: name, short: short, desc: desc };
    }

    const COMPOUND_ELEMENTS_PC = '[{"Id":754,"SystemId":null,"ProductId":878057041,"Title":"<lng><nl><![CDATA[RAM]]><\\/nl><de><![CDATA[RAM]]><\\/de><\\/lng>","Required":1,"Multiselect":0,"Minimum":null,"Maximum":null,"View":"BLOCK","Position":1,"Title_Value":"RAM","Items":[{"Id":868,"SystemId":null,"ElementId":754,"Type":"PRODUCT","Position":1,"Data":{"Id":869,"SystemId":null,"ItemId":868,"ProductId":878057015,"Minimum":1,"Maximum":2,"Discount":null,"DiscountType":"PERCENTAGE","Selected":1,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":0,"Minimum_Format":1,"Maximum_Format":2,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}},{"Id":869,"SystemId":null,"ElementId":754,"Type":"PRODUCT","Position":2,"Data":{"Id":870,"SystemId":null,"ItemId":869,"ProductId":878057018,"Minimum":1,"Maximum":2,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":0,"Minimum_Format":1,"Maximum_Format":2,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}},{"Id":877,"SystemId":null,"ElementId":754,"Type":"PRODUCT","Position":3,"Data":{"Id":878,"SystemId":null,"ItemId":877,"ProductId":878057073,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}},{"Id":879,"SystemId":null,"ElementId":754,"Type":"PRODUCT","Position":4,"Data":{"Id":880,"SystemId":null,"ItemId":879,"ProductId":878057074,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}}]},{"Id":760,"SystemId":null,"ProductId":878057041,"Title":"<lng><nl><![CDATA[CPU]]><\\/nl><de><![CDATA[CPU]]><\\/de><\\/lng>","Required":1,"Multiselect":0,"Minimum":null,"Maximum":null,"View":"LIST","Position":2,"Title_Value":"CPU","Items":[{"Id":881,"SystemId":null,"ElementId":760,"Type":"PRODUCT","Position":1,"Data":{"Id":882,"SystemId":null,"ItemId":881,"ProductId":878057254,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}},{"Id":882,"SystemId":null,"ElementId":760,"Type":"PRODUCT","Position":2,"Data":{"Id":883,"SystemId":null,"ItemId":882,"ProductId":878057253,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}},{"Id":883,"SystemId":null,"ElementId":760,"Type":"PRODUCT","Position":3,"Data":{"Id":884,"SystemId":null,"ItemId":883,"ProductId":878057255,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}},{"Id":884,"SystemId":null,"ElementId":760,"Type":"PRODUCT","Position":4,"Data":{"Id":885,"SystemId":null,"ItemId":884,"ProductId":878057256,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}}]},{"Id":756,"SystemId":null,"ProductId":878057041,"Title":"<lng><nl><![CDATA[Motherboards]]><\\/nl><de><![CDATA[Motherboards]]><\\/de><\\/lng>","Required":1,"Multiselect":0,"Minimum":null,"Maximum":null,"View":"BLOCK","Position":3,"Title_Value":"Motherboards","Items":[{"Id":872,"SystemId":null,"ElementId":756,"Type":"PRODUCT","Position":1,"Data":{"Id":873,"SystemId":null,"ItemId":872,"ProductId":878057068,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}},{"Id":873,"SystemId":null,"ElementId":756,"Type":"PRODUCT","Position":2,"Data":{"Id":874,"SystemId":null,"ItemId":873,"ProductId":878057069,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}}]},{"Id":757,"SystemId":null,"ProductId":878057041,"Title":"<lng><nl><![CDATA[Storage]]><\\/nl><de><![CDATA[Storage]]><\\/de><\\/lng>","Required":1,"Multiselect":1,"Minimum":2,"Maximum":null,"View":"BLOCK","Position":4,"Title_Value":"Storage","Items":[{"Id":874,"SystemId":null,"ElementId":757,"Type":"PRODUCT","Position":1,"Data":{"Id":875,"SystemId":null,"ItemId":874,"ProductId":878057070,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}},{"Id":878,"SystemId":null,"ElementId":757,"Type":"PRODUCT","Position":2,"Data":{"Id":879,"SystemId":null,"ItemId":878,"ProductId":878057074,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}},{"Id":880,"SystemId":null,"ElementId":757,"Type":"PRODUCT","Position":3,"Data":{"Id":881,"SystemId":null,"ItemId":880,"ProductId":878057075,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}}]},{"Id":755,"SystemId":null,"ProductId":878057041,"Title":"<lng><nl><![CDATA[GPU]]><\\/nl><de><![CDATA[GPU]]><\\/de><\\/lng>","Required":1,"Multiselect":0,"Minimum":null,"Maximum":null,"View":"LIST","Position":5,"Title_Value":"GPU","Items":[{"Id":870,"SystemId":null,"ElementId":755,"Type":"PRODUCT","Position":1,"Data":{"Id":871,"SystemId":null,"ItemId":870,"ProductId":878057020,"Minimum":6,"Maximum":6,"Discount":null,"DiscountType":"PERCENTAGE","Selected":1,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":"6,00","Maximum_Format":"6,00","Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}},{"Id":871,"SystemId":null,"ElementId":755,"Type":"PRODUCT","Position":2,"Data":{"Id":872,"SystemId":null,"ItemId":871,"ProductId":878057067,"Minimum":6,"Maximum":6,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":"6,00","Maximum_Format":"6,00","Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}}]},{"Id":758,"SystemId":null,"ProductId":878057041,"Title":"<lng><nl><![CDATA[Power Supplies]]><\\/nl><de><![CDATA[Power Supplies]]><\\/de><\\/lng>","Required":1,"Multiselect":0,"Minimum":null,"Maximum":null,"View":"LIST","Position":6,"Title_Value":"Power Supplies","Items":[{"Id":875,"SystemId":null,"ElementId":758,"Type":"PRODUCT","Position":1,"Data":{"Id":876,"SystemId":null,"ItemId":875,"ProductId":878057071,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}}]},{"Id":759,"SystemId":null,"ProductId":878057041,"Title":"<lng><nl><![CDATA[Cooling]]><\\/nl><de><![CDATA[Cooling]]><\\/de><\\/lng>","Required":1,"Multiselect":0,"Minimum":null,"Maximum":null,"View":"BLOCK","Position":7,"Title_Value":"Cooling","Items":[{"Id":876,"SystemId":null,"ElementId":759,"Type":"PRODUCT","Position":1,"Data":{"Id":877,"SystemId":null,"ItemId":876,"ProductId":878057072,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}}]}]';

    // Toyota Supra: Bodies, Horse power, Colors, Wheels (placeholder product IDs 878057100+; create these products in admin or replace IDs)
    const COMPOUND_ELEMENTS_CAR = '[{"Id":810,"SystemId":null,"ProductId":878057042,"Title":"<lng><nl><![CDATA[Karrosserie]]><\\/nl><de><![CDATA[Karrosserie]]><\\/de><\\/lng>","Required":1,"Multiselect":0,"Minimum":null,"Maximum":null,"View":"BLOCK","Position":1,"Title_Value":"Bodies","Items":[{"Id":901,"SystemId":null,"ElementId":810,"Type":"PRODUCT","Position":1,"Data":{"Id":902,"SystemId":null,"ItemId":901,"ProductId":878057100,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":1,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}},{"Id":902,"SystemId":null,"ElementId":810,"Type":"PRODUCT","Position":2,"Data":{"Id":903,"SystemId":null,"ItemId":902,"ProductId":878057101,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}},{"Id":903,"SystemId":null,"ElementId":810,"Type":"PRODUCT","Position":3,"Data":{"Id":904,"SystemId":null,"ItemId":903,"ProductId":878057102,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}}]},{"Id":811,"SystemId":null,"ProductId":878057042,"Title":"<lng><nl><![CDATA[Vermogen / PK]]><\\/nl><de><![CDATA[Leistung / PS]]><\\/de><\\/lng>","Required":1,"Multiselect":0,"Minimum":null,"Maximum":null,"View":"LIST","Position":2,"Title_Value":"Horse power","Items":[{"Id":911,"SystemId":null,"ElementId":811,"Type":"PRODUCT","Position":1,"Data":{"Id":912,"SystemId":null,"ItemId":911,"ProductId":878057110,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":1,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}},{"Id":912,"SystemId":null,"ElementId":811,"Type":"PRODUCT","Position":2,"Data":{"Id":913,"SystemId":null,"ItemId":912,"ProductId":878057111,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}},{"Id":913,"SystemId":null,"ElementId":811,"Type":"PRODUCT","Position":3,"Data":{"Id":914,"SystemId":null,"ItemId":913,"ProductId":878057112,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}}]},{"Id":812,"SystemId":null,"ProductId":878057042,"Title":"<lng><nl><![CDATA[Kleur]]><\\/nl><de><![CDATA[Farbe]]><\\/de><\\/lng>","Required":1,"Multiselect":0,"Minimum":null,"Maximum":null,"View":"BLOCK","Position":3,"Title_Value":"Colors","Items":[{"Id":921,"SystemId":null,"ElementId":812,"Type":"PRODUCT","Position":1,"Data":{"Id":922,"SystemId":null,"ItemId":921,"ProductId":878057120,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":1,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}},{"Id":922,"SystemId":null,"ElementId":812,"Type":"PRODUCT","Position":2,"Data":{"Id":923,"SystemId":null,"ItemId":922,"ProductId":878057121,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}},{"Id":923,"SystemId":null,"ElementId":812,"Type":"PRODUCT","Position":3,"Data":{"Id":924,"SystemId":null,"ItemId":923,"ProductId":878057122,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}},{"Id":924,"SystemId":null,"ElementId":812,"Type":"PRODUCT","Position":4,"Data":{"Id":925,"SystemId":null,"ItemId":924,"ProductId":878057123,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}}]},{"Id":813,"SystemId":null,"ProductId":878057042,"Title":"<lng><nl><![CDATA[Velgen]]><\\/nl><de><![CDATA[Felgen]]><\\/de><\\/lng>","Required":1,"Multiselect":0,"Minimum":null,"Maximum":null,"View":"BLOCK","Position":4,"Title_Value":"Wheels","Items":[{"Id":931,"SystemId":null,"ElementId":813,"Type":"PRODUCT","Position":1,"Data":{"Id":932,"SystemId":null,"ItemId":931,"ProductId":878057130,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":1,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}},{"Id":932,"SystemId":null,"ElementId":813,"Type":"PRODUCT","Position":2,"Data":{"Id":933,"SystemId":null,"ItemId":932,"ProductId":878057131,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}},{"Id":933,"SystemId":null,"ElementId":813,"Type":"PRODUCT","Position":3,"Data":{"Id":934,"SystemId":null,"ItemId":933,"ProductId":878057132,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}}]}]';

    const PRODUCT_REGISTRY = {
        PC: {
            type: 'compound',
            productId: '878057041',
            categoryId: '1082307',
            categoryPath: 'Protom',
            packageId: '29449',
            price: 50,
            photoId: '1004181835',
            compoundElementsJson: COMPOUND_ELEMENTS_PC
        },
        Car: {
            type: 'compound',
            productId: '878057042',
            categoryId: '1082307',
            categoryPath: 'Protom',
            packageId: '29449',
            price: 45000,
            photoId: '1004181840',
            compoundElementsJson: COMPOUND_ELEMENTS_CAR,
            productNumber: 'Toyota-Supra',
            displayNameNl: 'Toyota Supra samenstellen',
            displayNameDe: 'Toyota Supra zusammenstellen',
            shortNl: 'Stel je Toyota Supra samen',
            shortDe: 'Stelle deinen Toyota Supra zusammen',
            descNl: 'Stel je Toyota Supra samen met karrosserie, vermogen, kleur, velgen en meer.',
            descDe: 'Stelle deinen Toyota Supra mit Karosserie, Leistung, Farbe, Felgen und mehr zusammen.',
            aliasSlug: 'Toyota-Supra',
            placeholderIds: [878057100, 878057101, 878057102, 878057110, 878057111, 878057112, 878057120, 878057121, 878057122, 878057123, 878057130, 878057131, 878057132],
            childProducts: [
                { productNumber: 'Supra-Body-Stock', nameNl: 'Karrosserie Standaard', nameDe: 'Karosserie Standard', price: 0 },
                { productNumber: 'Supra-Body-Widebody', nameNl: 'Widebody kit', nameDe: 'Widebody Kit', price: 3500 },
                { productNumber: 'Supra-Body-GT', nameNl: 'GT body kit', nameDe: 'GT Karosserie', price: 2800 },
                { productNumber: 'Supra-HP-Stage1', nameNl: 'Vermogen Stage 1 (+50 pk)', nameDe: 'Leistung Stage 1 (+50 PS)', price: 1200 },
                { productNumber: 'Supra-HP-Stage2', nameNl: 'Vermogen Stage 2 (+100 pk)', nameDe: 'Leistung Stage 2 (+100 PS)', price: 2500 },
                { productNumber: 'Supra-HP-Stage3', nameNl: 'Vermogen Stage 3 (+150 pk)', nameDe: 'Leistung Stage 3 (+150 PS)', price: 4500 },
                { productNumber: 'Supra-Color-Red', nameNl: 'Kleur Rood', nameDe: 'Farbe Rot', price: 0 },
                { productNumber: 'Supra-Color-White', nameNl: 'Kleur Wit', nameDe: 'Farbe Weiss', price: 0 },
                { productNumber: 'Supra-Color-Black', nameNl: 'Kleur Zwart', nameDe: 'Farbe Schwarz', price: 0 },
                { productNumber: 'Supra-Color-Blue', nameNl: 'Kleur Blauw', nameDe: 'Farbe Blau', price: 0 },
                { productNumber: 'Supra-Wheels-Standard', nameNl: 'Velgen Standaard', nameDe: 'Felgen Standard', price: 0 },
                { productNumber: 'Supra-Wheels-Sport', nameNl: 'Sport velgen', nameDe: 'Sport Felgen', price: 1800 },
                { productNumber: 'Supra-Wheels-Premium', nameNl: 'Premium velgen', nameDe: 'Premium Felgen', price: 3200 }
            ]
        }
    };

    function _langKey(lang) {
        return lang.charAt(0).toUpperCase() + lang.slice(1);
    }

    /**
     * Generate product/compound product object from product name only.
     * Uses overrides.enabledLanguages (from shop settings) to emit ProductName_XX, ShortDescription_XX, etc. for each enabled language.
     * @param {string} productName - e.g. 'PC'
     * @param {object} [overrides] - optional overrides (enabledLanguages, productId, price, compoundElementsJson, etc.)
     * @returns {{ name: string, type: string, fields: Array<[string, string]> }}
     */
    function GenerateProductObject(productName, overrides) {
        const reg = PRODUCT_REGISTRY[productName];
        overrides = overrides || {};
        const enabledLangs = overrides.enabledLanguages && overrides.enabledLanguages.length > 0 ? overrides.enabledLanguages : ['nl', 'de'];

        let names;
        if (reg && reg.displayNameNl) {
            const productNumber = reg.productNumber != null ? reg.productNumber : productName;
            const aliasSlug = reg.aliasSlug != null ? reg.aliasSlug : String(productName).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
            const name = {};
            const short = {};
            const desc = {};
            for (let i = 0; i < enabledLangs.length; i++) {
                const code = enabledLangs[i];
                const key = _langKey(code);
                name[code] = reg['displayName' + key] != null ? reg['displayName' + key] : reg.displayNameNl;
                short[code] = reg['short' + key] != null ? reg['short' + key] : reg.shortNl || reg.displayNameNl;
                desc[code] = reg['desc' + key] != null ? reg['desc' + key] : reg.descNl || reg.displayNameNl;
            }
            names = { productNumber: productNumber, aliasSlug: aliasSlug, name: name, short: short, desc: desc };
        } else {
            names = generateDisplayNames(productName, enabledLangs);
        }
        if (!reg) return { name: productName, type: 'unknown', fields: [] };
        const productId = overrides.productId != null ? String(overrides.productId) : reg.productId;
        const price = overrides.price != null ? Number(overrides.price) : (reg.price != null ? reg.price : 50);
        const priceStr = String(price);
        const priceFormat = price.toFixed(2).replace('.', ',');
        const priceInc = (price * 1.21).toFixed(2);
        const priceIncFormat = priceInc.replace('.', ',');
        const categoryId = overrides.categoryId != null ? overrides.categoryId : reg.categoryId;
        const categoryPath = overrides.categoryPath != null ? overrides.categoryPath : reg.categoryPath;
        const packageId = overrides.packageId != null ? overrides.packageId : reg.packageId;
        const compoundElementsJson = overrides.compoundElementsJson != null ? overrides.compoundElementsJson : reg.compoundElementsJson;
        const photoId = overrides.photoId != null ? overrides.photoId : (reg.photoId || '1004181835');

        if (reg.type === 'compound') {
            const categoryJson = '[{"Id":"5931799","Category":"' + categoryId + '","Product":"' + productId + '","Position":"1","MaxPosition":1,"NumberOfChildren":26,"OrderBy":"2","ShowOnWebsite":"Y","UUID":"","Path":"' + categoryPath + '","Type":"Current"}]';
            const staggeredJson = '[{"Id":"fixed","ProductId":"' + productId + '","Number":1,"Price":' + priceStr + ',"Discount":0,"SellPrice":' + priceStr + ',"TAX":21,"TaxTariff":"NORMAL","StaggeredPrice":' + priceStr + ',"StaggeredSellPrice":' + priceStr + ',"OriginalDiscount":"0.00","Price_Format":"' + priceFormat + '","Price_FormatWithCurrency":"&#x20ac;&#x00a0;' + priceFormat + '","Price_Inc":' + priceInc + ',"Price_Inc_Format":"' + priceIncFormat + '","Price_Inc_FormatWithCurrency":"&#x20ac;&#x00a0;' + priceIncFormat + '","Price_Exc":' + priceStr + ',"Price_Exc_Format":"' + priceFormat + '","Price_Exc_FormatWithCurrency":"&#x20ac;&#x00a0;' + priceFormat + '","Discount_Format":"0,00","Discount_FormatWithCurrency":"&#x20ac;&#x00a0;0,00","Discount_Inc":0,"Discount_Inc_Format":"0,00","Discount_Inc_FormatWithCurrency":"&#x20ac;&#x00a0;0,00","Discount_Exc":0,"Discount_Exc_Format":"0,00","Discount_Exc_FormatWithCurrency":"&#x20ac;&#x00a0;0,00","SellPrice_Format":"' + priceFormat + '","SellPrice_FormatWithCurrency":"&#x20ac;&#x00a0;' + priceFormat + '","SellPrice_Inc":' + priceInc + ',"SellPrice_Inc_Format":"' + priceIncFormat + '","SellPrice_Inc_FormatWithCurrency":"&#x20ac;&#x00a0;' + priceIncFormat + '","SellPrice_Exc":' + priceStr + ',"SellPrice_Exc_Format":"' + priceFormat + '","SellPrice_Exc_FormatWithCurrency":"&#x20ac;&#x00a0;' + priceFormat + '","StaggeredPrice_Format":"' + priceFormat + '","StaggeredPrice_FormatWithCurrency":"&#x20ac;&#x00a0;' + priceFormat + '","StaggeredPrice_Inc":' + priceInc + ',"StaggeredPrice_Inc_Format":"' + priceIncFormat + '","StaggeredPrice_Inc_FormatWithCurrency":"&#x20ac;&#x00a0;' + priceIncFormat + '","StaggeredPrice_Exc":' + priceStr + ',"StaggeredPrice_Exc_Format":"' + priceFormat + '","StaggeredPrice_Exc_FormatWithCurrency":"&#x20ac;&#x00a0;' + priceFormat + '","StaggeredSellPrice_Format":"' + priceFormat + '","StaggeredSellPrice_FormatWithCurrency":"&#x20ac;&#x00a0;' + priceFormat + '","StaggeredSellPrice_Inc":' + priceInc + ',"StaggeredSellPrice_Inc_Format":"' + priceIncFormat + '","StaggeredSellPrice_Inc_FormatWithCurrency":"&#x20ac;&#x00a0;' + priceIncFormat + '","StaggeredSellPrice_Exc":' + priceStr + ',"StaggeredSellPrice_Exc_Format":"' + priceFormat + '","StaggeredSellPrice_Exc_FormatWithCurrency":"&#x20ac;&#x00a0;' + priceFormat + '","OriginalStaggeredPriceSellPrice":"' + priceStr + '.00","OriginalDiscount_Format":"0,00","OriginalDiscount_FormatWithCurrency":"&#x20ac;&#x00a0;0,00","OriginalDiscount_Inc":0,"OriginalDiscount_Inc_Format":"0,00","OriginalDiscount_Inc_FormatWithCurrency":"&#x20ac;&#x00a0;0,00","OriginalDiscount_Exc":0,"OriginalDiscount_Exc_Format":"0,00","OriginalDiscount_Exc_FormatWithCurrency":"&#x20ac;&#x00a0;0,00","TotalPrice":"' + priceFormat + '"}]';
            const photoJson = '[{"Id":"' + photoId + '","Product":"' + productId + '","Extension":".jpg","MainPhoto":"Y","Alt":"","Position":"1","Type":"Current"}]';
            const fields = [
                ['AdminItem', '4'],
                ['Mode', 'Modify'],
                ['Id', productId],
                ['Entity', '4'],
                ['iOriginalProductId', ''],
                ['Width', ''],
                ['Height', ''],
                ['DoNotClose', '1'],
                ['SystemStatus', 'Inactive'],
                ['SystemStatus', 'Active'],
                ['ProductNumber', names.productNumber]
            ];
            for (let L = 0; L < enabledLangs.length; L++) {
                const lang = enabledLangs[L];
                fields.push(['ProductName_' + lang, names.name[lang]], ['ShortDescription_' + lang, names.short[lang]], ['Description_' + lang, names.desc[lang]]);
            }
            fields.push(['Package', packageId]);
            for (let L2 = 0; L2 < enabledLangs.length; L2++) {
                fields.push(['Specs_' + enabledLangs[L2], names.name[enabledLangs[L2]]]);
            }
            fields.push(
                ['ColorId', ''],
                ['CategoryJSON', categoryJson],
                ['StaggeredPriceJSON', staggeredJson],
                ['PurchasePrice', ''],
                ['Price', priceStr],
                ['Discount', ''],
                ['MinimalOrderAmount', '1'],
                ['PhotoJSON', photoJson],
                ['PhotoPosition', ''],
                ['Keyword', ''],
                ['RelevantProductJSON', '[]'],
                ['VariationProductJSON', '[]'],
                ['ShowOrderButton', 'Y'],
                ['Layout', '201'],
                ['PhotoSize', 'SMALL'],
                ['HideWithoutCategory', 'YES'],
                ['Memo', ''],
                ['ProductFeaturedPropertiesJSON', '{}'],
                ['ProductDeletedFeaturedPropertiesJSON', ''],
                ['BrandId_search', ''],
                ['BrandId', ''],
                ['addtext', ''],
                ['EANNumber', ''],
                ['MPNNumber', ''],
                ['Keywords', '']
            );
            for (let L3 = 0; L3 < enabledLangs.length; L3++) {
                const l = enabledLangs[L3];
                fields.push(['MainCat_' + l, ''], ['SubCat_' + l, '']);
            }
            fields.push(['ObjectId', productId], ['CompoundElements', compoundElementsJson || '[]']);
            for (let L4 = 0; L4 < enabledLangs.length; L4++) {
                const lng = enabledLangs[L4];
                fields.push(
                    ['Metadata_Alias_' + lng, names.aliasSlug],
                    ['Metadata_PageTitle_' + lng, names.name[lng]],
                    ['Metadata_MetaDescription_' + lng, names.short[lng]],
                    ['Metadata_MetaKeywords_' + lng, names.name[lng]]
                );
            }
            fields.push(['ObjectId', productId]);
            const firstLangName = names.name[enabledLangs[0]];
            return { name: firstLangName, type: 'compound', fields: fields };
        }

        return { name: productName, type: reg.type || 'normal', fields: [] };
    }

    const COMPOUND_NAMES = ['PC', 'Car'];

    function escapeHtml(s) {
        if (s == null) return '';
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /** Default export selection: all compounds and all their children selected. */
    function getDefaultExportSelection() {
        const compounds = {};
        const children = {};
        for (let i = 0; i < COMPOUND_NAMES.length; i++) {
            const name = COMPOUND_NAMES[i];
            compounds[name] = true;
            const reg = PRODUCT_REGISTRY[name];
            if (reg && reg.childProducts && reg.childProducts.length > 0) {
                children[name] = {};
                for (let c = 0; c < reg.childProducts.length; c++) {
                    children[name][reg.childProducts[c].productNumber] = true;
                }
            }
        }
        return { compounds, children };
    }

    /**
     * Build a single CSV row (array of values in CSV_HEADERS order) for a product.
     * @param {object} spec - { name, productNumber, shortDesc, description, price, categoryId, packageId, aliasSlug, photoUrl? }
     */
    function buildExportRow(spec) {
        const name = spec.name || '';
        const productNumber = spec.productNumber || '';
        const weight = '0,0000';
        const description = spec.description != null ? spec.description : name;
        const specification = spec.specification != null ? spec.specification : '';
        const categoryId = spec.categoryId != null ? spec.categoryId : '';
        const price = formatPrice(spec.price);
        const purchasePrice = '0,00';
        const btw = '21,00';
        const soldPer = spec.soldPer != null ? spec.soldPer : '';
        const stock = '0';
        const packageId = spec.packageId != null ? spec.packageId : '';
        const mainImage = spec.photoUrl != null ? spec.photoUrl : '';
        const discount = '0,00';
        const decimals = '0';
        const minOrder = '1';
        const pageTitle = spec.pageTitle != null ? spec.pageTitle : name;
        const metaKeywords = spec.metaKeywords != null ? spec.metaKeywords : '';
        const metaDescription = spec.metaDescription != null ? spec.metaDescription : (spec.shortDesc != null ? spec.shortDesc : name);
        const alias = spec.aliasSlug != null ? spec.aliasSlug : String(productNumber).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '') || '';
        const shortDesc = spec.shortDesc != null ? spec.shortDesc : name;
        const active = '1';
        const btwTariff = 'NORMAL';
        const includeExport = '1';
        const row = [
            name, productNumber, '', '', weight, description, specification,
            categoryId, price, purchasePrice, btw, soldPer, stock, '', '',
            '', '', '', packageId, '', mainImage,
            '0,000', discount, '', '0,00',
            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
            decimals, minOrder, pageTitle, metaKeywords, metaDescription, alias,
            '', '', '', '', '', '',
            '', shortDesc, '', active, '', '', '1',
            '0,00', '0,00', btwTariff, includeExport, '',
            '', '', '', '', '', '', '', '',
            '', '', ''
        ];
        while (row.length < CSV_HEADERS.length) row.push('');
        return row.slice(0, CSV_HEADERS.length);
    }

    /**
     * Build all export rows: selected child products first, then selected compound products.
     * @param {string[]} enabledLangs
     * @param {{ compounds: Object.<string, boolean>, children: Object.<string, Object.<string, boolean>> }} selection - from UI checkboxes
     */
    function buildAllExportRows(enabledLangs, selection) {
        if (!enabledLangs || enabledLangs.length === 0) enabledLangs = ['nl', 'de'];
        const sel = selection || getDefaultExportSelection();
        const firstLang = enabledLangs[0];
        const rows = [];
        for (let i = 0; i < COMPOUND_NAMES.length; i++) {
            const productName = COMPOUND_NAMES[i];
            if (!sel.compounds[productName]) continue;
            const reg = PRODUCT_REGISTRY[productName];
            if (reg && reg.childProducts && reg.childProducts.length > 0) {
                const childSel = sel.children[productName] || {};
                const defaults = { categoryId: reg.categoryId, categoryPath: reg.categoryPath, packageId: reg.packageId };
                for (let c = 0; c < reg.childProducts.length; c++) {
                    const child = reg.childProducts[c];
                    if (!childSel[child.productNumber]) continue;
                    const key = _langKey(firstLang);
                    const childName = child['name' + key] != null ? child['name' + key] : (firstLang === 'nl' ? child.nameNl : child.nameDe) || child.productNumber;
                    rows.push(buildExportRow({
                        name: childName,
                        productNumber: child.productNumber,
                        shortDesc: childName,
                        description: childName,
                        price: child.price,
                        categoryId: defaults.categoryId,
                        packageId: defaults.packageId,
                        aliasSlug: String(child.productNumber).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, ''),
                        photoUrl: child.photoId ? getPhotoUrl(child.photoId) : ''
                    }));
                }
            }
        }
        for (let i = 0; i < COMPOUND_NAMES.length; i++) {
            const productName = COMPOUND_NAMES[i];
            if (!sel.compounds[productName]) continue;
            const obj = GenerateProductObject(productName, { enabledLanguages: enabledLangs });
            const reg = PRODUCT_REGISTRY[productName];
            if (!reg || !obj.fields || obj.fields.length === 0) continue;
            const name = obj.name;
            const productNumber = reg.productNumber != null ? reg.productNumber : productName;
            const aliasSlug = reg.aliasSlug != null ? reg.aliasSlug : String(productNumber).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
            const shortDesc = (reg.shortNl != null && firstLang === 'nl') || (reg.shortDe != null && firstLang === 'de')
                ? (firstLang === 'nl' ? reg.shortNl : reg.shortDe)
                : (obj.fields.filter(function (p) { return p[0] === 'ShortDescription_' + firstLang; })[0] || [])[1] || name;
            const description = (reg.descNl != null && firstLang === 'nl') || (reg.descDe != null && firstLang === 'de')
                ? (firstLang === 'nl' ? reg.descNl : reg.descDe)
                : (obj.fields.filter(function (p) { return p[0] === 'Description_' + firstLang; })[0] || [])[1] || name;
            rows.push(buildExportRow({
                name: name,
                productNumber: productNumber,
                shortDesc: shortDesc,
                description: description,
                price: reg.price,
                categoryId: reg.categoryId,
                packageId: reg.packageId,
                aliasSlug: aliasSlug,
                photoUrl: reg.photoId ? getPhotoUrl(reg.photoId) : ''
            }));
        }
        return rows;
    }

    function csvFromRows(rows) {
        const lines = [CSV_HEADERS.map(csvEscape).join('\t')];
        for (let r = 0; r < rows.length; r++) {
            lines.push(rows[r].map(csvEscape).join('\t'));
        }
        return lines.join('\r\n');
    }

    function downloadCsv(csvContent, filename) {
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'compound-products-export.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ——— Helpers ———

    function buildFormData(fields) {
        const fd = new FormData();
        fields.forEach(function (pair) {
            const key = pair[0];
            let val = pair[1];
            if (val === undefined || val === null) val = '';
            fd.append(key, val);
        });
        return fd;
    }

    /**
     * Build form fields for a normal product (AddProduct.php). Used for child products of a compound.
     * @param {object} spec - { productNumber, nameNl, nameDe, nameEn?, shortNl?, shortDe?, descNl?, descDe?, price }
     * @param {object} defaults - { categoryId, categoryPath, packageId } from registry
     * @param {string[]} [enabledLangs] - e.g. ['nl', 'de']; default ['nl', 'de']
     * @returns {Array<[string, string]>}
     */
    function buildNormalProductFields(spec, defaults, enabledLangs) {
        if (!enabledLangs || enabledLangs.length === 0) enabledLangs = ['nl', 'de'];
        const id = spec.Id != null ? String(spec.Id) : '0';
        const productNumber = spec.productNumber || spec.nameNl || 'product';
        const nameNl = spec.nameNl || productNumber;
        const price = Number(spec.price) || 0;
        const priceStr = String(price);
        const priceFormat = price.toFixed(2).replace('.', ',');
        const priceInc = (price * 1.21).toFixed(2);
        const categoryId = defaults && defaults.categoryId ? defaults.categoryId : '1082307';
        const categoryPath = defaults && defaults.categoryPath ? defaults.categoryPath : 'Protom';
        const packageId = defaults && defaults.packageId ? defaults.packageId : '29449';
        const categoryJson = '[{"Id":"","Category":"' + categoryId + '","Product":"' + id + '","Position":"1","MaxPosition":1,"NumberOfChildren":0,"OrderBy":"2","ShowOnWebsite":"Y","UUID":"","Path":"' + categoryPath + '","Type":"Current"}]';
        const staggeredJson = '[{"Id":"fixed","ProductId":"' + id + '","Number":1,"Price":' + priceStr + ',"Discount":0,"SellPrice":' + priceStr + ',"TAX":21,"TaxTariff":"NORMAL","StaggeredPrice":' + priceStr + ',"StaggeredSellPrice":' + priceStr + ',"OriginalDiscount":"0.00","Price_Format":"' + priceFormat + '","Price_Inc":' + priceInc + ',"TotalPrice":"' + priceFormat + '"}]';
        const slug = String(productNumber).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '') || 'product';
        const fields = [
            ['AdminItem', '4'],
            ['Mode', id === '0' ? 'Add' : 'Modify'],
            ['Id', id],
            ['Entity', '1'],
            ['iOriginalProductId', ''],
            ['SystemStatus', 'Active'],
            ['ProductNumber', productNumber]
        ];
        for (let i = 0; i < enabledLangs.length; i++) {
            const code = enabledLangs[i];
            const key = _langKey(code);
            const nm = spec['name' + key] != null ? spec['name' + key] : (code === 'nl' ? nameNl : (code === 'de' ? (spec.nameDe != null ? spec.nameDe : nameNl) : nameNl));
            const sh = spec['short' + key] != null ? spec['short' + key] : (code === 'nl' ? (spec.shortNl != null ? spec.shortNl : nameNl) : (code === 'de' ? (spec.shortDe != null ? spec.shortDe : nm) : nm));
            const dc = spec['desc' + key] != null ? spec['desc' + key] : (code === 'nl' ? (spec.descNl != null ? spec.descNl : nameNl) : (code === 'de' ? (spec.descDe != null ? spec.descDe : nm) : nm));
            fields.push(['ProductName_' + code, nm], ['ShortDescription_' + code, sh], ['Description_' + code, dc], ['Metadata_Alias_' + code, slug]);
        }
        fields.push(
            ['Package', packageId],
            ['TaxTariff', 'NORMAL'],
            ['Price', priceStr],
            ['Discount', '0'],
            ['MinimalOrderAmount', '1'],
            ['StaggeredPriceJSON', staggeredJson],
            ['CategoryJSON', categoryJson],
            ['PhotoJSON', '[]'],
            ['RelevantProductJSON', '[]'],
            ['VariationProductJSON', '[]'],
            ['ShowOrderButton', 'Y'],
            ['Layout', '101'],
            ['PhotoSize', 'SMALL'],
            ['HideWithoutCategory', 'YES'],
            ['ProductFeaturedPropertiesJSON', '{}']
        );
        return fields;
    }

    /**
     * Try to get the created product ID from AddProduct response (redirect or body).
     * @param {Response} response
     * @returns {string|null}
     */
    function getProductIdFromResponse(response) {
        const loc = response.headers.get('Location');
        if (loc) {
            const match = loc.match(/[?&](?:Product|Id)=(\d+)/);
            if (match) return match[1];
        }
        const url = response.url || '';
        const match = url.match(/[?&](?:Product|Id)=(\d+)/);
        if (match) return match[1];
        return null;
    }

    /**
     * Submit a normal product and return the created product ID (or null).
     */
    function submitNormalProduct(fields) {
        const url = getAddProductUrl();
        return fetch(url, { method: 'POST', credentials: 'same-origin', redirect: 'follow', body: buildFormData(fields) })
            .then(function (res) {
                const id = getProductIdFromResponse(res);
                if (id) return id;
                return null;
            });
    }

    function showToast(message, type) {
        if (typeof window.CCVToolbar !== 'undefined' && typeof window.CCVToolbar.showToast === 'function') {
            window.CCVToolbar.showToast(message);
        } else {
            window.alert(message);
        }
    }

    // ——— Script class ———

    class SeedCompoundProductsScript extends window.CCVScriptBase {
        constructor() {
            super();
            this.enabled = true;
            this._scriptPath = (typeof window !== 'undefined' && window.__CCV_SCRIPT_CURRENT_PATH__) ? window.__CCV_SCRIPT_CURRENT_PATH__ : '';
        }

        _getSettings() {
            if (!this._scriptPath) return {};
            try {
                const raw = localStorage.getItem(SCRIPT_SETTINGS_KEY_PREFIX + this._scriptPath);
                return raw ? JSON.parse(raw) : {};
            } catch (e) {
                return {};
            }
        }

        _saveExportSelection(selection) {
            if (!this._scriptPath) return;
            try {
                const s = this._getSettings();
                s.exportSelection = selection;
                localStorage.setItem(SCRIPT_SETTINGS_KEY_PREFIX + this._scriptPath, JSON.stringify(s));
            } catch (e) {}
        }

        _readExportSelectionFromDom() {
            const root = document.getElementById('ccv-export-compound-root');
            if (!root) return getDefaultExportSelection();
            const compounds = {};
            const children = {};
            const compoundChecks = root.querySelectorAll('input.export-compound');
            for (let i = 0; i < compoundChecks.length; i++) {
                const el = compoundChecks[i];
                const name = el.getAttribute('data-compound');
                if (name) compounds[name] = el.checked;
            }
            const childChecks = root.querySelectorAll('input.export-child');
            for (let j = 0; j < childChecks.length; j++) {
                const el = childChecks[j];
                const compoundName = el.getAttribute('data-compound');
                const productNumber = el.getAttribute('data-product-number');
                if (compoundName && productNumber) {
                    if (!children[compoundName]) children[compoundName] = {};
                    children[compoundName][productNumber] = el.checked;
                }
            }
            return { compounds, children };
        }

        runExport() {
            const self = this;
            const statusEl = document.getElementById('ccv-seed-compound-status');
            const setStatus = function (text, isError) {
                if (statusEl) {
                    statusEl.textContent = text;
                    statusEl.className = 'ccv-seed-compound-status' + (isError ? ' ccv-seed-compound-status-error' : '');
                }
            };
            const selection = this._readExportSelectionFromDom();
            this._saveExportSelection(selection);
            setStatus('Preparing export…', false);
            getEnabledShopLanguages().then(function (langs) {
                const rows = buildAllExportRows(langs, selection);
                if (rows.length === 0) {
                    setStatus('No products selected or to export.', true);
                    return;
                }
                const csv = csvFromRows(rows);
                const filename = 'compound-products-export-' + (new Date().toISOString().slice(0, 10)) + '.csv';
                downloadCsv(csv, filename);
                setStatus('Exported ' + rows.length + ' product(s). Download started.', false);
                showToast('Exported ' + rows.length + ' products to ' + filename);
            }).catch(function (err) {
                setStatus('Export failed: ' + (err && err.message ? err.message : 'unknown error'), true);
                showToast('Export failed');
            });
        }

        view() {
            const settings = this._getSettings();
            const sel = settings.exportSelection && settings.exportSelection.compounds ? settings.exportSelection : getDefaultExportSelection();
            let listHtml = '';
            for (let i = 0; i < COMPOUND_NAMES.length; i++) {
                const name = COMPOUND_NAMES[i];
                const reg = PRODUCT_REGISTRY[name];
                const displayName = escapeHtml((reg && reg.displayNameNl) ? reg.displayNameNl : name);
                const checked = sel.compounds[name] ? ' checked' : '';
                listHtml += '<div class="ccv-export-compound-row">';
                listHtml += '<label class="ccv-export-label ccv-export-compound-label">';
                listHtml += '<input type="checkbox" class="checkboxmassaction table-list-checkbox export-compound" data-compound="' + escapeHtml(name) + '"' + checked + '>';
                listHtml += '<span class="ccv-export-name">' + displayName + '</span></label>';
                if (reg && reg.childProducts && reg.childProducts.length > 0) {
                    listHtml += '<div class="ccv-export-children">';
                    for (let c = 0; c < reg.childProducts.length; c++) {
                        const child = reg.childProducts[c];
                        const childChecked = (sel.children[name] && sel.children[name][child.productNumber]) ? ' checked' : '';
                        const childLabel = escapeHtml(child.nameNl || child.productNumber);
                        listHtml += '<label class="ccv-export-label ccv-export-child-label">';
                        listHtml += '<input type="checkbox" class="checkboxmassaction table-list-checkbox export-child" data-compound="' + escapeHtml(name) + '" data-product-number="' + escapeHtml(child.productNumber) + '"' + childChecked + '>';
                        listHtml += '<span class="ccv-export-name">' + childLabel + '</span></label>';
                    }
                    listHtml += '</div>';
                }
                listHtml += '</div>';
            }
            return `
                <div class="ccv-script-settings" id="ccv-export-compound-root">
                    <p class="ccv-script-desc">Select which compound products and child options to include in the export. Compound = main product; list below = options for that compound.</p>
                    <div class="ccv-export-compound-list" onclick="event.stopPropagation()">
                        ${listHtml}
                    </div>
                    <button type="button" class="ccv-btn ccv-btn-primary ccv-btn-full" data-action="script-custom-action" data-script-custom-action="runExport">
                        Export CSV
                    </button>
                    <p id="ccv-seed-compound-status" class="ccv-seed-compound-status" aria-live="polite"></p>
                </div>
            `;
        }

        styles() {
            return `
                .ccv-seed-compound-status { margin-top: 8px; font-size: 13px; color: var(--ccv-text-secondary, #666); }
                .ccv-seed-compound-status-error { color: var(--ccv-danger, #dc3545); }
                .ccv-export-compound-list { margin: 12px 0; }
                .ccv-export-compound-row { margin-bottom: 10px; }
                .ccv-export-label { display: flex; align-items: center; gap: 10px; cursor: pointer; margin: 0; }
                .ccv-export-compound-list .checkboxmassaction.table-list-checkbox,
                .ccv-export-compound-list input[type="checkbox"] {
                    flex-shrink: 0;
                    width: 18px;
                    height: 18px;
                    min-width: 18px;
                    min-height: 18px;
                    margin: 0;
                    appearance: checkbox;
                    -webkit-appearance: checkbox;
                    display: inline-block;
                    vertical-align: middle;
                }
                .ccv-export-name { flex: 1; }
                .ccv-export-compound-label .ccv-export-name { font-weight: 600; }
                .ccv-export-child-label .ccv-export-name { font-weight: normal; }
                .ccv-export-children { margin: 4px 0 0 28px; }
                .ccv-export-children .ccv-export-label { margin-bottom: 4px; }
            `.trim();
        }
    }

    if (typeof window !== 'undefined') {
        window.__CCV_SCRIPT_INSTANCE__ = new SeedCompoundProductsScript();
    }
})();
