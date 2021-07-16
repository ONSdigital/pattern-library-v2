import nunjucks from 'nunjucks';

import createNunjucksEnvironment from '../../../lib/rendering/create-nunjucks-environment';

const nunjucksLoader = new nunjucks.WebLoader('/base/src');
const nunjucksEnvironment = createNunjucksEnvironment(nunjucksLoader);

export default function renderTemplate(templatePath, context) {
  return nunjucksEnvironment.render(templatePath, context);
}
