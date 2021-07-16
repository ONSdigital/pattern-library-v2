// Tabs component JS

// The tab js is based on the GDS tabs component(https://design-system.service.gov.uk/components/tabs/)
// https://github.com/alphagov/govuk-frontend/blob/master/src/components/tabs/tabs.js

import matchMedia from '../../js/utils/matchMedia';

const classTab = 'tab';
const classTabTitle = 'tabs__title';
const classTabList = 'tabs__list';
const classTabListItems = 'tab__list-item';
const classTabsPanel = 'tabs__panel';

const matchMediaUtil = matchMedia;

export default class Tabs {
  constructor(component) {
    this.boundTabClick = this.onTabClick.bind(this);
    this.boundTabKeydown = this.onTabKeydown.bind(this);

    this.component = component;
    this.tabsTitle = component.querySelector(`.${classTabTitle}`);
    this.tabs = [...component.getElementsByClassName(classTab)];
    this.tabList = component.getElementsByClassName(classTabList);
    this.tabListItems = [...component.getElementsByClassName(classTabListItems)];
    this.tabPanels = [...component.getElementsByClassName(classTabsPanel)];

    this.jsHiddenClass = 'tabs__panel--hidden';
    this.jsTabListAsRowClass = 'tabs__list--row';
    this.jsTabItemAsRowClass = 'tab__list-item--row';
    this.jsTabAsListClass = 'tab--row';

    this.tabsTitle.classList.add('u-vh');

    if (matchMediaUtil.hasMatchMedia()) {
      this.setupViewportChecks();
    } else {
      this.makeTabs();
    }
  }

  // Set up checks for responsive functionality
  // The tabs will display as tabs for >40rem viewports
  // Tabs will display as a TOC list and show full content for <40rem viewports
  // Aria tags are added only for >40rem viewports
  setupViewportChecks() {
    this.viewport = matchMediaUtil('(min-width: 40rem)');
    this.viewport.addListener(this.checkViewport.bind(this));
    this.checkViewport();
  }

  checkViewport() {
    if (this.viewport.matches) {
      this.makeTabs();
    } else {
      this.makeList();
    }
  }

  makeTabs() {
    this.tabList[0].setAttribute('role', 'tablist');
    this.tabList[0].classList.add(this.jsTabListAsRowClass);

    this.tabPanels.forEach(panel => {
      panel.setAttribute('tabindex', '0');
    });

    this.tabListItems.forEach(item => {
      item.setAttribute('role', 'presentation');
      item.classList.add(this.jsTabItemAsRowClass);
    });

    this.tabs.forEach(tab => {
      this.setAttributes(tab);
      tab.classList.add(this.jsTabAsListClass);

      tab.addEventListener('click', this.boundTabClick, true);
      tab.addEventListener('keydown', this.boundTabKeydown, true);
      this.hideTab(tab);
    });

    const activeTab = this.getTab(window.location.hash) || this.tabs[0];
    this.showTab(activeTab);

    this.component.boundOnHashChange = this.onHashChange.bind(this);
    window.addEventListener('hashchange', this.component.boundOnHashChange, true);
  }

  makeList() {
    this.tabList[0].removeAttribute('role');
    this.tabList[0].classList.remove(this.jsTabListAsRowClass);

    this.tabPanels.forEach(panel => {
      panel.removeAttribute('tabindex', '0');
    });

    this.tabListItems.forEach(item => {
      item.removeAttribute('role', 'presentation');
      item.classList.remove(this.jsTabItemAsRowClass);
    });

    this.tabs.forEach(tab => {
      tab.removeEventListener('click', this.boundTabClick, true);
      tab.removeEventListener('keydown', this.boundTabKeydown, true);
      tab.classList.remove(this.jsTabAsListClass);
      this.unsetAttributes(tab);
    });

    window.removeEventListener('hashchange', this.component.boundOnHashChange, true);
  }

  // Handle haschange so that the browser can cycle through the tab history
  onHashChange() {
    const hash = window.location.hash;
    const tabWithHash = this.getTab(hash);
    if (!tabWithHash) {
      return;
    }

    if (this.changingHash) {
      this.changingHash = false;
      return;
    }

    const previousTab = this.getCurrentTab();

    this.hideTab(previousTab);
    this.showTab(tabWithHash);
    tabWithHash.focus();
  }

  hideTab(tab) {
    this.unhighlightTab(tab);
    this.hidePanel(tab);
  }

  showTab(tab) {
    this.highlightTab(tab);
    this.showPanel(tab);
  }

  getTab(hash) {
    return this.component.querySelector('.tab[href="' + hash + '"]');
  }

  // Set aria tags
  setAttributes(tab) {
    const panelId = this.getHref(tab).slice(1);
    tab.setAttribute('id', 'tab_' + panelId);
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panelId);
    tab.setAttribute('tabindex', '-1');

    const panel = this.getPanel(tab);
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.classList.add(this.jsHiddenClass);
  }

  // Remove aria tags for TOC view
  unsetAttributes(tab) {
    tab.removeAttribute('id');
    tab.removeAttribute('role');
    tab.removeAttribute('aria-controls');
    tab.removeAttribute('tabindex');
    tab.removeAttribute('aria-selected');

    const panel = this.getPanel(tab);
    panel.removeAttribute('role');
    panel.removeAttribute('aria-labelledby');
    panel.classList.remove(this.jsHiddenClass);
  }

  onTabClick(e) {
    e.preventDefault();
    const newTab = e.target;
    const currentTab = this.getCurrentTab();
    this.hideTab(currentTab);
    this.showTab(newTab);
    this.createHash(newTab);
  }

  createHash(tab) {
    const panel = this.getPanel(tab);
    const id = panel.id;
    panel.id = '';
    this.changingHash = true;
    window.location.hash = this.getHref(tab).slice(1);
    panel.id = id;
  }

  onTabKeydown(event) {
    if (event.which === 37) {
      this.focusPreviousTab();
      event.preventDefault();
    } else if (event.which === 39) {
      this.focusNextTab();
      event.preventDefault();
    } else if (event.which === 32) {
      this.onTabClick(event);
    }
  }

  focusNextTab() {
    const focusedTab = this.getFocusedTab();
    const nextTabListItem = focusedTab.nextElementSibling;
    if (nextTabListItem) {
      nextTabListItem.firstElementChild.focus();
    }
  }

  focusPreviousTab() {
    const focusedTab = this.getFocusedTab();
    const previousTabListItem = focusedTab.previousElementSibling;
    if (previousTabListItem) {
      previousTabListItem.firstElementChild.focus();
    }
  }

  getPanel(tab) {
    const panel = this.component.querySelector(this.getHref(tab));
    return panel;
  }

  showPanel(tab) {
    const panel = this.getPanel(tab);
    panel.classList.remove(this.jsHiddenClass);
  }

  hidePanel(tab) {
    const panel = this.getPanel(tab);
    panel.classList.add(this.jsHiddenClass);
  }

  unhighlightTab(tab) {
    tab.setAttribute('aria-selected', 'false');
    tab.classList.remove('tab--selected');
    tab.setAttribute('tabindex', '-1');
  }

  highlightTab(tab) {
    tab.setAttribute('aria-selected', 'true');
    tab.classList.add('tab--selected');
    tab.setAttribute('tabindex', '0');
  }

  getFocusedTab() {
    return document.activeElement.parentNode;
  }

  getCurrentTab() {
    return this.component.querySelector('.tab--selected');
  }

  getHref(tab) {
    const href = tab.getAttribute('href');
    const hash = href.slice(href.indexOf('#'), href.length);
    return hash;
  }
}
