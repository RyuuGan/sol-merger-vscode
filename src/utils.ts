import vscode from 'vscode';
import path from 'path';
import glob from 'glob';
import fs from 'fs-extra';

const DEFAULT_CONFIG = {
  mergeSettings: {
    outputDir: 'compiled-contacts',
    inputGlob: '!(node_modules)/**/*.sol',
    delimeter: '\n\n',
    compiledSuffix: '_merged',
  },
};

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
    jsonConfig = fs.readJSONSync(overrideConfigFile, {
      encoding: 'utf-8',
    });
  } catch (e) {
    console.log(`File is not ${overrideConfigFile} is not a valid config file`);
    jsonConfig = {};
  }

  let outputDir =
    jsonConfig.outputDir || config.get('outputDir', DEFAULT_CONFIG.mergeSettings.outputDir);
  if (!path.isAbsolute(outputDir)) {
    outputDir = path.join(workspace.uri.path, outputDir);
  }
  return {
    root: path.resolve(workspace.uri.path),
    outputDir,
    inputGlob:
      jsonConfig.inputGlob || config.get('inputGlob', DEFAULT_CONFIG.mergeSettings.inputGlob),
    delimeter:
      jsonConfig.delimeter || config.get('delimeter', DEFAULT_CONFIG.mergeSettings.delimeter),
    append:
      jsonConfig.compiledSuffix ||
      config.get('compiledSuffix', DEFAULT_CONFIG.mergeSettings.compiledSuffix),
  };
}

export async function getFileList(settings: SolMergerSettings): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
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

export function maybeSetInitialConfig() {
  const config = vscode.workspace.getConfiguration();

  if (config.has('solMerger')) {
    return;
  }

  config.update('solMerger', DEFAULT_CONFIG);
}
