const COLOR_PALETTE = {
    free: [
        '#000000', '#FFFFFF', '#898D90', '#D4D7D9',
        '#6D001A', '#BE0039', '#FF4500', '#FFA800',
        '#FFD635', '#FFF8B4', '#00A368', '#00CC78', 
        '#7EED56', '#00756F', '#009EAA', '#00CCC0',
        '#2450A4', '#3690EA', '#51E9F4', '#493AC1',
        '#6A5CFF', '#94B3FF', '#811E9F', '#B44AC0',
        '#FF3881', '#FF99AA', '#6D482F', '#9C6926',
        '#FFB470', '#C1876B'
    ].map(color => color.toUpperCase()),
    
    locked: [
        '#515252', '#94B3FF', '#004CFF', '#0E4B99',
        '#2E69FF', '#83B3FF', '#4E76A8', '#9E0059',
        '#DE107F', '#FF8FA3', '#FFDBF0', '#FD4659',
        '#DE107F', '#FFB0FF', '#FF8FA3', '#C48242',
        '#A06A42', '#81C784', '#388E3C', '#1B5E20',
        '#FFC947', '#FFEB3B', '#F57C00', '#E65100',
        '#8E24AA', '#3F51B5', '#2196F3', '#00BCD4',
        '#009688', '#4CAF50', '#8BC34A', '#CDDC39'
    ].map(color => color.toUpperCase())
};

function hexToRgb(hex) {
    // Ensure hex is a string and remove any whitespace
    if (typeof hex !== 'string') return null;
    hex = hex.trim();
    
    // Add # if missing
    if (!hex.startsWith('#')) {
        hex = '#' + hex;
    }
    
    // Validate hex format
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
        console.warn('Invalid hex color:', hex);
        return null;
    }
    
    return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    };
}

function rgbToHex(r, g, b) {
    // Ensure values are valid integers between 0-255
    r = Math.max(0, Math.min(255, Math.round(r)));
    g = Math.max(0, Math.min(255, Math.round(g)));
    b = Math.max(0, Math.min(255, Math.round(b)));
    
    return "#" + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join("").toUpperCase();
}

function rgbToLab(r, g, b) {
    // Convert RGB to XYZ
    let x = r / 255;
    let y = g / 255;
    let z = b / 255;

    x = x > 0.04045 ? Math.pow((x + 0.055) / 1.055, 2.4) : x / 12.92;
    y = y > 0.04045 ? Math.pow((y + 0.055) / 1.055, 2.4) : y / 12.92;
    z = z > 0.04045 ? Math.pow((z + 0.055) / 1.055, 2.4) : z / 12.92;

    x *= 95.047;
    y *= 100.000;
    z *= 108.883;

    // Convert XYZ to LAB
    x /= 95.047;
    y /= 100.000;
    z /= 108.883;

    x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x + 16/116);
    y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y + 16/116);
    z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z + 16/116);

    const L = (116 * y) - 16;
    const a = 500 * (x - y);
    const bComponent = 200 * (y - z);

    return { L, a, b: bComponent };
}

function colorDistance(color1, color2) {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    
    if (!c1 || !c2) return Infinity;
    
    // Use perceptual color distance (Delta E CIE76)
    const lab1 = rgbToLab(c1.r, c1.g, c1.b);
    const lab2 = rgbToLab(c2.r, c2.g, c2.b);
    
    const deltaL = lab1.L - lab2.L;
    const deltaA = lab1.a - lab2.a;
    const deltaB = lab1.b - lab2.b;
    
    return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
}

function findClosestColor(targetColor, palette) {
    if (!palette || palette.length === 0) {
        console.warn('Empty palette provided, using default black');
        return '#000000';
    }
    
    // Ensure target color is valid
    const targetRgb = hexToRgb(targetColor);
    if (!targetRgb) {
        console.warn('Invalid target color:', targetColor);
        return palette[0];
    }
    
    let closestColor = palette[0];
    let minDistance = Infinity;
    
    for (const color of palette) {
        // Validate each palette color
        if (!hexToRgb(color)) {
            console.warn('Invalid palette color:', color);
            continue;
        }
        
        const distance = colorDistance(targetColor, color);
        if (distance < minDistance) {
            minDistance = distance;
            closestColor = color;
        }
    }
    
    // Validate the result is actually in the palette
    if (!palette.includes(closestColor)) {
        console.warn('Closest color not in palette, using first palette color');
        return palette[0];
    }
    
    return closestColor;
}

function validatePalette(palette) {
    const validColors = [];
    const invalidColors = [];
    
    for (const color of palette) {
        if (hexToRgb(color)) {
            validColors.push(color.toUpperCase());
        } else {
            invalidColors.push(color);
        }
    }
    
    if (invalidColors.length > 0) {
        console.warn('Found invalid colors in palette:', invalidColors);
    }
    
    return validColors;
}

function getAvailableColors(includeLocked = false, selectedLockedColors = []) {
    let availableColors = [...COLOR_PALETTE.free];
    
    if (includeLocked) {
        availableColors = availableColors.concat(selectedLockedColors);
    }
    
    return availableColors;
}

