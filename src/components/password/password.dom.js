import domready from '../../js/domready';

async function initialisePasswords() {
  const passwordFields = [...document.querySelectorAll('.js-password')];

  if (passwordFields.length) {
    const Password = (await import('./password')).default;

    passwordFields.forEach(field => new Password(field));
  }
}

domready(initialisePasswords);
