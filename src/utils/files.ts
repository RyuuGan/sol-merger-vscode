import glob from 'glob';
import { SolMergerSettings } from './settings';

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