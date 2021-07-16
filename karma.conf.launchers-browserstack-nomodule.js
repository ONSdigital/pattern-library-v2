// https://www.browserstack.com/automate/capabilities

export default {
  browsers: ['bs_windows_10_IE_11'],

  customLaunchers: {
    /**
     * Windows
     */
    bs_windows_10_IE_11: {
      base: 'BrowserStack',
      os: 'Windows',
      os_version: '10',
      browser: 'IE',
      browser_version: '11',
    },
  },
};
