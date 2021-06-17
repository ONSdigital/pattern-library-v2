import * as fs from 'fs';

import { removeFolder, copyDir, createFolder, copyFile, asyncForEach } from './helpers';
import { copyComponents, copyTemplates } from './common';

const cwd = process.cwd();
const sourcePath = `${cwd}/src`;
const componentsPath = `${sourcePath}/components`;
const newComponentsPath = `${cwd}/components`;
const templatesPath = `${sourcePath}/styles/page-template`;
const newTemplatesPath = `${cwd}/page-templates`;
const assetFolders = ['css', 'favicons', 'fonts', 'img', 'scripts'];
const builtAssetsFolders = assetFolders.map(folder => `${cwd}/build/${folder}`);
const newSassPath = `${cwd}/scss`;

async function removeExistingFolders() {
  const folders = [newComponentsPath, newTemplatesPath, ...assetFolders];

  await asyncForEach(folders, removeFolder);
}

async function copyAssets() {
  await asyncForEach(assetFolders, async (folder, index) => {
    await createFolder(folder);

    try {
      const builtPath = builtAssetsFolders[index];
      const files = await fs.readdirSync(builtPath).filter(path => !path.includes('patternlib'));

      asyncForEach(files, async file => {
        if (file.match(/(\.\w+)$/)) {
          await copyFile(`${builtPath}/${file}`, `${folder}/${file}`);
        } else {
          const newFolderPath = `${folder}/${file}`;
          const nestedBuiltPath = `${builtPath}/${file}`;
          await createFolder(newFolderPath);

          const nestedFiles = await fs.readdirSync(nestedBuiltPath).filter(path => !path.includes('patternlib'));

          asyncForEach(nestedFiles, async nestedFile => {
            await copyFile(`${nestedBuiltPath}/${nestedFile}`, `${newFolderPath}/${nestedFile}`);
          });
        }
      });
    } catch (error) {
      throw new Error(error);
    }
  });
}

async function copyBaseSass() {
  await createFolder(newSassPath);
  await copyDir(`${sourcePath}/scss`, `${newSassPath}`);
}

async function run() {
  await removeExistingFolders();
  await copyComponents(componentsPath, newComponentsPath);
  await copyTemplates(templatesPath, newTemplatesPath);
  await copyAssets();
  await copyBaseSass();
}

run();
