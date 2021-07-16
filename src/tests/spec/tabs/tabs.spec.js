import '../../../components/tabs/tabs';

import proxyquireify from 'proxyquireify';

import renderTemplate from '../../helpers/render-template';
import eventMock from '../../stubs/event.stub.spec';
import matchMediaDesktopMock from '../../stubs/matchMediaDesktop.stub.spec';
import matchMediaMobileMock from '../../stubs/matchMediaMobile.stub.spec';

const proxyquire = proxyquireify(require);

const params = {
  title: 'Tabs',
  tabs: [
    {
      title: 'Tab 1',
      content: 'Tab 1 content',
    },
    {
      title: 'Tab 2',
      content: 'Tab 2 content',
    },
    {
      title: 'Tab 3',
      content: 'Tab 3 content',
    },
  ],
};

describe('Component: Tabs', () => {
  const mobileMock = matchMediaMobileMock();
  const desktopMock = matchMediaDesktopMock();

  let tabs;

  describe('when the viewport is large,', () => {
    if (window.innerWidth > 631) {
      beforeEach(function() {
        const component = renderComponent(params);

        Object.keys(component).forEach(key => {
          this[key] = component[key];
        });

        const mockedTabs = proxyquire('../../../components/tabs/tabs', {
          '../../../js/utils/matchMedia': {
            default: desktopMock,
          },
        }).default;

        tabs = new mockedTabs(this.tabsComponent);
      });

      afterEach(function() {
        if (this.wrapper) {
          this.wrapper.remove();
        }
      });

      describe('Given the component has loaded', () => {
        it('Then the tab list items should be assigned the "presentation" role', function() {
          this.tabListItems.forEach(tabListItem => {
            expect(tabListItem.getAttribute('role')).to.equal('presentation');
          });
        });

        it('Then each tab should be assigned the "tab" role', function() {
          this.tab.forEach(tabEl => {
            expect(tabEl.getAttribute('role')).to.equal('tab');
          });
        });

        it('Then each tab should be assigned a unique "ID"', function() {
          for (let i = 0; i < this.tab.length; i++) {
            i = i + 1;
            expect(this.tab[i - 1].getAttribute('id')).to.equal('tab_tabId' + i);
          }
        });

        it('Then each tab should be assigned the "aria-controls" corresponding panel id', function() {
          for (let i = 0; i < this.tab.length; i++) {
            i = i + 1;
            expect(this.tab[i - 1].getAttribute('aria-controls')).to.equal('tabId' + i);
            expect(this.tabPanels[i - 1].getAttribute('id')).to.equal('tabId' + i);
          }
        });

        describe('The first tab element,', function() {
          it('Then should be assigned a "tabindex" value', function() {
            expect(this.tab[0].getAttribute('tabindex')).to.equal('0');
          });

          it('Then should be assigned the "aria-selected" value of true', function() {
            expect(this.tab[0].getAttribute('aria-selected')).to.equal('true');
          });

          it('Then should be assigned the class tab--selected', function() {
            expect(this.tab[0].classList.contains('tab--selected')).to.be.true;
          });

          it('Then should show the corresponding panel', function() {
            const tabId = this.tab[0].getAttribute('href').slice(1);
            const panel = document.getElementById(tabId);
            const classHidden = 'tabs__panel--hidden';
            expect(panel.classList.contains(classHidden)).to.be.false;
          });

          it('Then should hide all other panels', function() {
            const classHidden = 'tabs__panel--hidden';
            const panels = document.getElementsByClassName('tabs__panel');
            expect(panels[1].classList.contains(classHidden)).to.be.true;
            expect(panels[2].classList.contains(classHidden)).to.be.true;
          });
        });

        describe('When a tab is clicked,', function() {
          beforeEach('Click the second tab', function() {
            this.tab[1].click();
          });

          it('Then the tab should be assigned a "tabindex" value', function() {
            expect(this.tab[1].getAttribute('tabindex')).to.equal('0');
          });

          it('Then the tab should be assigned the "aria-selected" value of true', function() {
            expect(this.tab[1].getAttribute('aria-selected')).to.equal('true');
          });

          it('Then the tab should be assigned the class tab--selected', function() {
            expect(this.tab[1].classList.contains('tab--selected')).to.be.true;
          });

          it('Then the the corresponding panel should be shown', function() {
            const tabId = this.tab[1].getAttribute('href').slice(1);
            const panel = document.getElementById(tabId);
            const classHidden = 'tabs__panel--hidden';
            expect(panel.classList.contains(classHidden)).to.be.false;
          });

          it('Then all other panels should be hidden', function() {
            const classHidden = 'tabs__panel--hidden';
            const panels = document.getElementsByClassName('tabs__panel');
            expect(panels[0].classList.contains(classHidden)).to.be.true;
            expect(panels[2].classList.contains(classHidden)).to.be.true;
          });
        });

        describe('When right arrow key is pressed,', function() {
          it('should focus the next sibling', function() {
            const mockedEvent = eventMock({ which: 39 });

            tabs.focusNextTab = chai.spy();

            tabs.onTabKeydown(mockedEvent);

            expect(tabs.focusNextTab).to.have.been.called();
          });
        });

        describe('When left arrow key is pressed,', function() {
          it('should focus the previous sibling', function() {
            const mockedEvent = eventMock({ which: 37 });

            tabs.focusPreviousTab = chai.spy();

            tabs.onTabKeydown(mockedEvent);

            expect(tabs.focusPreviousTab).to.have.been.called();
          });
        });
      });
    }
  });

  describe('when the viewport is small,', () => {
    if (window.innerWidth < 631) {
      beforeEach(function() {
        const component = renderComponent(params);

        Object.keys(component).forEach(key => {
          this[key] = component[key];
        });

        const mockedTabs = proxyquire('../../../components/tabs/tabs', {
          '../../../js/utils/matchMedia': {
            default: mobileMock,
          },
        }).default;

        tabs = new mockedTabs(this.tabsComponent);
      });

      afterEach(function() {
        if (this.wrapper) {
          this.wrapper.remove();
        }
      });

      describe('Given the component has loaded', () => {
        it('Then all aria attributes should be removed from the tabs', function() {
          this.tab.forEach(tabEl => {
            expect(tabEl.getAttribute('role')).to.equal(null);
            expect(tabEl.getAttribute('aria-controls')).to.equal(null);
            expect(tabEl.getAttribute('aria-selected')).to.equal(null);
          });
        });

        it('Then all panels should be displayed', function() {
          const classHidden = 'tabs__panel--hidden';
          this.tabPanels.forEach(panel => {
            expect(panel.classList.contains(classHidden)).to.be.false;
          });
        });
      });
    }
  });
});

function renderComponent(params) {
  const html = renderTemplate('components/tabs/_test-template.njk', { params });

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);

  const tabsComponent = wrapper.querySelector('.tabs');
  const tabList = tabsComponent.querySelector('.tabs__list');
  const tab = [...tabsComponent.getElementsByClassName('tab')];
  const tabListItems = [...tabsComponent.getElementsByClassName('tab__list-item')];
  const tabPanels = [...tabsComponent.getElementsByClassName('tabs__panel')];

  return {
    wrapper,
    tabsComponent,
    tab,
    tabList,
    tabListItems,
    tabPanels,
  };
}
