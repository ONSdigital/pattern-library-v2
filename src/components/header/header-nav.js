import { GetViewportDetails } from 'viewport-details';

import onViewportChange from '../../js/utils/viewport-change';

const attrExpanded = 'aria-expanded';
const attrHidden = 'aria-hidden';
const hideClass = 'u-d-no@xxs@m';

export default class NavToggle {
  constructor(toggle, nav) {
    this.toggle = toggle;
    this.nav = nav;
    this.toggle.classList.remove('u-d-no');

    this.setAria();
    onViewportChange(this.setAria.bind(this));
  }

  registerEvents() {
    this.toggle.addEventListener('click', this.toggleNav.bind(this));
  }

  toggleNav() {
    const isHidden = this.nav.getAttribute(attrHidden);
    isHidden === 'false' ? this.closeNav() : this.openNav();
  }

  openNav() {
    this.toggle.setAttribute(attrExpanded, 'true');
    this.nav.setAttribute(attrHidden, 'false');
    this.nav.classList.remove(hideClass);
  }

  closeNav() {
    this.toggle.setAttribute(attrExpanded, 'false');
    this.nav.setAttribute(attrHidden, 'true');
    this.nav.classList.add(hideClass);
  }

  setAria() {
    const viewportDetails = GetViewportDetails();
    const hasAria = this.nav.hasAttribute(attrHidden);

    if (viewportDetails.width < 740) {
      if (!hasAria) {
        this.closeNav();
      }
    } else if (hasAria) {
      this.toggle.removeAttribute(attrExpanded);
      this.nav.removeAttribute(attrHidden);
      this.nav.classList.remove(hideClass);
    }
  }
}
