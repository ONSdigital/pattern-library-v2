import { cookie, setConsentCookie, setCookie, setDefaultConsentCookie } from '../../../js/cookies-functions';
import CookiesSettings from '../../../js/cookies-settings';

describe('Component: Cookie settings', function() {
  beforeEach(function() {
    const component = renderComponent();
    Object.keys(component).forEach(key => {
      this[key] = component[key];
    });
  });

  afterEach(function() {
    if (this.wrapper) {
      this.wrapper.remove();
    }
  });

  describe('setInitialFormValues', function() {
    it('sets a consent cookie by default', function() {
      new CookiesSettings(this.form);

      const setDefaultConsentCookieSpy = chai.spy(setDefaultConsentCookie);
      expect(setDefaultConsentCookieSpy).to.have.been.called;
    });

    it('sets all radio buttons to the default values', function() {
      new CookiesSettings(this.form);

      const radioButtons = this.form[0].querySelectorAll('input[value=on]');
      const consentCookieJSON = JSON.parse(cookie('ons_cookie_policy').replace(/'/g, '"'));
      for (let i = 0; i < radioButtons.length; i++) {
        const name = radioButtons[i].name.replace('cookies-', '');

        if (consentCookieJSON[name]) {
          expect(radioButtons[i].checked).to.be.true();
        } else {
          expect(radioButtons[i].checked).not.to.be.true();
        }
      }
    });
  });

  describe('submitSettingsForm', function() {
    it('updates consent cookie with any changes', function() {
      new CookiesSettings(this.form);

      const setConsentCookieSpy = chai.spy(setConsentCookie);
      this.form.querySelector('#settings-on').checked = true;
      this.form.querySelector('#settings-off').checked = false;

      const button = this.form.querySelector('#submit-button');
      button.click();

      expect(setConsentCookieSpy).to.have.been.called;
    });
  });

  it('sets ons_cookie_message_displayed cookie on form submit', function() {
    new CookiesSettings(this.form);

    const setCookieSpy = chai.spy(setCookie);

    cookie('ons_cookie_message_displayed', null);
    expect(cookie('ons_cookie_message_displayed')).to.equal(null);

    const button = this.form.querySelector('#submit-button');
    button.click();

    expect(setCookieSpy).to.have.been.called;
    expect(cookie('ons_cookie_message_displayed')).to.equal('true');
  });

  it('hides the cookie banner on form submit', function() {
    new CookiesSettings(this.form);

    const banner = document.querySelector('.cookies-banner');

    const button = this.form.querySelector('#submit-button');
    button.click();

    expect(banner.style.display).to.equal('none');
  });

  describe('showConfirmationMessage', function() {
    it('shows a confirmation message', function() {
      new CookiesSettings(this.form);

      const confirmationMessage = document.querySelector('.cookies-confirmation-message');
      const button = this.form.querySelector('#submit-button');
      button.click();

      expect(confirmationMessage.classList.contains('u-d-no')).to.be.false;
    });
  });
});

function renderComponent() {
  const formHTML =
    '<div class="cookies-banner" style="display: block;">' +
    '</div>' +
    '<form data-module="cookie-settings">' +
    '<input type="radio" id="settings-on" name="cookies-settings" value="on">' +
    '<input type="radio" id="settings-off" name="cookies-settings" value="off">' +
    '<input type="radio" name="cookies-usage" value="on">' +
    '<input type="radio" name="cookies-usage" value="off">' +
    '<input type="radio" name="cookies-campaigns" value="on">' +
    '<input type="radio" name="cookies-campaigns" value="off">' +
    '<button id="submit-button" type="submit">Submit</button>' +
    '</form>' +
    '<div class="cookies-confirmation-message u-d-no">' +
    '<a class="js-return-link" href="#">Return to previous page</a>' +
    '</div>';

  const wrapper = document.createElement('div');
  wrapper.innerHTML = formHTML;
  document.body.appendChild(wrapper);

  const form = wrapper.querySelector('[data-module=cookie-settings]');

  return {
    wrapper,
    form,
  };
}
