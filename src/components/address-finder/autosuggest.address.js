import abortableFetch from '../../js/abortable-fetch';
import { sanitiseAutosuggestText } from '../autosuggest/autosuggest.helpers';
import AutosuggestUI from '../autosuggest/autosuggest.ui';
import AddressError from './autosuggest.address.error';
import AddressSetter from './autosuggest.address.setter';

export const classInputContainer = 'autosuggest-input';
export const classNotEditable = 'js-address-not-editable';
export const classMandatory = 'js-address-mandatory';
export const classSearch = 'js-address-input__search';
export const classInput = 'js-autosuggest-input';
export const classInputUPRN = 'js-hidden-uprn';

export default class AutosuggestAddress {
  constructor(context) {
    this.context = context;
    this.input = context.querySelector(`.${classInput}`);
    this.search = context.querySelector(`.${classSearch}`);
    this.lang = document.documentElement.getAttribute('lang').toLowerCase();
    this.addressReplaceChars = [','];
    this.sanitisedQuerySplitNumsChars = true;
    this.form = context.closest('form');
    this.container = context.querySelector(`.${classInputContainer}`);
    this.errorMessage = this.container.getAttribute('data-error-message');
    this.groupCount = this.container.getAttribute('data-group-count');
    this.authorizationToken = this.container.getAttribute('data-authorization-token');
    this.uprn = context.querySelector(`.${classInputUPRN}`);

    // State
    this.fetch = null;
    this.totalResults = 0;
    this.errored = false;
    this.isEditable = context.querySelector(`.${classNotEditable}`) ? false : true;
    this.isMandatory = context.querySelector(`.${classMandatory}`) ? true : false;
    this.addressSelected = false;
    this.groupQuery = '';
    this.selectedAddressValue = '';

    // Bind event listeners
    if (this.form) {
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    // Initialise address setter
    if (this.isEditable) {
      this.addressSetter = new AddressSetter(context);
    }

    // Initialise autosuggest
    this.autosuggest = new AutosuggestUI({
      context: this.container,
      onSelect: this.onAddressSelect.bind(this),
      lang: this.lang,
      suggestionFunction: this.suggestAddresses.bind(this),
      sanitisedQueryReplaceChars: this.addressReplaceChars,
      sanitisedQuerySplitNumsChars: this.sanitisedQuerySplitNumsChars,
      minChars: 3,
      suggestOnBoot: true,
      handleUpdate: true,
    });

    // Set up AIMS api variables and auth
    this.APIDomain = this.container.getAttribute('data-api-domain');
    this.lookupURL = `${this.APIDomain}/addresses/eq?input=`;
    this.lookupGroupURL = `${this.APIDomain}/addresses/eq/bucket?`;
    this.retrieveURL = `${this.APIDomain}/addresses/eq/uprn/`;

    // Query string options
    this.regionCode = this.container.getAttribute('data-options-region-code');
    this.epoch = this.container.getAttribute('data-options-one-year-ago');
    this.classificationFilter = this.container.getAttribute('data-options-address-type');

    // Check API status
    this.checkAPIStatus();
  }

  checkAPIStatus() {
    this.fetch = abortableFetch(this.lookupURL + 'CF142&limit=10', {
      method: 'GET',
      headers: this.setAuthorization(this.authorizationToken),
    });
    this.fetch
      .send()
      .then(async response => {
        const status = (await response.json()).status.code;
        if (status > 400) {
          if (this.isEditable) {
            this.handleAPIError();
          } else {
            this.autosuggest.handleNoResults(status);
          }
        }
      })
      .catch(error => {
        console.log(error);
        if (this.isEditable) {
          this.handleAPIError();
        } else {
          this.autosuggest.handleNoResults(status);
        }
      });
  }

  suggestAddresses(query, [], grouped) {
    return new Promise((resolve, reject) => {
      if (this.fetch && this.fetch.status !== 'DONE') {
        this.fetch.abort();
      }

      this.reject = reject;
      this.findAddress(query, grouped)
        .then(resolve)
        .catch(reject);
    });
  }

  findAddress(text, grouped) {
    return new Promise((resolve, reject) => {
      let queryURL, fullQueryURL;
      const testInput = this.testFullPostcodeQuery(text);
      let limit = testInput ? 100 : 10;

      queryURL = grouped ? this.lookupGroupURL + this.groupQuery : this.lookupURL + text + '&limit=' + limit;

      fullQueryURL = this.generateURLParams(queryURL);
      if (testInput && grouped !== false) {
        fullQueryURL = fullQueryURL + '&groupfullpostcodes=combo';
      }

      this.fetch = abortableFetch(fullQueryURL, {
        method: 'GET',
        headers: this.setAuthorization(this.authorizationToken),
      });
      this.fetch
        .send()
        .then(async data => {
          const response = await data.json();
          const status = response.status.code;
          const addresses = response.response;
          const limit = response.response.limit;
          const results = await this.mapFindResults(addresses, limit, status);
          resolve(results);
        })
        .catch(reject);
    });
  }

  async mapFindResults(results, limit, status) {
    let mappedResults, currentResults;
    const total = results.total;

    if (results.partpostcode || (results.groupfullpostcodes === 'combo' && results.postcodes && results.postcodes.length > 1)) {
      mappedResults = await this.postcodeGroupsMapping(results);
      currentResults = mappedResults;
    } else if (results.addresses) {
      mappedResults = await this.addressMapping(results);
      currentResults = mappedResults ? mappedResults.results.sort() : null;
    } else {
      currentResults = results.addresses;
    }
    return {
      results: currentResults,
      totalResults: total,
      limit: limit,
      status: status,
    };
  }

  async addressMapping(results) {
    let updatedResults;
    const addresses = results.addresses;
    if (addresses[0]) {
      if (addresses[0] && addresses[0].bestMatchAddress) {
        updatedResults = addresses.map(({ uprn, bestMatchAddress, bestMatchAddressType }) => ({
          uprn: uprn,
          address: bestMatchAddress,
          type: bestMatchAddressType,
        }));
      } else if (addresses[0] && addresses[0].formattedAddress) {
        updatedResults = addresses.map(({ uprn, formattedAddress, addressType }) => ({
          uprn: uprn,
          address: formattedAddress,
          type: addressType,
        }));
      }

      results = updatedResults.map(({ uprn, address, type }) => {
        const sanitisedText = sanitiseAutosuggestText(address, this.addressReplaceChars);
        return {
          [this.lang]: address,
          sanitisedText,
          uprn,
          type,
        };
      });
      return {
        results: results,
        limit: results.limit,
      };
    }
  }

  async postcodeGroupsMapping(results) {
    const postcodeGroups = results.postcodes;
    let groups = postcodeGroups.map(({ postcode, postTown, streetName, townName, addressCount, firstUprn }) => {
      return {
        [this.lang]:
          streetName +
          ', ' +
          (townName === postTown ? postTown : townName + ', ' + postTown) +
          ', ' +
          postcode +
          ' (<span class="autosuggest-input__group">' +
          this.groupCount.replace(`{n}`, addressCount) +
          '</span>)',
        postcode,
        streetName,
        townName,
        postTown,
        firstUprn,
        addressCount,
      };
    });
    const newGroups = await this.replaceSingleCountAddresses(groups);
    return newGroups;
  }

  async replaceSingleCountAddresses(items) {
    for (const item of items) {
      if (item.addressCount === 1 && item.firstUprn !== 0) {
        let result = await this.createAddressObject(item.firstUprn);
        const matchingItem = items.findIndex(x => x.firstUprn == result.uprn);
        items[matchingItem] = result;
      }
    }
    return items;
  }

  async createAddressObject(id) {
    const data = await this.retrieveAddress(id);
    const address = data.response.address.formattedAddress;
    const uprn = data.response.address.uprn;
    const sanitisedText = sanitiseAutosuggestText(address, this.addressReplaceChars);
    return {
      [this.lang]: address,
      sanitisedText,
      uprn,
    };
  }

  testFullPostcodeQuery(input) {
    const fullPostcodeRegex = /\b((?:(?:gir)|(?:[a-pr-uwyz])(?:(?:[0-9](?:[a-hjkpstuw]|[0-9])?)|(?:[a-hk-y][0-9](?:[0-9]|[abehmnprv-y])?)))) ?([0-9][abd-hjlnp-uw-z]{2})\b/i;
    const testFullPostcode = fullPostcodeRegex.test(input);
    if (testFullPostcode) {
      return true;
    }
  }

  retrieveAddress(id, type = null) {
    return new Promise((resolve, reject) => {
      let retrieveUrl = this.retrieveURL + id;

      const fullUPRNURL = this.generateURLParams(retrieveUrl, id, type);

      this.fetch = abortableFetch(fullUPRNURL, {
        method: 'GET',
        headers: this.setAuthorization(this.authorizationToken),
      });

      this.fetch
        .send()
        .then(async response => {
          const data = await response.json();
          resolve(data);
        })
        .catch(reject);
    });
  }

  onAddressSelect(selectedResult) {
    return new Promise((resolve, reject) => {
      if (selectedResult.uprn) {
        this.retrieveAddress(selectedResult.uprn, selectedResult.type)
          .then(data => {
            if (this.isEditable) {
              if (data.status.code >= 403) {
                this.autosuggest.handleNoResults(403);
              } else {
                this.addressSetter.setAddress(this.createAddressLines(data, resolve));
                this.addressSelected = true;
              }
            } else {
              this.selectedAddressValue = selectedResult.displayText;
              this.autosuggest.input.value = selectedResult.displayText;
              this.uprn.value = selectedResult.uprn;
              this.addressSelected = true;
            }
          })
          .catch(error => {
            console.log(error);
            if (this.isEditable) {
              this.handleAPIError();
            } else {
              this.autosuggest.handleNoResults(403);
            }
            reject();
          });
      } else if (selectedResult.postcode) {
        this.autosuggest.input.value =
          selectedResult.streetName +
          ', ' +
          (selectedResult.townName === selectedResult.postTown
            ? selectedResult.postTown
            : selectedResult.townName + ', ' + selectedResult.postTown) +
          ', ' +
          selectedResult.postcode;
        this.autosuggest.input.focus();
        this.groupQuery =
          'postcode=' + selectedResult.postcode + '&streetname=' + selectedResult.streetName + '&townname=' + selectedResult.townName;
        this.autosuggest.handleChange(true);
      }
    });
  }

  createAddressLines(data, resolve) {
    const values = data.response.address;
    const addressLines = {
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2,
      addressLine3: values.addressLine3,
      townName: values.townName,
      postcode: values.postcode,
      uprn: values.uprn,
    };
    resolve();

    return addressLines;
  }

  generateURLParams(baseURL, uprn, type) {
    let fullURL = baseURL,
      addressType;

    const classificationFilterParam = '&classificationfilter=',
      eboostParam = '&eboost=10',
      wboostParam = '&wboost=10',
      nionlyParam = '&eboost=0&sboost=0&wboost=0',
      niboostParam = '&nboost=10',
      favourwelshParam = '&favourwelsh=true',
      addresstypeParam = '?addresstype=',
      epochParam = '&epoch=75';

    if (type) {
      addressType = type.toLowerCase();
    } else {
      addressType = 'paf';
    }

    if (!uprn) {
      if (this.classificationFilter && this.classificationFilter !== 'residential') {
        fullURL = fullURL + classificationFilterParam + this.classificationFilter;
      }

      if (this.classificationFilter === 'workplace') {
        if (this.regionCode === 'gb-eng') {
          fullURL = fullURL + eboostParam;
        } else if (this.regionCode === 'gb-wls') {
          fullURL = fullURL + wboostParam;
        }
      }

      if (this.regionCode === 'gb-nir') {
        if (this.classificationFilter === 'educational') {
          fullURL = fullURL + nionlyParam;
        } else {
          fullURL = fullURL + niboostParam;
        }
      }

      if (this.lang === 'cy') {
        fullURL = fullURL + favourwelshParam;
      }
    } else if (uprn) {
      fullURL = baseURL + addresstypeParam + addressType;
    }

    if (this.epoch === 'true') {
      fullURL = fullURL + epochParam;
    }

    return fullURL;
  }

  handleAPIError() {
    this.addressSetter.setManualMode(true, false);
    const searchBtn = document.querySelector('.js-address-search-btn');
    searchBtn.classList.add('u-d-no');
  }

  handleSubmit(event) {
    let isManualMode = false;

    if (this.isEditable) {
      isManualMode = this.addressSetter.manualMode;
      this.addressSetter.checkManualInputsValues(false);
    }
    if (this.isMandatory && !isManualMode) {
      if (
        !this.addressSelected ||
        this.input.value === '' ||
        (!this.isEditable && this.checkValueHasBeenUpdated(this.selectedAddressValue))
      ) {
        event.preventDefault();
        this.handleError = new AddressError(this.context);
        this.handleError.showErrorPanel();
        this.autosuggest.setAriaStatus(this.errorMessage);
      }
    }
  }

  checkValueHasBeenUpdated(value) {
    if (value !== this.input.value) {
      return true;
    }
  }

  setAuthorization(token) {
    this.authorization = `Bearer ${token}`;
    return new Headers({
      Authorization: this.authorization,
    });
  }
}
