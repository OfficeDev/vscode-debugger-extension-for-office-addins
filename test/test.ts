// import * as assert from "assert";
// import * as mocha from "mocha";
// import * as utils from "./../src/utilities";
// import {ISourceMapPathOverrides} from 'vscode-chrome-debug-core';
// const adapterArgs: Object = {
//     "port": 9222,
//     "trace":"verbose",
//     "url": "https://localhost:3000/taskpane.html?_host_Info=Excel$Win32$16.01$en-US$$$$0",
//     "webRoot": "${workspaceFolder}",
//     "sourceMaps": true,
//     "sourceMapPathOverrides": {
//       "webpack:///./src/*": "${workspaceFolder}/src/*",
//     }
//   }

// describe(`Test VS Code Debug for Office Add-ins`, function () {
//     before(`Setup Edge Debug Adapter`, async function () {
//         this.timeout(0);
//     }),
//     describe(`Test Edge Debug Adapter`, function () {
//         it("Validate sourceMapOverrides when specifying an override", async function () {
//             const sourceMapOverrides: ISourceMapPathOverrides = utils.getSourceMapPathOverrides(adapterArgs["webRoot"], adapterArgs["sourceMapPathOverrides"]);
//             assert.equal(true, sourceMapOverrides !== undefined, "Ensure returned sourceMapOverrides is defined");
//             assert.equal(sourceMapOverrides['webpack:///./src/*'], `${process.cwd()}` + "\\${workspaceFolder}\\src\\*", "Ensure returned  sourceMapOverrides path is correct");
//         });
//         it("Validate sourceMapOverrides when not specifying an override", async function () {
//             const sourceMapOverrides: ISourceMapPathOverrides = utils.getSourceMapPathOverrides(adapterArgs["webRoot"]);
//             assert.equal(true, sourceMapOverrides !== undefined, "Ensure returned sourceMapOverrides is defined");
//             assert.equal(5, Object. keys(sourceMapOverrides).length, "Ensure three default sourceMapOverrides are returned");
//          });
//     });
//     after(`Teardown Edge Debug Adapter`, async function () {
//         this.timeout(0);
//     });
// });