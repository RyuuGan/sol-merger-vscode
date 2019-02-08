import vscode from 'vscode';
import path from 'path';
import glob from 'glob';
import fs from 'fs';

export interface SolMergerSettings {
  root: string;
  outputDir: string;
  inputGlob: string;
  delimeter: string;
  append: string;
}

export function getSettings(workspace: vscode.WorkspaceFolder): SolMergerSettings {
  const config = vscode.workspace.getConfiguration('solMerger.mergeSettings');
  let jsonConfig: any;
  const overrideConfigFile = path.join(path.resolve(workspace.uri.path), '.solMerger.json');
  try {
    const content = fs.readFileSync(overrideConfigFile, {
      encoding: 'utf-8',
    });
    jsonConfig = JSON.parse(content);
  } catch (e) {
    console.log(`File is not ${overrideConfigFile} is not a valid config file`);
    jsonConfig = {};
  }

  let outputDir = jsonConfig.outputDir || config.get('outputDir', 'compiled-contacts');
  if (!path.isAbsolute(outputDir)) {
    outputDir = path.join(workspace.uri.path, outputDir);
  }
  return {
    root: path.resolve(workspace.uri.path),
    outputDir,
    inputGlob: jsonConfig.inputGlob || config.get('inputGlob', '!(node_modules)/**/*.sol'),
    delimeter: jsonConfig.delimeter || config.get('delimeter', '\n\n'),
    append: jsonConfig.compiledSuffix || config.get('compiledSuffix', '_merged'),
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
