import CookiesBanner from '../../../components/cookies-banner/cookies-banner';
import { approveAllCookieTypes, cookie, setCookie } from '../../../js/cookies-functions';

describe('Component: Cookie banner', function() {
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

  it('should show the cookie banner', function() {
    new CookiesBanner(this.banner);
    const setupCookiesEventsSpy = chai.spy(CookiesBanner.setupCookiesEvents);
    const showCookiesMessageSpy = chai.spy(CookiesBanner.showCookiesMessage);
    expect(setupCookiesEventsSpy).to.have.been.called;
    expect(showCookiesMessageSpy).to.have.been.called;

    expect(this.banner.style.display).to.equal('block');
  });

  it('sets all cookies to true when accepting cookies', function() {
    new CookiesBanner(this.banner);
    const approveAllCookieTypesSpy = chai.spy(approveAllCookieTypes);

    const button = this.banner.querySelector('.js-accept-cookies');
    button.click();

    expect(approveAllCookieTypesSpy).to.have.been.called;
    const cookieJSON = JSON.parse(cookie('ons_cookie_policy').replace(/'/g, '"'));
    expect(cookieJSON).to.contain({ essential: true, settings: true, usage: true, campaigns: true });
  });

  it('sets seen cookie message when accepting cookies', function() {
    new CookiesBanner(this.banner);
    const setConsentCookieSpy = chai.spy(CookiesBanner.setCookiesConsent);

    const button = this.banner.querySelector('.js-accept-cookies');
    button.click();

    expect(cookie('ons_cookie_message_displayed')).to.equal('true');
    expect(setConsentCookieSpy).to.have.been.called;
  });

  it('should hide the primary message when pressing the accept link', function() {
    new CookiesBanner(this.banner);
    const hideCookiesMessageSpy = chai.spy(CookiesBanner.hidePrimaryCookiesBanner);

    const button = this.banner.querySelector('.js-accept-cookies');
    button.click();

    const primaryBanner = this.banner.querySelector('.cookies-banner__primary');
    expect(primaryBanner.style.display).to.equal('none');
    expect(hideCookiesMessageSpy).to.have.been.called;
  });

  it('should show the secondary message when pressing the accept button', function() {
    new CookiesBanner(this.banner);

    const button = this.banner.querySelector('.js-accept-cookies');
    button.click();

    const secondaryBanner = this.banner.querySelector('.cookies-banner__confirmation');
    expect(secondaryBanner.classList.contains('u-d-no')).to.equal(false);
  });

  it('sets all radios to on from off', function() {
    new CookiesBanner(this.banner);

    const button = this.banner.querySelector('.js-accept-cookies');
    button.click();

    const radios = [...this.form.querySelectorAll('input[value=on]')];
    radios.forEach(radio => {
      expect(radio.checked).to.be.true;
    });
  });

  it('should hide the secondary message when pressing the hide button', function() {
    new CookiesBanner(this.banner);
    const hideCookiesMessageSpy = chai.spy(CookiesBanner.hideConfirmBanner);

    const button = this.banner.querySelector('.js-hide-button');
    button.click();

    expect(this.banner.style.display).to.equal('none');
    expect(hideCookiesMessageSpy).to.have.been.called;
  });

  it('does not show the banner if user has acknowledged the banner previously and consent cookie is present', function() {
    setCookie('ons_cookie_message_displayed', 'true');

    expect(this.banner.style.display).to.equal('');
  });
});

function renderComponent() {
  const formHTML =
    '<div class="cookies-banner">' +
    '<div class="container cookies-banner__primary">' +
    '<div class="grid">' +
    '<div class="grid__col col-8@m">' +
    '<h2 class="cookies-banner__title u-mb-xs">Tell us whether you accept cookies</h2>' +
    '<p class="cookies-banner__desc">We use cookies to collect information about how you use census.gov.uk. We use this information to make the website work as well as possible and improve our services.</p>' +
    '<button type="button" class="btn btn--small js-accept-cookies u-mb-xs@xxs@s cookies-banner__btn">' +
    '<span class="btn__inner">Accept all cookies</span>' +
    '</button>' +
    '<a href="#" role="button" class="btn btn--secondary btn--small u-ml-no@xxs@s cookies-banner__btn btn--link">' +
    '<span class="btn__inner">Cookie settings</span>' +
    '</a>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div class="container cookies-banner__confirmation u-d-no">' +
    '<div class="grid grid--flex grid--between grid--gutterless grid--no-wrap@s grid--vertical-center">' +
    '<div class="grid__col grid__col--flex col-auto u-flex-shrink@s">' +
    '<p class="cookies-banner__desc u-mb-no@s u-mr-s@s">You’ve accepted all cookies. You can <a href="#">change your cookie settings</a> at any time.</p>' +
    '</div>' +
    '<div class="grid__col">' +
    '<button type="button" class="btn btn--secondary btn--small js-hide-button">' +
    '<span class="btn__inner">Hide</span>' +
    '</button>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<form data-module="cookie-settings">' +
    '<input type="radio" class="js-radio" id="settings-on" name="cookies-settings" value="on">' +
    '<input type="radio" class="js-radio" id="settings-off" name="cookies-settings" value="off">' +
    '<input type="radio" class="js-radio" name="cookies-usage" value="on">' +
    '<input type="radio" class="js-radio" name="cookies-usage" value="off">' +
    '<input type="radio" class="js-radio" name="cookies-campaigns" value="on">' +
    '<input type="radio" class="js-radio" name="cookies-campaigns" value="off">' +
    '<button id="submit-button" type="submit">Submit</button>' +
    '</form>' +
    '<div class="cookies-confirmation-message u-d-no">' +
    '<a class="js-return-link" href="#">Return to previous page</a>' +
    '</div>';

  const wrapper = document.createElement('div');

  wrapper.innerHTML = formHTML;
  document.body.appendChild(wrapper);
  const banner = wrapper.querySelector('.cookies-banner');
  const form = wrapper.querySelector('form');

  return {
    wrapper,
    banner,
    form,
  };
}
