import * as fs from 'fs';
import { createFolder, copyFile } from './helpers';

export async function copyComponents(componentsPath, newComponentsPath) {
  await createFolder(newComponentsPath);

  try {
    const items = await fs.readdirSync(componentsPath).filter(path => !path.includes('.njk'));

    items.forEach(item => copyComponent(item, componentsPath, newComponentsPath));
  } catch (error) {
    throw new Error(error);
  }
}

async function copyComponent(componentName, componentsPath, newComponentsPath) {
  try {
    const componentPath = `${componentsPath}/${componentName}`;
    const newComponentPath = `${newComponentsPath}/${componentName}`;

    const items = await fs
      .readdirSync(componentPath)
      .filter(path => path.includes('_') && !path.includes('.md') && !path.includes('_test-'));

    if (items.length) {
      await createFolder(newComponentPath);
    }

    items.forEach(async path => {
      await copyFile(`${componentPath}/${path}`, `${newComponentPath}/${path}`);
    });
  } catch (error) {
    throw new Error(error);
  }
}

export async function copyTemplates(templatesPath, newTemplatesPath) {
  await createFolder(newTemplatesPath);

  try {
    const items = await fs.readdirSync(templatesPath).filter(path => path.includes('.njk') && path.includes('_'));

    items.forEach(item => copyTemplate(item, templatesPath, newTemplatesPath));
  } catch (error) {
    throw new Error(error);
  }
}

async function copyTemplate(templateFileName, templatesPath, newTemplatesPath) {
  try {
    await copyFile(`${templatesPath}/${templateFileName}`, `${newTemplatesPath}/${templateFileName}`);
  } catch (error) {
    throw new Error(error);
  }
}
