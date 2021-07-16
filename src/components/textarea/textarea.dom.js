import autosize from 'autosize';

import domready from '../../js/domready';

async function initialise() {
  const limitedInputs = [...document.querySelectorAll('.js-char-limit-input')];
  autosize(document.querySelectorAll('textarea'));

  if (limitedInputs.length) {
    const CharLimit = (await import('../char-check-limit/character-limit')).default;

    limitedInputs.forEach(input => new CharLimit(input));
  }
}

domready(initialise);
