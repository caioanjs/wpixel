class ImageProcessor {
    constructor() {
        this.originalImage = null;
        this.originalCanvas = null;
        this.originalContext = null;
        this.resultCanvas = null;
        this.resultContext = null;
    }

    loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.originalImage = img;
                    this.displayOriginalImage();
                    resolve(img);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    displayOriginalImage() {
        if (!this.originalImage) return;

        this.originalCanvas = document.getElementById('originalCanvas');
        if (!this.originalCanvas) {
            console.warn('Original canvas element not found');
            return;
        }
        this.originalContext = this.originalCanvas.getContext('2d');

        const maxSize = 300;
        const { width, height } = this.calculateDisplaySize(
            this.originalImage.width,
            this.originalImage.height,
            maxSize
        );

        this.originalCanvas.width = width;
        this.originalCanvas.height = height;

        this.originalContext.drawImage(this.originalImage, 0, 0, width, height);
    }

    calculateDisplaySize(originalWidth, originalHeight, maxSize) {
        let width = originalWidth;
        let height = originalHeight;

        if (width > height) {
            if (width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
            }
        } else {
            if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
            }
        }

        return { width: Math.round(width), height: Math.round(height) };
    }

    convertToPixelArt(targetWidth, availableColors, useAdvancedMode = true) {
        if (!this.originalImage) {
            throw new Error('No image loaded');
        }

        if (!availableColors || availableColors.length === 0) {
            throw new Error('No colors available for conversion');
        }

        console.log(`Converting with ${availableColors.length} colors:`, availableColors);

        const aspectRatio = this.originalImage.height / this.originalImage.width;
        const targetHeight = Math.round(targetWidth * aspectRatio);

        if (useAdvancedMode) {
            return this.convertWithAdvancedMode(targetWidth, targetHeight, availableColors);
        } else {
            return this.convertWithBasicMode(targetWidth, targetHeight, availableColors);
        }
    }

    convertWithAdvancedMode(targetWidth, targetHeight, availableColors) {
        // Pre-process image with slight blur to reduce noise
        const preprocessCanvas = document.createElement('canvas');
        const preprocessContext = preprocessCanvas.getContext('2d');
        preprocessCanvas.width = targetWidth * 2; // Higher intermediate resolution
        preprocessCanvas.height = targetHeight * 2;

        preprocessContext.imageSmoothingEnabled = true;
        preprocessContext.drawImage(this.originalImage, 0, 0, preprocessCanvas.width, preprocessCanvas.height);

        // Apply slight blur to reduce noise
        preprocessContext.filter = 'blur(0.5px)';
        preprocessContext.drawImage(preprocessCanvas, 0, 0);

        // Now downscale to target size
        const tempCanvas = document.createElement('canvas');
        const tempContext = tempCanvas.getContext('2d');
        tempCanvas.width = targetWidth;
        tempCanvas.height = targetHeight;

        tempContext.imageSmoothingEnabled = true;
        tempContext.drawImage(preprocessCanvas, 0, 0, targetWidth, targetHeight);

        const imageData = tempContext.getImageData(0, 0, targetWidth, targetHeight);
        const data = imageData.data;

        // Apply advanced dithering
        this.applyFloydSteinbergDithering(data, targetWidth, targetHeight, availableColors);

        tempContext.putImageData(imageData, 0, 0);
        this.sourceCanvas = tempCanvas;
        this.displayPixelArt(tempCanvas, targetWidth, targetHeight);
        this.validatePixelArtColors(tempCanvas, availableColors);

        return {
            canvas: tempCanvas,
            width: targetWidth,
            height: targetHeight,
            totalPixels: targetWidth * targetHeight
        };
    }

    convertWithBasicMode(targetWidth, targetHeight, availableColors) {
        const tempCanvas = document.createElement('canvas');
        const tempContext = tempCanvas.getContext('2d');
        tempCanvas.width = targetWidth;
        tempCanvas.height = targetHeight;

        // Disable image smoothing for crisp pixel art
        tempContext.imageSmoothingEnabled = false;
        tempContext.mozImageSmoothingEnabled = false;
        tempContext.webkitImageSmoothingEnabled = false;
        tempContext.msImageSmoothingEnabled = false;

        tempContext.drawImage(this.originalImage, 0, 0, targetWidth, targetHeight);

        const imageData = tempContext.getImageData(0, 0, targetWidth, targetHeight);
        const data = imageData.data;

        // Apply Floyd-Steinberg dithering for better quality
        this.applyFloydSteinbergDithering(data, targetWidth, targetHeight, availableColors);

        tempContext.putImageData(imageData, 0, 0);

        this.sourceCanvas = tempCanvas;
        
        this.displayPixelArt(tempCanvas, targetWidth, targetHeight);

        // Validate the result
        this.validatePixelArtColors(tempCanvas, availableColors);

        return {
            canvas: tempCanvas,
            width: targetWidth,
            height: targetHeight,
            totalPixels: targetWidth * targetHeight
        };
    }

    validatePixelArtColors(canvas, expectedPalette) {
        const context = canvas.getContext('2d');
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        const foundColors = new Set();
        const unexpectedColors = new Set();
        
        for (let i = 0; i < data.length; i += 4) {
            const a = data[i + 3];
            
            // Skip transparent pixels
            if (a < 128) continue;
            
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const colorHex = rgbToHex(r, g, b);
            
            foundColors.add(colorHex);
            
            if (!expectedPalette.includes(colorHex)) {
                unexpectedColors.add(colorHex);
            }
        }
        
        console.log(`Validation complete:`, {
            expectedColors: expectedPalette.length,
            foundColors: foundColors.size,
            unexpectedColors: unexpectedColors.size,
            colorsUsed: Array.from(foundColors),
            unexpectedColors: Array.from(unexpectedColors)
        });
        
        if (unexpectedColors.size > 0) {
            console.warn('Found colors not in palette:', Array.from(unexpectedColors));
        }
    }

    applyFloydSteinbergDithering(data, width, height, palette) {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const a = data[idx + 3];

                // Handle transparency
                if (a < 128) {
                    data[idx] = 255;
                    data[idx + 1] = 255;
                    data[idx + 2] = 255;
                    data[idx + 3] = 0;
                    continue;
                }

                const originalColor = rgbToHex(r, g, b);
                const closestColor = findClosestColor(originalColor, palette);
                const closestRgb = hexToRgb(closestColor);

                if (!closestRgb) {
                    console.warn('Invalid closest color:', closestColor);
                    continue;
                }

                // Set the new color
                data[idx] = closestRgb.r;
                data[idx + 1] = closestRgb.g;
                data[idx + 2] = closestRgb.b;
                data[idx + 3] = 255;

                // Calculate and distribute error for dithering
                const errorR = r - closestRgb.r;
                const errorG = g - closestRgb.g;
                const errorB = b - closestRgb.b;

                // Floyd-Steinberg error distribution
                this.distributeError(data, width, height, x, y, errorR, errorG, errorB);
            }
        }
    }

    distributeError(data, width, height, x, y, errorR, errorG, errorB) {
        const positions = [
            { dx: 1, dy: 0, factor: 7/16 },  // right
            { dx: -1, dy: 1, factor: 3/16 }, // bottom-left
            { dx: 0, dy: 1, factor: 5/16 },  // bottom
            { dx: 1, dy: 1, factor: 1/16 }   // bottom-right
        ];

        for (const pos of positions) {
            const newX = x + pos.dx;
            const newY = y + pos.dy;

            if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                const idx = (newY * width + newX) * 4;
                
                // Only distribute error to pixels that haven't been processed yet
                if (data[idx + 3] >= 128) { // Not transparent
                    data[idx] = Math.max(0, Math.min(255, data[idx] + errorR * pos.factor));
                    data[idx + 1] = Math.max(0, Math.min(255, data[idx + 1] + errorG * pos.factor));
                    data[idx + 2] = Math.max(0, Math.min(255, data[idx + 2] + errorB * pos.factor));
                }
            }
        }
    }

    displayPixelArt(sourceCanvas, pixelWidth, pixelHeight) {
        this.resultCanvas = document.getElementById('resultCanvas');
        if (!this.resultCanvas) {
            throw new Error('Result canvas element not found');
        }
        this.resultContext = this.resultCanvas.getContext('2d');

        const minPixelSize = 12;
        const maxPixelSize = 25;
        const pixelSize = Math.max(minPixelSize, Math.min(maxPixelSize, Math.floor(400 / Math.max(pixelWidth, pixelHeight))));
        
        const displayWidth = pixelWidth * pixelSize;
        const displayHeight = pixelHeight * pixelSize;

        this.resultCanvas.width = displayWidth;
        this.resultCanvas.height = displayHeight;

        this.resultCanvas.dataset.originalWidth = pixelWidth;
        this.resultCanvas.dataset.originalHeight = pixelHeight;

        this.resultContext.imageSmoothingEnabled = false;
        this.resultContext.mozImageSmoothingEnabled = false;
        this.resultContext.webkitImageSmoothingEnabled = false;
        this.resultContext.msImageSmoothingEnabled = false;

        this.resultContext.drawImage(sourceCanvas, 0, 0, displayWidth, displayHeight);
        
        this.initializeGridOverlay(displayWidth, displayHeight, pixelWidth, pixelHeight);
    }

    initializeGridOverlay(displayWidth, displayHeight, pixelWidth, pixelHeight) {
        const gridCanvas = document.getElementById('gridCanvas');
        if (!gridCanvas) {
            console.warn('Grid canvas element not found');
            return;
        }
        const gridContext = gridCanvas.getContext('2d');

        gridCanvas.width = displayWidth;
        gridCanvas.height = displayHeight;

        const cellWidth = displayWidth / pixelWidth;
        const cellHeight = displayHeight / pixelHeight;

        gridContext.clearRect(0, 0, displayWidth, displayHeight);

        const lineWidth = Math.max(1, Math.min(3, cellWidth / 10));
        
        gridContext.strokeStyle = 'rgba(0, 0, 0, 0.6)';
        gridContext.lineWidth = lineWidth + 1;
        this.drawGridLines(gridContext, pixelWidth, pixelHeight, cellWidth, cellHeight, displayWidth, displayHeight);

        gridContext.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        gridContext.lineWidth = lineWidth;
        this.drawGridLines(gridContext, pixelWidth, pixelHeight, cellWidth, cellHeight, displayWidth, displayHeight);
    }

    drawGridLines(context, pixelWidth, pixelHeight, cellWidth, cellHeight, displayWidth, displayHeight) {
        for (let x = 0; x <= pixelWidth; x++) {
            const xPos = x * cellWidth;
            context.beginPath();
            context.moveTo(xPos, 0);
            context.lineTo(xPos, displayHeight);
            context.stroke();
        }

        for (let y = 0; y <= pixelHeight; y++) {
            const yPos = y * cellHeight;
            context.beginPath();
            context.moveTo(0, yPos);
            context.lineTo(displayWidth, yPos);
            context.stroke();
        }
    }

    toggleGrid() {
        const gridCanvas = document.getElementById('gridCanvas');
        if (!gridCanvas) {
            console.warn('Grid canvas element not found');
            return false;
        }
        const isVisible = gridCanvas.style.display !== 'none';
        gridCanvas.style.display = isVisible ? 'none' : 'block';
        return !isVisible;
    }

    getPixelArtData(format = 'image/png') {
        if (!this.resultCanvas) {
            throw new Error('No pixel art generated');
        }
        return this.resultCanvas.toDataURL(format);
    }

    downloadPixelArt(filename = 'pixel-art.png', highRes = false) {
        try {
            let dataUrl;
            
            if (highRes && this.sourceCanvas) {
                dataUrl = this.createHighResVersion();
            } else {
                if (!this.resultCanvas) {
                    throw new Error('No pixel art generated');
                }
                dataUrl = this.createNormalVersionWithGrid();
            }
            
            const link = document.createElement('a');
            link.download = highRes ? filename.replace('.png', '-highres.png') : filename;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Download failed. Please try again.');
        }
    }

    createNormalVersionWithGrid() {
        const gridCanvas = document.getElementById('gridCanvas');
        if (!gridCanvas) {
            return this.sourceCanvas.toDataURL('image/png');
        }
        const isGridVisible = gridCanvas.style.display !== 'none';
        
        if (!isGridVisible) {
            return this.sourceCanvas.toDataURL('image/png');
        }
        
        const compositeCanvas = document.createElement('canvas');
        const compositeContext = compositeCanvas.getContext('2d');
        
        compositeCanvas.width = this.sourceCanvas.width;
        compositeCanvas.height = this.sourceCanvas.height;
        
        compositeContext.drawImage(this.sourceCanvas, 0, 0);
        
        const pixelWidth = this.sourceCanvas.width;
        const pixelHeight = this.sourceCanvas.height;
        const cellWidth = 1;
        const cellHeight = 1;
        
        compositeContext.strokeStyle = 'rgba(128, 128, 128, 0.5)';
        compositeContext.lineWidth = 1;
        
        for (let x = 0; x <= pixelWidth; x++) {
            compositeContext.beginPath();
            compositeContext.moveTo(x, 0);
            compositeContext.lineTo(x, pixelHeight);
            compositeContext.stroke();
        }
        
        for (let y = 0; y <= pixelHeight; y++) {
            compositeContext.beginPath();
            compositeContext.moveTo(0, y);
            compositeContext.lineTo(pixelWidth, y);
            compositeContext.stroke();
        }
        
        return compositeCanvas.toDataURL('image/png');
    }

    createHighResVersion() {
        if (!this.sourceCanvas) {
            throw new Error('No source canvas available for high-res export');
        }

        const originalWidth = this.sourceCanvas.width;
        const originalHeight = this.sourceCanvas.height;
        
        const scaleFactor = 100;
        const highResCanvas = document.createElement('canvas');
        const highResContext = highResCanvas.getContext('2d');
        
        highResCanvas.width = originalWidth * scaleFactor;
        highResCanvas.height = originalHeight * scaleFactor;
        
        highResContext.imageSmoothingEnabled = false;
        highResContext.mozImageSmoothingEnabled = false;
        highResContext.webkitImageSmoothingEnabled = false;
        highResContext.msImageSmoothingEnabled = false;
        
        highResContext.drawImage(
            this.sourceCanvas, 
            0, 0, originalWidth, originalHeight,
            0, 0, highResCanvas.width, highResCanvas.height
        );
        
        const gridCanvas = document.getElementById('gridCanvas');
        if (!gridCanvas) {
            console.warn('Grid canvas element not found for high-res export');
            return highResCanvas.toDataURL('image/png');
        }
        const isGridVisible = gridCanvas.style.display !== 'none';
        
        if (isGridVisible) {
            this.drawHighResGrid(highResContext, originalWidth, originalHeight, scaleFactor);
        }
        
        console.log(`High-res version created: ${highResCanvas.width}×${highResCanvas.height} (${scaleFactor}x scale)`);
        
        return highResCanvas.toDataURL('image/png');
    }

    drawHighResGrid(context, pixelWidth, pixelHeight, scaleFactor) {
        const cellWidth = scaleFactor;
        const cellHeight = scaleFactor;
        
        const lineWidth = Math.max(2, scaleFactor / 15);
        
        const gridTempCanvas = document.createElement('canvas');
        const gridTempContext = gridTempCanvas.getContext('2d');
        gridTempCanvas.width = pixelWidth * scaleFactor;
        gridTempCanvas.height = pixelHeight * scaleFactor;
        
        gridTempContext.strokeStyle = 'rgba(0, 0, 0, 0.7)';
        gridTempContext.lineWidth = lineWidth + 2;
        this.drawHighResGridLines(gridTempContext, pixelWidth, pixelHeight, cellWidth, cellHeight);
        
        gridTempContext.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        gridTempContext.lineWidth = lineWidth;
        this.drawHighResGridLines(gridTempContext, pixelWidth, pixelHeight, cellWidth, cellHeight);
        
        context.globalCompositeOperation = 'difference';
        context.drawImage(gridTempCanvas, 0, 0);
        
        context.globalCompositeOperation = 'source-over';
    }

    drawHighResGridLines(context, pixelWidth, pixelHeight, cellWidth, cellHeight) {
        for (let x = 0; x <= pixelWidth; x++) {
            const xPos = x * cellWidth;
            context.beginPath();
            context.moveTo(xPos, 0);
            context.lineTo(xPos, pixelHeight * cellHeight);
            context.stroke();
        }
        
        for (let y = 0; y <= pixelHeight; y++) {
            const yPos = y * cellHeight;
            context.beginPath();
            context.moveTo(0, yPos);
            context.lineTo(pixelWidth * cellWidth, yPos);
            context.stroke();
        }
    }

    downloadHighRes(filename = 'pixel-art-highres.png') {
        this.downloadPixelArt(filename, true);
    }

    async copyToClipboard() {
        try {
            if (!this.sourceCanvas) {
                throw new Error('No pixel art generated');
            }

            const blob = await new Promise(resolve => {
                this.sourceCanvas.toBlob(resolve, 'image/png');
            });

            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);

            return true;
        } catch (error) {
            console.error('Copy to clipboard failed:', error);
            return false;
        }
    }

    static validateImageFile(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 10 * 1024 * 1024;

        if (!validTypes.includes(file.type)) {
            throw new Error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        }

        if (file.size > maxSize) {
            throw new Error('Image file size must be less than 10MB');
        }

        return true;
    }

    getImageInfo() {
        if (!this.originalImage) return null;

        return {
            width: this.originalImage.width,
            height: this.originalImage.height,
            aspectRatio: this.originalImage.width / this.originalImage.height
        };
    }

    calculatePixelCount(targetWidth) {
        if (!this.originalImage) return { width: 0, height: 0, total: 0 };

        const aspectRatio = this.originalImage.height / this.originalImage.width;
        const targetHeight = Math.round(targetWidth * aspectRatio);

        return {
            width: targetWidth,
            height: targetHeight,
            total: targetWidth * targetHeight
        };
    }
}

const imageProcessor = new ImageProcessor();
