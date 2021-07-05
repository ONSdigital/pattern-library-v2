import { awaitPolyfills } from 'js/polyfills/await-polyfills';
import template from 'components/reply/_test-template.njk';
import ReplyInput from 'components/reply/reply-input';

const params = {
  textarea: {
    id: 'reply',
    name: 'reply',
    label: {
      text: 'Reply',
    },
  },
  button: {
    id: 'replyButton',
    type: 'button',
    text: 'Send message',
    classes: 'btn-group__btn',
  },
  closeLinkText: 'Close conversation',
  closeLinkUrl: '#',
};

describe('Component: Reply', () => {
  let wrapper, replyWrapper, replyInput, replyButton;

  before(() => awaitPolyfills);

  beforeEach(() => {
    const html = template.render({ params });

    wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);

    replyWrapper = document.querySelector('.js-reply');
    replyInput = document.getElementById(params.id);
    replyButton = document.getElementById('replyButton');

    new ReplyInput(replyWrapper);
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.remove();
    }
  });

  describe('Given that the reply component has initialised correctly', () => {
    it('the submit button shoudld be disabled', () => {
      expect(replyButton.disabled.to.equal(true));
    });
  });

  describe('Given that the user has not typed into the search input', () => {
    describe('when the user types into the search input', () => {
      const value = 'abcd';

      beforeEach(() => {
        populateReplyInput(replyInput, value);
      });

      it('the submit button should become enabled', () => {
        expect(replyButton.disabled.to.equal(false));
      });
    });

    describe('then the user deletes what they typed', () => {
      let value = '';

      beforeEach(() => {
        populateReplyInput(replyInput, value);
      });

      it('the button should become disabled', () => {
        expect(replyButton.disabled.to.equal(true));
      });
    });
  });

  function populateReplyInput(replyInput, value) {
    replyInput.value = value;
    const event = new CustomEvent('input');
    event.inputType = 'unitTest';
    replyInput.dispatchEvent(event);
  }
});
