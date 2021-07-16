import through from 'through2';

import createNunjucksEnvironment from './create-nunjucks-environment.js';
import renderPage from './render-page.js';

export default through.obj((file, enc, cb) => {
  const nunjucksEnvironment = createNunjucksEnvironment();
  const output = renderPage(file.path, nunjucksEnvironment);
  file.path = file.path.replace(/[\\\/]src[\\\/]pages[\\\/]/, '/src/').replace('.njk', '.html');
  file.contents = Buffer.from(output, enc);
  cb(null, file);
});
