/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import { ChromeDebugAdapter, IChromeDebugSessionOpts, ChromeDebugSession, utils, logger } from 'vscode-chrome-debug-core';
import { EdgeDebugSession } from './edgeDebugSession';
import { DebugProtocol } from 'vscode-debugprotocol';
import  { getAdapterPath, getSourceMapPathOverrides, isSupportedWindowsVersion, usageDataObject} from './utilities';
import * as childProcess from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

export class EdgeDebugAdapter extends ChromeDebugAdapter {
    private _adapterProc: childProcess.ChildProcess;
    private _adapterPort: number;

    private async _launchAdapter(args?: any): Promise<any> {
        let adapterExePath = args.runtimeExecutable;
        if (!adapterExePath) {
            adapterExePath = getAdapterPath();
        }

        logger.log(`Launching adapter at with arguments:', ${JSON.stringify(arguments)})`);

        // Check that debug adpater executable exists
        if (!fs.existsSync(adapterExePath)) {
            if (isSupportedWindowsVersion()) {
                const error: string = "No Edge Diagnostics Adapter was found. Install the Edge Diagnostics Adapter (https://github.com/OfficeDev/debug-adapter-for-office-addins) and specify a valid 'adapterExecutable' path";
                usageDataObject.sendUsageDataException("_launchAdapter", error);
                return utils.errP(error);
            } else {
                const error: string = "Microsoft Office Add-in Debugger is only supported on Windows 10 version 1903 (build 10.0.18362) and greater.";
                usageDataObject.sendUsageDataException("_launchAdapter", error);
                return utils.errP(error);
            }
        }

        // Check that user is running Windows 1903 (build 10.0.18362) or greater to ensure Edge webview is being used
        if (!isSupportedWindowsVersion()) {
            const error: string = `Microsoft Office Add-in Debugger is only supported on Windows 10 version 1903 (build 10.0.18362) and greater.  Currently installed version is ${os.release()}`;
            usageDataObject.sendUsageDataException("_launchAdapter", error);
            return utils.errP(error);
        }

        // Check that user is running a supported version of NodeJs (10 or higher)
        const nodeVersion = parseInt(process.version.slice(1));
        if (nodeVersion < 10) {
            const error: string = `Microsoft Office Add-in Debugger requires NodeJs 10 or higher.  Currently installed version is ${nodeVersion}`;
            usageDataObject.sendUsageDataException("_launchAdapter", error);
            return utils.errP(error);
        }

        let adapterArgs: string[] = [];
        if (!args.port) {
            args.port = 9222;
        }
        // We always tell the adpater what port to listen on so there's no shared info between the adapter and the extension
        let portCmdArg = '--port=' + args.port;
        this._adapterPort = args.port;
        adapterArgs.push(portCmdArg);

        // Resolve sourceMapOverrides
        args.sourceMapPathOverrides = getSourceMapPathOverrides(args.webRoot, args.sourceMapPathOverrides);

        if (args.url) {
            let launchUrlArg = '--launch=' + args.url;
            adapterArgs.push(launchUrlArg);
        }

        // The adapter might already be running if so don't spawn a new one
        try {
            // Ping adapter service to check if is started. If it isn't the ping will throw
            // an error and then we will start it by calling startEdgeAdapter
            const jsonResponse = await utils.getURL(`http://127.0.0.1:${args.port}/json/version`);
            const responseArray = JSON.parse(jsonResponse);
            let targetBrowser: string = responseArray.Browser;
            targetBrowser = targetBrowser.toLocaleLowerCase();
            if (targetBrowser.indexOf('edge') === -1) {
                const error: string = `Server for ${targetBrowser} already listening on ${this._adapterPort}`;
                return utils.errP(error);
            }
            usageDataObject.sendUsageDataSuccessEvent("_launchAdapter");
            return Promise.resolve(args);
        } catch {
            // Adapter isn't running so start it
            await this.startEdgeAdapater(args);
        }
    }

    private async startEdgeAdapater(args): Promise<any> {
        const adapterPath = path.resolve(__dirname, '../../node_modules/debug-adapter-for-office-addins');
        const adpaterFile = path.join(adapterPath, "out/src/edgeAdapter.js");
        const adapterLaunch: string = `node ${adpaterFile}  --servetools --diagnostics`;
        logger.log(`spawn('${adapterLaunch}')`);
        this._adapterProc = childProcess.spawn(adapterLaunch, [], {
            detached: false,
            shell: true,
            stdio: "pipe",
            windowsHide: true
        });

        this._adapterProc.stderr.on("error", (err) => {
            logger.error(`Adapter error: ${err}`);
            this.terminateSession(`${err}`);
        });

        this._adapterProc.stdout.on("data", (data) => {
            logger.log(`Adapter output: ${data}`);
        });

        if (this._adapterProc === undefined) {
            const error: string = "Unable to start Edge Debug Adapter";
            usageDataObject.sendUsageDataException("_launchAdapter", error);
            return utils.errP(error);
        }
        usageDataObject.sendUsageDataSuccessEvent("_launchAdapter");
        return Promise.resolve(args);
    }

    public constructor(opts?: IChromeDebugSessionOpts, debugSession?: ChromeDebugSession) {
        if (debugSession == null) {
            debugSession = new EdgeDebugSession(false);
        }
        super(opts, debugSession);
    }

    public launch(args: any): Promise<void> {
        logger.log(`Launching Edge`);

        return this._launchAdapter(args).then(() => {
            return super.attach(args);
        });
    }

    public attach(args: any): Promise<void> {
        logger.log(`Attaching to Edge`);

        return this._launchAdapter(args).then(() => {
            return super.attach(args);
        });
    }

    public disconnect(args: DebugProtocol.DisconnectArguments): Promise<void> {
        if (this._chromeConnection.attachedTarget !== undefined) {
            const closeDebuggerInstanceUrl: string = `http://127.0.0.1:${this._adapterPort}/json/close/${this._chromeConnection.attachedTarget.id}`;
            // Call adpater service to close debugger instance
            return utils.getURL(closeDebuggerInstanceUrl).then(() => {
                // Do additional clean-up
                this.clearEverything();
                super.disconnect(args);
            });
        }
    }

    public clearEverything(): void {
        if (this._adapterProc) {
            this._adapterProc.kill('SIGINT');
            this._adapterProc = null;
        }
        super.clearTargetContext();
    }
}

