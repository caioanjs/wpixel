const TRANSLATIONS = {
    pt: {
        title: "🌍 wPixel",
        subtitle: "Converta qualquer imagem para pixel art, feito para <a href='https://wplace.live/' target='_blank'>wplace.live</a>!",
        uploadText: "Clique para enviar uma imagem ou arraste e solte",
        pixelationSettings: "Configurações de Pixelização",
        targetWidth: "Largura desejada (pixels):",
        pixels: "Pixels",
        showGridOverlay: "Mostrar grade de pixels",
        colorPalette: "Paleta de Cores",
        freeColorsOnly: "Apenas Cores Grátis (não recomendado)",
        customSelection: "Seleção Personalizada",
        chooseColors: "Escolha suas Cores",
        allFree: "Todas Grátis",
        allLocked: "Todas Pagas",
        selectAll: "Selecionar Todas",
        clearAll: "Limpar Todas",
        freeColors: "Cores Grátis",
        lockedColors: "Cores Pagas 🔒",
        selected: "selecionada",
        selectedPlural: "selecionadas",
        total: "Total",
        colorsSelected: "cores selecionadas",
        convertButton: "Converter para Pixel Art",
        originalImage: "Imagem Original",
        pixelArtResult: "Resultado da Pixel Art",
        showGrid: "Mostrar Grade",
        hideGrid: "Esconder Grade",
        downloadNormal: "📥 Download Normal",
        downloadHighRes: "🔍 Download em Alta Resolução",
        copyClipboard: "📋 Copiar para Área de Transferência",
        errorTitle: "Erro",
        loadingTitle: "Carregando...",
        successTitle: "Sucesso!",
        fileTypeError: "Por favor, selecione um arquivo de imagem válido (JPEG, PNG, GIF ou WebP)",
        fileSizeError: "O tamanho do arquivo deve ser menor que 10MB",
        copySuccess: "Imagem copiada para a área de transferência!",
        copyError: "Erro ao copiar para a área de transferência",
        languageTitle: "Escolha seu idioma",
        languageSubtitle: "Selecione o idioma de sua preferência:",
        languageName: "Português",
        dontShowAgain: "Não mostrar novamente",
        confirm: "Confirmar",
        bluemarbleText: "você pode usar a ferramenta <a href='https://github.com/SwingTheVine/Wplace-BlueMarble/' target='_blank'>BlueMarble</a> para usar essa imagem como uma sobreposição!"
    },
    
    en: {
        title: "🌍 wPixel",
        subtitle: "Convert any images to pixel art, made for <a href='https://wplace.live/' target='_blank'>wplace.live</a>!",
        uploadText: "Click to upload an image or drag & drop",
        pixelationSettings: "Pixelation Settings",
        targetWidth: "Target Width (pixels):",
        pixels: "Pixels",
        showGridOverlay: "Show pixel grid overlay",
        colorPalette: "Color Palette",
        freeColorsOnly: "Free Colors Only (not recommended)",
        customSelection: "Custom Selection",
        chooseColors: "Choose Your Colors",
        allFree: "All Free",
        allLocked: "All Locked",
        selectAll: "Select All",
        clearAll: "Clear All",
        freeColors: "Free Colors",
        lockedColors: "Locked Colors 🔒",
        selected: "selected",
        selectedPlural: "selected",
        total: "Total",
        colorsSelected: "colors selected",
        convertButton: "Convert to Pixel Art",
        originalImage: "Original Image",
        pixelArtResult: "Pixel Art Result",
        showGrid: "Show Grid",
        hideGrid: "Hide Grid",
        downloadNormal: "📥 Download",
        downloadHighRes: "📥 Download High-Res",
        copyClipboard: "📋 Copy to Clipboard",
        errorTitle: "Error",
        loadingTitle: "Loading...",
        successTitle: "Success!",
        fileTypeError: "Please select a valid image file (JPEG, PNG, GIF, or WebP)",
        fileSizeError: "Image file size must be less than 10MB",
        copySuccess: "Image copied to clipboard!",
        copyError: "Error copying to clipboard",
        languageTitle: "Choose your language",
        languageSubtitle: "Select your preferred language:",
        languageName: "English",
        dontShowAgain: "Don't show again",
        confirm: "Confirm",
        bluemarbleText: "you can use <a href='https://github.com/SwingTheVine/Wplace-BlueMarble/' target='_blank'>BlueMarble</a> to use this as an overlay!"
    }
};

