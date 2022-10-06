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
exports.StorageService = exports.AlreadyInitializedError = void 0;
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const fs_1 = require("fs");
const noOpHook = (contents) => __awaiter(void 0, void 0, void 0, function* () {
    return contents;
});
class AlreadyInitializedError extends Error {
}
exports.AlreadyInitializedError = AlreadyInitializedError;
class StorageService {
    constructor(dbPath, readHook = noOpHook, writeHook = noOpHook) {
        this.dbPath = dbPath;
        this.readHook = readHook;
        this.writeHook = writeHook;
        this.isSaving = false;
        this.isDirty = false;
        this.isInitialized = false;
    }
    /**
     * Sets a new read hook. Throws AlreadyInitializedError if the database has already started.
     * @param hook
     */
    setReadHook(hook) {
        if (this.isInitialized) {
            throw new AlreadyInitializedError();
        }
        this.readHook = hook;
    }
    /**
     * Sets a new write hook.
     * @param hook
     */
    setWriteHook(hook) {
        this.writeHook = hook;
    }
    set(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.waitForFileSave();
            this.db[key] = value;
            this.isDirty = true;
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db[key];
        });
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.waitForFileSave();
            this.db = {};
            this.isDirty = true;
        });
    }
    remove(key) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.waitForFileSave();
            delete this.db[key];
            this.isDirty = true;
            return true;
        });
    }
    getPrefix(keyPrefix) {
        return Object.entries(this.db).filter(([key]) => {
            return key.startsWith(keyPrefix);
        }).map(([key, value]) => {
            return { key, value };
        });
    }
    deletePrefix(keyPrefix) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.waitForFileSave();
            Object.keys(this.db).forEach(s => {
                if (s.startsWith(keyPrefix)) {
                    delete this.db[s];
                }
            });
            this.isDirty = true;
        });
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            this.isInitialized = true;
            this.setupSaveTask();
            let fileContents;
            try {
                yield fs_1.promises.access(this.dbPath, fs_1.constants.R_OK);
                fileContents = yield fs_1.promises.readFile(this.dbPath, { encoding: 'utf8' });
                fileContents = yield this.readHook(fileContents);
            }
            catch (ex) {
                console.log(`file db does not exist ${ex}`);
                yield this.createFile();
                this.db = {};
                this.isDirty = true;
                return;
            }
            try {
                this.db = JSON.parse(fileContents);
            }
            catch (ex) {
                console.log(`DB was corrupted, resetting it ${ex}`);
                yield this.createFile();
                this.db = {};
            }
        });
    }
    setupSaveTask() {
        return setInterval(() => this.save(), 20 * 1000);
    }
    shutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.waitForFileSave();
            clearInterval((this.saveInterval));
            yield this.save();
        });
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.waitForFileSave();
                if (this.isDirty === false) {
                    return;
                }
                this.isSaving = true;
                let contents = JSON.stringify(this.db);
                contents = yield this.writeHook(contents);
                yield fs_1.promises.writeFile(this.dbPath, contents, { encoding: 'utf8' });
                this.isDirty = false;
            }
            catch (ex) {
                console.log(`File saving is erroring! ${ex}`);
            }
            finally {
                this.isSaving = false;
            }
        });
    }
    waitForFileSave() {
        return __awaiter(this, void 0, void 0, function* () {
            const cleanupCrew = [];
            const sleepToFail = (time) => {
                return new Promise((_, reject) => {
                    const timeout = setTimeout(function () {
                        reject(new Error('timeout'));
                    }, time);
                    cleanupCrew.push(timeout);
                });
            };
            const poll = (func) => {
                return new Promise(resolve => {
                    const interval = setInterval(() => {
                        if (func() === true) {
                            resolve();
                        }
                    }, 100);
                    cleanupCrew.push(interval);
                });
            };
            if (this.isSaving) {
                const timeout = sleepToFail(5 * 1000);
                const check = poll(() => !this.isSaving);
                try {
                    return yield Promise.race([timeout, check]);
                }
                catch (ex) {
                    throw new Error('Save timed out');
                }
                finally {
                    cleanupCrew.forEach(clearInterval);
                }
            }
        });
    }
    createFile() {
        return __awaiter(this, void 0, void 0, function* () {
            return fs_1.promises.writeFile(this.dbPath, '', { encoding: 'utf8' });
        });
    }
}
exports.StorageService = StorageService;

//# sourceMappingURL=StorageService.js.map
