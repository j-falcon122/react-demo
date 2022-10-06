"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntelliJSyntaxAnalyzer = void 0;
const VSCodeKeybindingDefault_1 = require("../model/vscode/implement/VSCodeKeybindingDefault");
const VSCodeKeyLinux_1 = require("../model/vscode/implement/VSCodeKeyLinux");
const VSCodeKeyMac_1 = require("../model/vscode/implement/VSCodeKeyMac");
const VSCodeKeyWindows_1 = require("../model/vscode/implement/VSCodeKeyWindows");
class IntelliJSyntaxAnalyzer {
    constructor(osDestination, actionIdCommandMappings, keystrokeKeyMappings, vscodeDefaults, intellijDefaults, intellijCustoms) {
        this.addCustomIntelliJ = (vscodeImmutable, vscodeDefault, intellijDefault, intellijCustom) => {
            const key = this.convertToKey(intellijCustom).key;
            const when = vscodeDefault.when;
            const command = vscodeDefault.command;
            const alreadyBinded = vscodeImmutable.some(keybinding => keybinding.key === key && keybinding.command === command && keybinding.when === when);
            return alreadyBinded ? undefined : new VSCodeKeybindingDefault_1.VSCodeKeybindingDefault(command, key, when);
        };
        this.addDefaultIntelliJ = (vscodeImmutable, vscodeDefault, intellijDefault) => {
            const key = this.convertToKey(intellijDefault).key;
            const when = vscodeDefault.when;
            const command = vscodeDefault.command;
            const alreadyBinded = vscodeImmutable.some(keybinding => keybinding.key === key && keybinding.command === command && keybinding.when === when);
            return alreadyBinded ? undefined : new VSCodeKeybindingDefault_1.VSCodeKeybindingDefault(command, key, when);
        };
        this.removeDefaultVSCode = (vscodeImmutable, vscodeDefault, intellijDefault, intellijCustom = undefined) => {
            const key = vscodeDefault.key;
            const command = vscodeDefault.command;
            const alreadyBinded = vscodeImmutable.some(keybinding => keybinding.key === key && keybinding.command.endsWith(command));
            if (alreadyBinded) {
                return undefined;
            }
            const removedCommand = `${IntelliJSyntaxAnalyzer.REMOVE_KEYBINDING}${command}`;
            return new VSCodeKeybindingDefault_1.VSCodeKeybindingDefault(removedCommand, key);
        };
        this.removeDefaultIntelliJ = (vscodeImmutable, vscodeDefault, intellijDefault, intellijCustom = undefined) => {
            const key = this.convertToKey(intellijDefault).key;
            const command = vscodeDefault.command;
            const alreadyBinded = vscodeImmutable.some(keybinding => keybinding.key === key && keybinding.command.endsWith(command));
            if (alreadyBinded) {
                return undefined;
            }
            const removedCommand = `${IntelliJSyntaxAnalyzer.REMOVE_KEYBINDING}${command}`;
            return new VSCodeKeybindingDefault_1.VSCodeKeybindingDefault(removedCommand, key);
        };
        this.osDestination = osDestination;
        this.actionIdCommandMappings = IntelliJSyntaxAnalyzer.groupBy(actionIdCommandMappings, x => x.intellij);
        this.keystrokeKeyMappings = keystrokeKeyMappings;
        this.vscodeDefaults = IntelliJSyntaxAnalyzer.groupBy(vscodeDefaults, x => x.command);
        this.intellijDefaults = intellijDefaults;
        this.intellijCustoms = IntelliJSyntaxAnalyzer.groupBy(intellijCustoms, x => x.actionId);
    }
    // FIXME: high-cost
    async convert() {
        let vscodeMutable = [];
        // set custom
        const customs = this.action(vscodeMutable, this.addCustomIntelliJ);
        vscodeMutable = vscodeMutable.concat(customs);
        // set default
        const defaults = this.action(vscodeMutable, undefined, this.addDefaultIntelliJ);
        vscodeMutable = vscodeMutable.concat(defaults);
        // remove default
        const removedDefaultsVSCode = this.action(vscodeMutable, this.removeDefaultVSCode, this.removeDefaultVSCode);
        vscodeMutable = vscodeMutable.concat(removedDefaultsVSCode);
        // remove default
        const removedDefaultsIntelliJ = this.action(vscodeMutable, this.removeDefaultIntelliJ, this.removeDefaultIntelliJ);
        vscodeMutable = vscodeMutable.concat(removedDefaultsIntelliJ);
        return vscodeMutable;
    }
    action(vscodeImmutable, onCustom, onDefault = undefined) {
        const vscodeMutable = [];
        // FIXEME: This loop is not correct because it duplicates when there are two defaults. Rewrite when I have time
        for (let intellijDefault of this.intellijDefaults) {
            if (!this.actionIdCommandMappings[intellijDefault.actionId]) {
                continue;
            }
            for (let actionIdCommandMapping of this.actionIdCommandMappings[intellijDefault.actionId]) {
                const actionId = actionIdCommandMapping.intellij;
                const command = actionIdCommandMapping.vscode;
                if (!this.vscodeDefaults[command]) {
                    continue;
                }
                for (let vscodeDefault of this.vscodeDefaults[command]) {
                    if (this.intellijCustoms[actionId]) {
                        if (onCustom) {
                            for (let intellijCustom of this.intellijCustoms[actionId]) {
                                const keybinding = onCustom(vscodeMutable.concat(vscodeImmutable), vscodeDefault, intellijDefault, intellijCustom);
                                if (keybinding) {
                                    vscodeMutable.push(keybinding);
                                }
                            }
                        }
                    }
                    else {
                        if (onDefault) {
                            const keybinding = onDefault(vscodeMutable.concat(vscodeImmutable), vscodeDefault, intellijDefault, undefined);
                            if (keybinding) {
                                vscodeMutable.push(keybinding);
                            }
                        }
                    }
                }
            }
        }
        return vscodeMutable;
    }
    convertToKey(intellijKeymap) {
        switch (this.osDestination) {
            case 'Linux':
                return new VSCodeKeyLinux_1.VSCodeKeyLinux(intellijKeymap, this.keystrokeKeyMappings);
            case 'Mac':
                return new VSCodeKeyMac_1.VSCodeKeyMac(intellijKeymap, this.keystrokeKeyMappings);
            case 'Windows':
                return new VSCodeKeyWindows_1.VSCodeKeyWindows(intellijKeymap, this.keystrokeKeyMappings);
        }
    }
    static groupBy(array, prop) {
        return array.reduce((groups, item) => {
            var _a;
            const val = prop(item);
            groups[val] = (_a = groups[val]) !== null && _a !== void 0 ? _a : [];
            groups[val].push(item);
            return groups;
        }, {});
    }
}
exports.IntelliJSyntaxAnalyzer = IntelliJSyntaxAnalyzer;
IntelliJSyntaxAnalyzer.REMOVE_KEYBINDING = '-';
//# sourceMappingURL=IntelliJSyntaxAnalyzer.js.map