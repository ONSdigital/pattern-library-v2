import {
  approveAllCookieTypes,
  checkConsentCookie,
  checkConsentCookieCategory,
  cookie,
  getConsentCookie,
  getCookie,
  getDomain,
  setConsentCookie,
  setCookie,
  setDefaultConsentCookie,
} from '../../../js/cookies-functions';

describe('Component: Cookie functions', function() {
  it('returns the cookie value if not provided with a value to set', function() {
    cookie('ons_cookie_message_displayed', 'testing fetching cookie value');

    cookie('ons_cookie_message_displayed');

    expect(cookie('ons_cookie_message_displayed')).to.equal('testing fetching cookie value');
  });

  it('can create a new cookie', function() {
    cookie('ons_cookie_message_displayed', null);
    expect(getCookie('ons_cookie_message_displayed')).to.equal(null);

    cookie('ons_cookie_message_displayed', 'test');

    expect(getCookie('ons_cookie_message_displayed')).to.equal('test');
  });

  it('sets a default expiry of 30 days if no options are provided', function() {
    const setCookieSpy = chai.spy(setCookie);
    cookie('ons_cookie_message_displayed', null);
    expect(getCookie('ons_cookie_message_displayed')).to.equal(null);

    cookie('ons_cookie_message_displayed', 'test');

    expect(setCookieSpy).to.have.been.called;
    expect(getCookie('ons_cookie_message_displayed')).to.contain('test', { days: 30 });
  });

  it('sets the expiry if one is provided', function() {
    const setCookieSpy = chai.spy(setCookie);

    cookie('ons_cookie_message_displayed', null);
    expect(getCookie('ons_cookie_message_displayed')).to.equal(null);

    cookie('ons_cookie_message_displayed', 'test', { days: 100 });

    expect(setCookieSpy).to.have.been.called;
    expect(getCookie('ons_cookie_message_displayed')).to.contain('test', { days: 100 });
  });

  it('can change the value of an existing cookie', function() {
    cookie('ons_cookie_message_displayed', 'test1');

    expect(getCookie('ons_cookie_message_displayed')).to.equal('test1');

    cookie('ons_cookie_message_displayed', 'test2');

    expect(getCookie('ons_cookie_message_displayed')).to.contain('test2');
  });

  it('deletes the cookie if value is set to false', function() {
    cookie('ons_cookie_message_displayed', false);

    expect(getCookie('ons_cookie_message_displayed')).to.equal(null);
  });

  it('deletes the cookie if value is set to null', function() {
    cookie('ons_cookie_message_displayed', null);
    expect(getCookie('ons_cookie_message_displayed')).to.equal(null);
  });
});

describe('consent cookie methods', function() {
  it('can set the consent cookie to default values', function() {
    const setCookieSpy = chai.spy(setCookie);
    cookie('ons_cookie_policy', null);
    expect(getCookie('ons_cookie_policy')).to.equal(null);

    setDefaultConsentCookie();

    expect(setCookieSpy).to.have.been.called;
    const cookieJSON = JSON.parse(cookie('ons_cookie_policy').replace(/'/g, '"'));
    expect(cookieJSON).to.contain({ essential: true, settings: false, usage: false, campaigns: false });
  });

  it('can set the consent cookie to approve all cookie categories', function() {
    const setCookieSpy = chai.spy(setCookie);

    setConsentCookie({ usage: false, essential: false });

    expect(getConsentCookie().essential).to.equal(false);
    expect(getConsentCookie().usage).to.equal(false);
    approveAllCookieTypes();

    expect(setCookieSpy).to.have.been.called;
    const cookieJSON = JSON.parse(cookie('ons_cookie_policy').replace(/'/g, '"'));
    expect(cookieJSON).to.contain({ essential: true, settings: true, usage: true, campaigns: true });
  });

  it('returns null if the consent cookie does not exist', function() {
    cookie('ons_cookie_policy', null);
    expect(getConsentCookie()).to.equal(null);
  });

  it('deletes relevant cookies in that category if consent is set to false', function() {
    setConsentCookie({ essential: true });

    setCookie('ons_cookie_message_displayed', 'this is an essential cookie');

    expect(cookie('ons_cookie_message_displayed')).to.equal('this is an essential cookie');

    const setCookieSpy = chai.spy(setCookie);
    const getDomainSpy = chai.spy(getDomain);

    setConsentCookie({ essential: false });
    expect(setCookieSpy).to.have.been.called;
    expect(getDomainSpy).to.have.been.called;
    expect(getCookie('ons_cookie_policy')).to.contain("{'essential':false,'settings':false,'usage':false,'campaigns':false}");

    expect(cookie('ons_cookie_message_displayed')).to.equal(null);
  });
});

describe('check cookie consent', function() {
  it('returns true if trying to set the consent cookie', function() {
    expect(checkConsentCookie('ons_cookie_policy', { essential: true })).to.equal(true);
  });

  it('returns true if deleting a cookie', function() {
    expect(checkConsentCookie('test_cookie', null)).to.equal(true);
    expect(checkConsentCookie('test_cookie', false)).to.equal(true);
  });

  it('does not set a default consent cookie if one is not present', function() {
    cookie('ons_cookie_policy', null);

    checkConsentCookieCategory('ons_cookie_message_displayed', true);

    expect(getConsentCookie()).to.equal(null);
  });

  it('returns true if the consent cookie does not exist and the cookie name is recognised', function() {
    expect(getConsentCookie()).to.equal(null);

    expect(checkConsentCookie('ons_cookie_message_displayed', true)).to.equal(true);
  });

  it('returns false if the consent cookie does not exist and the cookie name is not recognised', function() {
    expect(getConsentCookie()).to.equal(null);

    expect(checkConsentCookie('fake_cookie')).to.equal(false);
  });

  it('returns the consent for a given cookie', function() {
    setConsentCookie({ usage: false });

    expect(checkConsentCookie('_ga', 'set a usage cookie')).to.equal(false);

    setConsentCookie({ usage: true });

    expect(checkConsentCookie('_ga', 'set a usage cookie')).to.equal(true);
  });

  it('denies consent for cookies not in our list of cookies', function() {
    expect(checkConsentCookie('fake_cookie', 'just for testing')).to.equal(false);
  });
});
