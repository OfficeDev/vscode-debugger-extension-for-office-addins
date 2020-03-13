/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import { ChromeDebugAdapter, ISourceMapPathOverrides, IChromeDebugSessionOpts, ChromeDebugSession, utils, logger } from 'vscode-chrome-debug-core';
import { EdgeDebugSession } from './edgeDebugSession';
import * as edgeUtils from './utilities';
import * as childProcess from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const DefaultWebSourceMapPathOverrides: ISourceMapPathOverrides = {
    'webpack:///./~/*': '${webRoot}/node_modules/*',
    'webpack:///./*': '${webRoot}/*',
    'webpack:///*': '*',
    'webpack:///src/*': '${webRoot}/*',
    'meteor://app/*': '${webRoot}/*'
};

export class EdgeDebugAdapter extends ChromeDebugAdapter {
    private _adapterProc: childProcess.ChildProcess;

    private _launchAdapter(args?: any): Promise<any> {
        let adapterExePath = args.runtimeExecutable;
        if (!adapterExePath) {
            adapterExePath = edgeUtils.getAdapterPath();
        }

        logger.log(`Launching adapter at with arguments:', ${JSON.stringify(arguments)})`);
        // Check exists
        if (!fs.existsSync(adapterExePath)) {
            if (utils.getPlatform() == utils.Platform.Windows) {
                return utils.errP(`No Edge Diagnostics Adapter was found. Install the Edge Diagnostics Adapter (https://github.com/Microsoft/edge-diagnostics-adapter) and specify a valid 'adapterExecutable' path`);
            } else {
                return utils.errP(`Edge debugging is only supported on Windows 10.`);
            }
        }

        let adapterArgs: string[] = [];
        if (!args.port) {
            args.port = 9222;
        }
        // We always tell the adpater what port to listen on so there's no shared info between the adapter and the extension
        let portCmdArg = '--port=' + args.port;
        adapterArgs.push(portCmdArg);

        args.sourceMapPathOverrides = this.getSourceMapPathOverrides(args.webRoot, args.sourceMapPathOverrides);

        if (args.url) {
            let launchUrlArg = '--launch=' + args.url;
            adapterArgs.push(launchUrlArg);
        }

        // The adapter might already be running if so don't spawn a new one
        return utils.getURL(`http://127.0.0.1:${args.port}/json/version`).then((jsonResponse: any) => {
            try {
                const responseArray = JSON.parse(jsonResponse);
                let targetBrowser: string = responseArray.Browser;
                targetBrowser = targetBrowser.toLocaleLowerCase();
                if (targetBrowser.indexOf('edge') > -1) {
                    return Promise.resolve(args);
                }

                return utils.errP(`Sever for ${targetBrowser} already listening on :9222`);
            } catch (ex) {
                return utils.errP(`Sever already listening on :9222 returned ${ex}`);
            }

        }, error => {
            const adapterPath = path.resolve(__dirname, '../../node_modules/edge-diagnostics-adapter');
            const adpaterFile = path.join(adapterPath, "out/src/edgeAdapter.js");
            const adapterLaunch: string = `node ${adpaterFile}  --servetools --diagnostics`;
            logger.log(`spawn('${adapterLaunch}')`);
            this._adapterProc = childProcess.spawn(adapterLaunch, [], {
                detached: false,
                shell: true,
                stdio: "ignore",
                windowsHide: true
            });

            this._adapterProc.on("error", (err) => {
                logger.error(`Adapter error: ${err}`);
                this.terminateSession(`${err}`);
            });

            this._adapterProc.on("data", (data) => {
                logger.log(`Adapter output: ${data}`)
            });

            return Promise.resolve(args);
        });
    }

    public constructor(opts?: IChromeDebugSessionOpts, debugSession?: ChromeDebugSession) {
        if (debugSession == null) {
            debugSession = new EdgeDebugSession(false);
        }
        super(opts, debugSession);
    }

    public launch(args: any): Promise<void> {
        logger.log(`Launching Edge`);

        let launchUrl: string;
        if (args.file) {
            launchUrl = 'file:///' + path.resolve(args.cwd, args.file);
        } else if (args.url) {
            launchUrl = args.url;
        }

        return this._launchAdapter(args).then((attachArgs: any) => {
            return super.attach(attachArgs);
        });
    }

    public attach(args: any): Promise<void> {
        logger.log(`Attaching to Edge`);

        return this._launchAdapter(args).then((attachArgs: any) => {
            return super.attach(attachArgs);
        });
    }

    public clearEverything(): void {
        if (this._adapterProc) {
            this._adapterProc.kill('SIGINT');
            this._adapterProc = null;
        }

        super.clearTargetContext();
    }

    private getSourceMapPathOverrides(webRoot: string, sourceMapPathOverrides?: ISourceMapPathOverrides): ISourceMapPathOverrides {
        return sourceMapPathOverrides ? this.resolveWebRootPattern(webRoot, sourceMapPathOverrides, /*warnOnMissing=*/true) :
            this.resolveWebRootPattern(webRoot, DefaultWebSourceMapPathOverrides, /*warnOnMissing=*/false);
    }

    /**
     * Returns a copy of sourceMapPathOverrides with the ${webRoot} pattern resolved in all entries.
     *
     * dynamically required by test
     */
    private resolveWebRootPattern(webRoot: string, sourceMapPathOverrides: ISourceMapPathOverrides, warnOnMissing: boolean): ISourceMapPathOverrides {
        const resolvedOverrides: ISourceMapPathOverrides = {};
        for (let [key, value] of Object.entries(sourceMapPathOverrides)) {
            const replacePatternValue = this.replaceWebRootInSourceMapPathOverridesEntry(webRoot, value, warnOnMissing);
            resolvedOverrides[key] = path.resolve(replacePatternValue);
        }

        return resolvedOverrides;
    }

    private replaceWebRootInSourceMapPathOverridesEntry(webRoot: string, entry: string, warnOnMissing: boolean): string {
        const webRootIndex = entry.indexOf('${webRoot}');
        if (webRootIndex === 0) {
            if (webRoot) {
                return entry.replace('${webRoot}', webRoot);
            } else if (warnOnMissing) {
                logger.log('Warning: sourceMapPathOverrides entry contains ${webRoot}, but webRoot is not set');
            }
        } else if (webRootIndex > 0) {
            logger.log('Warning: in a sourceMapPathOverrides entry, ${webRoot} is only valid at the beginning of the path');
        }

        return entry;
    }
}

