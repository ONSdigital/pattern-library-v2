import domready from './domready';

async function initialise() {
  const links = [...document.getElementsByClassName('js-inpagelink')];

  if (links.length) {
    const inPageLinks = (await import('./inpagelink')).default;

    inPageLinks(links);
  }
}

domready(initialise);
