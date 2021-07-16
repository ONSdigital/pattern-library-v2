import domready from '../../../js/domready';

class Example {
  constructor(context) {
    this.tabs = [...context.querySelectorAll('.js-example-tab')];
    this.radios = [...context.querySelectorAll('.js-example-radio')];

    this.tabs.forEach((tab, index) => tab.addEventListener('click', event => this.handleTabClick(event, index)));
  }

  handleTabClick(event, index) {
    event.preventDefault();
    const radio = this.radios[index];

    radio.checked = !radio.checked;
  }
}

domready(() => [...document.querySelectorAll('.js-example')].map(example => new Example(example)));
