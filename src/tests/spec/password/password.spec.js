import Password from '../../../components/password/password';
import renderTemplate from '../../helpers/render-template';

const params = {
  id: 'password',
  label: {
    text: 'Password',
  },
  showPasswordText: 'Show password',
};

describe('Component: Password', () => {
  let wrapper, component, checkboxWrap, checkbox, input;

  beforeEach(() => {
    const html = renderTemplate('components/password/_test-template.njk', { params });

    wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);

    component = wrapper.querySelector('.js-password');
    checkboxWrap = component.querySelector('.js-password-toggle-wrap');
    checkbox = document.getElementById(`${params.id}-toggle`);
    input = document.getElementById(params.id);

    new Password(component);
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.remove();
    }
  });

  describe('Given the component has loaded', () => {
    it('checkbox should be visible', () => {
      expect(checkboxWrap.classList.contains('u-d-no')).to.equal(false);
    });
  });

  describe('Given the user has not toggled to "Show password"', () => {
    describe('when the user toggles to show password', () => {
      beforeEach(() => {
        checkbox.click();
      });

      it('the input type should change to text', () => {
        expect(input.type).to.equal('text');
      });
    });
  });

  describe('Given the user has toggled to "Show password"', () => {
    beforeEach(() => {
      checkbox.click();
    });

    describe('when the user toggles to hide the password', () => {
      beforeEach(() => {
        checkbox.click();
      });

      it('the input type should change to password', () => {
        expect(input.type).to.equal('password');
      });
    });
  });
});
