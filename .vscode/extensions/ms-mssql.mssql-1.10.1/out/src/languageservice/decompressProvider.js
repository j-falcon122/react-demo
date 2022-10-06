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
const DecompressTar = require("tar");
const DecompressZip = require("decompress-zip");
class DecompressProvider {
    decompressZip(pkg, logger) {
        const unzipper = new DecompressZip(pkg.tmpFile.name);
        return new Promise((resolve, reject) => {
            let totalFiles = 0;
            unzipper.on('progress', (index, fileCount) => __awaiter(this, void 0, void 0, function* () {
                totalFiles = fileCount;
            }));
            unzipper.on('extract', () => __awaiter(this, void 0, void 0, function* () {
                logger.appendLine(`Done! ${totalFiles} files unpacked.\n`);
                resolve();
            }));
            unzipper.on('error', (decompressErr) => __awaiter(this, void 0, void 0, function* () {
                logger.appendLine(`[ERROR] ${decompressErr}`);
                reject(decompressErr);
            }));
            unzipper.extract({ path: pkg.installPath });
        });
    }
    decompressTar(pkg, logger) {
        let totalFiles = 0;
        return DecompressTar.extract({
            file: pkg.tmpFile.name,
            cwd: pkg.installPath,
            onentry: () => { totalFiles++; },
            onwarn: (warn) => {
                if (warn.data && !warn.data.recoverable) {
                    logger.appendLine(`[ERROR] ${warn.message}`);
                }
            }
        }, () => { logger.appendLine(`Done! ${totalFiles} files unpacked.\n`); });
    }
    decompress(pkg, logger) {
        if (pkg.isZipFile) {
            return this.decompressZip(pkg, logger);
        }
        else {
            return this.decompressTar(pkg, logger);
        }
    }
}
exports.default = DecompressProvider;

//# sourceMappingURL=decompressProvider.js.map
