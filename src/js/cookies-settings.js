import { unset } from 'lodash';

import { cookie, setConsentCookie, setCookie, setDefaultConsentCookie } from './cookies-functions';

export default class CookiesSettings {
  constructor(component) {
    this.component = component;
    this.returnLink = document.querySelector('.js-return-link');
    this.confirmationMessage = document.querySelector('.cookies-confirmation-message');
    this.cookiesBanner = document.querySelector('.cookies-banner');

    this.component.addEventListener('submit', this.submitSettingsForm.bind(this));
    this.returnLink.addEventListener('click', this.goBackToPrevPage.bind(this));

    this.setInitialFormValues();
  }

  setInitialFormValues() {
    if (!cookie('ons_cookie_policy')) {
      setDefaultConsentCookie();
    }

    const currentConsentCookie = cookie('ons_cookie_policy');
    let currentConsentCookieJSON = JSON.parse(currentConsentCookie.replace(/'/g, '"'));

    try {
      unset(currentConsentCookieJSON, 'essential');
    } catch (e) {
      console.error(e);
    }

    for (let cookieType in currentConsentCookieJSON) {
      let radioButton;

      if (currentConsentCookieJSON[cookieType]) {
        radioButton = document.querySelector('input[name=cookies-' + cookieType + '][value=on]');
      } else {
        radioButton = document.querySelector('input[name=cookies-' + cookieType + '][value=off]');
      }

      radioButton.checked = true;
    }
  }

  submitSettingsForm(event) {
    event.preventDefault();

    if (!cookie('ons_cookie_message_displayed')) {
      setCookie('ons_cookie_message_displayed', true, { days: 365 });
    }

    const formInputs = event.target.getElementsByTagName('input');
    let options = {};

    for (let i = 0; i < formInputs.length; i++) {
      const input = formInputs[i];
      if (input.checked) {
        const name = input.name.replace('cookies-', '');
        const value = input.value === 'on' ? true : false;

        options[name] = value;

        if (name === 'usage' && value === true) {
          if (typeof loadGTM != 'undefined') {
            loadGTM();
          }
        }
      }
    }

    setConsentCookie(options);

    this.showConfirmationMessage();
    this.hideCookiesBanner();

    return false;
  }

  showConfirmationMessage() {
    this.confirmationMessage.classList.remove('u-d-no');
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    this.setConfirmationMessageAttributes();
  }

  hideCookiesBanner() {
    if (this.cookiesBanner) {
      this.cookiesBanner.style.display = 'none';
    }
  }

  setConfirmationMessageAttributes() {
    this.confirmationMessage.setAttribute('role', 'alert');
    if (document.referrer != '') {
      this.confirmationMessage.setAttribute('autofocus', 'autofocus');
      this.confirmationMessage.setAttribute('tabindex', '-1');
      this.confirmationMessage.focus();
    } else {
      this.returnLink.style.display = 'none';
    }
  }

  goBackToPrevPage() {
    window.history.back();
  }
}
