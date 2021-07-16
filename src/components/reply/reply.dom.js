import domready from '../../js/domready';

async function initialise() {
  const replyInputs = [...document.querySelectorAll('.js-reply')];

  if (replyInputs.length) {
    const ReplyInput = (await import('./reply-input')).default;

    replyInputs.forEach(input => new ReplyInput(input));
  }
}

domready(initialise);
