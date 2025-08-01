const COLOR_PALETTE = {
    free: [
        '#000000', '#898D90', '#D4D7D9', '#FFFFFF',
        '#6D001A', '#BE0039', '#FF4500', '#FFA800',
        '#FFD635', '#00A368', '#00CC78', '#7EED56',
        '#00756F', '#009EAA', '#2450A4', '#3690EA',
        '#51E9F4', '#493AC1', '#6A5CFF', '#811E9F',
        '#B44AC0', '#FF3881', '#FF99AA', '#6D482F',
        '#9C6926', '#000000'
    ],
    
    locked: [
        '#515252', '#94B3FF', '#004CFF', '#0E4B99',
        '#2E69FF', '#83B3FF', '#4E76A8', '#9E0059',
        '#DE107F', '#FF8FA3', '#FFDBF0', '#FD4659',
        '#DE107F', '#FFB0FF', '#FF8FA3', '#C48242',
        '#A06A42', '#81C784', '#388E3C', '#1B5E20',
        '#FFC947', '#FFEB3B', '#F57C00', '#E65100',
        '#8E24AA', '#3F51B5', '#2196F3', '#00BCD4',
        '#009688', '#4CAF50', '#8BC34A', '#CDDC39'
    ]
};

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join("");
}

function colorDistance(color1, color2) {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    
    if (!c1 || !c2) return Infinity;
    
    const dr = c1.r - c2.r;
    const dg = c1.g - c2.g;
    const db = c1.b - c2.b;
    
    return Math.sqrt(dr * dr + dg * dg + db * db);
}

function findClosestColor(targetColor, palette) {
    let closestColor = palette[0];
    let minDistance = Infinity;
    
    for (const color of palette) {
        const distance = colorDistance(targetColor, color);
        if (distance < minDistance) {
            minDistance = distance;
            closestColor = color;
        }
    }
    
    return closestColor;
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
    
    document.getElementById('freeCount').textContent = `(${freeSelected} selected)`;
    document.getElementById('lockedCount').textContent = `(${lockedSelected} selected)`;
    document.getElementById('totalSelected').textContent = `Total: ${totalSelected} colors selected`;
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
    
    if (mode === 'free') {
        return COLOR_PALETTE.free;
    } else if (mode === 'custom') {
        const selected = getSelectedColors();
        return selected.length > 0 ? selected : COLOR_PALETTE.free;
    }
    
    return COLOR_PALETTE.free;
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
