import beautify from 'js-beautify';

export function formatHTML(html, condenseWhiteSpace) {
  const beautifyDefaults = {
    unformatted: ['code', 'pre', 'em', 'strong'],
    indent_inner_html: true,
    preserve_newlines: true,
    indent_char: ' ',
    max_preserve_newlines: 1,
    indent_size: 2,
    sep: '\n',
  };

  const options = { ...beautifyDefaults };
  let beautifiedHtml = beautify.html(html, options);

  if (condenseWhiteSpace) {
    beautifiedHtml = beautify.html(html, options).replace(/^\s*$(?:\r\n?|\n)/gm, '');
  }

  return beautifiedHtml;
}
