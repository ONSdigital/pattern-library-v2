import { iframeResizer } from 'iframe-resizer';

import domready from '../domready';

function resize() {
  iframeResizer(
    {
      autoResize: true,
      heightCalculationMethod: 'max',
      scrolling: 'omit',
    },
    '.patternlib-example__iframe',
  );
}

domready(() => {
  setTimeout(function() {
    resize();
  }, 1000);
});
