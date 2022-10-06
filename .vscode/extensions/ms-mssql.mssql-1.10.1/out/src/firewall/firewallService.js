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
exports.FirewallService = void 0;
const firewallRequest_1 = require("../models/contracts/firewall/firewallRequest");
const Constants = require("../constants/constants");
class FirewallService {
    constructor(accountService) {
        this.accountService = accountService;
    }
    asCreateFirewallRuleParams(serverName, startIpAddress, endIpAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            let params = {
                account: this.accountService.account,
                serverName: serverName,
                startIpAddress: startIpAddress,
                endIpAddress: endIpAddress ? endIpAddress : startIpAddress,
                securityTokenMappings: yield this.accountService.createSecurityTokenMapping()
            };
            return params;
        });
    }
    createFirewallRule(serverName, startIpAddress, endIpAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            let params = yield this.asCreateFirewallRuleParams(serverName, startIpAddress, endIpAddress);
            let result = yield this.accountService.client.sendResourceRequest(firewallRequest_1.CreateFirewallRuleRequest.type, params);
            return result;
        });
    }
    handleFirewallRule(errorCode, errorMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            let params = { errorCode: errorCode, errorMessage: errorMessage, connectionTypeId: Constants.mssqlProviderName };
            let result = yield this.accountService.client.sendResourceRequest(firewallRequest_1.HandleFirewallRuleRequest.type, params);
            return result;
        });
    }
}
exports.FirewallService = FirewallService;

//# sourceMappingURL=firewallService.js.map
