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
exports.SimpleTokenCache = void 0;
const path_1 = require("path");
const StorageService_1 = require("./StorageService");
const crypto = require("crypto");
function getSystemKeytar() {
    try {
        return require('keytar');
    }
    catch (err) {
        console.log(err);
    }
    return undefined;
}
const separator = '§';
class SimpleTokenCache {
    constructor(serviceName, userStoragePath, forceFileStorage = false, credentialService) {
        this.serviceName = serviceName;
        this.userStoragePath = userStoragePath;
        this.forceFileStorage = forceFileStorage;
        this.credentialService = credentialService;
    }
    getFileKeytar(filePath, credentialService) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileName = path_1.parse(filePath).base;
            const iv = yield credentialService.readCredential(`${fileName}-iv`);
            const credentialKey = yield credentialService.readCredential(`${fileName}-key`);
            let ivBuffer;
            let keyBuffer;
            if (!(iv === null || iv === void 0 ? void 0 : iv.password) || !(credentialKey === null || credentialKey === void 0 ? void 0 : credentialKey.password)) {
                ivBuffer = crypto.randomBytes(16);
                keyBuffer = crypto.randomBytes(32);
                try {
                    yield credentialService.saveCredential(`${fileName}-iv`, ivBuffer.toString('hex'));
                    yield credentialService.saveCredential(`${fileName}-key`, keyBuffer.toString('hex'));
                }
                catch (ex) {
                    console.log(ex);
                }
            }
            else {
                ivBuffer = Buffer.from(iv.password, 'hex');
                keyBuffer = Buffer.from(credentialKey.password, 'hex');
            }
            const fileSaver = (content) => __awaiter(this, void 0, void 0, function* () {
                const cipherIv = crypto.createCipheriv('aes-256-gcm', keyBuffer, ivBuffer);
                return `${cipherIv.update(content, 'utf8', 'hex')}${cipherIv.final('hex')}%${cipherIv.getAuthTag().toString('hex')}`;
            });
            const fileOpener = (content) => __awaiter(this, void 0, void 0, function* () {
                const decipherIv = crypto.createDecipheriv('aes-256-gcm', keyBuffer, ivBuffer);
                const split = content.split('%');
                if (split.length !== 2) {
                    throw new Error('File didn\'t contain the auth tag.');
                }
                decipherIv.setAuthTag(Buffer.from(split[1], 'hex'));
                return `${decipherIv.update(split[0], 'hex', 'utf8')}${decipherIv.final('utf8')}`;
            });
            this.db = new StorageService_1.StorageService(filePath, fileOpener, fileSaver);
            yield this.db.initialize();
            const self = this;
            const fileKeytar = {
                getPassword(service, account) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return self.db.get(`${service}${separator}${account}`);
                    });
                },
                setPassword(service, account, password) {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield self.db.set(`${service}${separator}${account}`, password);
                    });
                },
                deletePassword(service, account) {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield self.db.remove(`${service}${separator}${account}`);
                        return true;
                    });
                },
                getPasswords(service) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const result = self.db.getPrefix(`${service}`);
                        if (!result) {
                            return [];
                        }
                        return result.map(({ key, value }) => {
                            return {
                                account: key.split(separator)[1],
                                password: value
                            };
                        });
                    });
                }
            };
            return fileKeytar;
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.serviceName = this.serviceName.replace(/-/g, '_');
            let keytar;
            if (this.forceFileStorage === false) {
                keytar = getSystemKeytar();
                // Add new method to keytar
                if (keytar) {
                    keytar.getPasswords = (service) => __awaiter(this, void 0, void 0, function* () {
                        const [serviceName, accountPrefix] = service.split(separator);
                        if (serviceName === undefined || accountPrefix === undefined) {
                            throw new Error('Service did not have seperator: ' + service);
                        }
                        const results = yield keytar.findCredentials(serviceName);
                        return results.filter(({ account }) => {
                            return account.startsWith(accountPrefix);
                        });
                    });
                }
            }
            if (!keytar) {
                keytar = yield this.getFileKeytar(path_1.join(this.userStoragePath, this.serviceName), this.credentialService);
            }
            this.keytar = keytar;
        });
    }
    set(id, key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.forceFileStorage && key.length > 2500) { // Windows limitation
                throw new Error('Key length is longer than 2500 chars');
            }
            if (id.includes(separator)) {
                throw new Error('Separator included in ID');
            }
            try {
                return yield this.keytar.setPassword(this.serviceName, id, key);
            }
            catch (ex) {
                console.log(`Adding key failed: ${ex}`);
            }
        });
    }
    get(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.keytar.getPassword(this.serviceName, id);
                if (result === null) {
                    return undefined;
                }
                return result;
            }
            catch (ex) {
                console.log(`Getting key failed: ${ex}`);
                return undefined;
            }
        });
    }
    remove(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.keytar.deletePassword(this.serviceName, key);
            }
            catch (ex) {
                console.log(`Clearing key failed: ${ex}`);
                return false;
            }
        });
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.keytar = getSystemKeytar();
            }
            catch (ex) {
                console.log(`clear keytar failed ${ex}`);
            }
        });
    }
    findCredentials(prefix) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.keytar.getPasswords(`${this.serviceName}${separator}${prefix}`);
            }
            catch (ex) {
                console.log(`Finding credentials failed: ${ex}`);
                return undefined;
            }
        });
    }
}
exports.SimpleTokenCache = SimpleTokenCache;

//# sourceMappingURL=cacheService.js.map
