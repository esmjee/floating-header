/**
 * Add Product Option attributes helper – for AddProductOption.php
 * Injects a control to add/reload generated attribute sets (colors, sizes, materials, etc.).
 */
const SCRIPT_SETTINGS_KEY_PREFIX = 'ccv-script-settings:';

const ALL_ATTRIBUTE_KEYS = [
    'colors', 'sizes', 'lengths', 'widths', 'heights', 'materials', 'patterns', 'finishes',
    'scents', 'flavors', 'shapes', 'ram', 'storage', 'weights', 'voltages', 'speeds',
    'editions', 'bundles', 'energies', 'brightness', 'temperatures', 'hardness', 'textures',
    'connections', 'certifications', 'compatibilities', 'purposes', 'conditions', 'seasons'
];

class AddProductOptionAttributesScript extends CCVScriptBase {
    static get ALL_CATEGORY_KEYS() { return ALL_ATTRIBUTE_KEYS; }
    constructor() {
        super();
        this.enabled = true;
        this._injectedRoot = null;
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

    _getEnabledCategoryKeys() {
        const all = AddProductOptionAttributesScript.ALL_CATEGORY_KEYS;
        const settings = this._getSettings();
        return all.filter(key => settings[key] !== false);
    }

    onEnable() {
        this._injectedRoot = this._runScript();
    }

    onDisable() {
        if (this._injectedRoot && this._injectedRoot.parentNode) {
            this._injectedRoot.remove();
            this._injectedRoot = null;
        }
    }

    _runScript() {
        const NUMBER_OF_ATTRIBUTES_TO_ADD = 5;
        const enabledKeys = this._getEnabledCategoryKeys();
        if (enabledKeys.length === 0) return null;

        const attributes = {
            colors: [
                "red", "green", "blue", "yellow", "black", "white", "grey", "purple", "orange",
                "beige", "gold", "silver", "navy", "turquoise", "pink", "magenta", "cyan", "maroon",
                "olive", "teal", "lavender", "mint", "peach", "cream", "charcoal", "amber", "ruby"
            ],
            sizes: [
                "XS", "S", "M", "L", "XL", "XXL", "XXXL", "small", "medium", "large", "oversized",
                "tiny", "compact", "wide", "slim", "tall", "short"
            ],
            lengths: [
                "extra short", "short", "mid length", "long", "extra long",
                "20cm", "30cm", "40cm", "50cm", "70cm", "1m", "1.5m", "2m", "3m"
            ],
            widths: [
                "narrow", "medium width", "wide", "extra wide",
                "5cm", "10cm", "15cm", "20cm"
            ],
            heights: [
                "low", "medium height", "tall", "extra tall",
                "10cm", "20cm", "30cm", "50cm", "1m"
            ],
            materials: [
                "cotton", "wool", "leather", "plastic", "metal", "steel", "aluminum", "titanium",
                "rubber", "glass", "ceramic", "carbon fiber", "linen", "silk", "synthetic", "bamboo",
                "hemp", "resin", "granite", "marble", "oak wood", "pine wood", "acrylic", "polyester"
            ],
            patterns: [
                "solid", "striped", "dotted", "checked", "plaid", "geometric", "floral", "abstract",
                "marbled", "gradient", "animal print", "camouflage"
            ],
            finishes: [
                "matte", "glossy", "satin", "polished", "brushed", "coated", "raw", "textured",
                "mirror finish", "frosted", "metallic", "pearlescent"
            ],
            scents: [
                "vanilla", "lavender", "rose", "citrus", "mint", "pine", "coconut", "cherry", "berry",
                "fresh linen", "coffee", "sandalwood", "jasmine", "ocean breeze"
            ],
            flavors: [
                "chocolate", "strawberry", "banana", "raspberry", "caramel", "coffee", "vanilla",
                "mint", "hazelnut", "peach", "watermelon", "apple", "lemon"
            ],
            shapes: [
                "round", "square", "oval", "rectangular", "triangular", "hexagonal",
                "cylindrical", "sphere", "cube", "pyramid", "flat"
            ],
            ram: [
                "4GB", "8GB", "16GB", "32GB", "64GB", "128GB", "256GB"
            ],
            storage: [
                "128GB", "256GB", "128GB", "512GB", "1TB", "2TB", "4TB", "8TB"
            ],
            weights: [
                "very light", "light", "medium weight", "heavy", "ultra heavy",
                "1kg", "2kg", "5kg", "10kg", "20kg"
            ],
            voltages: [
                "3.3V", "5V", "9V", "12V", "24V", "110V", "220V", "240V"
            ],
            speeds: [
                "slow", "medium", "fast", "ultra fast", "turbo", "silent", "high performance"
            ],
            editions: [
                "standard edition", "limited edition", "collector's edition", "premium edition",
                "special edition", "anniversary edition", "founders edition"
            ],
            bundles: [
                "single pack", "double pack", "triple pack", "value pack", "starter pack",
                "family pack", "mega bundle", "refill pack"
            ],
            energies: [
                "low energy", "medium energy", "high energy", "eco mode", "boost mode"
            ],
            brightness: [
                "dim", "soft", "normal", "bright", "ultra bright", "warm light", "cool light"
            ],
            temperatures: [
                "cold", "cool", "room temperature", "warm", "hot", "very hot"
            ],
            hardness: [
                "soft", "semi soft", "medium hard", "hard", "ultra hard"
            ],
            textures: [
                "smooth", "rough", "gritty", "velvety", "silky", "ribbed", "woven", "microfiber"
            ],
            connections: [
                "USB-A", "USB-C", "micro USB", "Lightning", "HDMI", "DisplayPort", "Bluetooth",
                "WiFi", "Ethernet", "NFC"
            ],
            certifications: [
                "CE certified", "FDA approved", "ISO 9001", "RoHS compliant", "Fair Trade",
                "Energy Star", "Waterproof IPX4", "Waterproof IPX7", "Fire resistant"
            ],
            compatibilities: [
                "universal", "Android", "iOS", "Windows", "Mac", "PlayStation", "Xbox", "Nintendo"
            ],
            purposes: [
                "indoor use", "outdoor use", "travel", "office", "gaming", "sports", "kitchen",
                "bathroom", "garden", "workshop", "children", "pets"
            ],
            conditions: [
                "new", "like new", "refurbished", "used", "fair condition", "damaged"
            ],
            seasons: [
                "winter", "spring", "summer", "autumn", "all-season"
            ]
        };

        const filteredAttributes = {};
        enabledKeys.forEach(k => { if (attributes[k]) filteredAttributes[k] = attributes[k]; });

        let selectedCategoryKey = null;

        const getRandomCategory = () => {
            const attributeKeys = Object.keys(filteredAttributes);
            if (attributeKeys.length === 0) return null;
            const randomIndex = Math.floor(Math.random() * attributeKeys.length);
            return attributeKeys[randomIndex];
        };

        const normalizeAttributeKey = (rawTitle) => {
            const cleanedTitle = rawTitle.replace(" (Gegenereerde set)", "").trim().toLowerCase();
            if (cleanedTitle in filteredAttributes) return cleanedTitle;
            if (!cleanedTitle.endsWith("s") && `${cleanedTitle}s` in filteredAttributes) return `${cleanedTitle}s`;
            if (cleanedTitle.endsWith("s") && cleanedTitle.slice(0, -1) in filteredAttributes) return cleanedTitle.slice(0, -1);
            return null;
        };

        const getOrCreateSelectedCategoryKey = () => {
            if (selectedCategoryKey && filteredAttributes[selectedCategoryKey]) return selectedCategoryKey;
            const titleInputs = document.querySelectorAll('input[name^="OptionName"]');
            for (const titleInput of titleInputs) {
                const rawTitle = titleInput.value.trim();
                if (rawTitle === "") continue;
                const normalizedKey = normalizeAttributeKey(rawTitle);
                if (normalizedKey) {
                    selectedCategoryKey = normalizedKey;
                    return selectedCategoryKey;
                }
            }
            const randomKey = getRandomCategory();
            selectedCategoryKey = randomKey;
            return selectedCategoryKey;
        };

        const getRandomAttribute = () => {
            const categoryKey = getOrCreateSelectedCategoryKey();
            const values = filteredAttributes[categoryKey];
            if (!values || values.length === 0) return '';
            const randomIndex = Math.floor(Math.random() * values.length);
            return values[randomIndex];
        };

        const reloadAttributes = (numberOfAttributesToAdd = 0) => {
            const attributeInputs = document.querySelectorAll('input[name^="AttributeName"]');
            attributeInputs.forEach((currentAttributeInput, currentIndex) => {
                currentAttributeInput.value = "";
                currentAttributeInput.value = `${currentIndex}. ${getRandomAttribute()}`;
                currentAttributeInput.dispatchEvent(new Event("input", { bubbles: true }));
            });
        };

        const insertIfExistsSetName = () => {
            const titleInputs = document.querySelectorAll('input[name^="OptionName"]');
            const categoryKey = getOrCreateSelectedCategoryKey();
            titleInputs.forEach((input) => {
                if (input.value !== "") return;
                input.value = categoryKey + " (Gegenereerde set)";
            });
        };

        const fillAttributes = (numberOfAttributesToAdd = 0) => {
            const inputs = document.querySelectorAll('input[name^="AttributeName"]');
            let attributeIndex = 0;
            inputs.forEach((input) => {
                if (input.value !== "") return;
                input.value = `${attributeIndex++}. ${getRandomAttribute()}`;
                input.dispatchEvent(new Event("input", { bubbles: true }));
            });
        };

        const addAttributes = (numberOfAttributesToAdd = 0) => {
            for (let attributeIndex = 0; attributeIndex < numberOfAttributesToAdd; attributeIndex++) {
                if (typeof AddAttribute === "function") {
                    AddAttribute();
                } else {
                    console.error("AddAttribute is not defined");
                    return null;
                }
            }
            setTimeout(() => fillAttributes(numberOfAttributesToAdd), 500);
        };

        const buttonContainer = document.querySelector("#ButtonContainer");
        if (!buttonContainer) return null;

        const wrapper = document.createElement("div");
        wrapper.className = "custom-form-group ccv-script-injected";
        wrapper.innerHTML = `
            <input id="js-custom-input" type="number" value="${NUMBER_OF_ATTRIBUTES_TO_ADD}" class="custom-input" placeholder="Aantal" />
            <button id="js-custom-input-submit" class="custom-button" type="button">Run script</button>
            <button id="js-custom-input-retry" class="retry-button" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="2 0 24 20" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1 2.13-9.36" />
                </svg>
            </button>
        `;
        buttonContainer.appendChild(wrapper);

        const runScriptButton = wrapper.querySelector("#js-custom-input-submit");
        runScriptButton.addEventListener("click", (e) => {
            e.preventDefault();
            const amountInput = wrapper.querySelector("#js-custom-input");
            insertIfExistsSetName();
            addAttributes(Number(amountInput.value) || NUMBER_OF_ATTRIBUTES_TO_ADD);
        });

        const reloadButton = wrapper.querySelector("#js-custom-input-retry");
        reloadButton.addEventListener("click", (e) => {
            e.preventDefault();
            const amountInput = wrapper.querySelector("#js-custom-input");
            insertIfExistsSetName();
            reloadAttributes(Number(amountInput.value) || NUMBER_OF_ATTRIBUTES_TO_ADD);
        });

        return wrapper;
    }

    view() {
        const settings = this._getSettings();
        const toggles = ALL_ATTRIBUTE_KEYS.map(key => {
            const checked = settings[key] !== false;
            const label = key.charAt(0).toUpperCase() + key.slice(1);
            return `<label class="ccv-script-attr-toggle"><input type="checkbox" data-script-setting="${key}" ${checked ? 'checked' : ''}> ${label}</label>`;
        }).join('');
        return `
            <div class="ccv-script-settings">
                <p class="ccv-script-desc">Adds a small control on the Add Product Option page to generate attribute sets. Toggle which categories (e.g. colors, sizes) are used when generating.</p>
                <div class="ccv-script-attr-toggles" id="ccv-script-attr-toggles">${toggles}</div>
                <p class="ccv-hint">Requires the page's global <code>AddAttribute</code> function. Disable the script to remove the injected UI.</p>
            </div>
        `;
    }
}

if (typeof window !== 'undefined') {
    window.__CCV_SCRIPT_INSTANCE__ = new AddProductOptionAttributesScript();
}
