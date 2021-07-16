import domready from '../../js/domready';

domready(async () => {
  const relationships = [...document.querySelectorAll('.js-relationships')];

  if (relationships.length) {
    const Relationships = (await import('./relationships')).default;

    relationships.forEach(element => new Relationships(element));
  }
});
