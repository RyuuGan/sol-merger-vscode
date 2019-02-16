import vscode from 'vscode';
import path from 'path';
import fs from 'fs-extra';

const DEFAULT_CONFIG = {
  mergeSettings: {
    outputDir: 'compiled-contacts',
    inputGlob: '!(node_modules)/**/*.sol',
    delimeter: '\n\n',
    compiledSuffix: '_merged',
    cleanDist: false
  },
};

export const ROOT_CONFIG_KEY = 'solMerger';

export interface SolMergerSettings {
  root: string;
  outputDir: string;
  inputGlob: string;
  delimeter: string;
  append: string;
  cleanDist: boolean;
}

export function getSettings(
  workspace: vscode.WorkspaceFolder
): SolMergerSettings {
  const config = vscode.workspace.getConfiguration('solMerger.mergeSettings');
  let jsonConfig: any;
  const overrideConfigFile = path.join(
    path.resolve(workspace.uri.fsPath),
    '.solMerger.json'
  );
  try {
    jsonConfig = fs.readJSONSync(overrideConfigFile, {
      encoding: 'utf-8',
    });
  } catch (e) {
    console.log(`File is not ${overrideConfigFile} is not a valid config file`);
    jsonConfig = {};
  }

  let outputDir =
    jsonConfig.outputDir ||
    config.get('outputDir', DEFAULT_CONFIG.mergeSettings.outputDir);
  if (!path.isAbsolute(outputDir)) {
    outputDir = path.join(workspace.uri.fsPath, outputDir);
  }
  return {
    root: path.resolve(workspace.uri.fsPath),
    outputDir,
    inputGlob:
      jsonConfig.inputGlob ||
      config.get('inputGlob', DEFAULT_CONFIG.mergeSettings.inputGlob),
    delimeter:
      jsonConfig.delimeter ||
      config.get('delimeter', DEFAULT_CONFIG.mergeSettings.delimeter),
    append:
      jsonConfig.compiledSuffix ||
      config.get('compiledSuffix', DEFAULT_CONFIG.mergeSettings.compiledSuffix),
    cleanDist: jsonConfig.cleanDist ||
      config.get('cleanDist', DEFAULT_CONFIG.mergeSettings.cleanDist)
  };
}
