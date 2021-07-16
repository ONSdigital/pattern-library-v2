import domready from '../../js/domready';

domready(async () => {
  const radios = [...document.querySelectorAll('.js-radio')];

  if (radios.length) {
    const Radios = (await import('../checkboxes/checkboxes')).default;

    new Radios(radios);

    const button = document.querySelector('.js-clear-btn');
    const otherInput = document.querySelector('.radio__other');
    if (button) {
      const ClearRadios = (await import('./clear-radios')).default;

      new ClearRadios(radios, button, otherInput);
    }

    const openOther = document.querySelector('.radio__other--open');
    if (openOther) {
      const parent = openOther.parentNode;
      const radioInput = parent.querySelector('.radio__input');
      const CheckRadios = (await import('./check-radios')).default;

      new CheckRadios(radioInput, openOther);
    }
  }
});
