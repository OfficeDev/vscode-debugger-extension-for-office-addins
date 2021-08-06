# Microsoft Office Add-in Debugger for Visual Studio Code

The "Microsoft Office Add-in Debugger" Extension for Visual Studio Code allows you to use F5 to debug your Office Add-in against the Edge runtime.

This debugging mode is dynamic, allowing you to set breakpoints while code is running. You can see changes in your code immediately while the debugger is attached, all without losing your debugging session. Your code changes also persist, so you can see the results of multiple changes to your code. The following image shows this extension in action.

![Microsoft Office Add-in Debugger Extension debugging Excel Add-in code](https://github.com/OfficeDev/vscode-debugger-extension-for-office-addins/blob/master/images/OfficeAddinDebugger.png?raw=true)

## Prerequisites

- [Visual Studio Code](https://code.visualstudio.com/) (must be run as an administrator)
- [Node.js (version 10+)](https://nodejs.org/)
- Windows 10
- [Microsoft Edge (Not Chromium)](https://support.microsoft.com/en-us/microsoft-edge-legacy)
- [Yo Office](https://github.com/OfficeDev/generator-office), if you need to create a new project

These instructions assume you have experience using the command line, understand basic JavaScript, and have created an Office add-in project before using the Yo OfficeDev/ generator-office).

## Install and use

1. If you do not already have a project to work with, [create a new project with the latest version of Yo Office](https://docs.microsoft.com/office/dev/add-ins/quickstarts/excel-quickstart-jquery?tabs=yeomangenerator). If you already have a project you would like to use, there is no need to create a new one.

2. Open a command prompt as administrator
![Command prompt options, including "run as administrator" in Windows 10](https://github.com/OfficeDev/vscode-debugger-extension-for-office-addins/blob/master/images/CommandPromptAdmin.png?raw=true)

> To open Visual Studio Code as an administrator, select the **run as administrator** option when opening Visual Studio Code after searching for it in Windows.

3. Navigate to your project directory.

4. Run the following command to open your project in Visual Studio Code as an administrator
	```command&nbsp;line
	code .
	```
    Once Visual Studio Code is open, navigate manually to the project folder.

	> To open Visual Studio Code as an administrator, select the **run as administrator** option when opening Visual Studio Code after searching for it in Windows.

5. Within VS Code, select **CTRL + SHIFT + X** to open the Extensions bar. Search for the "Office Addin Debugger" extension and install it.

6. In the .vscode folder of your project, you will find a launch.json file. At the end of the file, add the following code to the configurations section of the file.

```JSON
	    {
	      "name": "Attach to Office Add-ins (Edge Legacy)",
	      "type": "office-addin",
	      "request": "attach",
	      "url": "https://localhost:3000/taskpane.html?_host_Info=HOST$Win32$16.01$en-US$$$$0",
	      "port": 9222,
	      "timeout": 45000,
	      "webRoot": "${workspaceFolder}",
	      "trace": "verbose",
	    },
	    {
	      "name": "Attach to Office Add-in (Edge Chromium)",
	      "type": "edge",
	      "request": "attach",
	      "useWebView": "advanced",
	      "port": 9229,
	      "timeout": 600000,
	      "webRoot": "${workspaceRoot}",
	      "trace": "verbose"
	    }
```

7. In the section of JSON you just copied, find the "url" section. In this URL, you will need to replace the uppercase HOST text with the host application for your Office add-in. For example, if your Office add-in is for Excel, your URL value would be "https://localhost:3000/taskpane.html?_host_Info=<strong>Excel</strong>$Win32$16.01$en-US$$$$0".

8. Open the command prompt and ensure you are at the root folder of your project. Run the command `npm start` to start the dev server. When your add-in loads in the Office host application, open the task pane.

9. Return to Visual Studio Code and choose **View > Debug** or enter **CTRL + SHIFT + D** to switch to debug view.

10. From the Debug options, choose **Attach to Office Add-ins (Edge Chromium)** or **Attach to Office Add-ins (Edge Legacy)** depending on which Edge version you have. Select **F5** or choose **Debug -> Start Debugging** from the menu to begin debugging.

11. Set a breakpoint in your project's task pane file. You can set breakpoints in VS Code by hovering next to a line of code and selecting the red circle which appears.

![A red circle appears on a line of code in VS Code](https://github.com/OfficeDev/vscode-debugger-extension-for-office-addins/blob/master/images/breakpoint.png?raw=true)

12. Run your add-in. You will see that breakpoints have been hit and you can inspect local variables.

## Questions and comments
We'd love to get your feedback about this sample! You can send your feedback to us in the Issues section of this repository.

## Open Source Code of Conduct
This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information, see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Copyright

Copyright (c) 2020 Microsoft Corporation. All rights reserved.
