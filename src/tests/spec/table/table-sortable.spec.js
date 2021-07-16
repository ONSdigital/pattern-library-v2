import TableSort from '../../../components/table/sortable-table';
import renderTemplate from '../../helpers/render-template';

const params = {
  sortable: true,
  table_class: ' table--sortable',
  sortBy: 'Sort by',
  ariaAsc: 'ascending',
  ariaDesc: 'descending',
  ths: [
    {
      value: 'Column 1',
      ariaSort: 'none',
    },
    {
      value: 'Column 2',
      ariaSort: 'none',
    },
    {
      value: 'Column 3',
      ariaSort: 'none',
    },
    {
      value: 'Column 4',
      ariaSort: 'none',
    },
  ],
  trs: [
    {
      tds: [
        {
          value: 'A',
          dataSort: '1',
        },
        {
          value: 'A',
          dataSort: '4',
        },
        {
          value: 'A',
          dataSort: '0',
        },
        {
          value: 'A',
          dataSort: '2',
        },
      ],
    },
    {
      tds: [
        {
          value: 'B',
          dataSort: '2',
        },
        {
          value: 'B',
          dataSort: '4',
        },
        {
          value: 'B',
          dataSort: '0',
        },
        {
          value: 'B',
          dataSort: '2',
        },
      ],
    },
    {
      tds: [
        {
          value: 'C',
          dataSort: '3',
        },
        {
          value: 'C',
          dataSort: '4',
        },
        {
          value: 'C',
          dataSort: '0',
        },
        {
          value: 'C',
          dataSort: '2',
        },
      ],
    },
  ],
};

let originalValues = [],
  sortedValues = [];

describe('Component: Sortable table', function() {
  describe('When the component initialises', function() {
    before(function() {
      const component = renderComponent(params);

      Object.keys(component).forEach(key => {
        this[key] = component[key];
      });

      new TableSort(this.tableEl);

      const trs = [...this.tbody.querySelectorAll('tr')];
      for (let i = 0; i < trs.length; i++) {
        const tdVal = trs[i].childNodes[1].textContent;
        originalValues.push(tdVal);
      }
    });

    after(function() {
      if (this.wrapper) {
        this.wrapper.remove();
      }
    });

    it('should create a button element in each TH', function() {
      this.sortableHeadings.forEach(heading => {
        let headingChild = heading.childNodes[2];
        for (let i = 0; i < headingChild.length; i++) {
          expect(headingChild[i].getAttribute('type')).to.equal('button');
        }
      });
    });

    it('should create a status element with aria attributes', function() {
      const status = document.querySelector('.sortable-table-status');
      expect(status).to.exist;
      expect(status.getAttribute('aria-live')).to.equal('polite');
      expect(status.getAttribute('role')).to.equal('status');
      expect(status.getAttribute('aria-atomic')).to.equal('true');
    });

    describe('Each sort button element', function() {
      it('should contain an aria-label attribute', function() {
        this.sortableHeadings.forEach(heading => {
          let button = heading.childNodes[2];
          let headingText = heading.textContent.trim();
          expect(button.getAttribute('aria-label')).to.equal('Sort by ' + headingText);
        });
      });

      it('should contain a data-index attribute', function() {
        this.sortableHeadings.forEach((heading, i) => {
          let headingChild = heading.childNodes[2];
          expect(headingChild.getAttribute('data-index')).to.equal('' + i + '');
        });
      });

      it('should be given the class "table__sort-button"', function() {
        this.sortableHeadings.forEach(heading => {
          let headingChild = heading.childNodes[2];
          expect(headingChild.getAttribute('class')).to.equal('table__sort-button');
        });
      });
    });

    describe('When a sort button is clicked', function() {
      before(function() {
        this.sortableHeadings[0].childNodes[2].click();
      });

      it('should be given the aria-sort value of descending', function() {
        const th = this.sortableHeadings[0];
        expect(th.getAttribute('aria-sort')).to.equal('descending');
      });

      it('should set all other aria-sort values to none', function() {
        for (let i = 1; i < this.sortableHeadings.length; i++) {
          expect(this.sortableHeadings[i].getAttribute('aria-sort')).to.equal('none');
        }
      });

      it('should sort the column into descending order', function() {
        originalValues.reverse();
        const trs = this.tbody.querySelectorAll('tr');
        for (let i = 0; i < trs.length; i++) {
          const tdVal = trs[i].childNodes[1].textContent;
          sortedValues.push(tdVal);
        }

        expect(originalValues.join()).to.equal(sortedValues.join());
      });

      it('should update the aria-live status', function() {
        const status = document.getElementsByClassName('sortable-table-status')[0].textContent;
        const headingText = this.sortableHeadings[0].textContent.trim();
        expect(status).to.equal('Sort by ' + headingText + ' (descending)');
      });
    });

    describe('When a sort button is clicked again', function() {
      before(function() {
        this.sortableHeadings[0].childNodes[2].click();
      });

      it('should be given the aria-sort vale of ascending', function() {
        const th = this.sortableHeadings[0];
        expect(th.getAttribute('aria-sort')).to.equal('ascending');
      });

      it('should sort the column into ascending order', function() {
        sortedValues = [];
        originalValues.reverse();

        const trs = this.tbody.querySelectorAll('tr');
        for (let i = 0; i < trs.length; i++) {
          const tdVal = trs[i].childNodes[1].textContent;
          sortedValues.push(tdVal);
        }

        expect(originalValues.join()).to.equal(sortedValues.join());
      });
    });
  });
});

function renderComponent(params) {
  const html = renderTemplate('components/table/_test-template.njk', { params });

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);

  const tableEl = document.querySelector('.table');
  const sortableHeadings = [...document.querySelectorAll('[aria-sort]')];
  const tbody = tableEl.querySelector('.table__body');

  return {
    wrapper,
    tableEl,
    tbody,
    sortableHeadings,
  };
}
