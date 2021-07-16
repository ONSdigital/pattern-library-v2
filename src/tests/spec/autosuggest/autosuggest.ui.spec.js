import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiSpies from 'chai-spies';
import proxyquireify from 'proxyquireify';

import AutosuggestUI, {
  classAutosuggestHasResults,
  classAutosuggestOption,
  classAutosuggestOptionFocused,
  classAutosuggestOptionMoreResults,
  classAutosuggestOptionNoResults,
} from '../../../components/autosuggest/autosuggest.ui';
import renderTemplate from '../../helpers/render-template';
import eventMock from '../../stubs/event.stub.spec';
import fetchMock from '../../stubs/window.fetch.stub.spec';

const proxyquire = proxyquireify(require);

chai.should();
chai.use(chaiSpies);
chai.use(chaiAsPromised);

const params = {
  id: 'country-of-birth',
  label: {
    text: 'Enter the current name of the country',
    classes: 'js-autosuggest-label',
  },
  autocomplete: 'off',
  instructions:
    'Use up and down keys to navigate suggestions once youve typed more than two characters. Use the enter key to select a suggestion. Touch device users, explore by touch or with swipe gestures.',
  ariaYouHaveSelected: 'You have selected',
  ariaMinChars: 'Enter 3 or more characters for suggestions.',
  ariaOneResult: 'There is one suggestion available.',
  ariaNResults: 'There are {n} suggestions available.',
  ariaLimitedResults: 'Results have been limited to 10 suggestions. Enter more characters to improve your search.',
  moreResults: 'Continue entering to improve suggestions',
  resultsTitle: 'Suggestions',
  noResults: 'No results found',
  autosuggestData:
    'https://gist.githubusercontent.com/rmccar/c123023fa6bd1b137d7f960c3ffa1fed/raw/4dede1d6e757cf0bb836228600676c62ceb4f86c/country-of-birth.json',
  typeMore: 'Enter more of the address to get results',
  tooManyResults: '{n} results found. Enter more of the address to improve results.',
  errorTitle: 'There is a problem with your answer',
  errorMessage: 'Enter an address ',
  errorMessageAPI: 'Sorry, there is a problem. We are working to fix it. Please try again later or',
};

