import MutuallyExclusive from '../../../components/mutually-exclusive/mutually-exclusive';
import renderTemplate from '../../helpers/render-template';

const params = {
  legend: 'What type of central heating do you have?',
  checkboxesLabel: 'Select all that apply',
  name: 'mutually-exclusive',
  checkboxes: [
    {
      id: 'gas',
      label: {
        text: 'Gas',
      },
      value: 'gas',
    },
    {
      id: 'electric',
      label: {
        text: 'Electric',
      },
      value: 'electric',
    },
    {
      id: 'solid-fuel',
      label: {
        text: 'Solid fuel',
      },
      value: 'solid-fuel',
    },
    {
      id: 'other-fuel',
      label: {
        text: 'Other',
      },
      value: 'other',
      other: {
        id: 'other-fuel-textbox',
        name: 'other-fuel-answer',
        label: {
          text: 'Please specify',
        },
      },
    },
  ],
  mutuallyExclusive: {
    or: 'or',
    deselectMessage: 'Selecting this will uncheck all other checkboxes',
    deselectGroupAdjective: 'deselected',
    deselectCheckboxAdjective: 'deselected',
    checkbox: {
      id: 'no-central-heating',
      label: {
        text: 'No central heating',
      },
      value: 'no-central-heating',
    },
  },
};

describe('Component: Mutually Exclusive Checkbox With Single Checkbox Override', () => {
  let wrapper, component, exclusiveCheckbox, ariaAlert;

  beforeEach(() => {
    const html = renderTemplate('components/checkboxes/_test-template.njk', { params });

    wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);

    component = document.querySelector('.js-mutually-exclusive');
    params.checkboxes = params.checkboxes.filter(checkbox => !checkbox.exclusive);
    exclusiveCheckbox = document.getElementById(params.mutuallyExclusive.checkbox.id);
    ariaAlert = document.querySelector('.js-exclusive-alert');

    new MutuallyExclusive(component);
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.remove();
    }
  });

  describe('Given the user has clicked multiple non-exclusive options', () => {
    beforeEach(() => {
      params.checkboxes.forEach(checkbox => {
        const element = document.getElementById(checkbox.id);
        element.click();

        if (checkbox.other) {
          const otherElement = document.getElementById(checkbox.other.id);
          otherElement.value = 'Biofuel';
        }
      });
    });

    describe('when the user clicks the mutually exclusive option', () => {
      beforeEach(() => {
        exclusiveCheckbox.click();
      });

      it('then only the mutually exclusive option should be checked', () => {
        expect(exclusiveCheckbox.checked).to.equal(true);
        expect(exclusiveCheckbox.value).to.equal(params.mutuallyExclusive.checkbox.value);

        params.checkboxes.forEach(checkbox => {
          const element = document.getElementById(checkbox.id);

          expect(element.checked).to.equal(false);
          expect(element.value).to.equal(checkbox.value);

          if (checkbox.other) {
            const otherElement = document.getElementById(checkbox.other.id);

            expect(otherElement.value).to.equal('');
          }
        });
      });

      it('then the aria-live message should reflect the removed non exclusive options', done => {
        setTimeout(() => {
          const message = params.checkboxes
            .map(checkbox => `${checkbox.label.text} ${params.mutuallyExclusive.deselectGroupAdjective}.`)
            .join(' ');
          expect(ariaAlert.innerHTML).to.equal(message);

          done();
        }, 300);
      });
    });
  });

  describe('Given the user has clicked the mutually exclusive option', () => {
    beforeEach(() => {
      exclusiveCheckbox.click();
    });

    describe('when the user clicks the non-exclusive options', () => {
      beforeEach(() => {
        params.checkboxes.forEach(checkbox => {
          const element = document.getElementById(checkbox.id);

          element.click();
        });
      });

      it('then only the non-exclusive options should be checked', () => {
        params.checkboxes.forEach(checkbox => {
          const element = document.getElementById(checkbox.id);

          expect(element.checked).to.equal(true);
          expect(element.value).to.equal(checkbox.value);
        });

        expect(exclusiveCheckbox.checked).to.equal(false);
        expect(exclusiveCheckbox.value).to.equal(params.mutuallyExclusive.checkbox.value);
      });

      it('then the aria-live message should reflect the removed exclusive option', done => {
        setTimeout(() => {
          expect(ariaAlert.innerHTML).to.equal(
            `${params.mutuallyExclusive.checkbox.label.text} ${params.mutuallyExclusive.deselectCheckboxAdjective}.`,
          );
          done();
        }, 300);
      });

      describe('and the user deselects an non-exclusive option', () => {
        beforeEach(() => {
          const element = document.getElementById(params.checkboxes[0].id);

          element.click();
        });

        it('the aria-live message should not be updated', done => {
          setTimeout(() => {
            expect(ariaAlert.innerHTML).to.equal(
              `${params.mutuallyExclusive.checkbox.label.text} ${params.mutuallyExclusive.deselectCheckboxAdjective}.`,
            );
            done();
          }, 300);
        });
      });
    });
  });

  describe('Given the user has not clicked the mutually exclusive option', () => {
    beforeEach(() => {
      expect(exclusiveCheckbox.checked).to.equal(false);
    });

    describe('when the user clicks multiple non-exclusive options', () => {
      beforeEach(() => {
        params.checkboxes.forEach(checkbox => {
          const element = document.getElementById(checkbox.id);
          element.click();
        });
      });

      it('then only the non-exclusive options should be checked', () => {
        params.checkboxes.forEach(checkbox => {
          const element = document.getElementById(checkbox.id);
          expect(element.checked).to.equal(true);
        });

        expect(exclusiveCheckbox.checked).to.equal(false);
      });

      it('then the aria-live message should say nothing', done => {
        setTimeout(() => {
          expect(ariaAlert.innerHTML).to.equal('');
          done();
        }, 300);
      });
    });
  });

  describe('Given the user has not clicked any of the non-exclusive options', () => {
    beforeEach(() => {
      params.checkboxes.forEach(checkbox => {
        const element = document.getElementById(checkbox.id);
        expect(element.checked).to.equal(false);
      });
    });

    describe('when the user clicks the mutually exclusive option', () => {
      beforeEach(() => {
        exclusiveCheckbox.click();
      });

      it('then only the exclusive option should be checked', () => {
        expect(exclusiveCheckbox.checked).to.equal(true);

        params.checkboxes.forEach(checkbox => {
          const element = document.getElementById(checkbox.id);
          expect(element.checked).to.equal(false);
        });
      });

      it('then the aria-live message should say nothing', done => {
        setTimeout(() => {
          expect(ariaAlert.innerHTML).to.equal('');
          done();
        }, 300);
      });
    });
  });
});
