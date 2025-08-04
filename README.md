![wpixel typography](https://github.com/caioanjs/wpixel/blob/dacf85b03eb110c5f68244348b9af5f83d313cae/img/wpixel.png)

# wPixel - Convert any images to pixel art 🎨

**Convert any images to pixel art, made for [wplace.live](https://wplace.live/)!**

wPixel is a powerful, browser-based tool that transforms your images into pixel art using advanced algorithms and color palettes optimized for wplace.live. With support for multiple color modes, dithering, and high-resolution exports, it's perfect for creating artwork for collaborative pixel art projects.

## ✨ Features

- 🎨 **Advanced Color Processing** - Perceptual color matching with LAB color space
- 🔄 **Floyd-Steinberg Dithering** - Professional-grade error diffusion for smooth gradients
- 🎯 **Multiple Color Modes** - Free colors, locked colors, or custom selection
- 📏 **Flexible Sizing** - Adjustable pixel width from 8 to 200 pixels
- 🖼️ **High-Resolution Export** - Download up to 100x resolution for printing
- 📋 **Clipboard Support** - Copy results directly to clipboard
- 🌐 **Multi-language** - Available in Portuguese and English with easy language switching
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

![usage](https://github.com/caioanjs/wpixel/blob/6857fe5618ccc0e057a7a363d04e9b232f65bb4b/img/usage.png)

## 🚀 How to Use

### Basic Usage

1. **Upload an Image**
   - Click the upload area or drag & drop your image
   - Supported formats: JPEG, PNG, GIF, WebP
   - Maximum file size: 10MB

2. **Choose Your Settings**
   - **Target Width**: Set the desired width in pixels (8-200)
   - **Color Mode**: Select your preferred color palette
     - **Free Colors Only**: Uses only the free wplace colors (30 colors)
     - **Custom Selection**: Choose specific colors from free and locked palettes

3. **Convert Your Image**
   - Click "Convert to Pixel Art"
   - The tool will process your image using advanced dithering
   - View the result with optional grid overlay

4. **Download or Copy**
   - **Normal Download**: Get the pixel art at display resolution
   - **High-Res Download**: Export at 100x resolution for high-quality prints
   - **Copy to Clipboard**: Copy directly for pasting into other applications

### Language Selection

- **Language Selector**: Click the language button in the top-right corner to change languages anytime
- **Persistent Choice**: Your language preference is saved and remembered
- **Always Accessible**: You can change language even if you chose "don't show again" on the initial popup

### Color Modes Explained

#### 🆓 Free Colors Only
- Uses 30 carefully selected colors available for free on wplace.live
- Perfect for users who want to use only free colors
- Optimized palette provides good coverage for most images

#### 🎨 Custom Selection
- Choose from both free and locked color palettes
- Click colors to select/deselect them
- Use quick selection buttons:
  - **All Free**: Select all free colors
  - **All Locked**: Select all locked colors  
  - **Select All**: Select every available color
  - **Clear All**: Deselect all colors

### Advanced Features

#### Grid Overlay
- Toggle the pixel grid on/off to see individual pixels clearly
- Grid is included in downloads when enabled
- Helpful for planning pixel placement on wplace.live

#### High-Resolution Export
- Exports your pixel art at 100x the original resolution
- Perfect for printing, merchandise, or high-quality displays
- Maintains crisp pixel boundaries at any size

#### BlueMarble Integration
- Use the exported images with [BlueMarble](https://github.com/SwingTheVine/Wplace-BlueMarble/) tool
- Create overlays for easier placement on wplace.live

![how to help](https://github.com/caioanjs/wpixel/blob/6857fe5618ccc0e057a7a363d04e9b232f65bb4b/img/help.png)

## 🌍 Contributing Translations

We welcome contributions to make wPixel accessible to more users worldwide! Currently supported languages:
- 🇧🇷 Portuguese (Português)
- 🇺🇸 English

### How to Add a New Language

**🎉 Super Easy!** Just add your language to the translations file - no HTML changes needed!

1. **Fork the Repository**
   ```bash
   git clone https://github.com/caioanjs/wpixel.git
   cd wpixel
   ```

2. **Edit the Translations File**
   Open `translations.js` and add your language following this structure:

   ```javascript
   const TRANSLATIONS = {
       // Existing languages...
       
       // Add your language code (e.g., 'es' for Spanish, 'fr' for French)
       'your_language_code': {
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
           languageName: "Your Language Name Here", // ← Just change this!
           changeLanguage: "Change language",
           dontShowAgain: "Don't show again",
           confirm: "Confirm",
           madeBy: "Made by",
           bluemarbleText: "you can use <a href='https://github.com/SwingTheVine/Wplace-BlueMarble/' target='_blank'>BlueMarble</a> to use this as an overlay!"
       }
   };
   ```

3. **Add Language Selection Option**
   No additional steps needed! The language will automatically appear in the language selection popup.

4. **Test Your Translation**
   - Open the application in your browser
   - Test all text strings to ensure they display correctly
   - Check for text overflow or layout issues
   - Verify special characters display properly

5. **Submit a Pull Request**
   - Commit your changes with a descriptive message
   - Push to your forked repository
   - Create a pull request with:
     - Clear title: "Add [Language Name] translation"
     - Description of what language you added
     - Mention if you're a native speaker

### Translation Guidelines

**🚀 Quick Example:** Adding Spanish
```javascript
'es': {
    title: "🌍 wPixel",
    subtitle: "¡Convierte cualquier imagen en pixel art, hecho para <a href='https://wplace.live/' target='_blank'>wplace.live</a>!",
    // ... translate all the other strings ...
    languageName: "Español", // ← This is all you need for the language selector!
    // ... rest of translations ...
}
```

- **Keep it Concise**: UI text should be brief and clear
- **Maintain Context**: Preserve the meaning and tone of the original
- **Test Thoroughly**: Ensure text fits within UI elements
- **Use Native Script**: Use the appropriate writing system for your language
- **Be Consistent**: Use consistent terminology throughout
- **Cultural Adaptation**: Adapt content to local culture when appropriate

### Translation Status

| Language | Status | Contributor |
|----------|--------|-------------|
| 🇧🇷 Portuguese | ✅ Complete | [@caioanjs](https://github.com/caioanjs) |
| 🇺🇸 English | ✅ Complete | [@caioanjs](https://github.com/caioanjs) |
| 🇪🇸 Spanish | ❌ Needed | - |
| 🇫🇷 French | ❌ Needed | - |
| 🇩🇪 German | ❌ Needed | - |
| 🇯🇵 Japanese | ❌ Needed | - |

Want to add your language? We'd love your contribution! 🌟

## 🤝 Contributing

We welcome contributions! Whether you want to:
- Add new language translations
- Improve the user interface
- Enhance the color processing algorithms
- Fix bugs or add features
- Improve documentation

Please feel free to open an issue or submit a pull request.

## 📄 License

This project is open source. Please check the license file for details.

## 🙏 Acknowledgments

- Built for the [wplace.live](https://wplace.live/) community
- Compatible with [BlueMarble](https://github.com/SwingTheVine/Wplace-BlueMarble/) overlay tool
- Uses advanced color science algorithms for optimal results

---