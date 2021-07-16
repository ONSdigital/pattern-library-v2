import MutuallyExclusive from '../../../components/mutually-exclusive/mutually-exclusive';
import renderTemplate from '../../helpers/render-template';

const params = {
  id: 'date-mutually-exclusive',
  legend: 'When did you leave your last paid job?',
  description: 'For example, 31 3 2018',
  day: {
    label: {
      text: 'Day',
    },
    name: 'day-exclusive',
  },
  month: {
    label: {
      text: 'Month',
    },
    name: 'month-exclusive',
  },
  year: {
    label: {
      text: 'Year',
    },
    name: 'year-exclusive',
  },
  mutuallyExclusive: {
    or: 'Or',
    deselectMessage: 'Selecting this will clear the date if one has been inputted',
    deselectGroupAdjective: 'cleared',
    deselectCheckboxAdjective: 'deselected',
    checkbox: {
      id: 'date-exclusive-checkbox',
      name: 'no-paid-job',
      value: 'no-paid-job',
      label: {
        text: 'I have never had a paid job',
      },
    },
  },
};

describe('Component: Mutually Exclusive Date Input', () => {
  let wrapper, component, dayInput, monthInput, yearInput, checkbox, ariaAlert;

  beforeEach(() => {
    const html = renderTemplate('components/date-input/_test-template.njk', { params });

    wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);

    component = document.querySelector('.js-mutually-exclusive');

    dayInput = document.getElementById(`${params.id}-day`);
    monthInput = document.getElementById(`${params.id}-month`);
    yearInput = document.getElementById(`${params.id}-year`);
    checkbox = document.getElementById(params.mutuallyExclusive.checkbox.id);
    ariaAlert = document.querySelector('.js-exclusive-alert');

    new MutuallyExclusive(component);
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.remove();
    }
  });

  describe('Given the user populated the date input', () => {
    beforeEach(() => {
      populateDate(dayInput, monthInput, yearInput);
    });

    describe('when the user clicks the mutually exclusive option', () => {
      beforeEach(() => {
        checkbox.click();
      });

      it('then the date input should be cleared', () => {
        expect(dayInput.value).to.equal('');
        expect(monthInput.value).to.equal('');
        expect(yearInput.value).to.equal('');
      });

      it('then the aria alert should tell the user that the date input has been cleared', done => {
        setTimeout(() => {
          expect(ariaAlert.innerHTML).to.equal(
            // prettier-ignore
            `${params.day.label.text} ${params.mutuallyExclusive.deselectGroupAdjective}. ${params.month.label.text} ${params.mutuallyExclusive.deselectGroupAdjective}. ${params.year.label.text} ${params.mutuallyExclusive.deselectGroupAdjective}.`,
          );
          done();
        }, 300);
      });
    });
  });

  describe('Given the user has checked the mutually exclusive checkbox', () => {
    beforeEach(() => {
      checkbox.click();
    });

    describe('when the user populates the dateInput', () => {
      beforeEach(() => {
        populateDate(dayInput, monthInput, yearInput);
      });

      it('then the checkbox should be unchecked', () => {
        expect(checkbox.checked).to.equal(false);
      });

      it('then the aria alert should tell the user that the checkbox has been unchecked', done => {
        setTimeout(() => {
          expect(ariaAlert.innerHTML).to.equal(
            `${params.mutuallyExclusive.checkbox.label.text} ${params.mutuallyExclusive.deselectCheckboxAdjective}.`,
          );
          done();
        }, 300);
      });
    });
  });

  describe('Given the user has not populated the date input or checked the checkbox', () => {
    describe('when the user populates the date input', () => {
      beforeEach(() => {
        populateDate(dayInput, monthInput, yearInput);
      });

      it('then the aria alert shouldnt say anything', done => {
        setTimeout(() => {
          expect(ariaAlert.innerHTML).to.equal('');
          done();
        }, 300);
      });
    });

    describe('when the user clicks the mutually exclusive option', () => {
      beforeEach(() => {
        checkbox.click();
      });

      it('then the aria alert shouldnt say anything', done => {
        setTimeout(() => {
          expect(ariaAlert.innerHTML).to.equal('');
          done();
        }, 300);
      });
    });
  });
});

function populateDate(dayInput, monthInput, yearInput) {
  dayInput.value = 14;
  monthInput.value = 12;
  yearInput.value = 2018;

  const event = new CustomEvent('input');

  dayInput.dispatchEvent(event);
  monthInput.dispatchEvent(event);
  yearInput.dispatchEvent(event);
}
