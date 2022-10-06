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
exports.AccountStore = void 0;
const Constants = require("../constants/constants");
class AccountStore {
    constructor(_context) {
        this._context = _context;
    }
    getAccounts() {
        var _a;
        let configValues = (_a = this._context.globalState.get(Constants.configAzureAccount)) !== null && _a !== void 0 ? _a : [];
        return configValues;
    }
    getAccount(key) {
        let account;
        let configValues = this._context.globalState.get(Constants.configAzureAccount);
        if (!configValues) {
            throw new Error('no accounts stored');
        }
        for (let value of configValues) {
            if (value.key.id === key) {
                account = value;
                break;
            }
        }
        if (!account) {
            // Throw error message saying the account was not found
            return undefined;
        }
        return account;
    }
    removeAccount(key) {
        let configValues = this.getAccounts();
        configValues = configValues.filter(val => val.key.id !== key);
        this._context.globalState.update(Constants.configAzureAccount, configValues);
        return;
    }
    /**
     * Adds an account to the account store.
     *
     * @param {IAccount} account the account to add
     * @returns {Promise<void>} a Promise that returns when the account was saved
     */
    addAccount(account) {
        return __awaiter(this, void 0, void 0, function* () {
            let configValues = this.getAccounts();
            // remove element if already present in map
            if (configValues.length > 0) {
                configValues = configValues.filter(val => val.key.id !== account.key.id);
            }
            else {
                configValues = [];
            }
            configValues.unshift(account);
            yield this._context.globalState.update(Constants.configAzureAccount, configValues);
        });
    }
    clearAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            let configValues = [];
            yield this._context.globalState.update(Constants.configAzureAccount, configValues);
        });
    }
}
exports.AccountStore = AccountStore;

//# sourceMappingURL=accountStore.js.map
