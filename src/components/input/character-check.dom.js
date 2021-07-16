import domready from '../../js/domready';

async function initialise() {
  const checkedInputs = [...document.querySelectorAll('.js-char-check-input')];

  if (checkedInputs.length) {
    const CharCheck = (await import('../char-check-limit/character-check')).default;

    checkedInputs.forEach(input => new CharCheck(input));
  }
}

domready(initialise);
