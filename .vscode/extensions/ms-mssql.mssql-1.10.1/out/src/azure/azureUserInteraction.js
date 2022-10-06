"use strict";
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
exports.AzureUserInteraction = void 0;
const vscode = require("vscode");
class AzureUserInteraction {
    constructor(state) {
        let arr = state.split(',');
        this.port = arr[0];
        this.nonce = arr[1];
    }
    askForConsent(msg) {
        return;
    }
    openUrl(signInUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            return vscode.env.openExternal(vscode.Uri.parse(`http://localhost:${this.port}/signin?nonce=${encodeURIComponent(this.nonce)}`));
        });
    }
}
exports.AzureUserInteraction = AzureUserInteraction;

//# sourceMappingURL=azureUserInteraction.js.map