describe('Autosuggest.ui component', function() {
  describe('Before the component initialises', function() {
    beforeEach(function() {
      const component = renderComponent(params);
      Object.keys(component).forEach(key => {
        this[key] = component[key];
      });
    });

    afterEach(function() {
      if (this.wrapper) {
        this.wrapper.remove();
      }
    });

    it('aria attributes should not present yet', function() {
      const inputHasAriaAttributes = !![...this.input.attributes].find(attribute => attribute.name.includes('aria'));
      expect(inputHasAriaAttributes).to.be.false;
      expect(this.input.hasAttribute('role')).to.be.false;
    });

    it('the instructions, listbox, and status should be display none', function() {
      expect(getComputedStyle(this.instructions).display).to.equal('none');
      expect(getComputedStyle(this.listbox).display).to.equal('none');
      expect(getComputedStyle(this.status).display).to.equal('none');
    });
  });

  describe('When the component initialises', function() {
    beforeEach(function() {
      const component = renderComponent(params);

      Object.keys(component).forEach(key => {
        this[key] = component[key];
      });

      this.autosuggest = new AutosuggestUI({
        context: this.context,
        onSelect: async () => {},
        onUnsetResult: async () => {},
      });
    });

    afterEach(function() {
      if (this.wrapper) {
        this.wrapper.remove();
      }
    });

    it('the input should be given the correct aria attributes', function() {
      expect(this.input.getAttribute('aria-autocomplete')).to.equal('list');
      expect(this.input.getAttribute('aria-controls')).to.equal(this.listbox.getAttribute('id'));
      expect(this.input.getAttribute('aria-describedby')).to.equal(this.instructions.getAttribute('id'));
      expect(this.input.getAttribute('aria-haspopup')).to.equal('true');
      expect(this.input.getAttribute('aria-owns')).to.equal(this.listbox.getAttribute('id'));
      expect(this.input.getAttribute('aria-expanded')).to.equal('false');
      expect(this.input.getAttribute('role')).to.equal('combobox');
    });

    it('the autocomplete attribute be set to be not set to on', function() {
      expect(this.input.getAttribute('autocomplete')).to.be.oneOf(['off', 'null', undefined, '', '']);
    });

    it('the instructions, listbox, and status should become visible', function() {
      expect(getComputedStyle(this.instructions).display).to.equal('block');
      expect(getComputedStyle(this.listbox).display).to.equal('block');
      expect(getComputedStyle(this.status).display).to.equal('block');
    });

    describe('and the user presses the Up Arrow key', function() {
      beforeEach(function() {
        this.mockedEvent = eventMock({ keyCode: 38 });
        this.spy = chai.spy.on(this.autosuggest, 'navigateResults');
        this.autosuggest.handleKeydown(this.mockedEvent);
      });

      it('then preventDefault should be called on the event', function() {
        expect(this.mockedEvent.preventDefault).to.have.been.called();
      });

      it('then navigate results (up) should be called', function() {
        expect(this.spy).to.have.been.called.with.exactly(-1);
      });
    });

    describe('and the user presses the Down Arrow key', function() {
      beforeEach(function() {
        this.mockedEvent = eventMock({ keyCode: 40 });
        this.spy = chai.spy.on(this.autosuggest, 'navigateResults');
        this.autosuggest.handleKeydown(this.mockedEvent);
      });

      it('then preventDefault should be called on the event', function() {
        expect(this.mockedEvent.preventDefault).to.have.been.called();
      });

      it('then navigate results (down) should be called', function() {
        expect(this.spy).to.have.been.called.with.exactly(1);
      });
    });

    describe('and the user presses the Enter key', function() {
      beforeEach(function() {
        this.mockedEvent = eventMock({ keyCode: 13 });
        this.autosuggest.handleKeydown(this.mockedEvent);
      });

      it('then preventDefault should be called on the event', function() {
        expect(this.mockedEvent.preventDefault).to.have.been.called();
      });
    });

    describe('and the user presses any other key', function() {
      beforeEach(function() {
        this.mockedEvent = eventMock({ key: 'g' });
        this.autosuggest.handleKeydown(this.mockedEvent);
      });

      it('then preventDefault should not have been called on the event', function() {
        expect(this.mockedEvent.preventDefault).to.not.have.been.called();
      });
    });

    describe('and the user releases the Up Arrow key', function() {
      beforeEach(function() {
        this.mockedEvent = eventMock({ keyCode: 38 });
        this.autosuggest.handleKeyup(this.mockedEvent);
      });

      it('then preventDefault should be called on the event', function() {
        expect(this.mockedEvent.preventDefault).to.have.been.called();
      });
    });

    describe('and the user releases the Down Arrow key', function() {
      beforeEach(function() {
        this.mockedEvent = eventMock({ keyCode: 40 });
        this.autosuggest.handleKeyup(this.mockedEvent);
      });

      it('then preventDefault should be called on the event', function() {
        expect(this.mockedEvent.preventDefault).to.have.been.called();
      });
    });

    describe('and the user presses the Enter key', function() {
      beforeEach(function() {
        this.mockedEvent = eventMock({ keyCode: 13 });
        this.spy = chai.spy.on(this.autosuggest, 'selectResult');
        this.autosuggest.handleKeyup(this.mockedEvent);
      });

      it('then navigate results (down) should be called', function() {
        expect(this.spy).to.have.been.called.with.exactly();
      });
    });

    describe('and the user blurs the input', function() {
      beforeEach(function() {
        this.suggestionSpy = chai.spy.on(this.autosuggest, 'getSuggestions');
        this.originalClearTimout = window.clearTimeout;
        this.clearTimeoutSpy = chai.spy.on(window, 'clearTimeout');
        this.originalSetTimout = window.setTimeout;
        this.setTimeoutSpy = chai.spy.on(window, 'setTimeout');
        this.blurTimeout = this.autosuggest.blurTimeout;
      });

      afterEach(function() {
        window.clearTimeout = this.originalClearTimout;
        window.setTimeout = this.originalSetTimout;
      });

      it('then the blurTimout should be cleared', function() {
        this.autosuggest.handleBlur();

        expect(this.clearTimeoutSpy).to.have.been.called.with.exactly(this.blurTimeout);
      });

      it('then blurring should be set to true', function() {
        this.autosuggest.handleBlur();

        expect(this.autosuggest.blurring).to.be.true;
      });

      it('then the blur timeout should be reset', function() {
        this.autosuggest.handleBlur();

        expect(this.setTimeoutSpy).to.have.been.called();
      });

      it('bluring should be set to true and then false 300ms later', function(done) {
        this.autosuggest.handleBlur();

        expect(this.autosuggest.blurring).to.be.true;

        setTimeout(() => {
          expect(this.autosuggest.blurring).to.be.false;
          done();
        }, 300);
      });
    });

    describe('and the user inputs', function() {
      beforeEach(function() {
        this.getSuggestionsSpy = chai.spy.on(this.autosuggest, 'getSuggestions');
        this.abortFetchSpy = chai.spy.on(this.autosuggest, 'abortFetch');
      });

      describe('if the input is not currently blurring and the input has a value', function() {
        beforeEach(function(done) {
          this.autosuggest.blurring = false;
          this.autosuggest.input.value = 'Test test test';
          this.checkCharCountSpy = chai.spy.on(this.autosuggest, 'checkCharCount');

          setTimeout(() => {
            this.autosuggest.handleChange();
            done();
          });
        });

        it('then getSuggestions should be called', function() {
          expect(this.getSuggestionsSpy).to.have.been.called();
        });

        it('then checkCharCount should be called', function() {
          expect(this.checkCharCountSpy).to.have.been.called();
        });

        it('then settingResult should be false', function() {
          expect(this.autosuggest.settingResult).to.equal(false);
        });
      });

      describe('if the input has a value that is greater than 1 but less than the minimum characters', function() {
        beforeEach(function(done) {
          this.autosuggest.input.value = 'Te';
          this.handleNoResultsSpy = chai.spy.on(this.autosuggest, 'handleNoResults');
          setTimeout(() => {
            this.autosuggest.checkCharCount();
            done();
          });
        });

        it('then settingResult should be false', function() {
          expect(this.autosuggest.settingResult).to.equal(false);
        });
      });

      describe('if the input is not currently blurring and the input does not have a value', function() {
        beforeEach(function(done) {
          this.autosuggest.blurring = false;

          setTimeout(() => {
            this.autosuggest.handleChange();
            done();
          });
        });

        it('then abortFetch should be called', function() {
          expect(this.abortFetchSpy).to.have.been.called();
        });
      });

      describe('if the input is currently blurring and the input has a value', function() {
        beforeEach(function(done) {
          this.autosuggest.blurring = true;
          this.autosuggest.input.value = 'Test test test';

          setTimeout(() => {
            this.autosuggest.handleChange();
            done();
          });
        });

        it('then abortFetch should be called', function() {
          expect(this.abortFetchSpy).to.have.been.called();
        });
      });

      describe('if the input is currently blurring and the input does not have a value', function() {
        beforeEach(function(done) {
          this.autosuggest.blurring = true;

          setTimeout(() => {
            this.autosuggest.handleChange();
            done();
          });
        });

        it('then abortFetch should be called', function() {
          expect(this.abortFetchSpy).to.have.been.called();
        });
      });
    });

    describe('and suggestions are requested', function() {
      beforeEach(function() {
        this.unsetResultsSpy = chai.spy.on(this.autosuggest, 'unsetResults');
        this.setAriaStatusSpy = chai.spy.on(this.autosuggest, 'setAriaStatus');
        this.fetchSuggestionsSpy = chai.spy.on(this.autosuggest, 'fetchSuggestions');
        this.clearListboxSpy = chai.spy.on(this.autosuggest, 'clearListbox');
        this.handleResultsSpy = chai.spy.on(this.autosuggest, 'handleResults');
      });

      describe('if a result is being set', function() {
        beforeEach(function() {
          this.autosuggest.settingResult = true;
          this.autosuggest.getSuggestions();
        });

        getSuggestionsNothingRunTests();
      });

      describe('if the query hasnt changed', function() {
        beforeEach(function() {
          this.autosuggest.getSuggestions();
        });

        getSuggestionsNothingRunTests();
      });

      describe('if the query hasnt changed but force is set to true', function() {
        beforeEach(function() {
          this.autosuggest.getSuggestions(true);
        });

        it('then the results should be unset', function() {
          expect(this.unsetResultsSpy).to.have.been.called();
        });

        it('then the aria status should be set', function() {
          expect(this.setAriaStatusSpy).to.have.been.called();
        });
      });

      describe('if the query hasnt changed but force is set to true and a result is selected', function() {
        beforeEach(function() {
          this.autosuggest.resultSelected = true;
          this.autosuggest.getSuggestions(true);
        });

        getSuggestionsNothingRunTests();
      });

      describe('if the query has changed', function() {
        beforeEach(function(done) {
          this.input.value = 'Test';

          setTimeout(() => {
            this.autosuggest.getSuggestions();
            done();
          });
        });

        it('then the results should be unset', function() {
          expect(this.unsetResultsSpy).to.have.been.called();
        });
      });

      describe('if fetch suggestion returns results', function() {
        beforeEach(function() {
          this.autosuggest.handleResults({
            totalResults: 12,
            results: [
              {
                en: 'Testing',
                sanitisedText: 'testing',
              },
              {
                en: 'Afghanistan island',
                cy: 'Afghanistan',
              },
              {
                en: 'Aland islands',
                cy: 'ynysoedd Aland',
              },
              {
                en: 'Albania island',
                cy: 'Albania',
              },
              {
                en: 'Algeria island',
                cy: 'Algeria',
              },
              {
                en: 'American samoa island',
                cy: 'Samoa Americanaidd',
              },
              {
                en: 'Andorra island',
                cy: 'andorra',
              },
              {
                en: 'Angola island',
                cy: 'Angola',
              },
              {
                en: 'Anguilla island',
                cy: 'anguilla',
              },
              {
                en: 'Antarctica island',
                cy: 'Antarctica',
              },
              {
                en: 'Antarctica and oceania island',
                cy: 'Antarctica a oceania',
              },
              {
                en: 'Antigua and barbuda island',
                cy: 'Antigua a Barbuda',
              },
            ],
          });
        });

        it('then handleResults should be called', function() {
          expect(this.handleResultsSpy).to.have.been.called();
        });

        it('then only a maximum of 10 suggestions should be shown', function() {
          const resultsLength = this.autosuggest.listbox.getElementsByTagName('li').length - 1;
          expect(resultsLength).to.be.lessThan(11);
        });
      });

      describe('if fetch suggestion due to an abort error', function() {
        beforeEach(function(done) {
          this.input.value = 'Testing';

          this.autosuggest.fetchSuggestions = () => {
            return new Promise((resolve, reject) => {
              reject({
                name: 'AbortError',
              });
            });
          };

          this.autosuggest.getSuggestions();

          setTimeout(done);
        });
      });
    });

    describe('and results are fetched', function() {
      beforeEach(function() {
        this.abortFetchSpy = chai.spy.on(this.autosuggest, 'abortFetch');
        this.originalFetch = window.fetch;
      });

      afterEach(function() {
        window.fetch = this.originalFetch;
      });

      it('any running fetches should be aborted', function() {
        this.autosuggest.fetchSuggestions('yes');
        expect(this.abortFetchSpy).to.have.been.called();
      });

      describe('but the fetch errors', function() {
        beforeEach(function() {
          window.fetch = fetchMock(false);
        });

        it('then the function should reject', function() {
          return this.autosuggest.fetchSuggestions('yes').should.be.rejected;
        });
      });

      describe('and the fetch successfully returns', function() {
        beforeEach(function() {
          this.result = {
            results: [{ en: 'yes' }],
            totalResults: 1,
          };

          window.fetch = fetchMock(true, null, this.result);
        });

        it('then the function should resolve', function() {
          this.autosuggest.fetchSuggestions('yes').should.eventually.eql(this.result);
        });
      });

      describe('and the fetch successfully returns welsh results found from english names', function() {
        beforeEach(function() {
          this.result = {
            results: [{ en: 'Yes', cy: 'ie' }],
            totalResults: 1,
          };

          this.autosuggest.lang = 'cy';

          window.fetch = fetchMock(true, null, this.result);
        });

        it('then the function should resolve', function() {
          this.autosuggest.fetchSuggestions('yes').should.eventually.eql(this.result);
        });
      });
    });

    describe('and results are unset', function() {
      beforeEach(function() {
        this.autosuggest.results = [{ en: 'yes' }];
        this.autosuggest.resultOptions = ['<option>yes</option>'];
        this.autosuggest.resultSelected = true;
      });

      it('then results should be reset to an empty array', function() {
        this.autosuggest.unsetResults();
        expect(this.autosuggest.results).to.eql([]);
      });

      it('then resultOptions should be reset to an empty array', function() {
        this.autosuggest.unsetResults();
        expect(this.autosuggest.resultOptions).to.eql([]);
      });

      it('then resultSelected should be reset to false', function() {
        this.autosuggest.unsetResults();
        expect(this.autosuggest.resultSelected).to.be.false;
      });

      describe('and onUnsetResult is set', function() {
        beforeEach(function() {
          this.autosuggest.onUnsetResult = chai.spy(() => {});
        });

        it('then onUnsetResult should be called', function() {
          this.autosuggest.unsetResults();
          expect(this.autosuggest.onUnsetResult).to.have.been.called();
        });
      });
    });

    describe('and clearListbox is run', function() {
      beforeEach(function() {
        this.autosuggest.listbox.innerHTML = '<p>Yes</p>';
        this.autosuggest.context.classList.add('autosuggest-input--has-results');
        this.autosuggest.input.setAttribute('aria-activedescendant', 'yes');
        this.autosuggest.input.setAttribute('aria-expanded', 'true');

        this.setAriaStatusSpy = chai.spy.on(this.autosuggest, 'setAriaStatus');
      });

      it('then the listbox innerHTML should be cleared', function() {
        this.autosuggest.clearListbox();
        expect(this.autosuggest.listbox.innerHTML).to.equal('');
      });

      it('then the autosuggest--has-results should be removed', function() {
        this.autosuggest.clearListbox();
        expect(this.autosuggest.context.classList.contains('autosuggest-input--has-results')).to.be.false;
      });

      it('then the input aria-activedescendant attributes should be removed', function() {
        this.autosuggest.clearListbox();
        expect(this.autosuggest.input.hasAttribute('aria-activedescendant')).to.be.false;
      });

      it('then the input aria-expanded attributes should be removed', function() {
        this.autosuggest.clearListbox();
        expect(this.autosuggest.input.hasAttribute('aria-expanded')).to.be.false;
      });

      it('then setAriaStatus should be called', function() {
        this.autosuggest.clearListbox();
        expect(this.setAriaStatusSpy).to.have.been.called();
      });

      describe('and preventAriaStatusUpdate is set to true', function() {
        it('then setAriaStatus should not be called', function() {
          this.autosuggest.clearListbox(true);
          expect(this.setAriaStatusSpy).to.not.have.been.called();
        });
      });
    });

    describe('and navigateResults is run', function() {
      beforeEach(function() {
        this.autosuggest.numberOfResults = 3;
        this.setHighlightedResultSpy = chai.spy.on(this.autosuggest, 'setHighlightedResult');
      });

      describe('and the direction is 1', function() {
        describe('and the highlightedResultIndex is not set', function() {
          beforeEach(function() {
            this.autosuggest.highlightedResultIndex = null;
          });

          it('then setHighlightedResult should be called with an index of 0', function() {
            this.autosuggest.navigateResults(1);

            expect(this.setHighlightedResultSpy).to.have.been.called.with.exactly(0);
          });
        });

        describe('and the highlightedResultIndex is 0', function() {
          it('then setHighlightedResult should be called with the next index', function() {
            this.autosuggest.navigateResults(1);

            expect(this.setHighlightedResultSpy).to.have.been.called.with.exactly(1);
          });
        });

        describe('and the highlightedResultIndex is the same as the number of results', function() {
          beforeEach(function() {
            this.autosuggest.highlightedResultIndex = 2;
          });

          it('then setHighlightedResult should not be called', function() {
            this.autosuggest.navigateResults(1);

            expect(this.setHighlightedResultSpy).to.not.have.been.called();
          });
        });
      });

      describe('and the direction is -1', function() {
        describe('and the highlightedResultIndex is not set', function() {
          beforeEach(function() {
            this.autosuggest.highlightedResultIndex = null;
          });

          it('then setHighlightedResult should be called with an index of 0', function() {
            this.autosuggest.navigateResults(-1);

            expect(this.setHighlightedResultSpy).to.have.been.called.with.exactly(0);
          });
        });

        describe('and the highlightedResultIndex is 0', function() {
          it('then setHighlightedResult should be called with null', function() {
            this.autosuggest.navigateResults(-1);

            expect(this.setHighlightedResultSpy).to.have.been.called.with.exactly(null);
          });
        });

        describe('and the highlightedResultIndex is the same as the number of results', function() {
          beforeEach(function() {
            this.autosuggest.highlightedResultIndex = 2;
          });

          it('then setHighlightedResult should be called with the previous index', function() {
            this.autosuggest.navigateResults(-1);

            expect(this.setHighlightedResultSpy).to.have.been.called.with.exactly(1);
          });
        });
      });
    });

    describe('and the mouse moves over a result', function() {
      beforeEach(function() {
        this.autosuggest.highlightedResultIndex = 0;
        this.autosuggest.resultOptions = [1].map(() => {
          const option = document.createElement('option');
          option.className = classAutosuggestOptionFocused;

          return option;
        });

        this.autosuggest.handleMouseover();
      });

      it(`then the highlighted option's ${classAutosuggestOptionFocused} class should be removed`, function() {
        expect(this.autosuggest.resultOptions[0].classList.contains(classAutosuggestOptionFocused)).to.be.false;
      });
    });

    describe('and the mouse moves off a result', function() {
      beforeEach(function() {
        this.autosuggest.highlightedResultIndex = 0;
        this.autosuggest.resultOptions = [1].map(() => {
          const option = document.createElement('option');

          return option;
        });

        this.autosuggest.handleMouseout();
      });

      it(`then the highlighted option's ${classAutosuggestOptionFocused} class should be added`, function() {
        expect(this.autosuggest.resultOptions[0].classList.contains(classAutosuggestOptionFocused)).to.be.true;
      });
    });

    describe('and the highlighted result is set', function() {
      beforeEach(function() {
        this.autosuggest.input.setAttribute('aria-activedescendant', 'yes');
        this.setAriaStatusSpy = chai.spy.on(this.autosuggest, 'setAriaStatus');
      });

      it('then the highlightedResultsIndex should be set to match the passed index', function() {
        this.autosuggest.setHighlightedResult(1);
        expect(this.autosuggest.highlightedResultIndex).to.equal(1);
      });

      describe('if the index passed is null', function() {
        beforeEach(function() {
          this.autosuggest.setHighlightedResult(null);
        });

        it('then the aria-activedescendant attribute should be removed from the input', function() {
          expect(this.autosuggest.input.hasAttribute('aria-activedescendant')).to.be.false;
        });
      });

      describe('if there are no results', function() {
        it('then the function should return without running anything', function() {
          expect(this.setAriaStatusSpy).to.not.have.been.called();
        });
      });

      describe('if there are results', function() {
        beforeEach(function() {
          this.optionIndex = 1;
          this.autosuggest.resultOptions = [0, 1, 2].map(item => {
            const option = document.createElement('option');
            option.id = item;

            return option;
          });
          this.autosuggest.numberOfResults = this.autosuggest.resultOptions.length;
          this.autosuggest.setHighlightedResult(this.optionIndex);
        });

        it('the option with the same index as the passed index should be given a highlighted class', function() {
          expect(this.autosuggest.resultOptions[this.optionIndex].classList.contains(classAutosuggestOptionFocused)).to.be.true;
        });

        it('the option with the same index as the passed index should be given an aria-selected attribute', function() {
          expect(this.autosuggest.resultOptions[this.optionIndex].getAttribute('aria-selected')).to.equal('true');
        });

        it('the inputs aria-activedescendant attribute should be set to the id of the highlighted option', function() {
          expect(this.autosuggest.input.getAttribute('aria-activedescendant')).to.equal(this.optionIndex.toString());
        });

        it('the non highlighted options should not have the focused class', function() {
          this.autosuggest.resultOptions
            .filter((option, index) => index !== this.optionIndex)
            .forEach(option => {
              expect(option.classList.contains(classAutosuggestOptionFocused)).to.be.false;
            });
        });

        it('the non highlighted options should not have an aria-selected attribute', function() {
          this.autosuggest.resultOptions
            .filter((option, index) => index !== this.optionIndex)
            .forEach(option => {
              expect(option.hasAttribute('aria-selected')).to.be.false;
            });
        });

        it('setAriaStatus should be called', function() {
          expect(this.setAriaStatusSpy).to.have.been.called();
        });
      });
    });

    describe('and the aria status is set', function() {
      beforeEach(function() {
        this.autosuggest.ariaStatus.innerHTML = 'Yes';
        this.autosuggest.minChars = 2;
      });

      describe('if there is no content provided as an argument', function() {
        describe('and the query is too short', function() {
          beforeEach(function() {
            this.autosuggest.sanitisedQuery = '';
            this.autosuggest.setAriaStatus();
          });

          it('then the message should be set to type the minimum amount of characters', function() {
            expect(this.autosuggest.ariaStatus.innerHTML).to.equal(params.ariaMinChars);
          });
        });

        describe('and there are no results', function() {
          beforeEach(function() {
            this.autosuggest.query = 'Yes';
            this.autosuggest.sanitisedQuery = 'yes';
            this.autosuggest.numberOfResults = 0;
            this.autosuggest.setAriaStatus();
          });

          it('then the no results message should be set', function() {
            expect(this.autosuggest.ariaStatus.innerHTML).to.equal(`${params.noResults}: "${this.autosuggest.query}"`);
          });
        });

        describe('and there is one result', function() {
          beforeEach(function() {
            this.autosuggest.sanitisedQuery = 'yes';
            this.autosuggest.numberOfResults = 1;
            this.autosuggest.setAriaStatus();
          });

          it('then the one result message should be set', function() {
            expect(this.autosuggest.ariaStatus.innerHTML).to.equal(params.ariaOneResult);
          });
        });

        describe('and there are multiple results', function() {
          beforeEach(function() {
            this.autosuggest.sanitisedQuery = 'yes';
            this.autosuggest.numberOfResults = 3;
            this.autosuggest.setAriaStatus();
          });

          it('then the multiple results message should be set', function() {
            expect(this.autosuggest.ariaStatus.innerHTML).to.equal(params.ariaNResults.replace('{n}', this.autosuggest.numberOfResults));
          });
        });

        describe('and there are more results found than returned', function() {
          beforeEach(function() {
            this.autosuggest.sanitisedQuery = 'yes';
            this.autosuggest.numberOfResults = 3;
            this.autosuggest.resultLimit = 10;
            this.autosuggest.foundResults = 11;
            this.autosuggest.setAriaStatus();
          });

          it('then the multiple results message should be set', function() {
            expect(this.autosuggest.ariaStatus.innerHTML).to.equal(
              `${params.ariaNResults.replace('{n}', this.autosuggest.numberOfResults)} ${params.ariaLimitedResults}`,
            );
          });
        });
      });

      describe('if there content provided as an argument', function() {
        beforeEach(function() {
          this.autosuggest.setAriaStatus('Hello');
        });

        it('then the aria status should be set to the provided content', function() {
          expect(this.autosuggest.ariaStatus.innerHTML).to.equal('Hello');
        });
      });
    });

    describe('and a result is selected', function() {
      beforeEach(function() {
        this.onSelectSpy = chai.spy.on(this.autosuggest, 'onSelect');
        this.clearListboxSpy = chai.spy.on(this.autosuggest, 'clearListbox');
        this.setAriaStatusSpy = chai.spy.on(this.autosuggest, 'setAriaStatus');
      });

      describe('if there are no results', function() {
        beforeEach(function() {
          this.autosuggest.selectResult(0);
        });

        it('then the function should do nothing', function() {
          expect(this.onSelectSpy).to.not.have.been.called();
          expect(this.clearListboxSpy).to.not.have.been.called();
          expect(this.setAriaStatusSpy).to.not.have.been.called();
        });
      });

      describe('if there are results', function() {
        beforeEach(function() {
          this.autosuggest.sanitisedQuery = 'ye';
          this.autosuggest.results = [{ en: 'Yes', sanitisedText: 'yes' }];
          this.autosuggest.selectResult(0);
        });

        it('then resultSelected should be set to true', function() {
          expect(this.autosuggest.resultSelected).to.be.true;
        });

        it('then onSelect should be called', function() {
          expect(this.onSelectSpy).to.have.been.called();
        });

        it('then clearListbox should be called', function() {
          expect(this.clearListboxSpy).to.have.been.called();
        });

        it('then setAriaStatus should be called', function() {
          expect(this.setAriaStatusSpy).to.have.been.called.with.exactly(`${params.ariaYouHaveSelected}: Yes.`);
        });
      });
    });

    describe('and a result is emboldened', function() {
      describe('if the provided string includes the provided query', function() {
        it('then the match should be wrapped in strong tags', function() {
          expect(this.autosuggest.emboldenMatch('Aberdaugleddau', 'ABER')).to.equal('<strong>Aber</strong>daugleddau');
        });
      });

      describe('if the provided string does not include the provided query', function() {
        it('then the string should bre returned unmodified', function() {
          expect(this.autosuggest.emboldenMatch('yes', 'no')).to.equal('yes');
        });
      });
    });

    describe('and results are handled', function() {
      describe('if the user is currently deleting and there are no results', function() {
        beforeEach(function() {
          this.autosuggest.deleting = true;
        });

        describe('if there is "no results" content', function() {
          beforeEach(function() {
            this.autosuggest.handleResults({
              totalResults: 0,
              results: [],
            });
          });

          it('then the listbox innerHTML should show the no results message', function() {
            expect(this.autosuggest.listbox.innerHTML).to.equal(
              `<li class="${classAutosuggestOption} ${classAutosuggestOptionNoResults}">${params.noResults}</li>`,
            );
          });

          it('then the input aria-expanded attribute should be set to true', function() {
            expect(this.autosuggest.input.getAttribute('aria-expanded')).to.equal('true');
          });
        });

        describe('if there isnt any "no results" content', function() {
          beforeEach(function() {
            this.autosuggest.noResults = null;
            this.autosuggest.handleResults({
              totalResults: 0,
              results: [],
            });
          });

          it('then the listbox innerHTML should not be populated', function() {
            expect(this.autosuggest.listbox.innerHTML).to.equal('');
          });

          it('then the input aria-expanded attribute should be set to false', function() {
            expect(this.autosuggest.input.getAttribute('aria-expanded')).to.equal('false');
          });
        });
      });

      describe('if there are results', function() {
        describe('and there is only one result that exactly matches the user input', function() {
          beforeEach(function() {
            this.clearListboxSpy = chai.spy.on(this.autosuggest, 'clearListbox');
            this.selectResultSpy = chai.spy.on(this.autosuggest, 'selectResult');

            this.autosuggest.query = 'Yes';
            this.autosuggest.sanitisedQuery = 'yes';
            this.autosuggest.handleResults({
              totalResults: 1,
              results: [
                {
                  en: 'Yes',
                  sanitisedText: 'yes',
                },
              ],
            });
          });
        });

        describe('if there is more than one result', function() {
          beforeEach(function() {
            this.setHighlightedResultSpy = chai.spy.on(this.autosuggest, 'setHighlightedResult');

            this.autosuggest.query = 'Yes';
            this.autosuggest.sanitisedQuery = 'yes';
            this.autosuggest.handleResults({
              totalResults: 2,
              results: [
                {
                  en: 'Yes',
                  sanitisedText: 'yes',
                },
                {
                  en: 'Yes 2',
                  sanitisedText: 'yes 2',
                },
              ],
            });
          });

          it('then resultOptions should be generated', function() {
            const option1 = `<li class="${classAutosuggestOption}" id="${this.autosuggest.listboxId}__option--0" role="option" aria-label="Yes"><strong>Yes</strong></li>`;
            const option2 = `<li class="${classAutosuggestOption}" id="${this.autosuggest.listboxId}__option--1" role="option" aria-label="Yes 2"><strong>Yes</strong> 2</li>`;
            const html = option1 + option2;

            expect(this.autosuggest.listbox.innerHTML).to.equal(html);
          });

          it('then setHighlighted result should be called with null', function() {
            expect(this.setHighlightedResultSpy).to.have.been.called.with.exactly(null);
          });

          it('then aria-expanded should be true on the input', function() {
            expect(this.autosuggest.input.getAttribute('aria-expanded')).to.equal('true');
          });

          describe('when a result is clicked', function() {
            beforeEach(function() {
              this.selectResultSpy = chai.spy.on(this.autosuggest, 'onSelect');
              this.autosuggest.resultOptions[0].click();
            });

            it('then selectResult should be called', function() {
              expect(this.selectResultSpy).to.have.been.called();
            });
          });
        });

        describe('if there are more results found than returned', function() {
          beforeEach(function() {
            this.autosuggest.query = 'Yes';
            this.autosuggest.sanitisedQuery = 'yes';
            this.autosuggest.handleResults({
              totalResults: 3,
              results: [
                {
                  en: 'Yes',
                  sanitisedText: 'yes',
                },
                {
                  en: 'Yes',
                  sanitisedText: 'yes',
                },
              ],
            });
          });

          it('then the more results item should be added', function() {
            const option1 = `<li class="${classAutosuggestOption}" id="${this.autosuggest.listboxId}__option--0" role="option" aria-label="Yes"><strong>Yes</strong></li>`;
            const option2 = `<li class="${classAutosuggestOption}" id="${this.autosuggest.listboxId}__option--1" role="option" aria-label="Yes"><strong>Yes</strong></li>`;
            const option3 = `<li class="${classAutosuggestOption} ${classAutosuggestOptionMoreResults}" aria-hidden="true">${params.moreResults}</li>`;
            const html = option1 + option2 + option3;

            expect(this.autosuggest.listbox.innerHTML).to.equal(html);
          });

          it('then the context should be given the has results class', function() {
            expect(this.context.classList.contains(classAutosuggestHasResults)).to.be.true;
          });
        });
      });
    });

    describe('When there are no results due to an error', function() {
      describe('when the status code is 400', function() {
        beforeEach(function() {
          this.handleNoResultsSpy = chai.spy.on(this.autosuggest, 'handleNoResults');
          this.autosuggest.handleNoResults(400);
        });

        it('then the listbox innerHTML should show the type more message', function() {
          expect(this.autosuggest.listbox.innerHTML).to.equal(
            `<li class="${classAutosuggestOption} ${classAutosuggestOptionNoResults}">${params.typeMore}</li>`,
          );
          expect(this.handleNoResultsSpy).to.have.been.called();
        });
      });

      describe('when the status code is greater than 400', function() {
        beforeEach(function() {
          this.handleNoResultsSpy = chai.spy.on(this.autosuggest, 'handleNoResults');
          this.setAriaStatusSpy = chai.spy.on(this.autosuggest, 'setAriaStatus');
          this.createWarningSpy = chai.spy.on(this.autosuggest, 'createWarningElement');
          this.autosuggest.handleNoResults(401);
        });

        it('then the listbox innerHTML should show the API error message', function() {
          expect(this.autosuggest.listbox.textContent).to.equal('!' + params.errorMessageAPI);
          expect(this.createWarningSpy).to.have.been.called();
          expect(this.handleNoResultsSpy).to.have.been.called();
        });

        it('the input should be disabled', function() {
          expect(this.input.hasAttribute('disabled')).to.be.true;
        });

        it('the input value should be empty', function() {
          expect(this.input.value).to.equal('');
        });

        it('the label class should be added', function() {
          expect(this.label.classList.contains('u-lighter')).to.be.true;
        });

        it('then the aria status should be set', function() {
          expect(this.setAriaStatusSpy).to.have.been.called();
        });
      });

      describe('when there is no status code', function() {
        beforeEach(function() {
          this.handleNoResultsSpy = chai.spy.on(this.autosuggest, 'handleNoResults');
          this.setAriaStatusSpy = chai.spy.on(this.autosuggest, 'setAriaStatus');
          this.createWarningSpy = chai.spy.on(this.autosuggest, 'createWarningElement');
          this.autosuggest.handleNoResults('');
        });

        it('then the listbox innerHTML should show the API error message', function() {
          expect(this.autosuggest.listbox.textContent).to.equal('!' + params.errorMessageAPI);
          expect(this.createWarningSpy).to.have.been.called();
          expect(this.handleNoResultsSpy).to.have.been.called();
        });

        it('the input should be disabled', function() {
          expect(this.input.hasAttribute('disabled')).to.be.true;
        });

        it('the input value should be empty', function() {
          expect(this.input.value).to.equal('');
        });

        it('the label class should be added', function() {
          expect(this.label.classList.contains('u-lighter')).to.be.true;
        });

        it('then the aria status should be set', function() {
          expect(this.setAriaStatusSpy).to.have.been.called();
        });
      });
    });
  });

  describe('When the fetch is aborted', function() {
    beforeEach(function() {
      // Mock
      this.originalFetch = window.fetch;

      window.fetch = fetchMock(true);

      this.fetchSpy = chai.spy(require('../../../js/abortable-fetch').default);

      const mockedautosuggestUI = proxyquire('../../../components/autosuggest/autosuggest.ui', {
        '../../../js/abortable-fetch': {
          default: this.fetchSpy,
        },
      }).default;

      // Render
      const component = renderComponent(params);

      // Initialise
      Object.keys(component).forEach(key => {
        this[key] = component[key];
      });

      this.autosuggest = new mockedautosuggestUI({
        context: this.context,
        onSelect: () => {},
        onUnsetResult: () => {},
      });
    });

    afterEach(function() {
      window.fetch = this.originalFetch;

      if (this.wrapper) {
        this.wrapper.remove();
      }
    });

    describe('and fetch is not defined', function() {
      beforeEach(function() {
        this.autosuggest.fetch.status = 'undefined';
        this.abortSpy = chai.spy.on(this.autosuggest.fetch, 'abort');
        this.autosuggest.abortFetch();
      });

      it('then the function should return immediately', function() {
        expect(this.abortSpy).to.have.been.called();
      });
    });

    describe('and fetch is defined but the status is equal to DONE', function() {
      beforeEach(function() {
        this.autosuggest.fetch.status = 'DONE';
        this.abortSpy = chai.spy.on(this.autosuggest.fetch, 'abort');
        this.autosuggest.abortFetch();
      });

      it('then the function should return immediately', function() {
        expect(this.abortSpy).to.not.have.been.called();
      });
    });

    describe('and fetch is defined but the status is equal not to DONE', function() {
      beforeEach(function() {
        this.abortSpy = chai.spy.on(this.autosuggest.fetch, 'abort');
        this.autosuggest.abortFetch();
      });

      it('then the function should return immediately', function() {
        expect(this.abortSpy).to.have.been.called();
      });
    });
  });

  describe('When the component initialises with a custom suggestion function', function() {
    beforeEach(function() {
      const component = renderComponent(params);

      Object.keys(component).forEach(key => {
        this[key] = component[key];
      });

      this.customSuggestionFunctionSpy = chai.spy(async () => {});

      this.autosuggest = new AutosuggestUI({
        context: this.context,
        onSelect: async () => {},
        onUnsetResult: async () => {},
        suggestionFunction: this.customSuggestionFunctionSpy,
      });
    });

    afterEach(function() {
      if (this.wrapper) {
        this.wrapper.remove();
      }
    });

    describe('when getSuggestions is called', function() {
      beforeEach(function() {
        this.input.value = 'Yes';

        this.autosuggest.fetchSuggestions();
      });

      it('then the custom suggeston function should be called', function() {
        expect(this.customSuggestionFunctionSpy).to.have.been.called();
      });
    });
  });

  describe('When the component initialises with the allowMultiple parameter', function() {
    const paramsOptions = {
      id: 'country-of-birth',
      label: {
        text: 'Enter the current name of the country',
        classes: 'js-autosuggest-label',
      },
      autocomplete: 'off',
      allowMultiple: 'true',
      instructions:
        'Use up and down keys to navigate suggestions once youve typed more than two characters. Use the enter key to select a suggestion. Touch device users, explore by touch or with swipe gestures.',
      ariaYouHaveSelected: 'You have selected',
      ariaMinChars: 'Enter 3 or more characters for suggestions.',
      ariaOneResult: 'There is one suggestion available.',
      ariaNResults: 'There are {n} suggestions available.',
      ariaLimitedResults: 'Results have been limited to 10 suggestions. Enter more characters to improve your search.',
      moreResults: 'Continue entering to improve suggestions',
      resultsTitle: 'Suggestions',
      noResults: 'No results found',
      autosuggestData:
        'https://gist.githubusercontent.com/rmccar/c123023fa6bd1b137d7f960c3ffa1fed/raw/4dede1d6e757cf0bb836228600676c62ceb4f86c/country-of-birth.json',
      typeMore: 'Enter more of the address to get results',
      tooManyResults: '{n} results found. Enter more of the address to improve results.',
      errorTitle: 'There is a problem with your answer',
      errorMessage: 'Enter an address ',
      errorMessageAPI: 'Sorry, there is a problem. We are working to fix it. Please try again later or',
    };

    beforeEach(function(done) {
      const component = renderComponent(paramsOptions);

      Object.keys(component).forEach(key => {
        this[key] = component[key];
      });

      this.autosuggest = new AutosuggestUI({
        context: this.context,
        onSelect: async () => {},
        onUnsetResult: async () => {},
      });
      done();
    });

    afterEach(function() {
      if (this.wrapper) {
        this.wrapper.remove();
      }
    });

    describe('when a result is selected', function() {
      beforeEach(function(done) {
        this.autosuggest.sanitisedQuery = 'ye';
        this.autosuggest.results = [{ en: 'Yes', sanitisedText: 'yes' }];
        this.autosuggest.selectResult(0);
        this.input.value = 'Yes';
        this.autosuggest.handleFocus();
        setTimeout(done);
      });

      it('the allSelections array should be updated with the selection', function() {
        expect(this.autosuggest.allSelections).to.contain('Yes');
      });

      it('the input value should contain a comma when focused', function() {
        expect(this.input.value).to.equal('Yes, ');
      });
    });

    describe('when the user blurs the input', function() {
      beforeEach(function(done) {
        this.autosuggest.allSelections = ['Yes'];
        this.input.value = 'Yes, ';
        this.autosuggest.handleBlur();
        setTimeout(done);
      });

      it('the input value should not contain a comma', function() {
        expect(this.input.value).to.equal('Yes');
      });
    });

    describe('when the input contains selected results and a new query', function() {
      beforeEach(function(done) {
        this.autosuggest.allSelections = ['Yes', 'Hello'];
        this.input.value = 'Yes, Hello, Something';
        this.autosuggest.getSuggestions();
        setTimeout(done);
      });

      it('the query should only contain the new query', function() {
        expect(this.autosuggest.query).to.equal('Something');
      });
    });
  });
});

function renderComponent(params) {
  const html = renderTemplate('components/autosuggest/_test-template.njk', { params });

  const wrapper = document.createElement('div');

  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);

  const context = wrapper.querySelector('.js-autosuggest');
  const input = context.querySelector('.js-autosuggest-input');
  const label = wrapper.querySelector('.js-autosuggest-label');
  const resultsContainer = context.querySelector('.js-autosuggest-results');
  const listbox = context.querySelector('.js-autosuggest-listbox');
  const instructions = context.querySelector('.js-autosuggest-instructions');
  const status = context.querySelector('.js-autosuggest-aria-status');
  return {
    wrapper,
    context,
    input,
    label,
    resultsContainer,
    listbox,
    instructions,
    status,
  };
}

function getSuggestionsNothingRunTests() {
  it('then the function should return immediately without running anything else', function() {
    expect(this.unsetResultsSpy).to.not.have.been.called();
    expect(this.setAriaStatusSpy).to.not.have.been.called();
    expect(this.fetchSuggestionsSpy).to.not.have.been.called();
    expect(this.clearListboxSpy).to.not.have.been.called();
    expect(this.handleResultsSpy).to.not.have.been.called();
  });
}
