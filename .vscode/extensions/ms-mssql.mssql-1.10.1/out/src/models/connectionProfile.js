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
exports.ConnectionProfile = void 0;
const LocalizedConstants = require("../constants/localizedConstants");
const interfaces_1 = require("./interfaces");
const connectionCredentials_1 = require("./connectionCredentials");
const question_1 = require("../prompts/question");
const utils = require("./utils");
const ads_adal_library_1 = require("ads-adal-library");
const azureController_1 = require("../azure/azureController");
const providerSettings_1 = require("../azure/providerSettings");
// Concrete implementation of the IConnectionProfile interface
/**
 * A concrete implementation of an IConnectionProfile with support for profile creation and validation
 */
class ConnectionProfile extends connectionCredentials_1.ConnectionCredentials {
    /**
     * Creates a new profile by prompting the user for information.
     * @param  {IPrompter} prompter that asks user the questions needed to complete a profile
     * @param  {IConnectionProfile} (optional) default profile values that will be prefilled for questions, if any
     * @returns Promise - resolves to undefined if profile creation was not completed, or IConnectionProfile if completed
     */
    static createProfile(prompter, connectionStore, context, accountStore, defaultProfileValues) {
        return __awaiter(this, void 0, void 0, function* () {
            let profile = new ConnectionProfile();
            // Ensure all core properties are entered
            let authOptions = connectionCredentials_1.ConnectionCredentials.getAuthenticationTypesChoice();
            if (authOptions.length === 1) {
                // Set default value as there is only 1 option
                profile.authenticationType = authOptions[0].value;
            }
            let azureController = new azureController_1.AzureController(context);
            let azureAuthChoices = ConnectionProfile.getAzureAuthChoices();
            let azureAccountChoices = ConnectionProfile.getAccountChoices(accountStore);
            let accountAnswer;
            azureAccountChoices.unshift({ name: LocalizedConstants.azureAddAccount, value: 'addAccount' });
            let questions = yield connectionCredentials_1.ConnectionCredentials.getRequiredCredentialValuesQuestions(profile, true, false, connectionStore, defaultProfileValues);
            // Check if password needs to be saved
            questions.push({
                type: question_1.QuestionTypes.confirm,
                name: LocalizedConstants.msgSavePassword,
                message: LocalizedConstants.msgSavePassword,
                shouldPrompt: (answers) => !profile.connectionString && connectionCredentials_1.ConnectionCredentials.isPasswordBasedCredential(profile),
                onAnswered: (value) => profile.savePassword = value
            }, {
                type: question_1.QuestionTypes.expand,
                name: LocalizedConstants.aad,
                message: LocalizedConstants.azureChooseAccount,
                choices: azureAccountChoices,
                shouldPrompt: (answers) => profile.isAzureActiveDirectory(),
                onAnswered: (value) => accountAnswer = value
            }, {
                type: question_1.QuestionTypes.input,
                name: LocalizedConstants.profileNamePrompt,
                message: LocalizedConstants.profileNamePrompt,
                placeHolder: LocalizedConstants.profileNamePlaceholder,
                default: defaultProfileValues ? defaultProfileValues.profileName : undefined,
                onAnswered: (value) => {
                    // Fall back to a default name if none specified
                    profile.profileName = value ? value : undefined;
                }
            });
            return prompter.prompt(questions, true).then((answers) => __awaiter(this, void 0, void 0, function* () {
                if (answers.authenticationType === 'AzureMFA') {
                    if (answers.AAD === 'addAccount') {
                        profile = yield azureController.getTokens(profile, accountStore, providerSettings_1.default.resources.databaseResource);
                    }
                    else {
                        try {
                            profile = yield azureController.refreshTokenWrapper(profile, accountStore, accountAnswer, providerSettings_1.default.resources.databaseResource);
                        }
                        catch (error) {
                            console.log(`Refreshing tokens failed: ${error}`);
                        }
                    }
                }
                if (answers && profile.isValidProfile()) {
                    return profile;
                }
                // returning undefined to indicate failure to create the profile
                return undefined;
            }));
        });
    }
    // Assumption: having connection string or server + profile name indicates all requirements were met
    isValidProfile() {
        if (this.connectionString) {
            return true;
        }
        if (this.authenticationType) {
            if (this.authenticationType === interfaces_1.AuthenticationTypes[interfaces_1.AuthenticationTypes.Integrated] ||
                this.authenticationType === interfaces_1.AuthenticationTypes[interfaces_1.AuthenticationTypes.AzureMFA]) {
                return utils.isNotEmpty(this.server);
            }
            else {
                return utils.isNotEmpty(this.server)
                    && utils.isNotEmpty(this.user);
            }
        }
        return false;
    }
    isAzureActiveDirectory() {
        return this.authenticationType === interfaces_1.AuthenticationTypes[interfaces_1.AuthenticationTypes.AzureMFA];
    }
    static getAzureAuthChoices() {
        let choices = [
            { name: LocalizedConstants.azureAuthTypeCodeGrant, value: utils.azureAuthTypeToString(ads_adal_library_1.AzureAuthType.AuthCodeGrant) },
            { name: LocalizedConstants.azureAuthTypeDeviceCode, value: utils.azureAuthTypeToString(ads_adal_library_1.AzureAuthType.DeviceCode) }
        ];
        return choices;
    }
    static getAccountChoices(accountStore) {
        var _a;
        let accounts = accountStore.getAccounts();
        let choices = [];
        if (accounts.length > 0) {
            for (let account of accounts) {
                choices.push({ name: (_a = account === null || account === void 0 ? void 0 : account.displayInfo) === null || _a === void 0 ? void 0 : _a.displayName, value: account });
            }
        }
        return choices;
    }
}
exports.ConnectionProfile = ConnectionProfile;

//# sourceMappingURL=connectionProfile.js.map
