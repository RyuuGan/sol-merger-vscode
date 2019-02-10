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

export const ROOT_CONFIG_KEY = 'solMerger';

export interface SolMergerSettings {
  root: string;
  outputDir: string;
  inputGlob: string;
  delimeter: string;
  append: string;
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
  };
}

export async function getFileList(
  settings: SolMergerSettings
): Promise<string[]> {
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
      }
    );
  });
}

export function maybeSetInitialConfig() {
  const config = vscode.workspace.getConfiguration(ROOT_CONFIG_KEY);

  const flattenConfig = flattenObject(DEFAULT_CONFIG);

  for (const key of Object.keys(flattenConfig)) {
    if (config.has(key)) {
      continue;
    }
    config.update(key, flattenConfig[key]);
  }

  const globalConfig = vscode.workspace.getConfiguration();

  if (!config.has(ROOT_CONFIG_KEY)) {
    globalConfig.update(ROOT_CONFIG_KEY, config);
  }

  /*
   * Flatten Object @gdibble: Inspired by https://gist.github.com/penguinboy/762197
   *   input:  { 'a':{ 'b':{ 'b2':2 }, 'c':{ 'c2':2, 'c3':3 } } }
   *   output: { 'a.b.b2':2, 'a.c.c2':2, 'a.c.c3':3 }
   */
  function flattenObject(obj: Object): { [key: string]: any } {
    const toReturn = {};
    let flatObject: { [key: string]: any };
    for (const i of Object.keys(obj)) {
      if (Array.isArray(obj[i])) {
        toReturn[i] = obj[i];
        return toReturn;
      }
      if (typeof obj[i] === 'object') {
        flatObject = flattenObject(obj[i]);
        for (const x in flatObject) {
          if (!flatObject.hasOwnProperty(x)) {
            continue;
          }
          toReturn[i + (!!isNaN(x as any) ? '.' + x : '')] = flatObject[x];
        }
      } else {
        toReturn[i] = obj[i];
      }
    }
    return toReturn;
  }
}
