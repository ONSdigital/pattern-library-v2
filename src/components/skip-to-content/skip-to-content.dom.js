import domready from '../../js/domready';
import skipToMain from './skip-to-content';

async function initaliseSkipToLink() {
  const links = [...document.querySelectorAll('.skip__link')];
  if (links.length) {
    links.forEach(link => {
      skipToMain(link);
    });
  }
}

domready(initaliseSkipToLink);
