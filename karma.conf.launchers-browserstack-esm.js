// https://www.browserstack.com/automate/capabilities

export default {
  browsers: [
    'bs_iphone_11_pro',
    'bs_google_pixel_4',
    'bs_mac_chrome',
    // 'bs_mac_firefox',
    'bs_mac_safari',
    'bs_windows_10_IE_edge',
    'bs_windows_10_chrome',
    // 'bs_windows_10_firefox',
  ],

  customLaunchers: {
    /**
     * iOS
     */
    bs_iphone_11_pro: {
      base: 'BrowserStack',
      device: 'iPhone 11 Pro',
      os: 'ios',
      os_version: '13',
      real_mobile: true,
    },

    /**
     * Android
     */
    bs_google_pixel_4: {
      base: 'BrowserStack',
      device: 'Google Pixel 4',
      os: 'android',
      os_version: '11.0',
      real_mobile: true,
    },

    /**
     * OS X
     */
    bs_mac_chrome: {
      base: 'BrowserStack',
      browser: 'chrome',
      browser_version: 'latest',
      os: 'OS X',
      os_version: 'Catalina',
    },
    // bs_mac_firefox: {
    //   base: 'BrowserStack',
    //   browser: 'firefox',
    //   browser_version: '70.0',
    //   os: 'OS X',
    //   os_version: 'High Sierra',
    // },
    bs_mac_safari: {
      base: 'BrowserStack',
      browser: 'safari',
      browser_version: '13.0',
      os: 'OS X',
      os_version: 'Catalina',
    },

    /**
     * Windows
     */
    bs_windows_10_IE_edge: {
      base: 'BrowserStack',
      os: 'Windows',
      os_version: '10',
      browser: 'Edge',
      browser_version: 'latest',
    },
    bs_windows_10_chrome: {
      base: 'BrowserStack',
      os: 'Windows',
      os_version: '10',
      browser: 'Chrome',
      browser_version: 'latest',
    },
    // bs_windows_10_firefox: {
    //   base: 'BrowserStack',
    //   os: 'Windows',
    //   os_version: '10',
    //   browser: 'firefox',
    //   browser_version: '56.0',
    // },
  },
};
