import abortableFetch from '../../js/abortable-fetch';
import { sanitiseAutosuggestText } from './autosuggest.helpers';
import queryJson from './code.list.searcher';

export const baseClass = 'js-autosuggest';

export const classAutosuggestOption = 'autosuggest-input__option';
export const classAutosuggestOptionFocused = `${classAutosuggestOption}--focused`;
export const classAutosuggestOptionNoResults = `${classAutosuggestOption}--no-results`;
export const classAutosuggestOptionMoreResults = `${classAutosuggestOption}--more-results u-fs-s`;
export const classAutosuggestHasResults = 'autosuggest-input--has-results';
export const classAutosuggestResultsTitle = 'autosuggest-input__results-title';

export default class AutosuggestUI {
  constructor({
    context,
    autosuggestData,
    sanitisedQueryReplaceChars,
    sanitisedQuerySplitNumsChars,
    minChars,
    resultLimit,
    suggestOnBoot,
    onSelect,
    onUnsetResult,
    suggestionFunction,
    handleUpdate,
    lang,
    ariaYouHaveSelected,
    ariaMinChars,
    ariaOneResult,
    ariaNResults,
    ariaLimitedResults,
    ariaGroupedResults,
    moreResults,
    resultsTitle,
    noResults,
    tooManyResults,
    errorAPI,
    errorAPILinkText,
    typeMore,
  }) {
    // DOM Elements
    this.context = context;
    this.input = context.querySelector(`.${baseClass}-input`);
    this.resultsContainer = context.querySelector(`.${baseClass}-results`);
    this.listbox = this.resultsContainer.querySelector(`.${baseClass}-listbox`);
    this.instructions = context.querySelector(`.${baseClass}-instructions`);
    this.ariaStatus = context.querySelector(`.${baseClass}-aria-status`);
    this.form = context.closest('form');
    this.label = document.querySelector('.label');

    // Settings
    this.autosuggestData = autosuggestData || context.getAttribute('data-autosuggest-data');
    this.ariaYouHaveSelected = ariaYouHaveSelected || context.getAttribute('data-aria-you-have-selected');
    this.ariaMinChars = ariaMinChars || context.getAttribute('data-aria-min-chars');
    this.ariaOneResult = ariaOneResult || context.getAttribute('data-aria-one-result');
    this.ariaNResults = ariaNResults || context.getAttribute('data-aria-n-results');
    this.ariaLimitedResults = ariaLimitedResults || context.getAttribute('data-aria-limited-results');
    this.ariaGroupedResults = ariaGroupedResults || context.getAttribute('data-aria-grouped-results');
    this.moreResults = moreResults || context.getAttribute('data-more-results');
    this.resultsTitle = resultsTitle || context.getAttribute('data-results-title');
    this.noResults = noResults || context.getAttribute('data-no-results');
    this.tooManyResults = tooManyResults || context.getAttribute('data-too-many-results');
    this.errorAPI = errorAPI || context.getAttribute('data-error-api');
    this.errorAPILinkText = errorAPILinkText || context.getAttribute('data-error-api-link-text');
    this.typeMore = typeMore || context.getAttribute('data-type-more');
    this.allowMultiple = context.getAttribute('data-allow-multiple') || false;
    this.listboxId = this.listbox.getAttribute('id');
    this.minChars = minChars || 3;
    this.resultLimit = resultLimit || 10;
    this.suggestOnBoot = suggestOnBoot;
    this.lang = lang || 'en';

    // Callbacks
    this.onSelect = onSelect;
    this.onUnsetResult = onUnsetResult;
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
    this.allSelections = [];
    this.data = [];
    this.foundResults = 0;
    this.numberOfResults = 0;
    this.highlightedResultIndex = 0;
    this.settingResult = false;
    this.resultSelected = false;
    this.blurring = false;
    this.blurTimeout = null;
    this.sanitisedQueryReplaceChars = sanitisedQueryReplaceChars || [];
    this.sanitisedQuerySplitNumsChars = sanitisedQuerySplitNumsChars || false;

    this.initialiseUI();
  }

