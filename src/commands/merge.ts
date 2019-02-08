import vscode from 'vscode';
import path from 'path';
import Merger from 'sol-merger/lib/Merger';
import fs from 'fs';
import { getSettings, getFileList } from '../utils';

export async function mergeContracts(): Promise<void> {
  const promises = vscode.workspace.workspaceFolders.map(processWorkspace);
  await Promise.all(promises);
}

async function processWorkspace(workspace: vscode.WorkspaceFolder) {
  const settings = getSettings(workspace);
  const files = await getFileList(settings);

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
      fs.writeFile(outputFile, result, { encoding: 'utf-8' }, err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });

  return Promise.all(promises);
}
