"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
exports.AzureAuthRequest = void 0;
const LocalizedConstants = require("../constants/localizedConstants");
const ads_adal_library_1 = require("ads-adal-library");
const simpleWebServer_1 = require("./simpleWebServer");
const crypto = require("crypto");
const path = require("path");
const fs_1 = require("fs");
const vscode = require("vscode");
const vscodeWrapper_1 = require("../controllers/vscodeWrapper");
class AzureAuthRequest {
    constructor(context, logger) {
        this.simpleWebServer = new simpleWebServer_1.SimpleWebServer();
        this.serverPort = undefined;
        this.nonce = crypto.randomBytes(16).toString('base64');
        this.context = context;
        this.logger = logger;
        this._vscodeWrapper = new vscodeWrapper_1.default();
    }
    getState() {
        return `${this.serverPort},${encodeURIComponent(this.nonce)}`;
    }
    getAuthorizationCode(signInUrl, authComplete) {
        return __awaiter(this, void 0, void 0, function* () {
            let mediaPath = path.join(this.context.extensionPath, 'media');
            // media path goes here - working directory for this extension
            const sendFile = (res, filePath, contentType) => __awaiter(this, void 0, void 0, function* () {
                let fileContents;
                try {
                    fileContents = yield fs_1.promises.readFile(filePath);
                }
                catch (ex) {
                    this.logger.error(ex);
                    res.writeHead(400);
                    res.end();
                    return;
                }
                res.writeHead(200, {
                    'Content-Length': fileContents.length,
                    'Content-Type': contentType
                });
                res.end(fileContents);
            });
            this.simpleWebServer.on('/landing.css', (req, reqUrl, res) => {
                sendFile(res, path.join(mediaPath, 'landing.css'), 'text/css; charset=utf-8').catch(this.logger.error);
            });
            this.simpleWebServer.on('/SignIn.svg', (req, reqUrl, res) => {
                sendFile(res, path.join(mediaPath, 'SignIn.svg'), 'image/svg+xml').catch(this.logger.error);
            });
            this.simpleWebServer.on('/signin', (req, reqUrl, res) => {
                let receivedNonce = reqUrl.query.nonce;
                receivedNonce = receivedNonce.replace(/ /g, '+');
                if (receivedNonce !== encodeURIComponent(this.nonce)) {
                    res.writeHead(400, { 'content-type': 'text/html' });
                    // res.write(localize('azureAuth.nonceError', 'Authentication failed due to a nonce mismatch, please close Azure Data Studio and try again.'));
                    res.end();
                    this.logger.error('nonce no match', receivedNonce, this.nonce);
                    return;
                }
                res.writeHead(302, { Location: signInUrl });
                res.end();
            });
            return new Promise((resolve, reject) => {
                this.simpleWebServer.on('/callback', (req, reqUrl, res) => {
                    var _a, _b;
                    const state = (_a = reqUrl.query.state) !== null && _a !== void 0 ? _a : '';
                    const code = (_b = reqUrl.query.code) !== null && _b !== void 0 ? _b : '';
                    const stateSplit = state.split(',');
                    if (stateSplit.length !== 2) {
                        res.writeHead(400, { 'content-type': 'text/html' });
                        // res.write(localize('azureAuth.stateError', 'Authentication failed due to a state mismatch, please close ADS and try again.'));
                        res.end();
                        reject(new Error('State mismatch'));
                        return;
                    }
                    if (stateSplit[1] !== encodeURIComponent(this.nonce)) {
                        res.writeHead(400, { 'content-type': 'text/html' });
                        // res.write(localize('azureAuth.nonceError', 'Authentication failed due to a nonce mismatch,
                        // please close Azure Data Studio and try again.'));
                        res.end();
                        reject(new Error('Nonce mismatch'));
                        return;
                    }
                    resolve(code);
                    authComplete.then(() => {
                        sendFile(res, path.join(mediaPath, 'landing.html'), 'text/html; charset=utf-8').catch(console.error);
                    }, (ex) => {
                        res.writeHead(400, { 'content-type': 'text/html' });
                        res.write(ex.message);
                        res.end();
                    });
                });
            });
            return;
            // check the state that is returned from the local web server for the server port and nonce
            // private addServerListeners(server: SimpleWebServer, )
        });
    }
    displayDeviceCodeScreen(msg, userCode, verificationUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            // create a notification with the device code message, usercode, and verificationurl
            const selection = yield this._vscodeWrapper.showInformationMessage(msg, LocalizedConstants.msgCopyAndOpenWebpage);
            if (selection === LocalizedConstants.msgCopyAndOpenWebpage) {
                this._vscodeWrapper.clipboardWriteText(userCode);
                let test = yield vscode.env.openExternal(vscode.Uri.parse(verificationUrl));
                console.log(msg);
                console.log(userCode);
                console.log(verificationUrl);
            }
            return;
        });
    }
    closeDeviceCodeScreen() {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    startServer() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.serverPort = yield this.simpleWebServer.startup();
            }
            catch (ex) {
                throw new ads_adal_library_1.AzureAuthError(13, 'Server could not start', ex);
            }
        });
    }
}
exports.AzureAuthRequest = AzureAuthRequest;

//# sourceMappingURL=azureAuthRequest.js.map
