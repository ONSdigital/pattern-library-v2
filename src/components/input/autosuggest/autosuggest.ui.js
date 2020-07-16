import dice from 'dice-coefficient';
import { sortBy } from 'sort-by-typescript';

import queryJson from './code.list.searcher';
import { sanitiseAutosuggestText } from './autosuggest.helpers';
import fetch from 'js/abortable-fetch';

export const baseClass = 'js-autosuggest';

export const classAutosuggestOption = 'autosuggest-input__option';
export const classAutosuggestOptionFocused = `${classAutosuggestOption}--focused`;
export const classAutosuggestOptionNoResults = `${classAutosuggestOption}--no-results u-fs-s`;
export const classAutosuggestOptionMoreResults = `${classAutosuggestOption}--more-results u-fs-s`;
export const classAutosuggestHasResults = 'autosuggest-input--has-results';
export const classAutosuggestResultsTitle = 'autosuggest-input__results-title';

export default class AutosuggestUI {
  constructor({
    context,
    autosuggestData,
    sanitisedQueryReplaceChars,
    minChars,
    resultLimit,
    suggestOnBoot,
    onSelect,
    onError,
    onUnsetResult,
    suggestionFunction,
    handleUpdate,
    lang,
    ariaYouHaveSelected,
    ariaMinChars,
    ariaOneResult,
    ariaNResults,
    ariaLimitedResults,
    moreResults,
    resultsTitle,
    noResults,
  }) {
    // DOM Elements
    this.context = context;
    this.input = context.querySelector(`.${baseClass}-input`);
    this.resultsContainer = context.querySelector(`.${baseClass}-results`);
    this.listbox = this.resultsContainer.querySelector(`.${baseClass}-listbox`);
    this.instructions = context.querySelector(`.${baseClass}-instructions`);
    this.ariaStatus = context.querySelector(`.${baseClass}-aria-status`);
    // Settings
    this.autosuggestData = autosuggestData || context.getAttribute('data-autosuggest-data');
    this.ariaYouHaveSelected = ariaYouHaveSelected || context.getAttribute('data-aria-you-have-selected');
    this.ariaMinChars = ariaMinChars || context.getAttribute('data-aria-min-chars');
    this.ariaOneResult = ariaOneResult || context.getAttribute('data-aria-one-result');
    this.ariaNResults = ariaNResults || context.getAttribute('data-aria-n-results');
    this.ariaLimitedResults = ariaLimitedResults || context.getAttribute('data-aria-limited-results');
    this.moreResults = moreResults || context.getAttribute('data-more-results');
    this.resultsTitle = resultsTitle || context.getAttribute('data-results-title');
    this.noResults = noResults || context.getAttribute('data-no-results');

    this.listboxId = this.listbox.getAttribute('id');
    this.minChars = minChars || 3;
    this.resultLimit = resultLimit || 10;
    this.suggestOnBoot = suggestOnBoot;
    this.lang = lang || 'en-gb';

    // Callbacks
    this.onSelect = onSelect;
    this.onUnsetResult = onUnsetResult;
    this.onError = onError;
    this.handleUpdate = handleUpdate;

    if (suggestionFunction) {
      this.fetchSuggestions = suggestionFunction;
    } else {
      this.fetchData();
    }

    // State
    this.ctrlKey = false;
    this.deleting = false;
    this.query = '';
    this.sanitisedQuery = '';
    this.previousQuery = '';
    this.results = [];
    this.resultOptions = [];
    this.data = [];
    this.foundResults = 0;
    this.numberOfResults = 0;
    this.highlightedResultIndex = 0;
    this.settingResult = false;
    this.resultSelected = false;
    this.blurring = false;
    this.blurTimeout = null;
    this.sanitisedQueryReplaceChars = sanitisedQueryReplaceChars || [];

    // Temporary fix as runner doesn't use full lang code
    if (this.lang === 'en') {
      this.lang = 'en-gb';
    }

    this.initialiseUI();
  }

