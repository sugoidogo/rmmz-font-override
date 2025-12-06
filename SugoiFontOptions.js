/*:
 * @target MZ
 * @plugindesc Adds Font Overrides to Options
 * @author SugoiDogo
 * @help SugoiFontSettings.js
 * 
 * Adds Font Overrides to Options
 * 
 * Create the folder alt_fonts in your project folder,
 * add your fonts to that folder, and this plugin will
 * add the option to override game fonts with alt fonts.
 * Useful for accessibility fonts, etc.
 */
{
    const option_name = 'Font Override'
    const font_symbol = 'font_override'
    const disabled = 'disabled'
    const alt_fonts = 'alt_fonts/'
    const fonts_index = 'index.json'
    const fonts = [disabled]
    let font = fonts[0]

    if (globalThis.require) {
        const fs = require('fs')
        fs.mkdirSync(alt_fonts,{recursive:true})
        const fontFileNames = fs.readdirSync(alt_fonts)
        fs.writeFileSync(alt_fonts + fonts_index, JSON.stringify(fontFileNames))
    }

    fetch(encodeURI(alt_fonts + fonts_index))
        .then(response => response.json())
        .then(/** @type {string[]} */ fontFileNames => {
            for (const fontFileName of fontFileNames) {
                if(fontFileName===fonts_index) continue
                const fontName = fontFileName.split('.')[0]
                const fontURL = encodeURI(alt_fonts + fontFileName)
                // @ts-ignore FontManager is not documented
                FontManager.startLoading(fontName, fontURL)
                fonts.push(fontName)
            }
        })

    const addGeneralOptions = Window_Options.prototype.addGeneralOptions
    Window_Options.prototype.addGeneralOptions = function () {
        addGeneralOptions.call(this);
        this.addCommand(option_name, font_symbol, true)
    }

    const statusText = Window_Options.prototype.statusText
    Window_Options.prototype.statusText = function (/** @type {number} */ index) {
        const symbol = this.commandSymbol(index)
        if (symbol === font_symbol) {
            return font
        }
        return statusText.call(this, index)
    }

    function getNextFont(forward = true) {
        let index = fonts.indexOf(font)
        if (forward) {
            index++
        } else {
            index--
        }
        index %= fonts.length
        return fonts[index]
    }

    const processOk = Window_Options.prototype.processOk
    Window_Options.prototype.processOk = function () {
        const index = this.index();
        const symbol = this.commandSymbol(index);
        if (symbol === font_symbol) {
            // @ts-ignore changeValue should have `value: any`
            this.changeValue(font_symbol, getNextFont())
        } else {
            return processOk.call(this)
        }
    }

    const cursorRight = Window_Options.prototype.cursorRight
    Window_Options.prototype.cursorRight = function (/** @type {boolean} */ wrap) {
        const index = this.index();
        const symbol = this.commandSymbol(index);
        if (symbol === font_symbol) {
            // @ts-ignore changeValue should have `value: any`
            this.changeValue(font_symbol, getNextFont())
        } else {
            return cursorRight.call(this, wrap)
        }
    }

    const cursorLeft = Window_Options.prototype.cursorLeft
    Window_Options.prototype.cursorLeft = function (/** @type {boolean} */ wrap) {
        const index = this.index();
        const symbol = this.commandSymbol(index);
        if (symbol === font_symbol) {
            // @ts-ignore changeValue should have `value: any`
            this.changeValue(font_symbol, getNextFont(false))
        } else {
            return cursorLeft.call(this, wrap)
        }
    }

    Object.defineProperty(ConfigManager, font_symbol, {
        get: function () {
            return font
        },
        set: function (value) {
            font = value
        },
        configurable: true
    })

    const makeData = ConfigManager.makeData
    ConfigManager.makeData = function () {
        const config = makeData.call(this)
        config[font_symbol] = font
        return config
    }

    const applyData = ConfigManager.applyData
    ConfigManager.applyData = function (config) {
        applyData.call(this, config)
        if (font_symbol in config && typeof config[font_symbol] === 'string') {
            font = config[font_symbol]
        }
    }

    const mainFontFace = Game_System.prototype.mainFontFace
    Game_System.prototype.mainFontFace = function () {
        if (font === disabled) {
            return mainFontFace.call(this)
        } else {
            return font
        }
    }
}
{
    const option_name = 'Font Size'
    const font_size_symbol = 'font_size'
    let font_size = Game_System.prototype.mainFontSize.call();
    const font_size_max = font_size * 2;

    const addGeneralOptions = Window_Options.prototype.addGeneralOptions
    Window_Options.prototype.addGeneralOptions = function () {
        addGeneralOptions.call(this);
        this.addCommand(option_name, font_size_symbol, true)
    }

    const statusText = Window_Options.prototype.statusText
    Window_Options.prototype.statusText = function (/** @type {number} */ index) {
        const symbol = this.commandSymbol(index)
        if (symbol === font_size_symbol) {
            return font_size
        }
        return statusText.call(this, index)
    }

    function cycleFontSize(forward = true) {
        if (forward) font_size = (font_size + 1) % font_size_max
        else font_size = (font_size - 1) % font_size_max
        return font_size
    }

    const processOk = Window_Options.prototype.processOk
    Window_Options.prototype.processOk = function () {
        const index = this.index();
        const symbol = this.commandSymbol(index);
        if (symbol === font_size_symbol) {
            // @ts-ignore changeValue should have `value: any`
            this.changeValue(font_size_symbol, cycleFontSize())
        } else {
            return processOk.call(this)
        }
    }

    const cursorRight = Window_Options.prototype.cursorRight
    Window_Options.prototype.cursorRight = function (/** @type {boolean} */ wrap) {
        const index = this.index();
        const symbol = this.commandSymbol(index);
        if (symbol === font_size_symbol) {
            this.changeValue(font_size_symbol, cycleFontSize())
        } else {
            return cursorRight.call(this, wrap)
        }
    }

    const cursorLeft = Window_Options.prototype.cursorLeft
    Window_Options.prototype.cursorLeft = function (/** @type {boolean} */ wrap) {
        const index = this.index();
        const symbol = this.commandSymbol(index);
        if (symbol === font_size_symbol) {
            this.changeValue(font_size_symbol, cycleFontSize(false))
        } else {
            return cursorLeft.call(this, wrap)
        }
    }

    Object.defineProperty(ConfigManager, font_size_symbol, {
        get: function () {
            return font_size
        },
        set: function (value) {
            font_size = value
        },
        configurable: true
    })

    const makeData = ConfigManager.makeData
    ConfigManager.makeData = function () {
        const config = makeData.call(this)
        config[font_size_symbol] = font_size
        return config
    }

    const applyData = ConfigManager.applyData
    ConfigManager.applyData = function (config) {
        applyData.call(this, config)
        if (font_size_symbol in config && typeof config[font_size_symbol] === 'number') {
            font_size = config[font_size_symbol]
        }
    }

    Game_System.prototype.mainFontSize = function () {
        return font_size
    }
}