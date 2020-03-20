/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import {ChromeDebugSession, IChromeDebugSessionOpts} from 'vscode-chrome-debug-core';
import {EdgeDebugAdapter} from './edgeDebugAdapter';

export class EdgeDebugSession extends ChromeDebugSession {

    public constructor(targetLinesStartAt1: boolean, isServer: boolean = false) {
        super(targetLinesStartAt1, isServer, {adapter: EdgeDebugAdapter, extensionName: "vscode-edge-debug"});
    }
}