  initialiseUI() {
    this.input.setAttribute('aria-autocomplete', 'list');
    this.input.setAttribute('aria-controls', this.listbox.getAttribute('id'));
    this.input.setAttribute('aria-describedby', this.instructions.getAttribute('id'));
    this.input.setAttribute('aria-has-popup', true);
    this.input.setAttribute('aria-owns', this.listbox.getAttribute('id'));
    this.input.setAttribute('aria-expanded', false);
    this.input.setAttribute('autocomplete', this.input.getAttribute('data-autocomplete') || 'zz');
    this.input.setAttribute('role', 'combobox');

    this.context.classList.add('autosuggest-input--initialised');

    this.bindEventListeners();
  }

  fetchData() {
    return new Promise((resolve, reject) => {
      fetch(this.autosuggestData)
        .then(async response => {
          this.data = await response.json();
          resolve(this.data);
        })
        .catch(reject);
    });
  }

  bindEventListeners() {
    this.input.addEventListener('keydown', this.handleKeydown.bind(this));
    this.input.addEventListener('keyup', this.handleKeyup.bind(this));
    this.input.addEventListener('input', this.handleChange.bind(this));
    this.input.addEventListener('focus', this.handleFocus.bind(this));
    this.input.addEventListener('blur', this.handleBlur.bind(this));

    this.listbox.addEventListener('mouseover', this.handleMouseover.bind(this));
    this.listbox.addEventListener('mouseout', this.handleMouseout.bind(this));
  }

  handleKeydown(event) {
    this.ctrlKey = (event.ctrlKey || event.metaKey) && event.key !== 'v';

    switch (event.key) {
      case 'ArrowUp': {
        event.preventDefault();
        this.navigateResults(-1);
        break;
      }
      case 'ArrowDown': {
        event.preventDefault();
        this.navigateResults(1);
        break;
      }
      case 'Enter': {
        event.preventDefault();
        break;
      }
    }
  }

