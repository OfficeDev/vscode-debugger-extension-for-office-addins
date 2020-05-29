import * as assert from "assert";
import * as fs from "fs";
import * as mocha from "mocha";
import * as os from "os";
import * as path from "path";
import * as utils from "./../src/utilities";
import { ISourceMapPathOverrides, utils as chromeUtils } from 'vscode-chrome-debug-core';
import { ChromeDebugSession } from 'vscode-chrome-debug-core';
import { EdgeDebugSession } from './../src/edgeDebugSession';

describe(`Test VS Code Debug for Office Add-ins`, function () {
    describe(`Basic tests for VS Code Debug for Office Add-ins`, function () {
        it("Validate starting Chrome Debug Session does not throw exception", async function () {
            ChromeDebugSession.run(EdgeDebugSession);
            assert.doesNotThrow(() => ChromeDebugSession.run(EdgeDebugSession));
        });
        it("Validate sourceMapOverrides when specifying overrides", async function () {
            const webRoot = process.cwd();
            const overrides = utils.DefaultWebSourceMapPathOverrides;
            const expOverrides: ISourceMapPathOverrides = {
                'webpack:///./~/*': `${webRoot}\\node_modules\\*`,
                'webpack:///./*': `${webRoot}\\*`,
                'webpack:///*': `${webRoot}\\*`,
                'webpack:///src/*': `${webRoot}\\*`,
            };
            const resolvedOverides = utils.getSourceMapPathOverrides(webRoot, overrides);
            assert.deepEqual(resolvedOverides, expOverrides);
        });
        it("Ignores the webRoot pattern when it's not at the beginning of the string", async function () {
            const webRoot = process.cwd();
            const override: ISourceMapPathOverrides = { 'webpack:///./*': '/app/${workspaceFolder}/src' }
            const resolvedWebRoot = utils.resolveWebRootPattern(webRoot, override, false /* warnOnMissing) */);
            assert.deepEqual(resolvedWebRoot, override);
        });
        it("Validate sourceMapOverrides when not specifying overrides", async function () {
            const webRoot = process.cwd();
            const expOverrides: ISourceMapPathOverrides = {
                'webpack:///./~/*': `${webRoot}\\node_modules\\*`,
                'webpack:///./*': `${webRoot}\\*`,
                'webpack:///*': `${webRoot}\\*`,
                'webpack:///src/*': `${webRoot}\\*`,
            };
            const resolvedOverides = utils.getSourceMapPathOverrides(webRoot);
            assert.deepEqual(resolvedOverides, expOverrides);
        });
        it("Validate adpater executable exists", async function () {
            const adapterExePath = utils.getAdapterPath(true /* isTest */);
            assert.equal(fs.existsSync(adapterExePath), true);
        });
        it("Validate supported Windows version", async function () {
            const versionArray: number[] = utils.getOsVersionArray();
            if (chromeUtils.getPlatform() !== chromeUtils.Platform.Windows || versionArray[0] < 10 || versionArray[2] < 18362) {
                assert.equal(utils.isSupportedWindowsVersion(), false);
            } else {
                assert.equal(utils.isSupportedWindowsVersion(), true);
            }
        });
    });
});
