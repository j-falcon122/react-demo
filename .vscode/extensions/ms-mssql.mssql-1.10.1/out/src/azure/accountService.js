"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
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
exports.AccountService = void 0;
const Constants = require("../constants/constants");
const azureController_1 = require("./azureController");
const providerSettings_1 = require("../azure/providerSettings");
class AccountService {
    constructor(_client, _vscodeWrapper, _context, _accountStore) {
        this._client = _client;
        this._vscodeWrapper = _vscodeWrapper;
        this._context = _context;
        this._accountStore = _accountStore;
        this._account = undefined;
        this._token = undefined;
        this.commonTenant = {
            id: 'common',
            displayName: 'common'
        };
    }
    get account() {
        return this._account;
    }
    setAccount(account) {
        this._account = account;
    }
    get client() {
        return this._client;
    }
    /**
     * Public for testing purposes only
     */
    set token(value) {
        this._token = value;
    }
    convertToAzureAccount(azureSession) {
        let tenant = {
            displayName: Constants.tenantDisplayName,
            id: azureSession.tenantId,
            userId: azureSession.userId
        };
        let key = {
            providerId: Constants.resourceProviderId,
            id: azureSession.userId
        };
        let account = {
            key: key,
            displayInfo: {
                userId: azureSession.userId,
                displayName: undefined,
                accountType: undefined,
                name: undefined
            },
            properties: {
                tenants: [tenant]
            },
            isStale: this._isStale,
            isSignedIn: false
        };
        return account;
    }
    createSecurityTokenMapping() {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: match type for mapping in mssql and sqltoolsservice
            let mapping = {};
            mapping[this.getHomeTenant(this.account).id] = {
                token: yield this.refreshToken(this.account)
            };
            return mapping;
        });
    }
    refreshToken(account) {
        return __awaiter(this, void 0, void 0, function* () {
            let azureController = new azureController_1.AzureController(this._context);
            return yield azureController.refreshToken(account, this._accountStore, providerSettings_1.default.resources.azureManagementResource);
        });
    }
    getHomeTenant(account) {
        var _a, _b;
        // Home is defined by the API
        // Lets pick the home tenant - and fall back to commonTenant if they don't exist
        return (_b = (_a = account.properties.tenants.find(t => t.tenantCategory === 'Home')) !== null && _a !== void 0 ? _a : account.properties.tenants[0]) !== null && _b !== void 0 ? _b : this.commonTenant;
    }
}
exports.AccountService = AccountService;

//# sourceMappingURL=accountService.js.map
