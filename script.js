document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    initializeColorPalette();
    initializeSelectableColorPicker();
    setupEventListeners();
    updatePixelInfo();
    initializeColorModeTabs();
}

function initializeColorModeTabs() {
    const modeTabs = document.querySelectorAll('.mode-tab');
    const customSection = document.getElementById('customColorsSection');
    
    modeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            modeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const mode = tab.dataset.mode;
            if (mode === 'custom') {
                customSection.style.display = 'block';
                if (getSelectedColors().length === 0) {
                    selectAllFreeColors();
                }
            } else {
                customSection.style.display = 'none';
            }
        });
    });
    
    document.getElementById('selectAllFree').addEventListener('click', selectAllFreeColors);
    document.getElementById('selectAllLocked').addEventListener('click', selectAllLockedColors);
    document.getElementById('selectAll').addEventListener('click', selectAllColors);
    document.getElementById('clearAll').addEventListener('click', clearAllColors);
}

function setupEventListeners() {
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const pixelSize = document.getElementById('pixelSize');
    const pixelSizeNumber = document.getElementById('pixelSizeNumber');
    const convertBtn = document.getElementById('convertBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadHighResBtn = document.getElementById('downloadHighResBtn');
    const copyBtn = document.getElementById('copyBtn');
    const showGrid = document.getElementById('showGrid');
    const gridToggle = document.getElementById('gridToggle');

    uploadArea.addEventListener('click', () => imageInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleFileDrop);
    imageInput.addEventListener('change', handleFileSelect);

    pixelSize.addEventListener('input', (e) => {
        pixelSizeNumber.value = e.target.value;
        updatePixelInfo();
    });
    
    pixelSizeNumber.addEventListener('input', (e) => {
        const value = Math.max(8, Math.min(200, parseInt(e.target.value) || 32));
        pixelSize.value = value;
        pixelSizeNumber.value = value;
        updatePixelInfo();
    });

    showGrid.addEventListener('change', handleGridToggle);
    gridToggle.addEventListener('click', handleGridToggle);

    convertBtn.addEventListener('click', convertImage);

    downloadBtn.addEventListener('click', () => imageProcessor.downloadPixelArt());
    downloadHighResBtn.addEventListener('click', handleHighResDownload);
    copyBtn.addEventListener('click', handleCopyToClipboard);
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
}

function handleFileDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

async function handleFile(file) {
    try {
        ImageProcessor.validateImageFile(file);
        showLoadingState();
        await imageProcessor.loadImage(file);
        document.getElementById('controlsSection').style.display = 'block';
        updatePixelInfo();
        document.getElementById('convertBtn').disabled = false;
    } catch (error) {
        console.error('Error loading image:', error);
        alert(error.message || 'Error loading image. Please try again.');
    } finally {
        hideLoadingState();
    }
}

function showLoadingState() {
    const uploadArea = document.getElementById('uploadArea');
    const originalContent = uploadArea.innerHTML;
    uploadArea.setAttribute('data-original-content', originalContent);
    uploadArea.innerHTML = `
        <div class="upload-content">
            <div class="loading"></div>
            <p>Loading image...</p>
        </div>
    `;
}

function hideLoadingState() {
    const uploadArea = document.getElementById('uploadArea');
    const originalContent = uploadArea.getAttribute('data-original-content');
    if (originalContent) {
        uploadArea.innerHTML = originalContent;
        uploadArea.removeAttribute('data-original-content');
    }
}

function updatePixelInfo() {
    const pixelSize = parseInt(document.getElementById('pixelSize').value);
    const pixelInfo = document.getElementById('pixelInfo');
    
    if (imageProcessor.originalImage) {
        const { width, height, total } = imageProcessor.calculatePixelCount(pixelSize);
        pixelInfo.textContent = `Pixels: ${width} × ${height} = ${total.toLocaleString()} pixels`;
    } else {
        pixelInfo.textContent = `Target width: ${pixelSize} pixels`;
    }
}

function handleColorModeChange(e) {
    console.log('Legacy color mode change handler');
}

function handleGridToggle() {
    const gridVisible = imageProcessor.toggleGrid();
    const gridToggle = document.getElementById('gridToggle');
    const showGrid = document.getElementById('showGrid');
    
    gridToggle.classList.toggle('active', gridVisible);
    showGrid.checked = gridVisible;
    
    if (gridVisible) {
        gridToggle.innerHTML = '<span class="grid-icon">⊟</span> Hide Grid';
    } else {
        gridToggle.innerHTML = '<span class="grid-icon">⊞</span> Show Grid';
    }
}

async function convertImage() {
    try {
        if (!imageProcessor.originalImage) {
            alert('Please upload an image first.');
            return;
        }

        const convertBtn = document.getElementById('convertBtn');
        const originalText = convertBtn.textContent;
        convertBtn.innerHTML = '<span class="loading"></span> Converting...';
        convertBtn.disabled = true;

        const targetWidth = parseInt(document.getElementById('pixelSize').value);
        const availableColors = getAvailableColorsForMode();
        
        if (availableColors.length === 0) {
            alert('Please select at least one color for conversion.');
            convertBtn.innerHTML = originalText;
            convertBtn.disabled = false;
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 100));

        const result = imageProcessor.convertToPixelArt(targetWidth, availableColors);

        const resultsSection = document.getElementById('resultsSection');
        resultsSection.style.display = 'block';
        
        const originalImageSection = resultsSection.querySelector('.result-item:first-child');
        if (originalImageSection) {
            originalImageSection.style.display = 'none';
        }
        
        resultsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });

        console.log(`Conversion complete: ${result.width}×${result.height} (${result.totalPixels} pixels) using ${availableColors.length} colors`);

        convertBtn.innerHTML = originalText;
        convertBtn.disabled = false;

    } catch (error) {
        console.error('Conversion error:', error);
        alert(error.message || 'Error converting image. Please try again.');
        const convertBtn = document.getElementById('convertBtn');
        convertBtn.innerHTML = convertBtn.getAttribute('data-original-text') || 'Convert to Pixel Art';
        convertBtn.disabled = false;
    }
}

