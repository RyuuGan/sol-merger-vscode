import path from 'path';
import fs from 'fs-extra';
import Merger from 'sol-merger/lib/Merger';
import { SolMergerSettings } from './settings';

export async function compileSolFile(file: string, settings: SolMergerSettings): Promise<string> {
  const merger = new Merger({ delimeter: settings.delimeter });
  return await merger.processFile(file, true);
}

export async function saveFile(file: string, content: string, settings: SolMergerSettings) {
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
  await fs.outputFile(outputFile, content, { encoding: 'utf-8' });
}
