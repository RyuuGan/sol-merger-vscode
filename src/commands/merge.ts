import vscode from 'vscode';
import fs from 'fs-extra';
import { getSettings } from '../utils/settings';
import { getFileList } from '../utils/files';
import { compileSolFile, saveFile } from '../utils/compilers';

const ERROR_MESSAGES = {
  GO_TO_FILE: 'Go to file',
}

export async function mergeContracts(): Promise<void> {
  const promises =
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.map(processWorkspace);

  if (!promises) {
    return;
  }
  await Promise.all(promises);
}

async function processWorkspace(workspace: vscode.WorkspaceFolder) {
  const settings = getSettings(workspace);
  const files = await getFileList(settings);

  if (settings.cleanDist === true) {
    await fs.remove(settings.outputDir);
  }

  const promises = files.map(async file => {
    try {
      const content = await compileSolFile(file, settings);
      await saveFile(file, content, settings);
    } catch (e) {
      console.error(file, e);
      vscode.window.showErrorMessage(e.message, ERROR_MESSAGES.GO_TO_FILE).then((message) => {
        if (message === ERROR_MESSAGES.GO_TO_FILE) {
          vscode.workspace.openTextDocument(file).then(doc => {
            vscode.window.showTextDocument(doc);
          });
        }
      });
    }
  });

  return Promise.all(promises);
}