function initializeColorPalette() {
    const freePalette = document.getElementById('freePalette');
    const lockedPalette = document.getElementById('lockedPalette');
    
    if (!freePalette || !lockedPalette) {
        return;
    }
    
    COLOR_PALETTE.free.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = color;
        swatch.title = color.toUpperCase();
        freePalette.appendChild(swatch);
    });
    
    COLOR_PALETTE.locked.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch locked';
        swatch.style.backgroundColor = color;
        swatch.title = color.toUpperCase() + ' (Locked)';
        lockedPalette.appendChild(swatch);
    });
}

function initializeLockedColorSelection() {
    console.log('Legacy locked color selection initialized');
}

function initializeSelectableColorPicker() {
    const freeColorsContainer = document.getElementById('selectableFreeColors');
    const lockedColorsContainer = document.getElementById('selectableLockedColors');
    
    if (!freeColorsContainer || !lockedColorsContainer) {
        console.warn('Color picker containers not found');
        return;
    }
    
    COLOR_PALETTE.free.forEach((color, index) => {
        const swatch = createSelectableSwatch(color, `free-${index}`, false);
        freeColorsContainer.appendChild(swatch);
    });
    
    COLOR_PALETTE.locked.forEach((color, index) => {
        const swatch = createSelectableSwatch(color, `locked-${index}`, true);
        lockedColorsContainer.appendChild(swatch);
    });
    
    updateSelectionCounts();
}

function createSelectableSwatch(color, id, isLocked) {
    const swatch = document.createElement('div');
    swatch.className = `selectable-color-swatch ${isLocked ? 'locked' : ''}`;
    swatch.style.backgroundColor = color;
    swatch.dataset.color = color;
    swatch.dataset.id = id;
    swatch.dataset.locked = isLocked;
    swatch.title = `${color.toUpperCase()} ${isLocked ? '(Locked)' : '(Free)'}`;
    
    swatch.addEventListener('click', () => {
        toggleColorSelection(swatch);
    });
    
    return swatch;
}

function toggleColorSelection(swatch) {
    swatch.classList.toggle('selected');
    updateSelectionCounts();
}

function updateSelectionCounts() {
    const freeSelected = document.querySelectorAll('#selectableFreeColors .selectable-color-swatch.selected').length;
    const lockedSelected = document.querySelectorAll('#selectableLockedColors .selectable-color-swatch.selected').length;
    const totalSelected = freeSelected + lockedSelected;
    
    const freeCountEl = document.getElementById('freeCount');
    const lockedCountEl = document.getElementById('lockedCount');
    const totalSelectedEl = document.getElementById('totalSelected');
    
    if (freeCountEl) freeCountEl.textContent = `(${freeSelected} selected)`;
    if (lockedCountEl) lockedCountEl.textContent = `(${lockedSelected} selected)`;
    if (totalSelectedEl) totalSelectedEl.textContent = `Total: ${totalSelected} colors selected`;
}

function getSelectedColors() {
    const selectedSwatches = document.querySelectorAll('.selectable-color-swatch.selected');
    return Array.from(selectedSwatches).map(swatch => swatch.dataset.color);
}

function selectAllFreeColors() {
    const freeSwatches = document.querySelectorAll('#selectableFreeColors .selectable-color-swatch');
    freeSwatches.forEach(swatch => swatch.classList.add('selected'));
    updateSelectionCounts();
}

function selectAllLockedColors() {
    const lockedSwatches = document.querySelectorAll('#selectableLockedColors .selectable-color-swatch');
    lockedSwatches.forEach(swatch => swatch.classList.add('selected'));
    updateSelectionCounts();
}

function selectAllColors() {
    const allSwatches = document.querySelectorAll('.selectable-color-swatch');
    allSwatches.forEach(swatch => swatch.classList.add('selected'));
    updateSelectionCounts();
}

function clearAllColors() {
    const allSwatches = document.querySelectorAll('.selectable-color-swatch');
    allSwatches.forEach(swatch => swatch.classList.remove('selected'));
    updateSelectionCounts();
}

function getCurrentColorMode() {
    const activeTab = document.querySelector('.mode-tab.active');
    return activeTab ? activeTab.dataset.mode : 'free';
}

function getAvailableColorsForMode() {
    const mode = getCurrentColorMode();
    let colors = [];
    
    if (mode === 'free') {
        colors = COLOR_PALETTE.free;
    } else if (mode === 'custom') {
        const selected = getSelectedColors();
        colors = selected.length > 0 ? selected : COLOR_PALETTE.free;
    }
    
    // Validate and clean the palette
    const validColors = validatePalette(colors);
    
    if (validColors.length === 0) {
        console.warn('No valid colors found, falling back to basic palette');
        return ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF'];
    }
    
    console.log(`Using ${validColors.length} valid colors for conversion`);
    return validColors;
}

function getSelectedLockedColors() {
    const selectedLockedSwatches = document.querySelectorAll('#selectableLockedColors .selectable-color-swatch.selected');
    return Array.from(selectedLockedSwatches).map(swatch => swatch.dataset.color);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        COLOR_PALETTE,
        hexToRgb,
        rgbToHex,
        colorDistance,
        findClosestColor,
        getAvailableColors,
        initializeColorPalette,
        initializeLockedColorSelection,
        getSelectedLockedColors
    };
}
