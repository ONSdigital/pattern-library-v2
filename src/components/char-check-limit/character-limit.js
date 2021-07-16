import { trackEvent } from '../../js/analytics';

const inputClassLimitReached = 'input--limit-reached';
const remainingClassLimitReached = 'input__limit--reached';
const attrCharLimitRef = 'data-char-limit-ref';

export default class CharLimit {
  constructor(input) {
    this.input = input;
    this.maxLength = input.maxLength;
    this.limitElement = document.getElementById(input.getAttribute(attrCharLimitRef));
    this.singularMessage = this.limitElement.getAttribute('data-charcount-singular');
    this.pluralMessage = this.limitElement.getAttribute('data-charcount-plural');

    this.updateLimitReadout(null, true);
    this.limitElement.classList.remove('u-d-no');

    input.addEventListener('input', this.updateLimitReadout.bind(this));
  }

  updateLimitReadout(event, firstRun) {
    const value = this.input.value;
    const remaining = this.maxLength - value.length;
    const message = remaining === 1 ? this.singularMessage : this.pluralMessage;
    // Prevent aria live announcement when component initialises
    if (!firstRun && event.inputType) {
      this.limitElement.setAttribute('aria-live', 'polite');
    } else {
      this.limitElement.removeAttribute('aria-live');
    }

    this.limitElement.innerText = message.replace('{x}', remaining);

    this.setLimitClass(remaining, this.input, inputClassLimitReached);
    this.setLimitClass(remaining, this.limitElement, remainingClassLimitReached);

    this.track(remaining);
  }

  setLimitClass(remaining, element, limitClass) {
    element.classList[remaining > 0 ? 'remove' : 'add'](limitClass);
    this.limitElement.setAttribute('aria-live', [remaining > 0 ? 'polite' : 'assertive']);
  }

  track(remaining) {
    if (remaining < 1) {
      trackEvent('send', {
        hitType: 'event',
        eventCategory: 'Error',
        eventAction: 'Textarea limit reached',
        eventLabel: `Limit of ${this.maxLength} reached/exceeded`,
      });
    }
  }
}
