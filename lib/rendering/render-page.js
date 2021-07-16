import frontMatter from 'front-matter';
import fs from 'fs';
import marked from 'marked';
import nunjucks from 'nunjucks';

import { formatHTML } from './helpers/format-html.js';
import { getPageInfo } from './helpers/site-map';

const markdownRenderer = new marked.Renderer();

markdownRenderer.paragraph = text => {
  if (
    /^<(\!doctype|abbr|acronym|address|applet|area|article|aside|audio|b|base|bdi|bdo|big|blockquote|body|br|button|canvas|caption|center|cite|code|col|colgroup|command|datalist|dd|del|details|dfn|dialog|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frame|frameset|head|header|hgroup|hr|h1|h2|h3|h4|h5|h6|html|i|iframe|img|input|ins|kbd|keygen|label|legend|li|link|map|mark|menu|meta|meter|nav|noframes|noscript|object|ol|optgroup|option|output|p|param|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|source|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|tt|u|ul|var|video)/i.test(
      text,
    )
  ) {
    return `${text}\n`;
  } else {
    return `<p>${text}</p>\n`;
  }
};

export default function renderPage(templatePath, nunjucksEnvironment) {
  try {
    const isExample = templatePath.includes('examples/');

    const data = frontMatter(fs.readFileSync(templatePath, { encoding: 'utf8' }));
    const layout = data.attributes.layout ?? (isExample ? 'example' : 'page');

    let template;
    if (layout === 'none') {
      template = data.body;
    } else {
      template = `
          {% extends 'layouts/_${layout}.njk' %}

          {% block main %}
          ${data.body}
          {% endblock %}
        `;
    }

    const compiledTemplate = nunjucks.compile(template, nunjucksEnvironment, templatePath);

    let html = compiledTemplate.render({
      pageInfo: getPageInfo(templatePath),
    });

    html = formatHTML(html, true);
    html = html.replace(/(?!<code[^>]*?>)(\n +)(?![^<]*?<\/code>)/g, '\n');

    html = marked(html, {
      pedantic: true,
      smartypants: true,
      renderer: markdownRenderer,
    });

    return html;
  } catch (err) {
    console.error(`An error occurred whilst rendering: ${templatePath}`);
    throw err;
  }
}
