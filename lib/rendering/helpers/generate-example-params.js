import * as fs from 'fs';
import marked from 'marked';

import { formatHTML } from './format-html.js';
import { removeFrontmatterFromString } from './remove-frontmatter-from-string.js';

const sourcePath = `${process.cwd()}/src`;

export default function generateExampleParams(params, nunjucksEnvironment) {
  const link = `/${params.path.replace('/index.njk', '').replace('/index.html', '')}`;
  const name = link.split('/examples/')[1];
  const path = `${sourcePath}/${params.path}`;

  if (fs.existsSync(path)) {
    let raw = removeFrontmatterFromString(fs.readFileSync(path, 'utf8'));

    const srcPath = params.componentFolderPath ? `${sourcePath}/${params.componentFolderPath}/` : `${path.split('/examples/')[0]}/`;
    const optionsPath = `${srcPath}_macro-options.md`;
    const macroPath = `${srcPath}_macro.njk`;

    let options;
    let scss;
    let template;

    if (fs.existsSync(optionsPath)) {
      options = marked(fs.readFileSync(optionsPath, 'utf8'), {
        smartypants: true,
      });
    }

    if (fs.existsSync(srcPath)) {
      const sassFiles = fs.readdirSync(srcPath).filter(file => {
        const fileNameParts = file.split('.');
        const ext = fileNameParts[fileNameParts.length - 1];

        return ext === 'scss';
      });

      const sassRaw = sassFiles.map(file => {
        return fs.readFileSync(`${srcPath}${file}`, 'utf8');
      });
      scss = sassRaw.join('\n');
    }

    if (fs.existsSync(macroPath)) {
      template = fs.readFileSync(macroPath, 'utf8');
    }

    const html = formatHTML(nunjucksEnvironment.renderString(raw), true);

    if (!path.match(/.njk$/)) {
      raw = undefined;
    }

    return {
      ...params,
      link,
      raw,
      options,
      html,
      scss,
      name,
      template,
    };
  } else {
    console.log('');
    console.error(`Path: '${path}' not found.`);
  }
}
