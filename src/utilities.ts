/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import {ISourceMapPathOverrides, logger, utils} from 'vscode-chrome-debug-core';
import * as path from 'path';

export const DefaultWebSourceMapPathOverrides: ISourceMapPathOverrides = {
    'webpack:///./~/*': '${workspaceFolder}/node_modules/*',
    'webpack:///./*': '${workspaceFolder}/*',
    'webpack:///*': '${workspaceFolder}/*',
    'webpack:///src/*': '${workspaceFolder}/*'
};

const EDGE_ADAPTER_PATH = {
    OSX: '',
    WINx64: path.resolve(__dirname, '../../node_modules/debug-adapter-for-office-addins/out/lib/Networkproxy.exe'),
    WINx64Test: path.resolve(__dirname, `${path.resolve(process.cwd())}/node_modules/debug-adapter-for-office-addins/out/lib/Networkproxy.exe`),
    LINUX: ''
};

export function getAdapterPath(isTest: boolean = false): string {
    const platform = utils.getPlatform();
    // There is no good way to get the system arch so detecting the program files dir
    let arch;
    if(process.env.hasOwnProperty('ProgramFiles(x86)')){
        arch = 'x64';
    } else {
        arch = 'x86';
    }
    if (platform === utils.Platform.Windows) {
        if(arch === 'x64'){
            if (isTest) {
                return EDGE_ADAPTER_PATH.WINx64Test
            } else
            {
                return EDGE_ADAPTER_PATH.WINx64;
            }
        } else if(arch === 'x86'){
            return null;
        }
    }
    return null;
}

export function getSourceMapPathOverrides(webRoot: string, sourceMapPathOverrides?: ISourceMapPathOverrides): ISourceMapPathOverrides {
    return sourceMapPathOverrides ? this.resolveWebRootPattern(webRoot, sourceMapPathOverrides, /*warnOnMissing=*/true) :
        this.resolveWebRootPattern(webRoot, DefaultWebSourceMapPathOverrides, /*warnOnMissing=*/false);
}

export function resolveWebRootPattern(webRoot: string, sourceMapPathOverrides: ISourceMapPathOverrides, warnOnMissing: boolean): ISourceMapPathOverrides {
    const resolvedOverrides: ISourceMapPathOverrides = {};
    for (let [key, value] of Object.entries(sourceMapPathOverrides)) {
        const replacePatternValue = this.replaceWebRootInSourceMapPathOverridesEntry(webRoot, value, warnOnMissing);
        if (replacePatternValue !== value) {
            resolvedOverrides[key] = path.resolve(replacePatternValue);
        } else {
            resolvedOverrides[key] = replacePatternValue;
        }
    }

    return resolvedOverrides;
}

export function replaceWebRootInSourceMapPathOverridesEntry(webRoot: string, entry: string, warnOnMissing: boolean): string {
    const webRootIndex = entry.indexOf('${workspaceFolder}');
    if (webRootIndex === 0) {
        if (webRoot) {
            return entry.replace('${workspaceFolder}', webRoot);
        } else if (warnOnMissing) {
            logger.log('Warning: sourceMapPathOverrides entry contains ${workspaceFolder}, but webRoot is not set');
        }
    } else if (webRootIndex > 0) {
        logger.log('Warning: in a sourceMapPathOverrides entry, ${workspaceFolder} is only valid at the beginning of the path');
    }

    return entry;
}