class LanguageManager {
    constructor() {
        this.currentLanguage = this.getStoredLanguage() || 'pt';
        this.shouldShowPopup = this.getShouldShowPopup();
        this.languageFlags = {
            'pt': '🇧🇷',
            'en': '🇺🇸',
            'es': '🇪🇸',
            'fr': '🇫🇷',
            'de': '🇩🇪',
            'ja': '🇯🇵',
            'zh': '🇨🇳',
            'ru': '🇷🇺',
            'it': '🇮🇹',
            'ko': '🇰🇷'
        };
        this.init();
    }
    
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupLanguageSystem());
        } else {
            this.setupLanguageSystem();
        }
    }
    
    setupLanguageSystem() {
        console.log('Setting up language system...', {
            shouldShowPopup: this.shouldShowPopup,
            currentLanguage: this.currentLanguage
        });
        
        this.generateLanguageButtons();
        this.setupPopupEvents();
        
        if (this.shouldShowPopup) {
            console.log('Showing language popup...');
            this.showLanguagePopup();
        } else {
            console.log('Applying stored language:', this.currentLanguage);
            this.updatePageTexts();
        }
    }

    generateLanguageButtons() {
        const languageOptions = document.getElementById('languageOptions');
        if (!languageOptions) return;

        // Clear existing buttons
        languageOptions.innerHTML = '';

        // Generate button for each available language
        Object.keys(TRANSLATIONS).forEach(langCode => {
            const button = document.createElement('button');
            button.className = 'language-btn';
            button.setAttribute('data-lang', langCode);
            
            const flag = this.languageFlags[langCode] || '🌍';
            const languageName = TRANSLATIONS[langCode].languageName || langCode.toUpperCase();
            
            button.innerHTML = `
                <span class="flag">${flag}</span>
                <span>${languageName}</span>
            `;
            
            languageOptions.appendChild(button);
        });
    }
    
    getStoredLanguage() {
        return localStorage.getItem('preferredLanguage');
    }
    
    getShouldShowPopup() {
        return localStorage.getItem('showLanguagePopup') !== 'false';
    }
    
    setLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('preferredLanguage', lang);
        this.updatePageTexts();
    }
    
    setShouldShowPopup(show) {
        localStorage.setItem('showLanguagePopup', show.toString());
    }
    
    translate(key) {
        return TRANSLATIONS[this.currentLanguage][key] || TRANSLATIONS.en[key] || key;
    }
    
    updatePageTexts() {
        this.updateElement('h1', 'title');
        this.updateElement('header p', 'subtitle');
        this.updateElement('.upload-content p', 'uploadText');
        
        this.updateElement('[data-translate="pixelationSettings"]', 'pixelationSettings');
        this.updateElement('label[for="pixelSize"]', 'targetWidth');
        this.updateElement('[data-translate="showGridOverlay"]', 'showGridOverlay');
        
        this.updateElement('[data-translate="colorPalette"]', 'colorPalette');
        this.updateElement('[data-mode="free"]', 'freeColorsOnly');
        this.updateElement('[data-mode="custom"]', 'customSelection');
        this.updateElement('[data-translate="chooseColors"]', 'chooseColors');
        this.updateElement('#selectAllFree', 'allFree');
        this.updateElement('#selectAllLocked', 'allLocked');
        this.updateElement('#selectAll', 'selectAll');
        this.updateElement('#clearAll', 'clearAll');
        
        this.updateElement('#convertBtn', 'convertButton');
        
        this.updateElement('[data-translate="originalImage"]', 'originalImage');
        this.updateElement('[data-translate="pixelArtResult"]', 'pixelArtResult');
        this.updateElement('#downloadBtn', 'downloadNormal');
        this.updateElement('#downloadHighResBtn', 'downloadHighRes');
        this.updateElement('#copyBtn', 'copyClipboard');
        
        this.updatePixelInfo();
        this.updateColorCounts();
    }
    
    updateElement(selector, key) {
        const element = document.querySelector(selector);
        if (element) {
            if (key === 'subtitle') {
                element.innerHTML = this.translate(key);
            } else {
                element.textContent = this.translate(key);
            }
        }
    }
    
    updatePixelInfo() {
        const pixelInfo = document.getElementById('pixelInfo');
        if (pixelInfo) {
            const size = document.getElementById('pixelSize').value;
            const totalPixels = (size * size).toLocaleString();
            pixelInfo.textContent = `${this.translate('pixels')}: ${size} × ${size} = ${totalPixels} ${this.translate('pixels').toLowerCase()}`;
        }
    }
    
    updateColorCounts() {
        const freeCount = document.getElementById('freeCount');
        const lockedCount = document.getElementById('lockedCount');
        const totalSelected = document.getElementById('totalSelected');
        
        if (freeCount) {
            const count = freeCount.dataset.count || 0;
            freeCount.textContent = `(${count} ${count == 1 ? this.translate('selected') : this.translate('selectedPlural')})`;
        }
        
        if (lockedCount) {
            const count = lockedCount.dataset.count || 0;
            lockedCount.textContent = `(${count} ${count == 1 ? this.translate('selected') : this.translate('selectedPlural')})`;
        }
        
        if (totalSelected) {
            const count = totalSelected.dataset.count || 0;
            totalSelected.textContent = `${this.translate('total')}: ${count} ${this.translate('colorsSelected')}`;
        }
    }
    
    showLanguagePopup() {
        if (!this.shouldShowPopup) {
            console.log('Popup should not be shown');
            return;
        }
        
        const popup = document.getElementById('languagePopup');
        console.log('Popup element found:', !!popup);
        
        if (!popup) return;
        
        this.setupPopupEvents();
        
        console.log('Showing popup...');
        popup.style.display = 'flex';
        setTimeout(() => {
            popup.classList.add('show');
            console.log('Popup show class added');
        }, 50);
    }
    
    setupPopupEvents() {
        const popup = document.getElementById('languagePopup');
        const languageButtons = document.querySelectorAll('.language-btn');
        const dontShowAgainCheckbox = document.getElementById('dontShowAgain');
        
        if (!popup || !languageButtons.length) return;
        
        languageButtons.forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });
        
        const newLanguageButtons = document.querySelectorAll('.language-btn');
        
        newLanguageButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const selectedLang = btn.dataset.lang;
                const dontShowAgain = document.getElementById('dontShowAgain').checked;
                
                this.setLanguage(selectedLang);
                this.setShouldShowPopup(!dontShowAgain);
                
                this.hideLanguagePopup();
            });
        });
    }
    
    hideLanguagePopup() {
        const popup = document.getElementById('languagePopup');
        if (popup) {
            popup.classList.remove('show');
            setTimeout(() => {
                popup.style.display = 'none';
            }, 300);
        }
    }
    
    setLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('preferredLanguage', lang);
        this.updatePageTexts();
        
        if (lang === 'en') {
            window.location.href = './en/index.html';
            return;
        }
    }
}

const languageManager = new LanguageManager();

