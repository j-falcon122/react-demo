"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntelliJXMLParser = void 0;
const parser = require("fast-xml-parser");
const IntelliJKeymapXML_1 = require("../model/intellij/implement/IntelliJKeymapXML");
class IntelliJXMLParser {
    static async parseToJson(xml) {
        if (!xml) {
            return undefined;
        }
        const parserXmlOptions = {
            ignoreAttributes: false,
            parseAttributeValue: true,
            arrayMode: true,
        };
        if (!parser.validate(xml)) {
            throw Error('Cannot load this IntelliJ IDEA Keymap file. Plesase check the file format.');
        }
        return parser.parse(xml, parserXmlOptions);
    }
    static async desirialize(json) {
        if (!json || !json.keymap) {
            return [];
        }
        const intellijKeymaps = new Array();
        const actionElements = json.keymap[0].action;
        for (const actionIndex in actionElements) {
            const actionIdAttr = actionElements[actionIndex]['@_id'];
            const keystorkeElements = actionElements[actionIndex]['keyboard-shortcut'];
            for (const keystrokeIndex in keystorkeElements) {
                const keyboardShortcutElement = keystorkeElements[keystrokeIndex];
                const firstKeystrokeAttr = keyboardShortcutElement['@_first-keystroke'];
                const secondKeystrokeAttr = keyboardShortcutElement['@_second-keystroke'];
                const intellijKeymapXml = new IntelliJKeymapXML_1.IntelliJKeymapXML(actionIdAttr, firstKeystrokeAttr, secondKeystrokeAttr);
                intellijKeymaps.push(intellijKeymapXml);
            }
        }
        return intellijKeymaps;
    }
}
exports.IntelliJXMLParser = IntelliJXMLParser;
//# sourceMappingURL=IntelliJXmlParser.js.map