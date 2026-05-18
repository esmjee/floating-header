/**
 * Shared compound product registry and admin form builders for PC compound creator + export plugin.
 */
(function () {
    'use strict';

    const COMPOUND_LANGS = ['nl', 'de', 'en', 'it', 'tr', 'es'];

    const DEFAULT_LANGUAGE_TEMPLATES = {
        nl: { name: 'Eigen X samenstellen', short: 'Stel je eigen X samen', desc: 'Je kan hier je eigen X samenstellen.' },
        de: { name: 'Eigen X zusammenstellen', short: 'Stell deinen eigenen X zusammen', desc: 'Hier kannst du deinen eigenen X zusammenstellen.' },
        en: { name: 'Configure your X', short: 'Build your own X', desc: 'Configure and order your X here.' },
        tr: { name: 'X oluşturun', short: 'Kendi X oluşturun', desc: 'Burada X oluşturabilirsiniz.' },
        it: { name: 'Configura il tuo X', short: 'Configura il tuo X', desc: 'Configura qui il tuo X.' },
        es: { name: 'Configura tu X', short: 'Configura tu X', desc: 'Configura aquí tu X.' }
    };

    const PC_CHILD_PRODUCTS = [
        { key: 'RAM-1', imageFile: 'pc-ram-1.jpg', nameNl: '32 GB DDR4 RAM', nameDe: '32 GB DDR4 RAM', nameEn: '32 GB DDR4 RAM', price: 89, minimum: 1, maximum: 2, selected: 1 },
        { key: 'RAM-2', imageFile: 'pc-ram-2.jpg', nameNl: '16 GB DDR4 RAM', nameDe: '16 GB DDR4 RAM', nameEn: '16 GB DDR4 RAM', price: 49, minimum: 1, maximum: 2, selected: 0 },
        { key: 'RAM-3', imageFile: 'pc-ram-3.jpg', nameNl: '64 GB DDR5 RAM', nameDe: '64 GB DDR5 RAM', nameEn: '64 GB DDR5 RAM', price: 199, selected: 0 },
        { key: 'RAM-4', imageFile: 'pc-ram-4.jpg', nameNl: '32 GB DDR5 RAM', nameDe: '32 GB DDR5 RAM', nameEn: '32 GB DDR5 RAM', price: 129, selected: 0 },
        { key: 'CPU-1', imageFile: 'pc-cpu-1.jpg', nameNl: 'Intel Core i7', nameDe: 'Intel Core i7', nameEn: 'Intel Core i7', price: 349, selected: 0 },
        { key: 'CPU-2', imageFile: 'pc-cpu-2.jpg', nameNl: 'Intel Core i5', nameDe: 'Intel Core i5', nameEn: 'Intel Core i5', price: 249, selected: 0 },
        { key: 'CPU-3', imageFile: 'pc-cpu-3.jpg', nameNl: 'AMD Ryzen 7', nameDe: 'AMD Ryzen 7', nameEn: 'AMD Ryzen 7', price: 329, selected: 0 },
        { key: 'CPU-4', imageFile: 'pc-cpu-4.jpg', nameNl: 'AMD Ryzen 5', nameDe: 'AMD Ryzen 5', nameEn: 'AMD Ryzen 5', price: 229, selected: 0 },
        { key: 'Motherboards-1', imageFile: 'pc-motherboard-1.jpg', nameNl: 'ATX Moederbord Pro', nameDe: 'ATX Mainboard Pro', nameEn: 'ATX Motherboard Pro', price: 189, selected: 0 },
        { key: 'Motherboards-2', imageFile: 'pc-motherboard-2.jpg', nameNl: 'mATX Moederbord', nameDe: 'mATX Mainboard', nameEn: 'mATX Motherboard', price: 149, selected: 0 },
        { key: 'Storage-1', imageFile: 'pc-storage-1.jpg', nameNl: '1 TB NVMe SSD', nameDe: '1 TB NVMe SSD', nameEn: '1 TB NVMe SSD', price: 99, selected: 0 },
        { key: 'Storage-2', imageFile: 'pc-storage-2.jpg', nameNl: '2 TB NVMe SSD', nameDe: '2 TB NVMe SSD', nameEn: '2 TB NVMe SSD', price: 179, selected: 0 },
        { key: 'Storage-3', imageFile: 'pc-storage-3.jpg', nameNl: '500 GB SATA SSD', nameDe: '500 GB SATA SSD', nameEn: '500 GB SATA SSD', price: 59, selected: 0 },
        { key: 'GPU-1', imageFile: 'pc-gpu-1.jpg', nameNl: 'NVIDIA RTX 4070', nameDe: 'NVIDIA RTX 4070', nameEn: 'NVIDIA RTX 4070', price: 599, minimum: 6, maximum: 6, selected: 1 },
        { key: 'GPU-2', imageFile: 'pc-gpu-2.jpg', nameNl: 'NVIDIA RTX 4060', nameDe: 'NVIDIA RTX 4060', nameEn: 'NVIDIA RTX 4060', price: 449, minimum: 6, maximum: 6, selected: 0 },
        { key: 'Power-Supplies-1', imageFile: 'pc-psu-1.jpg', nameNl: '750W Voeding', nameDe: '750W Netzteil', nameEn: '750W Power Supply', price: 119, selected: 0 },
        { key: 'Cooling-1', imageFile: 'pc-cooling-1.jpg', nameNl: 'CPU Koeler', nameDe: 'CPU Kühler', nameEn: 'CPU Cooler', price: 49, selected: 0 }
    ];

    const COMPOUND_ELEMENTS_PC = '[{"Id":754,"SystemId":null,"ProductId":878057041,"Title":"<lng><nl><![CDATA[RAM]]><\\/nl><de><![CDATA[RAM]]><\\/de><\\/lng>","Required":1,"Multiselect":0,"Minimum":null,"Maximum":null,"View":"BLOCK","Position":1,"Title_Value":"RAM","Items":[{"Id":868,"SystemId":null,"ElementId":754,"Type":"PRODUCT","Position":1,"Data":{"Id":869,"SystemId":null,"ItemId":868,"ProductId":878057015,"Minimum":1,"Maximum":2,"Discount":null,"DiscountType":"PERCENTAGE","Selected":1,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":0,"Minimum_Format":1,"Maximum_Format":2,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}},{"Id":869,"SystemId":null,"ElementId":754,"Type":"PRODUCT","Position":2,"Data":{"Id":870,"SystemId":null,"ItemId":869,"ProductId":878057018,"Minimum":1,"Maximum":2,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":0,"Minimum_Format":1,"Maximum_Format":2,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}},{"Id":877,"SystemId":null,"ElementId":754,"Type":"PRODUCT","Position":3,"Data":{"Id":878,"SystemId":null,"ItemId":877,"ProductId":878057073,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}},{"Id":879,"SystemId":null,"ElementId":754,"Type":"PRODUCT","Position":4,"Data":{"Id":880,"SystemId":null,"ItemId":879,"ProductId":878057074,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}}]},{"Id":760,"SystemId":null,"ProductId":878057041,"Title":"<lng><nl><![CDATA[CPU]]><\\/nl><de><![CDATA[CPU]]><\\/de><\\/lng>","Required":1,"Multiselect":0,"Minimum":null,"Maximum":null,"View":"LIST","Position":2,"Title_Value":"CPU","Items":[{"Id":881,"SystemId":null,"ElementId":760,"Type":"PRODUCT","Position":1,"Data":{"Id":882,"SystemId":null,"ItemId":881,"ProductId":878057254,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}},{"Id":882,"SystemId":null,"ElementId":760,"Type":"PRODUCT","Position":2,"Data":{"Id":883,"SystemId":null,"ItemId":882,"ProductId":878057253,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}},{"Id":883,"SystemId":null,"ElementId":760,"Type":"PRODUCT","Position":3,"Data":{"Id":884,"SystemId":null,"ItemId":883,"ProductId":878057255,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}},{"Id":884,"SystemId":null,"ElementId":760,"Type":"PRODUCT","Position":4,"Data":{"Id":885,"SystemId":null,"ItemId":884,"ProductId":878057256,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}}]},{"Id":756,"SystemId":null,"ProductId":878057041,"Title":"<lng><nl><![CDATA[Motherboards]]><\\/nl><de><![CDATA[Motherboards]]><\\/de><\\/lng>","Required":1,"Multiselect":0,"Minimum":null,"Maximum":null,"View":"BLOCK","Position":3,"Title_Value":"Motherboards","Items":[{"Id":872,"SystemId":null,"ElementId":756,"Type":"PRODUCT","Position":1,"Data":{"Id":873,"SystemId":null,"ItemId":872,"ProductId":878057068,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}},{"Id":873,"SystemId":null,"ElementId":756,"Type":"PRODUCT","Position":2,"Data":{"Id":874,"SystemId":null,"ItemId":873,"ProductId":878057069,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}}]},{"Id":757,"SystemId":null,"ProductId":878057041,"Title":"<lng><nl><![CDATA[Storage]]><\\/nl><de><![CDATA[Storage]]><\\/de><\\/lng>","Required":1,"Multiselect":1,"Minimum":2,"Maximum":null,"View":"BLOCK","Position":4,"Title_Value":"Storage","Items":[{"Id":874,"SystemId":null,"ElementId":757,"Type":"PRODUCT","Position":1,"Data":{"Id":875,"SystemId":null,"ItemId":874,"ProductId":878057070,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}},{"Id":878,"SystemId":null,"ElementId":757,"Type":"PRODUCT","Position":2,"Data":{"Id":879,"SystemId":null,"ItemId":878,"ProductId":878057074,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format": null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}},{"Id":880,"SystemId":null,"ElementId":757,"Type":"PRODUCT","Position":3,"Data":{"Id":881,"SystemId":null,"ItemId":880,"ProductId":878057075,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}}]},{"Id":755,"SystemId":null,"ProductId":878057041,"Title":"<lng><nl><![CDATA[GPU]]><\\/nl><de><![CDATA[GPU]]><\\/de><\\/lng>","Required":1,"Multiselect":0,"Minimum":null,"Maximum":null,"View":"LIST","Position":5,"Title_Value":"GPU","Items":[{"Id":870,"SystemId":null,"ElementId":755,"Type":"PRODUCT","Position":1,"Data":{"Id":871,"SystemId":null,"ItemId":870,"ProductId":878057020,"Minimum":6,"Maximum":6,"Discount":null,"DiscountType":"PERCENTAGE","Selected":1,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":"6,00","Maximum_Format":"6,00","Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}},{"Id":871,"SystemId":null,"ElementId":755,"Type":"PRODUCT","Position":2,"Data":{"Id":872,"SystemId":null,"ItemId":871,"ProductId":878057067,"Minimum":6,"Maximum":6,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":"6,00","Maximum_Format":"6,00","Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}}]},{"Id":758,"SystemId":null,"ProductId":878057041,"Title":"<lng><nl><![CDATA[Power Supplies]]><\\/nl><de><![CDATA[Power Supplies]]><\\/de><\\/lng>","Required":1,"Multiselect":0,"Minimum":null,"Maximum":null,"View":"LIST","Position":6,"Title_Value":"Power Supplies","Items":[{"Id":875,"SystemId":null,"ElementId":758,"Type":"PRODUCT","Position":1,"Data":{"Id":876,"SystemId":null,"ItemId":875,"ProductId":878057071,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}}]},{"Id":759,"SystemId":null,"ProductId":878057041,"Title":"<lng><nl><![CDATA[Cooling]]><\\/nl><de><![CDATA[Cooling]]><\\/de><\\/lng>","Required":1,"Multiselect":0,"Minimum":null,"Maximum":null,"View":"BLOCK","Position":7,"Title_Value":"Cooling","Items":[{"Id":876,"SystemId":null,"ElementId":759,"Type":"PRODUCT","Position":1,"Data":{"Id":877,"SystemId":null,"ItemId":876,"ProductId":878057072,"Minimum":null,"Maximum":null,"Discount":null,"DiscountType":"PERCENTAGE","Selected":0,"Name":{},"Discount_Value":0,"MinimalPrice_Value":{},"IsActive":{},"ProductDecimals":2,"Minimum_Format":null,"Maximum_Format":null,"Discount_Format":null,"Discount_Value_Format":"0,00","Discount_Value_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Inc":0,"Discount_Value_Inc_Format":"0,00","Discount_Value_Inc_FormatWithCurrency":"\\u20ac\\u00a00,00","Discount_Value_Exc":0,"Discount_Value_Exc_Format":"0,00","Discount_Value_Exc_FormatWithCurrency":"\\u20ac\\u00a00,00"}}]}]';

    const PRODUCT_REGISTRY = {
        PC: {
            type: 'compound',
            productId: '878057041',
            categoryId: '1082307',
            categoryPath: 'Protom',
            packageId: '29449',
            price: 50,
            photoId: '1004181835',
            compoundElementsJson: COMPOUND_ELEMENTS_PC,
            childProducts: PC_CHILD_PRODUCTS,
            mainImageFile: 'pc-main.jpg',
            aliasSlug: 'Eigen-PC-samenstellen'
        }
    };

    function getBaseUrl() {
        if (typeof window === 'undefined' || !window.location) return '';
        const origin = window.location.origin || '';
        const pathname = window.location.pathname || '';
        const prefix = pathname.indexOf('/onderhoud') !== -1 ? '/onderhoud' : '';
        return origin + prefix;
    }

    function getAddCompoundProductUrl() {
        return getBaseUrl() + '/AdminItems/ProductManagement/AddCompoundProduct.php?AdminItem=4&Width=880&Height=480';
    }

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

    function _langKey(lang) {
        return lang.charAt(0).toUpperCase() + lang.slice(1);
    }

    function childKeyFromElement(elementTitle, position) {
        return String(elementTitle).replace(/\s+/g, '-') + '-' + position;
    }

    function buildLngXml(text, langs) {
        let xml = '<lng>';
        for (let i = 0; i < langs.length; i++) {
            const code = langs[i];
            xml += '<' + code + '><![CDATA[' + text + ']]></' + code + '>';
        }
        xml += '</lng>';
        return xml;
    }

    function generateDisplayNames(productName, enabledLangs) {
        if (!enabledLangs || enabledLangs.length === 0) enabledLangs = ['nl', 'de'];
        const slug = String(productName).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
        const X = productName;
        const name = {};
        const short = {};
        const desc = {};
        for (let i = 0; i < enabledLangs.length; i++) {
            const code = enabledLangs[i];
            const tmpl = DEFAULT_LANGUAGE_TEMPLATES[code] || DEFAULT_LANGUAGE_TEMPLATES.en || DEFAULT_LANGUAGE_TEMPLATES.nl;
            name[code] = (tmpl.name || '').replace(/X/g, X);
            short[code] = (tmpl.short || '').replace(/X/g, X);
            desc[code] = (tmpl.desc || '').replace(/X/g, X);
        }
        return { productNumber: productName, aliasSlug: slug || productName, name: name, short: short, desc: desc };
    }

    function getChildSpecByKey(key) {
        for (let i = 0; i < PC_CHILD_PRODUCTS.length; i++) {
            if (PC_CHILD_PRODUCTS[i].key === key) return PC_CHILD_PRODUCTS[i];
        }
        return null;
    }

    function remapCompoundElementsProductIds(templateJson, idMap, compoundProductId, langs, forAdd) {
        langs = langs && langs.length ? langs : COMPOUND_LANGS;
        let elements;
        try {
            elements = typeof templateJson === 'string' ? JSON.parse(templateJson) : templateJson;
        } catch (e) {
            return '[]';
        }
        for (let e = 0; e < elements.length; e++) {
            const el = elements[e];
            if (forAdd) {
                el.Id = null;
                el.SystemId = null;
            }
            el.ProductId = compoundProductId != null ? Number(compoundProductId) : el.ProductId;
            const titleVal = el.Title_Value || '';
            if (titleVal) {
                el.Title = buildLngXml(titleVal, langs);
            }
            if (!el.Items) continue;
            for (let i = 0; i < el.Items.length; i++) {
                const item = el.Items[i];
                if (forAdd) {
                    item.Id = null;
                    item.SystemId = null;
                    item.ElementId = null;
                }
                if (item.Type !== 'PRODUCT' || !item.Data) continue;
                const key = childKeyFromElement(titleVal, item.Position);
                const newPid = idMap[key];
                if (newPid != null) {
                    item.Data.ProductId = Number(newPid);
                }
                const spec = getChildSpecByKey(key);
                if (spec) {
                    if (spec.minimum != null) item.Data.Minimum = spec.minimum;
                    if (spec.maximum != null) item.Data.Maximum = spec.maximum;
                    if (spec.selected != null) item.Data.Selected = spec.selected ? 1 : 0;
                }
                if (forAdd && item.Data) {
                    item.Data.Id = null;
                    item.Data.SystemId = null;
                    item.Data.ItemId = null;
                }
            }
        }
        return JSON.stringify(elements);
    }

    function GenerateProductObject(productName, overrides) {
        const reg = PRODUCT_REGISTRY[productName];
        overrides = overrides || {};
        const enabledLangs = overrides.enabledLanguages && overrides.enabledLanguages.length > 0
            ? overrides.enabledLanguages
            : COMPOUND_LANGS;

        let names;
        if (reg && reg.displayNameNl) {
            const productNumber = overrides.productNumber != null ? overrides.productNumber : (reg.productNumber != null ? reg.productNumber : productName);
            const aliasSlug = reg.aliasSlug != null ? reg.aliasSlug : String(productNumber).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
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
            if (overrides.productNumber) names.productNumber = overrides.productNumber;
            if (reg && reg.aliasSlug) names.aliasSlug = reg.aliasSlug;
        }

        if (!reg) return { name: productName, type: 'unknown', fields: [] };

        const productId = overrides.productId != null ? String(overrides.productId) : reg.productId;
        const isAdd = overrides.mode === 'Add' || productId === '0' || productId === '';
        const id = isAdd ? '0' : productId;
        const price = overrides.price != null ? Number(overrides.price) : (reg.price != null ? reg.price : 50);
        const priceStr = String(price);
        const priceFormat = price.toFixed(2).replace('.', ',');
        const priceInc = (price * 1.21).toFixed(2);
        const priceIncFormat = priceInc.replace('.', ',');
        const categoryId = overrides.categoryId != null ? overrides.categoryId : reg.categoryId;
        const categoryPath = overrides.categoryPath != null ? overrides.categoryPath : reg.categoryPath;
        const packageId = overrides.packageId != null ? overrides.packageId : reg.packageId;
        const compoundElementsJson = overrides.compoundElementsJson != null ? overrides.compoundElementsJson : reg.compoundElementsJson;
        const photoId = overrides.photoId != null ? overrides.photoId : (reg.photoId || '');

        if (reg.type === 'compound') {
            const categoryJson = '[{"Id":"","Category":"' + categoryId + '","Product":"' + id + '","Position":"1","MaxPosition":1,"NumberOfChildren":26,"OrderBy":"2","ShowOnWebsite":"Y","UUID":"","Path":"' + categoryPath + '","Type":"Current"}]';
            const staggeredJson = '[{"Id":"fixed","ProductId":"' + id + '","Number":1,"Price":' + priceStr + ',"Discount":0,"SellPrice":' + priceStr + ',"TAX":21,"TaxTariff":"NORMAL","StaggeredPrice":' + priceStr + ',"StaggeredSellPrice":' + priceStr + ',"OriginalDiscount":"0.00","Price_Format":"' + priceFormat + '","Price_FormatWithCurrency":"&#x20ac;&#x00a0;' + priceFormat + '","Price_Inc":' + priceInc + ',"Price_Inc_Format":"' + priceIncFormat + '","Price_Inc_FormatWithCurrency":"&#x20ac;&#x00a0;' + priceIncFormat + '","Price_Exc":' + priceStr + ',"Price_Exc_Format":"' + priceFormat + '","Price_Exc_FormatWithCurrency":"&#x20ac;&#x00a0;' + priceFormat + '","Discount_Format":"0,00","Discount_FormatWithCurrency":"&#x20ac;&#x00a0;0,00","Discount_Inc":0,"Discount_Inc_Format":"0,00","Discount_Inc_FormatWithCurrency":"&#x20ac;&#x00a0;0,00","Discount_Exc":0,"Discount_Exc_Format":"0,00","Discount_Exc_FormatWithCurrency":"&#x20ac;&#x00a0;0,00","SellPrice_Format":"' + priceFormat + '","SellPrice_FormatWithCurrency":"&#x20ac;&#x00a0;' + priceFormat + '","SellPrice_Inc":' + priceInc + ',"SellPrice_Inc_Format":"' + priceIncFormat + '","SellPrice_Inc_FormatWithCurrency":"&#x20ac;&#x00a0;' + priceIncFormat + '","SellPrice_Exc":' + priceStr + ',"SellPrice_Exc_Format":"' + priceFormat + '","SellPrice_Exc_FormatWithCurrency":"&#x20ac;&#x00a0;' + priceFormat + '","StaggeredPrice_Format":"' + priceFormat + '","StaggeredPrice_FormatWithCurrency":"&#x20ac;&#x00a0;' + priceFormat + '","StaggeredPrice_Inc":' + priceInc + ',"StaggeredPrice_Inc_Format":"' + priceIncFormat + '","StaggeredPrice_Inc_FormatWithCurrency":"&#x20ac;&#x00a0;' + priceIncFormat + '","StaggeredPrice_Exc":' + priceStr + ',"StaggeredPrice_Exc_Format":"' + priceFormat + '","StaggeredPrice_Exc_FormatWithCurrency":"&#x20ac;&#x00a0;' + priceFormat + '","StaggeredSellPrice_Format":"' + priceFormat + '","StaggeredSellPrice_FormatWithCurrency":"&#x20ac;&#x00a0;' + priceFormat + '","StaggeredSellPrice_Inc":' + priceInc + ',"StaggeredSellPrice_Inc_Format":"' + priceIncFormat + '","StaggeredSellPrice_Inc_FormatWithCurrency":"&#x20ac;&#x00a0;' + priceIncFormat + '","StaggeredSellPrice_Exc":' + priceStr + ',"StaggeredSellPrice_Exc_Format":"' + priceFormat + '","StaggeredSellPrice_Exc_FormatWithCurrency":"&#x20ac;&#x00a0;' + priceFormat + '","OriginalStaggeredPriceSellPrice":"' + priceStr + '.00","OriginalDiscount_Format":"0,00","OriginalDiscount_FormatWithCurrency":"&#x20ac;&#x00a0;0,00","OriginalDiscount_Inc":0,"OriginalDiscount_Inc_Format":"0,00","OriginalDiscount_Inc_FormatWithCurrency":"&#x20ac;&#x00a0;0,00","OriginalDiscount_Exc":0,"OriginalDiscount_Exc_Format":"0,00","OriginalDiscount_Exc_FormatWithCurrency":"&#x20ac;&#x00a0;0,00","TotalPrice":"' + priceFormat + '"}]';
            const photoJson = isAdd ? '[]' : '[{"Id":"' + photoId + '","Product":"' + id + '","Extension":".jpg","MainPhoto":"Y","Alt":"","Position":"1","Type":"Current"}]';
            const fields = [
                ['AdminItem', '4'],
                ['Mode', isAdd ? 'Add' : 'Modify'],
                ['Id', id],
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
                fields.push(
                    ['ProductName_' + lang, names.name[lang]],
                    ['ShortDescription_' + lang, names.short[lang]],
                    ['Description_' + lang, names.desc[lang]]
                );
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
            fields.push(['ObjectId', id], ['CompoundElements', compoundElementsJson || '[]']);
            for (let L4 = 0; L4 < enabledLangs.length; L4++) {
                const lng = enabledLangs[L4];
                fields.push(
                    ['Metadata_Alias_' + lng, names.aliasSlug],
                    ['Metadata_PageTitle_' + lng, names.name[lng]],
                    ['Metadata_MetaDescription_' + lng, names.short[lng]],
                    ['Metadata_MetaKeywords_' + lng, names.name[lng]]
                );
            }
            fields.push(['ObjectId', id]);
            const firstLangName = names.name[enabledLangs[0]];
            return { name: firstLangName, type: 'compound', fields: fields };
        }

        return { name: productName, type: reg.type || 'normal', fields: [] };
    }

    function getChildApiName(spec) {
        return spec.nameNl || spec.nameEn || spec.key;
    }

    if (typeof window !== 'undefined') {
        window.CCVCompoundProducts = {
            COMPOUND_LANGS: COMPOUND_LANGS,
            PRODUCT_REGISTRY: PRODUCT_REGISTRY,
            PC_CHILD_PRODUCTS: PC_CHILD_PRODUCTS,
            COMPOUND_ELEMENTS_PC: COMPOUND_ELEMENTS_PC,
            DEFAULT_LANGUAGE_TEMPLATES: DEFAULT_LANGUAGE_TEMPLATES,
            getBaseUrl: getBaseUrl,
            getAddCompoundProductUrl: getAddCompoundProductUrl,
            buildFormData: buildFormData,
            getProductIdFromResponse: getProductIdFromResponse,
            GenerateProductObject: GenerateProductObject,
            remapCompoundElementsProductIds: remapCompoundElementsProductIds,
            childKeyFromElement: childKeyFromElement,
            buildLngXml: buildLngXml,
            getChildSpecByKey: getChildSpecByKey,
            getChildApiName: getChildApiName
        };
    }
})();
