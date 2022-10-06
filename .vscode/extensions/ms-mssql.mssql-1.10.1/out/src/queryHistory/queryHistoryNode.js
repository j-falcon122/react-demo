"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryHistoryNode = exports.EmptyHistoryNode = void 0;
const vscode = require("vscode");
const path = require("path");
const LocalizedConstants = require("../constants/localizedConstants");
/**
 * Empty Node shown when no queries are available
 */
class EmptyHistoryNode extends vscode.TreeItem {
    constructor() {
        super(LocalizedConstants.msgNoQueriesAvailable, vscode.TreeItemCollapsibleState.None);
        this.contextValue = EmptyHistoryNode.contextValue;
    }
}
exports.EmptyHistoryNode = EmptyHistoryNode;
EmptyHistoryNode.contextValue = 'emptyHistoryNode';
/**
 * Query history node
 */
class QueryHistoryNode extends vscode.TreeItem {
    constructor(label, tooltip, queryString, ownerUri, timeStamp, connectionLabel, isSuccess) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.iconsPath = path.join(__dirname, 'icons');
        this.successIcon = path.join(this.iconsPath, 'status_success.svg');
        this.failureIcon = path.join(this.iconsPath, 'status_error.svg');
        this._queryString = queryString;
        this._ownerUri = ownerUri;
        this._timeStamp = timeStamp;
        this._isSuccess = isSuccess;
        this._connectionLabel = connectionLabel;
        this.iconPath = this._isSuccess ? this.successIcon : this.failureIcon;
        this.tooltip = tooltip;
        this.contextValue = QueryHistoryNode.contextValue;
    }
    /** Getters */
    get historyNodeLabel() {
        const label = typeof this.label === 'string' ? this.label : this.label.label;
        return label;
    }
    get ownerUri() {
        return this._ownerUri;
    }
    get timeStamp() {
        return this._timeStamp;
    }
    get queryString() {
        return this._queryString;
    }
    get connectionLabel() {
        return this._connectionLabel;
    }
}
exports.QueryHistoryNode = QueryHistoryNode;
QueryHistoryNode.contextValue = 'queryHistoryNode';

//# sourceMappingURL=queryHistoryNode.js.map
