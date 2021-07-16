import domready from '../../js/domready';

domready(async () => {
  const toggleMainBtn = document.querySelector('.js-toggle-main');
  const mainNavList = document.querySelector('.js-header-nav');

  if (toggleMainBtn) {
    const NavToggle = (await import('./header-nav')).default;

    new NavToggle(toggleMainBtn, mainNavList).registerEvents();
  }
});
