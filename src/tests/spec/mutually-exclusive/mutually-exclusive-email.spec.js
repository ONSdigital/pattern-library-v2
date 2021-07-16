import MutuallyExclusive from '../../../components/mutually-exclusive/mutually-exclusive';
import renderTemplate from '../../helpers/render-template';

const params = {
  id: 'email',
  type: 'email',
  label: {
    text: 'Enter an email',
  },
  mutuallyExclusive: {
    or: 'Or',
    deselectMessage: 'Selecting this will clear your email',
    deselectGroupAdjective: 'cleared',
    deselectCheckboxAdjective: 'deselected',
    checkbox: {
      id: 'email-checkbox',
      name: 'no-email',
      value: 'no-email',
      label: {
        text: 'I dont want to receive a confirmation email',
      },
    },
  },
};

describe('Component: Mutually Exclusive Email Input', () => {
  let wrapper, component, input, checkbox, ariaAlert;

  beforeEach(() => {
    const html = renderTemplate('components/input/_test-template.njk', { params });

    wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);

    component = document.querySelector('.js-mutually-exclusive');
    input = document.getElementById(params.id);
    checkbox = document.getElementById(params.mutuallyExclusive.checkbox.id);
    ariaAlert = document.querySelector('.js-exclusive-alert');

    new MutuallyExclusive(component);
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.remove();
    }
  });

  describe('Given the user populated the email input', () => {
    beforeEach(() => {
      populateInput(input);
    });

    describe('when the user clicks the mutually exclusive option', () => {
      beforeEach(() => {
        checkbox.click();
      });

      it('then the email input should be cleared', () => {
        expect(input.value).to.equal('');
      });

      it('then the aria alert should tell the user that the email input has been cleared', done => {
        setTimeout(() => {
          expect(ariaAlert.innerHTML).to.equal(`${params.label.text} ${params.mutuallyExclusive.deselectGroupAdjective}.`);
          done();
        }, 300);
      });
    });
  });

  describe('Given the user has checked the mutually exclusive checkbox', () => {
    beforeEach(() => {
      checkbox.click();
    });

    describe('when the user populates the email input', () => {
      beforeEach(() => {
        populateInput(input);
      });

      it('then the checkbox should be unchecked', () => {
        expect(checkbox.checked).to.equal(false);
      });

      it('then the aria alert should tell the user that the checkbox has been unchecked', done => {
        setTimeout(() => {
          expect(ariaAlert.innerHTML).to.equal(
            `${params.mutuallyExclusive.checkbox.label.text} ${params.mutuallyExclusive.deselectCheckboxAdjective}.`,
          );
          done();
        }, 300);
      });
    });
  });

  describe('Given the user has not populated the email input or checked the checkbox', () => {
    describe('when the user populates the email input', () => {
      beforeEach(() => {
        populateInput(input);
      });

      it('then the aria alert shouldnt say anything', done => {
        setTimeout(() => {
          expect(ariaAlert.innerHTML).to.equal('');
          done();
        }, 300);
      });
    });

    describe('when the user clicks the mutually exclusive option', () => {
      beforeEach(() => {
        checkbox.click();
      });

      it('then the aria alert shouldnt say anything', done => {
        setTimeout(() => {
          expect(ariaAlert.innerHTML).to.equal('');
          done();
        }, 300);
      });
    });
  });
});

function populateInput(input) {
  input.value = 'email@email.com';
  const event = new CustomEvent('input');
  input.dispatchEvent(event);
}
