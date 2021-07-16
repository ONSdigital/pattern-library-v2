import proxyquireify from 'proxyquireify';

import renderTemplate from '../../helpers/render-template';
import GetViewportDetailsMock from '../../stubs/getViewportDetails.stub.spec';

const proxyquire = proxyquireify(require);

const params = {
  toggleButton: {
    text: 'Menu',
    ariaLabel: 'Toggle main navigation',
  },
  navigation: {
    classes: 'js-header-nav u-d-no',
    id: 'main-nav',
    ariaLabel: 'Main menu',
    ariraListLabel: 'Navigation menu',
    currentPath: '/surveys',
    itemsList: [
      {
        title: 'Surveys',
        path: '/surveys',
      },
      {
        title: 'Messages',
        path: '#',
      },
      {
        title: 'To do',
        path: '#',
      },
      {
        title: 'My account',
        path: '#',
        classes: 'nav__item--secondary u-d-no@m',
      },
      {
        title: 'Sign out',
        path: '#',
        classes: 'u-d-no@m',
      },
    ],
  },
};

describe('Component: Navigation', function() {
  const ViewportDetailsMock = new GetViewportDetailsMock();

  describe('When the viewport is small,', function() {
    beforeEach(function() {
      const component = renderComponent(params);

      Object.keys(component).forEach(key => {
        this[key] = component[key];
      });
    });

    afterEach(function() {
      if (this.wrapper) {
        this.wrapper.remove();
      }
    });

    describe('When the component initialises', function() {
      beforeEach(function() {
        const HeaderNav = require('../../../components/header/header-nav').default;

        this.nav = new HeaderNav(this.toggleMainBtn, this.mainNavList);
        this.nav.registerEvents = chai.spy(this.nav.registerEvents);
        this.nav.registerEvents();
      });

      it('registerEvents should be called', function() {
        expect(this.nav.registerEvents).to.have.been.called();
      });

      describe('When viewport has a width more than 740,', function() {
        beforeEach(function() {
          ViewportDetailsMock.setParams({ width: 800 });

          const HeaderNav = proxyquire('../../../components/header/header-nav', {
            'viewport-details': {
              GetViewportDetails: ViewportDetailsMock.getMock(),
            },
          }).default;

          this.nav = new HeaderNav(this.toggleMainBtn, this.mainNavList);
          this.nav.registerEvents();
        });

        it('The nav list shouldn\'t be given an "aria-hidden" attribute', function() {
          expect(this.mainNavList.hasAttribute('aria-hidden')).to.equal(false);
        });

        describe('and then the viewport width changes to less than 740', function() {
          beforeEach(function() {
            ViewportDetailsMock.setParams({ width: 375 });
            this.nav.setAria();
          });

          it('The nav list should be given an "aria-hidden" attribute', function() {
            expect(this.mainNavList.hasAttribute('aria-hidden')).to.equal(true);
          });
        });

        describe('When the main nav is opened,', function() {
          beforeEach(function() {
            this.nav.openNav = chai.spy(this.nav.openNav);
            this.nav.toggleNav();
          });

          it('openNav should be called', function() {
            expect(this.nav.openNav).to.have.been.called();
          });

          it('Should be assigned the "aria-hidden" value of false', function() {
            expect(this.mainNavList.getAttribute('aria-hidden')).to.equal('false');
          });

          it('Should not have the hidden class', function() {
            expect(this.mainNavList.classList.contains('u-d-no@xxs@m')).to.be.false;
          });
        });

        describe('When the main nav is closed,', function() {
          beforeEach(function() {
            this.nav.closeNav(this.toggleMainBtn, this.mainNavList);
          });

          it('Should be assigned the "aria-hidden" value of false', function() {
            expect(this.mainNavList.getAttribute('aria-hidden')).to.equal('true');
          });

          it('Should not have the hidden class', function() {
            expect(this.mainNavList.classList.contains('u-d-no@xxs@m')).to.be.true;
          });
        });

        describe('and then the viewport width changes to more than 740', function() {
          beforeEach(function() {
            ViewportDetailsMock.setParams({ width: 800 });
            this.nav.setAria();
          });

          it('The nav list "aria-hidden" attribute should be removed', function() {
            expect(this.mainNavList.hasAttribute('aria-hidden')).to.equal(false);
          });
        });
      });

      describe('When viewport has a width less than 740,', function() {
        beforeEach(function() {
          ViewportDetailsMock.setParams({ width: 375 });

          const HeaderNav = proxyquire('../../../components/header/header-nav', {
            'viewport-details': {
              GetViewportDetails: ViewportDetailsMock.getMock(),
            },
          }).default;

          this.nav = new HeaderNav(this.toggleMainBtn, this.mainNavList);
          this.nav.registerEvents();
        });

        it('The nav list should be given an "aria-hidden" attribute', function() {
          expect(this.mainNavList.hasAttribute('aria-hidden')).to.equal(true);
        });

        describe('When the main nav is opened,', function() {
          beforeEach(function() {
            this.nav.openNav = chai.spy(this.nav.openNav);
            this.nav.toggleNav();
          });
        });

        describe('and then the viewport width changes to more than 740', function() {
          beforeEach(function() {
            ViewportDetailsMock.setParams({ width: 800 });
            this.nav.setAria();
          });

          it('The nav list "aria-hidden" attribute should be removed', function() {
            expect(this.mainNavList.hasAttribute('aria-hidden')).to.equal(false);
          });
        });
        describe('and then the viewport width changes to less than 740', function() {
          beforeEach(function() {
            ViewportDetailsMock.setParams({ width: 375 });
            this.nav.setAria();
          });

          it('The nav list "aria-hidden" attribute should be set to true', function() {
            expect(this.mainNavList.hasAttribute('aria-hidden')).to.equal(true);
          });
        });
      });
    });
  });
});

function renderComponent(params) {
  const html = renderTemplate('components/header/_test-template.njk', { params });

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);

  const toggleMainBtn = wrapper.querySelector('.js-toggle-main');
  const mainNavList = wrapper.querySelector('.js-header-nav');

  return {
    wrapper,
    toggleMainBtn,
    mainNavList,
  };
}
