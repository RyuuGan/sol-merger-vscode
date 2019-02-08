import vscode from 'vscode';
import path from 'path';
import glob from 'glob';

export interface SolMergerSettings {
  root: string;
  outputDir: string;
  inputGlob: string;
  delimeter: string;
  append: string;
}

export function getSettings(workspace: vscode.WorkspaceFolder): SolMergerSettings {
  // TODO: return actual data
  return {
    root: path.resolve(workspace.uri.path),
    outputDir: path.join(workspace.uri.path, 'compiled-contacts'),
    inputGlob: '!(node_modules)/**/*.sol',
    delimeter: '\n\n',
    append: '_merged',
  };
}

export async function getFileList(settings: SolMergerSettings): Promise<string[]> {
  return new Promise((resolve, reject) => {
    glob(
      settings.inputGlob,
      {
        cwd: settings.root,
        absolute: true,
      },
      (err, files) => {
        if (err) {
          return reject(err);
        }
        resolve(files);
      },
    );
  });
}
