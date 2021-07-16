import SubmitButton from '../../../components/button/button';
import renderTemplate from '../../helpers/render-template';

describe('Function: Loader Button ', function() {
  let wrapper, buttonElement;

  let params = {
    id: 'button',
    text: 'Submit',
    submitType: 'loader',
  };

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
      expect(buttonElement.classList.contains('btn--loader')).to.be.true;
      expect(buttonElement.classList.contains('js-loader')).to.be.true;
      expect(buttonElement.classList.contains('js-submit-btn')).to.be.true;
    });
  });

  describe('Once the button is initialised', () => {
    beforeEach(() => {
      new SubmitButton(buttonElement, params.submitType);
    });

    it('Button disabled attribute should not be set', () => {
      expect(buttonElement.getAttribute('disabled')).to.not.exist;
    });

    describe('and the button is clicked', () => {
      beforeEach(() => {
        buttonElement.click();
      });

      it('Button should have loading style applied', () => {
        expect(buttonElement.classList.contains('is-loading')).to.be.true;
      });

      it('Button should be disabled', () => {
        expect(buttonElement.getAttribute('disabled')).to.equal('true');
      });
    });
  });
});

describe('Function: Timer Button ', function() {
  let wrapper, buttonElement;

  let params = {
    id: 'button',
    text: 'Submit',
    submitType: 'timer',
  };

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
      expect(buttonElement.classList.contains('btn--loader')).to.be.false;
      expect(buttonElement.classList.contains('js-timer')).to.be.true;
      expect(buttonElement.classList.contains('js-submit-btn')).to.be.true;
    });
  });

  describe('Once the button is initialised', () => {
    beforeEach(() => {
      new SubmitButton(buttonElement, params.submitType);
    });

    it('Button disabled attribute should not be set', () => {
      expect(buttonElement.getAttribute('disabled')).to.not.exist;
    });

    describe('and the button is clicked', () => {
      beforeEach(() => {
        buttonElement.click();
      });

      it('Button should not have loading style applied', () => {
        expect(buttonElement.classList.contains('is-loading')).to.be.false;
      });

      it('Button should be disabled', () => {
        expect(buttonElement.getAttribute('disabled')).to.equal('true');
      });

      it('after the timer the button disabled attribute should not be set', done => {
        setTimeout(() => {
          expect(buttonElement.getAttribute('disabled')).to.not.exist;
          done();
        }, 1500);
      });
    });
  });
});
