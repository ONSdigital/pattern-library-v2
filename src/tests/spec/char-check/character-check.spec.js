import CharCheck from '../../../components/char-check-limit/character-check';
import renderTemplate from '../../helpers/render-template';

const params = {
  id: 'search-field',
  type: 'number',
  classes: 'input--w-6',
  label: {
    text: 'Filter results',
  },
  searchButton: {
    text: 'Filter',
  },
  charCheckLimit: {
    charcheckCountdown: true,
    limit: 11,
    charCountOverLimitSingular: '{x} number too many',
    charCountOverLimitPlural: '{x} numbers too many',
    charCountSingular: 'You have {x} character remaining',
    charCountPlural: 'You have {x} characters remaining',
  },
};

describe('Component: Input with character check', () => {
  let wrapper, searchWrapper, searchInput, limit_readout;

  beforeEach(() => {
    const html = renderTemplate('components/search/_test-template.njk', { params });

    wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);

    searchWrapper = document.querySelector('.js-char-check-input');
    searchInput = document.getElementById(params.id);
    limit_readout = document.getElementById(`${params.id}-check-remaining`);

    new CharCheck(searchWrapper);
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.remove();
    }
  });

  describe('Given that the char check helper has initialised correctly', () => {
    it('the char check readout should be invisible', () => {
      expect(limit_readout.classList.contains('u-d-no')).to.equal(true);
    });

    it('then the character limit readout should reflect the number of characters remaining', () => {
      expect(limit_readout.innerHTML).to.equal(params.charCheckLimit.charCountPlural.replace('{x}', params.charCheckLimit.limit));
    });
  });

  describe('Given that the user has not typed into the search input', () => {
    describe('when the user types into the search input', () => {
      const value = '1';
      beforeEach(() => {
        populateSearchInput(searchInput, value);
      });

      it('then the characters remaining readout reflect the number of characters remaining', () => {
        expect(limit_readout.innerHTML).to.equal(
          params.charCheckLimit.charCountPlural.replace('{x}', params.charCheckLimit.limit - value.length),
        );
      });

      it('the char check readout should be visible', () => {
        expect(limit_readout.classList.contains('u-d-no')).to.equal(false);
      });
    });

    describe('when the user types something into the input', () => {
      let value = '1';

      beforeEach(() => {
        populateSearchInput(searchInput, value);
      });

      it('then aria-live should be set to polite', () => {
        expect(limit_readout.getAttribute('aria-live')).to.equal('polite');
      });
    });

    describe('when the user reaches the charcheck limit of the input', () => {
      let value = '11111111111';

      beforeEach(() => {
        populateSearchInput(searchInput, value);
      });

      it('the char check readout should be invisible', () => {
        expect(limit_readout.classList.contains('u-d-no')).to.equal(true);
      });
    });

    describe('when the user has 1 character remaining before the limit is reached', () => {
      let value = '1111111111';

      beforeEach(() => {
        populateSearchInput(searchInput, value);
      });

      it('then the characters remaining readout reflect the number of characters remaining', () => {
        let remaining = params.charCheckLimit.limit - value.length;
        expect(limit_readout.innerHTML).to.equal(params.charCheckLimit.charCountSingular.replace('{x}', Math.abs(remaining)));
      });
    });
  });

  describe('Given that the user has exceeded the charcheck limit of the input by 1', () => {
    let value = '111111111111';

    beforeEach(() => {
      populateSearchInput(searchInput, value);
    });

    it('the char check readout should be visible', () => {
      expect(limit_readout.classList.contains('u-d-no')).to.equal(false);
    });

    it('then the characters remaining readout reflect the number of characters exceeded', () => {
      let remaining = params.charCheckLimit.limit - value.length;
      expect(limit_readout.innerHTML).to.equal(params.charCheckLimit.charCountOverLimitSingular.replace('{x}', Math.abs(remaining)));
    });

    it('then aria-live should be set to assertive', () => {
      expect(limit_readout.getAttribute('aria-live')).to.equal('assertive');
    });

    it('then the input and readout should be given limit reached classes', () => {
      expect(searchInput.classList.contains('input--limit-reached')).to.equal(true);
      expect(limit_readout.classList.contains('input__limit--reached')).to.equal(true);
    });
  });

  describe('Given that the user has exceeded the charcheck limit of the input by more than 1', () => {
    let value = '1111111111111';

    beforeEach(() => {
      populateSearchInput(searchInput, value);
    });

    it('the char check readout should be visible', () => {
      expect(limit_readout.classList.contains('u-d-no')).to.equal(false);
    });

    it('then the characters remaining readout reflect the number of characters exceeded', () => {
      let remaining = params.charCheckLimit.limit - value.length;
      expect(limit_readout.innerHTML).to.equal(params.charCheckLimit.charCountOverLimitPlural.replace('{x}', Math.abs(remaining)));
    });

    it('then aria-live should be set to assertive', () => {
      expect(limit_readout.getAttribute('aria-live')).to.equal('assertive');
    });

    it('then the input and readout should be given limit reached classes', () => {
      expect(searchInput.classList.contains('input--limit-reached')).to.equal(true);
      expect(limit_readout.classList.contains('input__limit--reached')).to.equal(true);
    });
  });

  describe('Given that the input value is cleared programatically', () => {
    beforeEach(() => {
      populateSearchInput(searchInput);
      populateSearchInput(searchInput, '');

      it('then aria-live attribute should not be added', () => {
        expect(limit_readout.hasAttribute('aria-live')).to.be.false;
      });
    });
  });
});

function populateSearchInput(searchInput, value = '1') {
  searchInput.value = value;
  const event = new CustomEvent('input');
  event.inputType = 'unitTest';
  searchInput.dispatchEvent(event);
}
