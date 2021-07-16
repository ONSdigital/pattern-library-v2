import ReplyInput from '../../../components/reply/reply-input';
import renderTemplate from '../../helpers/render-template';

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
  closeLinkUrl: '#0',
};

describe('Component: Reply', () => {
  let wrapper, replyWrapper, replyInput, replyButton;

  beforeEach(() => {
    const html = renderTemplate('components/reply/_test-template.njk', { params });

    wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);

    replyWrapper = wrapper.querySelector('.js-reply');
    replyInput = document.getElementById(params.textarea.id);
    replyButton = document.getElementById(params.button.id);

    new ReplyInput(replyWrapper);
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.remove();
    }
  });

  describe('Given that the reply component has initialised correctly', () => {
    it('the submit button shoudld be disabled', () => {
      expect(replyButton.hasAttribute('disabled')).to.be.true;
      expect(replyButton.classList.contains('btn--disabled')).to.equal(true);
    });
  });

  describe('Given that the user has not typed into the search input', () => {
    describe('when the user types into the search input', () => {
      const value = 'abcd';

      beforeEach(() => {
        populateReplyInput(replyInput, value);
      });

      it('the submit button should become enabled', () => {
        expect(replyButton.hasAttribute('disabled')).to.be.false;
        expect(replyButton.classList.contains('btn--disabled')).to.equal(false);
      });
    });

    describe('then the user deletes what they typed', () => {
      let value = '';

      beforeEach(() => {
        populateReplyInput(replyInput, value);
      });

      it('the button should become disabled', () => {
        expect(replyButton.hasAttribute('disabled')).to.be.true;
        expect(replyButton.classList.contains('btn--disabled')).to.equal(true);
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
