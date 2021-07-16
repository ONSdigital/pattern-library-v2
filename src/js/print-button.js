import domready from './domready';

export default function addEventListeners() {
  const buttons = [...document.querySelectorAll('.js-print-btn')];

  buttons.forEach(button => {
    button.addEventListener('click', handleClick);
    button.classList.remove('u-d-no');
  });
}

function handleClick() {
  window.print();
}

domready(addEventListeners);
