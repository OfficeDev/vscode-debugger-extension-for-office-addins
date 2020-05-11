# VS Code Debugger for Office Add-ins

The Visual Studio Debugger Extension for Office Add-ins allows you to use F5 in VS Code to debug your Office Add-in. This debugging mode is dynamic, allowing you to set breakpoints while code is running. You can see changes in your code immediately while the debugger is attached, all without losing your debugging session. Your code changes also persist, so you can see the results of multiple changes to your code.

## Pre-Requisites

- [Visual Studio Code](https://code.visualstudio.com/) run as an administrator
- [Node.js, version 10+](https://nodejs.org/)
- Windows 10 and Edge
- Familiarity creating projects with the yo office generator. If you have not done this before, you can learn how to install yeoman and use it for add-ins projects in [this Github repository](https://github.com/OfficeDev/generator-office).

## Install and use

1. Within VS Code, select **CTRL + SHIFT + X** to open the Extensions bar. Search for the VS Code Debugger for Office Add-ins extension and install it.

2. Create a new project with yo office, like [this Excel Office Add-in](https://docs.microsoft.com/office/dev/add-ins/quickstarts/excel-quickstart-jquery?tabs=yeomangenerator). Follow the prompts within the command line to set up your project. You can choose any language or type of project to suit your needs.

3. Open your project in Visual Studio Code.

4. In the .vscode folder of your project, you will find a launch.json file. At the end of the file, add the following code to the configurations section of the file.

```json
	    {
	      "type": "office-addin",
	      "request": "attach",
	      "name": "Attach to Office Add-ins",
	      "port": 9222,
	      "trace": "verbose",
	      "url": "https://localhost:3000/taskpane.html?_host_Info=HOST$Win32$16.01$en-US$$$$0",
	      "webRoot": "${workspaceFolder}",
	      "timeout": 45000     
    }
```

5. In the section of JSON you just copied in, there is a "url" section. In this URL, you will need to replace the uppercase HOST text with the host application of your Office add-in. For example, if your Office add-in is for Excel, your URL value would be "https://localhost:3000/taskpane.html?_host_Info=Excel$Win32$16.01$en-US$$$$0".

6. Within the root folder of your project, run `npm start` within the command line to start the dev server. When you add-in starts up, open the task pane.

7. Return to Visual Studio Code and choose **View > Debug** or enter **Ctrl+Shift+D** to switch to debug view.

8. From the Debug options, choose **Attach to Office Add-ins**. Select **F5** or choose **Debug -> Start Debugging** from the menu to begin debugging.

9. Set a breakpoint in your project's task pane file. You can set breakpoints in VS Code by hovering next to a line of code and selecting the red circle which appears.

10. In your add-in, you will see that breakpoints have been hit.

## Questions and comments
We'd love to get your feedback about this sample. You can send your feedback to us in the Issues section of this repository.

## Open Source Code of Conduct
This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information, see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Copyright

Copyright (c) 2017 Microsoft Corporation. All rights reserved.