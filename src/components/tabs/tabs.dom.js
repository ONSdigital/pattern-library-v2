import domready from '../../js/domready';

async function tabs() {
  const tabs = [...document.querySelectorAll('.tabs')];

  if (tabs.length) {
    const Tabs = (await import('./tabs')).default;

    tabs.forEach(component => new Tabs(component));
  }
}

domready(tabs);
