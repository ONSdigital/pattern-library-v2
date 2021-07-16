import domready from '../../js/domready';

async function submitButton() {
  const buttons = [...document.querySelectorAll('.js-submit-btn')];
  let submitType;

  if (buttons.length) {
    const SubmitButton = (await import('./button')).default;
    buttons.forEach(button => {
      if (button.classList.contains('js-timer')) {
        submitType = 'timer';
      } else if (button.classList.contains('js-loader')) {
        submitType = 'loader';
      } else if (button.classList.contains('btn--link')) {
        submitType = 'link';
      }
      new SubmitButton(button, submitType);
    });
  }
}

domready(submitButton);
