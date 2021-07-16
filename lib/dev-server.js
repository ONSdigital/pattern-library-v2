import express from 'express';
import fs from 'fs';

import createNunjucksEnvironment from './rendering/create-nunjucks-environment.js';
import renderPage from './rendering/render-page.js';

process.env.IS_DEV_SERVER = true;

const app = express();

const nunjucksEnvironment = createNunjucksEnvironment();

app.use((req, res, next) => {
  let rawRequestPath = (req.path ?? '/').substr(1);
  if (rawRequestPath !== '' && !rawRequestPath.endsWith('/')) {
    rawRequestPath += '/';
  }

  const requestPath = !!rawRequestPath ? `${rawRequestPath}index` : 'index';

  let templatePath = `./src/pages/${requestPath}.njk`;
  if (!fs.existsSync(templatePath)) {
    templatePath = `./src/${requestPath}.njk`;
  }

  if (!fs.existsSync(templatePath)) {
    next();
    return;
  }

  const output = renderPage(templatePath, nunjucksEnvironment);
  res.send(output);
});

app.use(express.static('./src/static'));
app.use(express.static('./build'));

app.listen(3010);
