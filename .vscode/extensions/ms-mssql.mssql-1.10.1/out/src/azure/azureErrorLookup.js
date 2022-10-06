"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureErrorLookup = void 0;
const ads_adal_library_1 = require("ads-adal-library");
const simpleErrorMapping = {
    [ads_adal_library_1.ErrorCodes.AuthError]: 'Something failed with the authentication, or your tokens have been deleted from the system. Please try adding your account to vscode-mssql again',
    [ads_adal_library_1.ErrorCodes.TokenRetrieval]: 'Token retrieval failed with an error. Open developer tools to view the error',
    [ads_adal_library_1.ErrorCodes.NoAccessTokenReturned]: 'No access token returned from Microsoft OAuth',
    [ads_adal_library_1.ErrorCodes.UniqueIdentifier]: 'The user had no unique identifier within AAD',
    [ads_adal_library_1.ErrorCodes.Tenant]: 'Error retrieving tenant information',
    [ads_adal_library_1.ErrorCodes.GetAccount]: 'Error when getting your account from the cache',
    [ads_adal_library_1.ErrorCodes.ParseAccount]: 'Error when parsing your account from the cache',
    [ads_adal_library_1.ErrorCodes.AddAccount]: 'Error when adding your account to the cache',
    [ads_adal_library_1.ErrorCodes.GetAccessTokenAuthCodeGrant]: 'Error when getting access token from authorization token for AuthCodeGrant',
    [ads_adal_library_1.ErrorCodes.GetAccessTokenDeviceCodeLogin]: 'Error when getting access token for DeviceCodeLogin',
    [ads_adal_library_1.ErrorCodes.TimedOutDeviceCode]: 'Timed out when waiting for device code login results',
    [ads_adal_library_1.ErrorCodes.ServerStartFailure]: 'Server could not start. This could be a permissions error or an incompatibility on your system. You can try enabling device code authentication from settings.',
    [ads_adal_library_1.ErrorCodes.UserKey]: '"User key was undefined - could not create a userKey from the tokenClaims"'
};
class AzureErrorLookup {
    getSimpleError(errorCode) {
        return simpleErrorMapping[errorCode];
    }
    getTenantNotFoundError(context) {
        return;
    }
}
exports.AzureErrorLookup = AzureErrorLookup;

//# sourceMappingURL=azureErrorLookup.js.map