async function handleCopyToClipboard() {
    try {
        const copyBtn = document.getElementById('copyBtn');
        const originalText = copyBtn.textContent;
        
        copyBtn.textContent = 'Copying...';
        copyBtn.disabled = true;

        const success = await imageProcessor.copyToClipboard();
        
        if (success) {
            copyBtn.textContent = '✅ Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.disabled = false;
            }, 2000);
        } else {
            throw new Error('Copy failed');
        }

    } catch (error) {
        console.error('Copy error:', error);
        alert('Copy to clipboard failed. Your browser may not support this feature.');
        
        const copyBtn = document.getElementById('copyBtn');
        copyBtn.textContent = '📋 Copy to Clipboard';
        copyBtn.disabled = false;
    }
}

async function handleHighResDownload() {
    try {
        const downloadBtn = document.getElementById('downloadHighResBtn');
        const originalText = downloadBtn.textContent;
        
        downloadBtn.innerHTML = '<span class="loading"></span> Generating 100x...';
        downloadBtn.disabled = true;

        await new Promise(resolve => setTimeout(resolve, 100));

        imageProcessor.downloadHighRes();

        downloadBtn.textContent = '✅ Downloaded!';
        setTimeout(() => {
            downloadBtn.textContent = originalText;
            downloadBtn.disabled = false;
        }, 2000);

    } catch (error) {
        console.error('High-res download error:', error);
        alert('High-res download failed. The image might be too large.');
        
        const downloadBtn = document.getElementById('downloadHighResBtn');
        downloadBtn.textContent = '🚀 Download 100x High-Res';
        downloadBtn.disabled = false;
    }
}

function formatNumber(num) {
    return num.toLocaleString();
}

window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});

window.app = {
    imageProcessor,
    convertImage,
    updatePixelInfo,
    handleFile
};
