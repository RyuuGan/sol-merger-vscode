// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import vscode from 'vscode';
import { mergeContracts } from './commands/merge';
import { contextCompileFile } from './commands/contextCompileFile';
import { solScheme } from './config';
import { solProvider } from './providers/solProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate({ subscriptions }: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "Sol merger" is now active!');
  subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(solScheme, solProvider));

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  subscriptions.push(
    vscode.commands.registerCommand('extension.sol-merger.merge', () => {
      // The code you place here will be executed every time your command is executed
      mergeContracts().then(() => {
        vscode.window.showInformationMessage('Merging is compete');
      });
    }),
  );

  subscriptions.push(
    vscode.commands.registerCommand('extension.sol-merger.compileFile', () => {
      contextCompileFile();
    }),
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
