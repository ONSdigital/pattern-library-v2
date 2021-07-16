import UAC from '../../../components/access-code/uac';
import renderTemplate from '../../helpers/render-template';

const params = {
  id: 'uac',
  name: 'uac',
  label: {
    text: 'Enter the 16 character code printed on the letter',
    description: 'Keep this code safe and only share it with others in your household',
  },
  securityMessage: 'Your personal information is protected by law and will be kept confidential.',
};

describe('Component: UAC Input', () => {
  let wrapper, input, instance;

  beforeEach(() => {
    const html = renderTemplate('components/access-code/_test-template.njk', { params });

    wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);

    input = document.getElementById(params.id);

    instance = new UAC(input);
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.remove();
    }
  });

  describe('Given that the input is empty, when the user inputs characters', () => {
    beforeEach(() => {
      input.value = '0000000000000000';
      instance.handleInput();
    });

    it('they should be spaced out in groups of 4', () => {
      expect(input.value).to.equal('0000 0000 0000 0000');
    });
  });

  describe('Given that the user has already inputted a value, when they delete or change a value', () => {
    beforeEach(() => {
      input.value = '0000 000 0000 0000';

      input.setSelectionRange(5, 5);

      instance.handleInput();
    });

    it('then the cursors position should not change', () => {
      expect(input.selectionStart).to.equal(5);
    });
  });

  describe('Given that the input is empty, when an input event is triggered with no new value', () => {
    beforeEach(() => {
      instance.handleInput();
    });

    it('then the replacement function should not error', () => {
      let error = false;

      window.onerror = () => {
        error = true;
      };

      expect(error).to.equal(false);
    });
  });
});
