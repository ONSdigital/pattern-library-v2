import domready from '../../../js/domready';
import subNavigation from './sub-navigation';

async function initaliseSubNavigation() {
  const subNavCurrentPage = document.querySelector('.js-patternlib-subnav__item--active');
  if (subNavCurrentPage) {
    subNavigation(subNavCurrentPage);
  }
}

domready(initaliseSubNavigation);