  initialiseUI() {
    this.input.setAttribute('aria-autocomplete', 'list');
    this.input.setAttribute('aria-controls', this.listbox.getAttribute('id'));
    this.input.setAttribute('aria-describedby', this.instructions.getAttribute('id'));
    this.input.setAttribute('aria-haspopup', true);
    this.input.setAttribute('aria-owns', this.listbox.getAttribute('id'));
    this.input.setAttribute('aria-expanded', false);
    this.input.setAttribute('autocomplete', this.input.getAttribute('autocomplete') || 'off');
    this.input.setAttribute('role', 'combobox');

    this.context.classList.add('autosuggest-input--initialised');

    this.bindEventListeners();
  }

  fetchData() {
    this.fetch = abortableFetch(this.autosuggestData);
    return new Promise((resolve, reject) => {
      this.fetch
        .send()
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

    switch (event.keyCode) {
      case 38: {
        event.preventDefault();
        this.navigateResults(-1);
        break;
      }
      case 40: {
        event.preventDefault();
        this.navigateResults(1);
        break;
      }
      case 13: {
        if (this.highlightedResultIndex !== null) {
          event.preventDefault();
        }
        break;
      }
    }
  }

  handleKeyup(event) {
    switch (event.keyCode) {
      case 40:
      case 38: {
        event.preventDefault();
        break;
      }
      case 13: {
        if (this.highlightedResultIndex !== null) {
          this.selectResult();
        }
        break;
      }
    }

    this.ctrlKey = false;
  }

  handleChange(alternative = false) {
    if ((!this.blurring && this.input.value.trim()) || alternative === true) {
      this.settingResult = false;
      if (alternative === true) {
        this.getSuggestions(false, alternative);
      } else {
        this.getSuggestions();
      }
    } else {
      this.abortFetch();
      this.clearListbox();
    }
  }

  handleFocus() {
    if (this.allowMultiple === 'true' && this.allSelections.length && this.input.value.slice(-1) !== ' ' && this.input.value !== '') {
      this.input.value = `${this.input.value}, `;
    }
  }

  handleBlur() {
    clearTimeout(this.blurTimeout);
    this.blurring = true;

    this.blurTimeout = setTimeout(() => {
      this.blurring = false;
    }, 300);

    if (this.allowMultiple === 'true' && this.input.value.slice(-2) === ', ') {
      this.input.value = this.input.value.slice(0, -2);
    }
  }

  checkCharCount() {
    if (this.input.value.length > 1 && this.input.value.length < this.minChars) {
      this.inputTimeout = setTimeout(() => {
        this.handleNoResults(false);
      }, 2000);
    } else {
      clearTimeout(this.inputTimeout);
    }
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

  getSuggestions(force, alternative) {
    if (!this.settingResult) {
      if (this.allowMultiple === 'true' && this.allSelections.length) {
        const newQuery = this.input.value.split(', ').find(item => !this.allSelections.includes(item));
        this.query = newQuery ? newQuery : this.input.value;
      } else {
        this.query = this.input.value;
      }

      const sanitisedQuery = sanitiseAutosuggestText(this.query, this.sanitisedQueryReplaceChars, this.sanitisedQuerySplitNumsChars);

      if (sanitisedQuery !== this.sanitisedQuery || (force && !this.resultSelected)) {
        this.sanitisedQuery = sanitisedQuery;
        this.unsetResults();
        this.checkCharCount();
        if (this.sanitisedQuery.length >= this.minChars) {
          this.fetchSuggestions(this.sanitisedQuery, this.data, alternative)
            .then(this.handleResults.bind(this))
            .catch(error => {
              if (error.name !== 'AbortError') {
                console.log('error:', error);
                this.handleNoResults(500);
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
    this.numberOfResults = this.results ? Math.max(this.results.length, 0) : 0;
    this.setAriaStatus();
    if (!this.deleting || (this.numberOfResults && this.deleting)) {
      this.listbox.innerHTML = '';
      if (this.results) {
        this.resultOptions = this.results.map((result, index) => {
          let ariaLabel = result[this.lang];
          ariaLabel = ariaLabel.split('(<span class="autosuggest-input__group">')[0];
          let innerHTML = this.emboldenMatch(result[this.lang], this.query);

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
      }

      if (this.numberOfResults < this.foundResults) {
        const listElement = document.createElement('li');
        listElement.className = `${classAutosuggestOption} ${classAutosuggestOptionMoreResults}`;
        listElement.setAttribute('aria-hidden', 'true');
        listElement.innerHTML = this.moreResults;
        this.listbox.appendChild(listElement);
      }

      if (this.resultLimit === 100 && this.foundResults > this.resultLimit) {
        let message = this.tooManyResults.replace('{n}', this.foundResults);
        this.listbox.insertBefore(this.createWarningElement(message), this.listbox.firstChild);
      }

      this.setHighlightedResult(null);

      this.input.setAttribute('aria-expanded', !!this.numberOfResults);

      if (!!this.numberOfResults && this.sanitisedQuery.length >= this.minChars) {
        this.context.classList.add(classAutosuggestHasResults);
      } else {
        this.context.classList.remove(classAutosuggestHasResults);
        this.clearListbox();
      }
    }

    if (this.numberOfResults === 0 && this.noResults) {
      this.handleNoResults(result.status);
    }
  }

  handleNoResults(status) {
    let message;
    this.context.classList.add(classAutosuggestHasResults);
    this.context.querySelector(`.${classAutosuggestResultsTitle}`).classList.add('u-d-no');
    this.input.setAttribute('aria-expanded', true);

    if (status === 400 || status === false) {
      message = this.typeMore;
      this.setAriaStatus(message);
      this.listbox.innerHTML = `<li class="${classAutosuggestOption} ${classAutosuggestOptionNoResults}">${message}</li>`;
    } else if (status > 400 || status === '') {
      message = this.errorAPI + (this.errorAPILinkText ? ' <a href="' + window.location.href + '">' + this.errorAPILinkText + '</a>.' : '');

      this.input.setAttribute('disabled', true);
      this.input.value = '';
      this.label.classList.add('u-lighter');

      this.listbox.innerHTML = '';
      this.listbox.insertBefore(this.createWarningElement(message), this.listbox.firstChild);
      this.setAriaStatus(message);
    } else {
      message = this.noResults;
      this.listbox.innerHTML = `<li class="${classAutosuggestOption} ${classAutosuggestOptionNoResults}">${message}</li>`;
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
          const groupedResult = option.querySelector('.autosuggest-input__group');
          const ariaLabel = option.getAttribute('aria-label');
          if (groupedResult) {
            let groupedAriaMsg = this.ariaGroupedResults.replace('{n}', groupedResult.innerHTML);
            groupedAriaMsg = groupedAriaMsg.replace('{x}', ariaLabel);
            this.setAriaStatus(groupedAriaMsg);
          } else {
            this.setAriaStatus(ariaLabel);
          }
        } else {
          option.classList.remove(classAutosuggestOptionFocused);
          option.removeAttribute('aria-selected');
        }
      });
    }
  }

  setAriaStatus(content) {
    if (!content) {
      const queryTooShort = this.sanitisedQuery.length < this.minChars;
      const noResults = this.numberOfResults === 0;
      if (queryTooShort) {
        content = this.ariaMinChars;
      } else if (noResults) {
        content = `${this.noResults}: "${this.query}"`;
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

      if (this.allowMultiple === 'true') {
        let value = this.storeExistingSelections(result[this.lang]);
        result.displayText = value;
      } else {
        result.displayText = result[this.lang];
      }
      this.onSelect(result).then(() => (this.settingResult = false));

      const ariaMessage = `${this.ariaYouHaveSelected}: ${result.displayText}.`;

      this.clearListbox();
      this.setAriaStatus(ariaMessage);
    }
  }

  createWarningElement(content) {
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
    warningBodyElement.innerHTML = content;

    warningElement.appendChild(warningSpanElement);
    warningElement.appendChild(warningBodyElement);
    warningListElement.appendChild(warningElement);

    return warningListElement;
  }

  storeExistingSelections(value) {
    this.currentSelections = this.input.value.split(', ').filter(items => this.allSelections.includes(items));
    this.allSelections = [];
    if (this.currentSelections.length) {
      this.allSelections = this.currentSelections;
    }
    this.allSelections.push(value);

    this.allSelections = this.allSelections.filter(function(value, index, array) {
      return array.indexOf(value) == index;
    });

    return this.allSelections.join(', ');
  }

  emboldenMatch(string, query) {
    let reg = new RegExp(
      this.escapeRegExp(query)
        .split(' ')
        .join('[\\s,]*'),
      'gi',
    );

    return string.replace(reg, '<strong>$&</strong>');
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
