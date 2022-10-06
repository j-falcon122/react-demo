"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Picker = void 0;
const vscode = require("vscode");
const ImporterType_1 = require("../model/ImporterType");
const OS_1 = require("../model/OS");
class Picker {
    static async pickImporterType() {
        const options = {
            placeHolder: 'Which OS do you want to convert for?',
            ignoreFocusOut: true,
        };
        const picked = await vscode.window.showQuickPick(ImporterType_1.ImporterTypePickerList, options);
        switch (picked) {
            case ImporterType_1.XML_FILE:
                return 'XmlFile';
            case ImporterType_1.DEFAULT:
                return 'Default';
            case undefined:
                return undefined;
        }
    }
    static async pickOSDestionation() {
        const osOptions = {
            placeHolder: 'Which OS do you want to convert for?',
            ignoreFocusOut: true,
        };
        const picked = await vscode.window.showQuickPick(OS_1.OSPickerList, osOptions);
        switch (picked) {
            case OS_1.LINUX_TO_LINUX:
                return { src: 'Linux', dst: 'Linux' };
            case OS_1.LINUX_TO_MAC:
                return { src: 'Linux', dst: 'Mac' };
            case OS_1.LINUX_TO_WINDOWS:
                return { src: 'Linux', dst: 'Windows' };
            case OS_1.MAC_TO_LINUX:
                return { src: 'Mac', dst: 'Linux' };
            case OS_1.MAC_TO_MAC:
                return { src: 'Mac', dst: 'Mac' };
            case OS_1.MAC_TO_WINDOWS:
                return { src: 'Mac', dst: 'Windows' };
            case OS_1.WINDOWS_TO_LINUX:
                return { src: 'Windows', dst: 'Linux' };
            case OS_1.WINDOWS_TO_MAC:
                return { src: 'Windows', dst: 'Mac' };
            case OS_1.WINDOWS_TO_WINDOWS:
                return { src: 'Windows', dst: 'Windows' };
            case undefined:
                return undefined;
        }
    }
}
exports.Picker = Picker;
//# sourceMappingURL=Picker.js.map