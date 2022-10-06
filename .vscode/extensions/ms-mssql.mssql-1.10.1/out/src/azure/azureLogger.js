"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureLogger = void 0;
class AzureLogger {
    log(msg, ...vals) {
        const fullMessage = `${msg} - ${vals.map(v => JSON.stringify(v)).join(' - ')}`;
        console.log(fullMessage);
    }
    error(msg, ...vals) {
        const fullMessage = `${msg} - ${vals.map(v => JSON.stringify(v)).join(' - ')}`;
        console.error(fullMessage);
    }
    pii(msg, ...vals) {
        const fullMessage = `${msg} - ${vals.map(v => JSON.stringify(v)).join(' - ')}`;
        console.log(fullMessage);
    }
}
exports.AzureLogger = AzureLogger;

//# sourceMappingURL=azureLogger.js.map
