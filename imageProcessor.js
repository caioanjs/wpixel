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

    convertToPixelArt(targetWidth, availableColors) {
        if (!this.originalImage) {
            throw new Error('No image loaded');
        }

        const aspectRatio = this.originalImage.height / this.originalImage.width;
        const targetHeight = Math.round(targetWidth * aspectRatio);

        const tempCanvas = document.createElement('canvas');
        const tempContext = tempCanvas.getContext('2d');
        tempCanvas.width = targetWidth;
        tempCanvas.height = targetHeight;

        tempContext.drawImage(this.originalImage, 0, 0, targetWidth, targetHeight);

        const imageData = tempContext.getImageData(0, 0, targetWidth, targetHeight);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a < 128) {
                data[i] = 255;
                data[i + 1] = 255;
                data[i + 2] = 255;
                data[i + 3] = 0;
                continue;
            }

            const originalColor = rgbToHex(r, g, b);
            const closestColor = findClosestColor(originalColor, availableColors);
            const closestRgb = hexToRgb(closestColor);

            data[i] = closestRgb.r;
            data[i + 1] = closestRgb.g;
            data[i + 2] = closestRgb.b;
            data[i + 3] = 255;
        }

        tempContext.putImageData(imageData, 0, 0);

        this.displayPixelArt(tempCanvas, targetWidth, targetHeight);

        return {
            canvas: tempCanvas,
            width: targetWidth,
            height: targetHeight,
            totalPixels: targetWidth * targetHeight
        };
    }

    displayPixelArt(sourceCanvas, pixelWidth, pixelHeight) {
        this.resultCanvas = document.getElementById('resultCanvas');
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

        this.sourceCanvas = sourceCanvas;
        
        this.initializeGridOverlay(displayWidth, displayHeight, pixelWidth, pixelHeight);
    }

    initializeGridOverlay(displayWidth, displayHeight, pixelWidth, pixelHeight) {
        const gridCanvas = document.getElementById('gridCanvas');
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
        const isGridVisible = gridCanvas.style.display !== 'none';
        
        if (!isGridVisible) {
            return this.resultCanvas.toDataURL('image/png');
        }
        
        const compositeCanvas = document.createElement('canvas');
        const compositeContext = compositeCanvas.getContext('2d');
        
        compositeCanvas.width = this.resultCanvas.width;
        compositeCanvas.height = this.resultCanvas.height;
        
        compositeContext.drawImage(this.resultCanvas, 0, 0);
        
        compositeContext.globalCompositeOperation = 'difference';
        
        const pixelWidth = parseInt(this.resultCanvas.dataset.originalWidth);
        const pixelHeight = parseInt(this.resultCanvas.dataset.originalHeight);
        const cellWidth = this.resultCanvas.width / pixelWidth;
        const cellHeight = this.resultCanvas.height / pixelHeight;
        const lineWidth = Math.max(1, Math.min(3, cellWidth / 10));
        
        const gridTempCanvas = document.createElement('canvas');
        const gridTempContext = gridTempCanvas.getContext('2d');
        gridTempCanvas.width = this.resultCanvas.width;
        gridTempCanvas.height = this.resultCanvas.height;
        
        gridTempContext.strokeStyle = 'rgba(0, 0, 0, 0.6)';
        gridTempContext.lineWidth = lineWidth + 1;
        this.drawGridLines(gridTempContext, pixelWidth, pixelHeight, cellWidth, cellHeight, this.resultCanvas.width, this.resultCanvas.height);
        
        gridTempContext.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        gridTempContext.lineWidth = lineWidth;
        this.drawGridLines(gridTempContext, pixelWidth, pixelHeight, cellWidth, cellHeight, this.resultCanvas.width, this.resultCanvas.height);
        
        compositeContext.drawImage(gridTempCanvas, 0, 0);
        
        compositeContext.globalCompositeOperation = 'source-over';
        
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
            if (!this.resultCanvas) {
                throw new Error('No pixel art generated');
            }

            const blob = await new Promise(resolve => {
                this.resultCanvas.toBlob(resolve, 'image/png');
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
