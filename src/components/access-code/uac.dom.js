import domready from '../../js/domready';

domready(async () => {
  const uacInputs = [...document.querySelectorAll('.js-uac')];

  if (uacInputs.length) {
    const UAC = (await import('./uac')).default;

    uacInputs.forEach(element => new UAC(element));
  }
});
