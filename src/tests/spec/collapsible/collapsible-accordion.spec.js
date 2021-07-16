import Collapsible from '../../../components/collapsible/collapsible';
import CollapsibleGroup from '../../../components/collapsible/collapsible.group';
import renderTemplate from '../../helpers/render-template';
import eventMock from '../../stubs/event.stub.spec';

const params = {
  id: 'accordion',
  allButton: {
    open: 'Show all',
    close: 'Hide all',
  },
  itemsList: [
    {
      title: 'Total retail turnover',
      content:
        '<h3 class="u-fs-r">Include:</h3><ul class="list"><li class="list__item">VAT</li><li class="list__item">internet sales</li><li class="list__item">retail sales from outlets in Great Britain to <a href="#">customers abroad</a></li></ul><h3 class="u-fs-r">Exclude:</h3><ul class="list"><li class="list__item">revenue from mobile phone network commission and top-up</li><li class="list__item">sales from catering facilities used by customers</li><li class="list__item">lottery sales and commission from lottery sales</li><li class="list__item">sales of car accessories and motor vehicles</li><li class="list__item">NHS receipts</li><li class="list__item">automotive fuel</li></ul>',
      button: {
        open: 'Show',
        close: 'Hide',
      },
    },
    {
      title: 'Food sales',
      content:
        '<h3 class="u-fs-r">Include:</h3><ul class="list"><li class="list__item">all fresh food</li><li class="list__item">other food for human consumption (except chocolate and sugar confectionery)</li><li class="list__item">soft drinks</li></ul><h3 class="u-fs-r">Exclude:</h3><ul class="list"><li class="list__item">sales from catering facilities used by customers</li></ul>',
      button: {
        open: 'Show',
        close: 'Hide',
      },
    },
    {
      title: 'Alcohol, confectionery, soft drinks and tobacco sales',
      content:
        '<h3 class="u-fs-r">Include:</h3><ul class="list"><li class="list__item">chocolate and sugar confectionery</li><li class="list__item">tobacco and smokers’ requisites</li></ul>',
      button: {
        open: 'Show',
        close: 'Hide',
      },
    },
  ],
};

describe('Component: Accordion', function() {
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

  describe('before the component initialises', function() {
    it('then the toggle button element should have a u-d-no class', function() {
      expect([...this.toggleButton.classList].includes('u-d-no')).to.be.true;
    });
  });

  describe('When the component initialises', function() {
    it('then the toggle button element should not have a u-d-no class', function() {
      new Collapsible(this.item.collapsible);
      expect([...this.toggleButton.classList].includes('u-d-no')).to.be.false;
    });

    it('then none of the collapsibleHeader items should have a tabindex attribute', function() {
      this.items.forEach(item => {
        expect(item.collapsibleHeader.hasAttribute('tabindex')).to.be.false;
      });
    });

    beforeEach(function() {
      this.item = this.items[0];
      this.collapsible = new Collapsible(this.item.collapsible);
      this.group = new CollapsibleGroup(this.toggleButton, [this.collapsible]);

      this.collapsible.onOpen = chai.spy(this.collapsible.onOpen);
      this.collapsible.onClose = chai.spy(this.collapsible.onClose);
    });

    describe('and all of the items are closed', function() {
      describe('when an item is opened', function() {
        beforeEach(function() {
          this.collapsible.setOpen(true);
        });

        it('onOpen should be called', function() {
          expect(this.collapsible.onOpen).to.have.been.called();
        });

        describe('when an item is called to be opened a second time', function() {
          beforeEach(function() {
            this.collapsible.onOpen = chai.spy(this.collapsible.onOpen);
            this.collapsible.setOpen(true);
          });

          it('nothing should happen', function() {
            expect(this.collapsible.onOpen).to.not.have.been.called();
          });
        });

        describe('and toggle is called within the same event loop', function() {
          beforeEach(function() {
            this.collapsible.setOpen = chai.spy(this.collapsible.setOpen);
            this.collapsible.toggle(eventMock());
          });

          it('nothing should happen', function() {
            expect(this.collapsible.setOpen).to.not.have.been.called();
          });
        });
      });

      describe('when the toggle button is clicked', function() {
        beforeEach(function() {
          this.mockedEvent = eventMock();

          this.group.handleButtonClick(this.mockedEvent);
        });

        it('prevent default should be called on the click event', function() {
          expect(this.mockedEvent.preventDefault).to.have.been.called();
        });
      });
    });

    describe('and an item is open', function() {
      beforeEach(function(done) {
        this.collapsible.setOpen(true);
        setTimeout(done);
      });

      describe('when the item is closed', function() {
        beforeEach(function() {
          this.collapsible.setOpen(false);
        });

        it('onClose should be called', function() {
          expect(this.collapsible.onClose).to.have.been.called();
        });
      });
    });
  });
});

function renderComponent(params) {
  const html = renderTemplate('components/accordion/_test-template.njk', { params });

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);

  const toggleButton = wrapper.querySelector('.js-collapsible-all');

  const items = [...wrapper.querySelectorAll('.js-collapsible')].map(collapsible => {
    const collapsibleHeader = collapsible.querySelector('.js-collapsible-heading');
    const content = collapsible.querySelector('.js-collapsible-content');
    const button = collapsible.querySelector('.js-collapsible-button');

    return {
      collapsible,
      collapsibleHeader,
      content,
      button,
    };
  });

  return {
    wrapper,
    toggleButton,
    items,
  };
}
