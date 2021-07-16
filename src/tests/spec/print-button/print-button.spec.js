import printButton from '../../../js/print-button';
import renderTemplate from '../../helpers/render-template';

const params = {
  id: 'button',
  type: 'button',
  text: 'Print this page',
  buttonStyle: 'print',
};

describe('Function: Print Button ', function() {
  let wrapper, buttonElement;

  beforeEach(() => {
    const html = renderTemplate('components/button/_test-template.njk', { params });

    wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);

    buttonElement = document.getElementById(params.id);
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.remove();
    }
  });

  describe('Before the button is initialised', () => {
    it('Button should have relevant classes', () => {
      expect(buttonElement.classList.contains('btn--print')).to.be.true;
      expect(buttonElement.classList.contains('u-d-no')).to.be.true;
      expect(buttonElement.classList.contains('js-print-btn')).to.be.true;
    });

    it('Button should be type button', () => {
      expect(buttonElement.getAttribute('type')).to.equal('button');
    });
  });

  describe('Once the button is initialised', () => {
    beforeEach(() => {
      printButton();
    });

    it('Button should be made visible', () => {
      expect(buttonElement.classList.contains('u-d-no')).to.be.false;
    });

    describe('and the button is clicked', () => {
      let printSpy;
      let originalPrintFunction = window.print;
      beforeEach(() => {
        printSpy = chai.spy();
        window.print = printSpy;

        buttonElement.click();
      });

      afterEach(() => {
        window.print = originalPrintFunction;
      });

      it('preventDefault should be called on the event', () => {
        expect(printSpy).to.have.been.called();
      });
    });
  });
});