  handleKeyup(event) {
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown': {
        event.preventDefault();
        break;
      }
      case 'Enter': {
        if (this.highlightedResultIndex == null) {
          this.clearListbox();
        } else {
          this.selectResult();
        }
        break;
      }
    }

    this.ctrlKey = false;
  }

  handleChange() {
    if ((!this.blurring && this.input.value.trim()) || this.handleUpdate) {
      if (this.handleUpdate) {
        this.settingResult = false;
      }
      this.getSuggestions();
    } else {
      this.abortFetch();
    }
  }

  handleFocus() {
    clearTimeout(this.blurTimeout);
    this.getSuggestions(true);
  }

  handleBlur() {
    clearTimeout(this.blurTimeout);
    this.blurring = true;

    this.blurTimeout = setTimeout(() => {
      this.blurring = false;
    }, 300);
  }

  handleMouseover() {
    const focusedItem = this.resultOptions[this.highlightedResultIndex];

    if (focusedItem) {
      focusedItem.classList.remove(classAutosuggestOptionFocused);
    }
  }

  handleMouseout() {
    const focusedItem = this.resultOptions[this.highlightedResultIndex];

    if (focusedItem) {
      focusedItem.classList.add(classAutosuggestOptionFocused);
    }
  }

  navigateResults(direction) {
    let index = 0;

    if (this.highlightedResultIndex !== null) {
      index = this.highlightedResultIndex + direction;
    }

    if (index < this.numberOfResults) {
      if (index < 0) {
        index = null;
      }

      this.setHighlightedResult(index);
    }
  }

  getSuggestions(force) {
    if (!this.settingResult) {
      const query = this.input.value;
      const sanitisedQuery = sanitiseAutosuggestText(query, this.sanitisedQueryReplaceChars, this.sanitisedQuerySplitNumsChars);

      if (sanitisedQuery !== this.sanitisedQuery || (force && !this.resultSelected)) {
        this.unsetResults();
        this.setAriaStatus();

        this.query = query;
        this.sanitisedQuery = sanitisedQuery;
        if (this.sanitisedQuery.length >= this.minChars) {
          this.fetchSuggestions(this.sanitisedQuery, this.data)
            .then(this.handleResults.bind(this))
            .catch(error => {
              if (error.name !== 'AbortError' && this.onError) {
                this.onError(error);
              }
            });
        } else {
          this.clearListbox();
        }
      }
    }
  }

  async fetchSuggestions(sanitisedQuery, data) {
    this.abortFetch();
    const results = await queryJson(sanitisedQuery, data, this.lang, this.resultLimit);
    results.forEach(result => {
      result.sanitisedText = sanitiseAutosuggestText(result[this.lang], this.sanitisedQueryReplaceChars);
      if (this.lang !== 'en-gb') {
        const english = result['en-gb'];
        const sanitisedAlternative = sanitiseAutosuggestText(english, this.sanitisedQueryReplaceChars);

        if (sanitisedAlternative.match(sanitisedQuery)) {
          result.alternatives = [english];
          result.sanitisedAlternatives = [sanitisedAlternative];
        }
      } else {
        result.alternatives = [];
        result.sanitisedAlternatives = [];
      }
    });
    return {
      results,
      totalResults: results.length,
    };
  }

  abortFetch() {
    if (this.fetch && this.fetch.status !== 'DONE') {
      this.fetch.abort();
    }
  }

  unsetResults() {
    this.results = [];
    this.resultOptions = [];
    this.resultSelected = false;

    if (this.onUnsetResult) {
      this.onUnsetResult();
    }
  }

  clearListbox(preventAriaStatusUpdate) {
    this.listbox.innerHTML = '';
    this.context.classList.remove(classAutosuggestHasResults);
    this.input.removeAttribute('aria-activedescendant');
    this.input.removeAttribute('aria-expanded');

    if (!preventAriaStatusUpdate) {
      this.setAriaStatus();
    }
  }

  handleResults(result) {
    this.resultLimit = result.limit ? result.limit : this.resultLimit;
    this.foundResults = result.totalResults;
    if (this.foundResults > this.resultLimit) {
      result.results = result.results.slice(0, this.resultLimit);
    }

    this.results = result.results;
    this.numberOfResults = Math.max(this.results.length, 0);

    if (!this.deleting || (this.numberOfResults && this.deleting)) {
      this.listbox.innerHTML = '';
      this.resultOptions = this.results.map((result, index) => {
        let ariaLabel = result[this.lang];
        let innerHTML = this.emboldenMatch(ariaLabel, this.query);

        if (Array.isArray(result.sanitisedAlternatives)) {
          const alternativeMatch = result.sanitisedAlternatives.find(
            alternative => alternative !== result.sanitisedText && alternative.includes(this.sanitisedQuery),
          );

          if (alternativeMatch) {
            const alternativeText = result.alternatives[result.sanitisedAlternatives.indexOf(alternativeMatch)];
            innerHTML += ` <small>(${this.emboldenMatch(alternativeText, this.query)})</small>`;
            ariaLabel += `, (${alternativeText})`;
          }
        }

        const listElement = document.createElement('li');
        listElement.className = classAutosuggestOption;
        listElement.setAttribute('id', `${this.listboxId}__option--${index}`);
        listElement.setAttribute('role', 'option');
        listElement.setAttribute('aria-label', ariaLabel);
        listElement.innerHTML = innerHTML;

        listElement.addEventListener('click', () => {
          this.selectResult(index);
        });

        this.listbox.appendChild(listElement);

        this.context.querySelector(`.${classAutosuggestResultsTitle}`).classList.remove('u-d-no');

        return listElement;
      });

      if (this.numberOfResults < this.foundResults) {
        const listElement = document.createElement('li');
        listElement.className = `${classAutosuggestOption} ${classAutosuggestOptionMoreResults}`;
        listElement.setAttribute('aria-hidden', 'true');
        listElement.innerHTML = this.moreResults;
        this.listbox.appendChild(listElement);
      }

      if (this.resultLimit === 100 && this.foundResults > this.resultLimit) {
        const warningListElement = document.createElement('li');
        const warningElement = document.createElement('div');
        const warningSpanElement = document.createElement('span');
        const warningBodyElement = document.createElement('div');

        warningListElement.setAttribute('aria-hidden', 'true');
        warningListElement.className = 'autosuggest-input__warning';
        warningElement.className = 'panel panel--warn autosuggest-input__panel';

        warningSpanElement.className = 'panel__icon';
        warningSpanElement.setAttribute('aria-hidden', 'true');
        warningSpanElement.innerHTML = '!';

        warningBodyElement.className = 'panel__body';
        warningBodyElement.innerHTML = this.foundResults + ' results found. Enter more of the address to improve results.';

        warningElement.appendChild(warningSpanElement);
        warningElement.appendChild(warningBodyElement);
        warningListElement.appendChild(warningElement);
        this.listbox.insertBefore(warningListElement, this.listbox.firstChild);
      }

      this.setHighlightedResult(null);

      this.input.setAttribute('aria-expanded', !!this.numberOfResults);
      this.context.classList[!!this.numberOfResults ? 'add' : 'remove'](classAutosuggestHasResults);

      this.setHighlightedResult(null);

      this.input.setAttribute('aria-expanded', !!this.numberOfResults);
      this.context.classList[!!this.numberOfResults ? 'add' : 'remove'](classAutosuggestHasResults);
    }
    if (this.numberOfResults === 0 && this.noResults) {
      this.context.classList.add(classAutosuggestHasResults);
      this.context.querySelector(`.${classAutosuggestResultsTitle}`).classList.add('u-d-no');
      this.listbox.innerHTML = `<li class="${classAutosuggestOption} ${classAutosuggestOptionNoResults}">${this.noResults}</li>`;
      this.input.setAttribute('aria-expanded', true);
    }
  }

  setHighlightedResult(index) {
    this.highlightedResultIndex = index;

    if (this.highlightedResultIndex === null) {
      this.input.removeAttribute('aria-activedescendant');
    } else if (this.numberOfResults) {
      this.resultOptions.forEach((option, optionIndex) => {
        if (optionIndex === index) {
          option.classList.add(classAutosuggestOptionFocused);
          option.setAttribute('aria-selected', true);
          this.input.setAttribute('aria-activedescendant', option.getAttribute('id'));
        } else {
          option.classList.remove(classAutosuggestOptionFocused);
          option.removeAttribute('aria-selected');
        }
      });

      this.setAriaStatus();
    }
  }

  setAriaStatus(content) {
    if (!content) {
      const queryTooShort = this.sanitisedQuery.length < this.minChars;
      const noResults = this.numberOfResults === 0;

      if (queryTooShort) {
        content = this.ariaMinChars;
      } else if (noResults) {
        content = `${this.ariaNoResults}: "${this.query}"`;
      } else if (this.numberOfResults === 1) {
        content = this.ariaOneResult;
      } else {
        content = this.ariaNResults.replace('{n}', this.numberOfResults);

        if (this.resultLimit && this.foundResults > this.resultLimit) {
          content += ` ${this.ariaLimitedResults}`;
        }
      }
    }
    this.ariaStatus.innerHTML = content;
  }

  selectResult(index) {
    if (this.results.length) {
      this.settingResult = true;

      const result = this.results[index || this.highlightedResultIndex || 0];
      this.resultSelected = true;

      if (result.sanitisedText !== this.sanitisedQuery && result.sanitisedAlternatives && result.sanitisedAlternatives.length) {
        const bestMatchingAlternative = result.sanitisedAlternatives
          .map((alternative, index) => ({
            score: dice(this.sanitisedQuery, alternative),
            index,
          }))
          .sort(sortBy('score'))[0];

        const scoredSanitised = dice(this.sanitisedQuery, result.sanitisedText);

        if (bestMatchingAlternative.score >= scoredSanitised) {
          result.displayText = result.alternatives[bestMatchingAlternative.index];
        } else {
          result.displayText = result[this.lang];
        }
      } else {
        result.displayText = result[this.lang];
      }
      this.onSelect(result).then(() => (this.settingResult = false));

      const ariaMessage = `${this.ariaYouHaveSelected}: ${result.displayText}.`;

      this.clearListbox();
      this.setAriaStatus(ariaMessage);
    }
  }

  emboldenMatch(string, query) {
    let reg = new RegExp(
      this.escapeRegExp(query)
        .split('')
        .join('[\\s,]*'),
      'gi',
    );
    return string.replace(reg, '<strong>$&</strong>');
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
