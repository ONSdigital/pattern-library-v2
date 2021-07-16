import domready from '../../js/domready';

async function cookiesBanner() {
  const cookiesBanner = [...document.querySelectorAll('.cookies-banner')];

  if (cookiesBanner.length) {
    const CookiesBanner = (await import('./cookies-banner')).default;
    cookiesBanner.forEach(banner => {
      new CookiesBanner(banner);
    });
  }
}

domready(cookiesBanner);
