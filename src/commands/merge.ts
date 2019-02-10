import vscode from 'vscode';
import path from 'path';
import Merger from 'sol-merger/lib/Merger';
import fs from 'fs-extra';
import { getSettings, getFileList } from '../utils';

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

  const promises = files.map(file => {
    return new Promise(async (resolve, reject) => {
      const merger = new Merger({ delimeter: settings.delimeter });
      let result: string;
      try {
        result = await merger.processFile(file, true);
      } catch (e) {
        reject(e);
      }
      let outputFile: string;
      if (settings.outputDir) {
        outputFile = path.join(settings.outputDir, path.basename(file));
      } else {
        let extname = path.extname(file);
        outputFile = path.join(
          path.dirname(file),
          path.basename(file, extname) + settings.append + extname,
        );
      }
      console.log(`${file} -> ${outputFile}`);
      fs.outputFile(outputFile, result, { encoding: 'utf-8' }, err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    }).catch((e: Error) => {
      console.error(file, e);
      vscode.window.showErrorMessage(e.message, ERROR_MESSAGES.GO_TO_FILE).then((message) => {
        if (message === ERROR_MESSAGES.GO_TO_FILE) {
          vscode.workspace.openTextDocument(file).then(doc => {
            vscode.window.showTextDocument(doc);
         });
        }
      });
    });
  });

  return Promise.all(promises);
}
