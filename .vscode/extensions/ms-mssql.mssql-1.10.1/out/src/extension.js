/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getController = exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const Constants = require("./constants/constants");
const LocalizedConstants = require("./constants/localizedConstants");
const mainController_1 = require("./controllers/mainController");
const vscodeWrapper_1 = require("./controllers/vscodeWrapper");
let controller = undefined;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        let vscodeWrapper = new vscodeWrapper_1.default();
        controller = new mainController_1.default(context, undefined, vscodeWrapper);
        context.subscriptions.push(controller);
        // Checking if localization should be applied
        let config = vscodeWrapper.getConfiguration(Constants.extensionConfigSectionName);
        let applyLocalization = config[Constants.configApplyLocalization];
        if (applyLocalization) {
            LocalizedConstants.loadLocalizedConstants(vscode.env.language);
        }
        // Exposed for testing purposes
        vscode.commands.registerCommand('mssql.getControllerForTests', () => controller);
        const activated = yield controller.activate();
        return activated;
    });
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
    return __awaiter(this, void 0, void 0, function* () {
        if (controller) {
            yield controller.deactivate();
            controller.dispose();
        }
    });
}
exports.deactivate = deactivate;
/**
 * Exposed for testing purposes
 */
function getController() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!controller) {
            let savedController = yield vscode.commands.executeCommand('mssql.getControllerForTests');
            return savedController;
        }
        return controller;
    });
}
exports.getController = getController;

//# sourceMappingURL=extension.js.map
