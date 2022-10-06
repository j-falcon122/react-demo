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
exports.AzureController = void 0;
const vscode = require("vscode");
const LocalizedConstants = require("../constants/localizedConstants");
const azureStringLookup_1 = require("../azure/azureStringLookup");
const azureUserInteraction_1 = require("../azure/azureUserInteraction");
const azureErrorLookup_1 = require("../azure/azureErrorLookup");
const azureMessageDisplayer_1 = require("./azureMessageDisplayer");
const azureLogger_1 = require("../azure/azureLogger");
const azureAuthRequest_1 = require("./azureAuthRequest");
const cacheService_1 = require("./cacheService");
const path = require("path");
const os = require("os");
const fs_1 = require("fs");
const credentialstore_1 = require("../credentialstore/credentialstore");
const utils = require("../models/utils");
const ads_adal_library_1 = require("ads-adal-library");
const providerSettings_1 = require("../azure/providerSettings");
const vscodeWrapper_1 = require("../controllers/vscodeWrapper");
function getAppDataPath() {
    let platform = process.platform;
    switch (platform) {
        case 'win32': return process.env['APPDATA'] || path.join(process.env['USERPROFILE'], 'AppData', 'Roaming');
        case 'darwin': return path.join(os.homedir(), 'Library', 'Application Support');
        case 'linux': return process.env['XDG_CONFIG_HOME'] || path.join(os.homedir(), '.config');
        default: throw new Error('Platform not supported');
    }
}
function getDefaultLogLocation() {
    return path.join(getAppDataPath(), 'vscode-mssql');
}
function findOrMakeStoragePath() {
    return __awaiter(this, void 0, void 0, function* () {
        let defaultLogLocation = getDefaultLogLocation();
        let storagePath = path.join(defaultLogLocation, 'AAD');
        try {
            yield fs_1.promises.mkdir(defaultLogLocation, { recursive: true });
        }
        catch (e) {
            if (e.code !== 'EEXIST') {
                console.log(`Creating the base directory failed... ${e}`);
                return undefined;
            }
        }
        try {
            yield fs_1.promises.mkdir(storagePath, { recursive: true });
        }
        catch (e) {
            if (e.code !== 'EEXIST') {
                console.error(`Initialization of vscode-mssql storage failed: ${e}`);
                console.error('Azure accounts will not be available');
                return undefined;
            }
        }
        console.log('Initialized vscode-mssql storage.');
        return storagePath;
    });
}
class AzureController {
    constructor(context, logger) {
        this.context = context;
        if (!this.logger) {
            this.logger = new azureLogger_1.AzureLogger();
        }
        if (!this._vscodeWrapper) {
            this._vscodeWrapper = new vscodeWrapper_1.default();
        }
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.authRequest = new azureAuthRequest_1.AzureAuthRequest(this.context, this.logger);
            yield this.authRequest.startServer();
            let storagePath = yield findOrMakeStoragePath();
            let credentialStore = new credentialstore_1.CredentialStore();
            this.cacheService = new cacheService_1.SimpleTokenCache('aad', storagePath, true, credentialStore);
            yield this.cacheService.init();
            this.storageService = this.cacheService.db;
            this.azureStringLookup = new azureStringLookup_1.AzureStringLookup();
            this.azureUserInteraction = new azureUserInteraction_1.AzureUserInteraction(this.authRequest.getState());
            this.azureErrorLookup = new azureErrorLookup_1.AzureErrorLookup();
            this.azureMessageDisplayer = new azureMessageDisplayer_1.AzureMessageDisplayer();
        });
    }
    getTokens(profile, accountStore, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            let account;
            let config = vscode.workspace.getConfiguration('mssql').get('azureActiveDirectory');
            if (config === utils.azureAuthTypeToString(ads_adal_library_1.AzureAuthType.AuthCodeGrant)) {
                let azureCodeGrant = yield this.createAuthCodeGrant();
                account = yield azureCodeGrant.startLogin();
                yield accountStore.addAccount(account);
                const token = yield azureCodeGrant.getAccountSecurityToken(account, azureCodeGrant.getHomeTenant(account).id, settings);
                if (!token) {
                    let errorMessage = LocalizedConstants.msgGetTokenFail;
                    this._vscodeWrapper.showErrorMessage(errorMessage);
                }
                profile.azureAccountToken = token.token;
                profile.email = account.displayInfo.email;
                profile.accountId = account.key.id;
            }
            else if (config === utils.azureAuthTypeToString(ads_adal_library_1.AzureAuthType.DeviceCode)) {
                let azureDeviceCode = yield this.createDeviceCode();
                account = yield azureDeviceCode.startLogin();
                yield accountStore.addAccount(account);
                const token = yield azureDeviceCode.getAccountSecurityToken(account, azureDeviceCode.getHomeTenant(account).id, settings);
                if (!token) {
                    let errorMessage = LocalizedConstants.msgGetTokenFail;
                    this._vscodeWrapper.showErrorMessage(errorMessage);
                }
                profile.azureAccountToken = token.token;
                profile.email = account.displayInfo.email;
                profile.accountId = account.key.id;
            }
            return profile;
        });
    }
    refreshTokenWrapper(profile, accountStore, accountAnswer, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            let account = accountStore.getAccount(accountAnswer.key.id);
            if (!account) {
                yield this._vscodeWrapper.showErrorMessage(LocalizedConstants.msgAccountNotFound);
                throw new Error(LocalizedConstants.msgAccountNotFound);
            }
            let azureAccountToken = yield this.refreshToken(account, accountStore, settings);
            if (!azureAccountToken) {
                let errorMessage = LocalizedConstants.msgAccountRefreshFailed;
                return this._vscodeWrapper.showErrorMessage(errorMessage, LocalizedConstants.refreshTokenLabel).then((result) => __awaiter(this, void 0, void 0, function* () {
                    if (result === LocalizedConstants.refreshTokenLabel) {
                        let refreshedProfile = yield this.getTokens(profile, accountStore, settings);
                        return refreshedProfile;
                    }
                    else {
                        return undefined;
                    }
                }));
            }
            profile.azureAccountToken = azureAccountToken;
            profile.email = account.displayInfo.email;
            profile.accountId = account.key.id;
            return profile;
        });
    }
    refreshToken(account, accountStore, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let token;
                if (account.properties.azureAuthType === 0) {
                    // Auth Code Grant
                    let azureCodeGrant = yield this.createAuthCodeGrant();
                    let newAccount = yield azureCodeGrant.refreshAccess(account);
                    if (newAccount.isStale === true) {
                        return undefined;
                    }
                    yield accountStore.addAccount(newAccount);
                    token = yield azureCodeGrant.getAccountSecurityToken(account, azureCodeGrant.getHomeTenant(account).id, settings);
                }
                else if (account.properties.azureAuthType === 1) {
                    // Auth Device Code
                    let azureDeviceCode = yield this.createDeviceCode();
                    let newAccount = yield azureDeviceCode.refreshAccess(account);
                    yield accountStore.addAccount(newAccount);
                    if (newAccount.isStale === true) {
                        return undefined;
                    }
                    token = yield azureDeviceCode.getAccountSecurityToken(account, azureDeviceCode.getHomeTenant(account).id, providerSettings_1.default.resources.databaseResource);
                }
                return token.token;
            }
            catch (ex) {
                let errorMsg = this.azureErrorLookup.getSimpleError(ex.errorCode);
                this._vscodeWrapper.showErrorMessage(errorMsg);
            }
        });
    }
    createAuthCodeGrant() {
        return __awaiter(this, void 0, void 0, function* () {
            let azureLogger = new azureLogger_1.AzureLogger();
            yield this.init();
            return new ads_adal_library_1.AzureCodeGrant(providerSettings_1.default, this.storageService, this.cacheService, azureLogger, this.azureMessageDisplayer, this.azureErrorLookup, this.azureUserInteraction, this.azureStringLookup, this.authRequest);
        });
    }
    createDeviceCode() {
        return __awaiter(this, void 0, void 0, function* () {
            let azureLogger = new azureLogger_1.AzureLogger();
            yield this.init();
            return new ads_adal_library_1.AzureDeviceCode(providerSettings_1.default, this.storageService, this.cacheService, azureLogger, this.azureMessageDisplayer, this.azureErrorLookup, this.azureUserInteraction, this.azureStringLookup, this.authRequest);
        });
    }
    removeToken(account) {
        return __awaiter(this, void 0, void 0, function* () {
            let azureAuth = yield this.createAuthCodeGrant();
            yield azureAuth.deleteAccountCache(account.key);
            return;
        });
    }
}
exports.AzureController = AzureController;

//# sourceMappingURL=azureController.js.map
