import Radios from '../../../components/checkboxes/checkboxes';
import CheckRadios from '../../../components/radios/check-radios';
import ClearRadios from '../../../components/radios/clear-radios';
import renderTemplate from '../../helpers/render-template';

const params = {
  name: 'contact-preference',
  clearRadios: {
    text: 'Clear selection',
    url: '/',
    ariaClearText: 'You can clear your answer by clicking the clear selection button under the radio buttons',
    ariaClearedText: 'You have cleared your answer',
  },
  radios: [
    {
      id: 'email',
      value: 'email',
      label: {
        text: 'Email',
      },
      other: {
        id: 'email-other',
        type: 'email',
        label: {
          text: 'Enter your email address',
        },
      },
    },
    {
      id: 'phone',
      value: 'phone',
      label: {
        text: 'Phone',
      },
      other: {
        id: 'tel-other',
        type: 'tel',
        label: {
          text: 'Enter your phone number',
        },
      },
    },
    {
      id: 'text',
      value: 'Open input test',
      label: {
        text: 'Text',
      },
      other: {
        id: 'text-other',
        type: 'text',
        open: true,
        label: {
          text: 'Enter something else',
        },
      },
    },
  ],
};

describe('Component: Radios', function() {
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

  describe('Before the component initialises', function() {
    it('if a radio has an other option that is not open, it should be given the correct aria-attributes', function() {
      let i = 0;
      this.radios.forEach(radio => {
        i++;
        if (radio[i] < radio.length) {
          expect(radio.hasAttribute('aria-haspopup')).to.equal(true);
          expect(radio.getAttribute('aria-haspopup')).to.equal('true');
          expect(radio.hasAttribute('aria-controls')).to.equal(true);
          expect(radio.getAttribute('aria-controls')).to.equal(`${radio.id}-other-wrap`);
        }
      });
    });
  });

  describe('When the component initialises', function() {
    beforeEach(function() {
      new Radios(this.radios);
      new ClearRadios(this.radios, this.button, this.otherInput);
      new CheckRadios(this.radioInput, this.openOther);
    });

    it('radios with other options should be given aria-expanded attributes', function() {
      let i = 0;
      this.radios.forEach(radio => {
        i++;
        if (radio[i] < radio.length) {
          expect(radio.hasAttribute('aria-expanded')).to.equal(true);
          expect(radio.getAttribute('aria-expanded')).to.equal('false');
        }
      });
    });

    describe('and a radio checked', function() {
      beforeEach(function() {
        this.radios[0].click();
      });

      // eslint-disable-next-line prettier/prettier
      it("then the checked radio's aria-expanded attribute should be set to true", function() {
        expect(this.radios[0].getAttribute('aria-expanded')).to.equal('true');
      });

      // eslint-disable-next-line prettier/prettier
      it("then the unchecked radios' aria-expanded attribute should be set to false", function() {
        let i = 0;
        this.radios
          .filter(radio => !radio.checked)
          .forEach(radio => {
            if (radio[i] < radio.length) {
              expect(radio.getAttribute('aria-expanded')).to.equal('false');
            }
          });
      });

      it('then the clear button should be visible', function() {
        expect(this.button.classList.contains('u-db-no-js_enabled')).to.equal(false);
      });

      it('then the aria live message should announce that the answer can be cleared', function(done) {
        const ariaElement = document.querySelector('.js-clear-radio-alert');
        setTimeout(() => {
          expect(ariaElement.innerHTML).to.equal(`${params.clearRadios.ariaClearText}`);
          done();
        }, 300);
      });

      describe('and the radio selection is changed', function() {
        beforeEach(function() {
          this.radios[1].click();
        });

        // eslint-disable-next-line prettier/prettier
        it("then the checked radio's aria-expanded attribute should be set to true", function() {
          expect(this.radios[1].getAttribute('aria-expanded')).to.equal('true');
        });

        // eslint-disable-next-line prettier/prettier
        it("then the unchecked radios' aria-expanded attribute should be set to false", function() {
          let i = 0;
          this.radios
            .filter(radio => !radio.checked)
            .forEach(radio => {
              if (radio[i] < radio.length) {
                expect(radio.getAttribute('aria-expanded')).to.equal('false');
              }
            });
        });
      });
    });

    describe('and the clear button is clicked', function() {
      beforeEach(function() {
        this.button.click();
      });

      it('then the clear button should not be visible', function() {
        expect(this.button.classList.contains('u-db-no-js_enabled')).to.equal(true);
      });

      it('then the aria live message should announce that the answer has been cleared', function(done) {
        const ariaElement = document.querySelector('.js-clear-radio-alert');
        setTimeout(() => {
          expect(ariaElement.innerHTML).to.equal(`${params.clearRadios.ariaClearedText}`);
          done();
        }, 300);
      });

      it('then all radios should not be checked', function() {
        this.radios.forEach(radio => {
          expect(radio.checked).to.equal(false);
        });
      });

      it('then all other input fields should be empty', function() {
        const parent = this.otherInput.parentNode;
        this.otherField = parent.querySelector('.input');
        expect(this.otherField.value).to.equal('');
      });
    });

    // This test can sometimes fail if the browser window isn't focused when the test runs.
    describe('and there is a visible input which is focused', function() {
      beforeEach(function() {
        this.input = this.openOther.querySelector('.input');
        this.input.focus();
      });

      it('then the radio button should be checked', function(done) {
        setTimeout(() => {
          expect(this.radioInput.checked).to.equal(true);
          done();
        }, 300);
      });
    });

    describe('and there is a visible input and the radio is checked', function() {
      beforeEach(function() {
        this.input = this.openOther.querySelector('.input');
        this.radioInput.click();
      });

      it('then the input should have a tab index of 0', function(done) {
        setTimeout(() => {
          expect(this.input.getAttribute('tabindex')).to.equal('0');
          done();
        }, 300);
      });
    });
  });
});

function renderComponent(params) {
  const html = renderTemplate('components/radios/_test-template.njk', { params });

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);

  const radios = [...wrapper.querySelectorAll('.js-radio')];
  const button = document.querySelector('.js-clear-btn');
  const otherInput = document.querySelector('.radio__other');
  const openOther = document.querySelector('.radio__other--open');
  const parent = openOther.parentNode;
  const radioInput = parent.querySelector('.radio__input');
  return {
    wrapper,
    radios,
    button,
    otherInput,
    openOther,
    radioInput,
  };
}
