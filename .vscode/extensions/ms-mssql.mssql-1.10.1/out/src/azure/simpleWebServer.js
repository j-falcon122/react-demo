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
exports.SimpleWebServer = exports.AlreadyRunningError = void 0;
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const http = require("http");
const url = require("url");
class AlreadyRunningError extends Error {
}
exports.AlreadyRunningError = AlreadyRunningError;
class SimpleWebServer {
    constructor(autoShutoffTimer = 5 * 60 * 1000) {
        this.autoShutoffTimer = autoShutoffTimer;
        this.pathMappings = new Map();
        this.bumpLastUsed();
        this.autoShutoff();
        this.server = http.createServer((req, res) => {
            this.bumpLastUsed();
            const reqUrl = url.parse(req.url, /* parseQueryString */ true);
            const handler = this.pathMappings.get(reqUrl.pathname);
            if (handler) {
                return handler(req, reqUrl, res);
            }
            res.writeHead(404);
            res.end();
        });
    }
    bumpLastUsed() {
        this.lastUsed = new Date().getTime();
    }
    shutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            clearInterval(this.shutoffInterval);
            return new Promise((resolve, reject) => {
                this.server.close((error) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }
    startup() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.hasStarted) {
                throw new AlreadyRunningError();
            }
            this.hasStarted = true;
            let portTimeout;
            const portPromise = new Promise((resolve, reject) => {
                portTimeout = setTimeout(() => {
                    reject(new Error('Timed out waiting for the server to start'));
                }, 5000);
                this.server.on('listening', () => {
                    // TODO: What are string addresses?
                    const address = this.server.address();
                    if (address.port === undefined) {
                        reject(new Error('Port was not defined'));
                    }
                    resolve(address.port.toString());
                });
                this.server.on('error', () => {
                    reject(new Error('Server error'));
                });
                this.server.on('close', () => {
                    reject(new Error('Server closed'));
                });
                this.server.listen(0, '127.0.0.1');
            });
            const clearPortTimeout = () => {
                clearTimeout(portTimeout);
            };
            portPromise.finally(clearPortTimeout);
            return portPromise;
        });
    }
    on(pathMapping, handler) {
        this.pathMappings.set(pathMapping, handler);
    }
    autoShutoff() {
        this.shutoffInterval = setInterval(() => {
            const time = new Date().getTime();
            if (time - this.lastUsed > this.autoShutoffTimer) {
                console.log('Shutting off webserver...');
                this.shutdown().catch(console.error);
            }
        }, 1000);
    }
}
exports.SimpleWebServer = SimpleWebServer;

//# sourceMappingURL=simpleWebServer.js.map
