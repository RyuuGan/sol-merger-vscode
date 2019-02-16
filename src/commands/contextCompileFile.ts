import vscode from 'vscode';
import path from 'path';
import { getSettings } from '../utils/settings';
import { compileSolFile } from '../utils/compilers';

export async function contextCompileFile(): Promise<void> {
  if (!vscode.window.activeTextEditor) {
    vscode.window.showWarningMessage('Open solidity file to execute this command.');
    return;
  }
  const fileUri = vscode.window.activeTextEditor.document.uri;
  const settings = getSettings(vscode.workspace.getWorkspaceFolder(fileUri));
  try {
    const content = await compileSolFile(fileUri.fsPath, settings);
    const extName = path.extname(fileUri.fsPath);
    const fileName = path.basename(fileUri.fsPath, extName);
    const compiledName = fileName + settings.append + extName;

    const uri = vscode.Uri.parse(`sol:${compiledName}?${content}`);
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc, { preview: false });
  } catch(e) {
    console.error(fileUri.fsPath, e);
    vscode.window.showErrorMessage(e.message);
  }
}
