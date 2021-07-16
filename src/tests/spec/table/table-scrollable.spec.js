import TableScroll from '../../../components/table/scrollable-table';
import renderTemplate from '../../helpers/render-template';

const params = {
  scrollable: true,
  ths: [
    {
      value: 'Column 1',
    },
    {
      value: 'Column 2',
    },
    {
      value: 'Column 3',
    },
    {
      value: 'Column 4',
    },
    {
      value: 'Column 5',
    },
    {
      value: 'Column 6',
    },
    {
      value: 'Column 8',
    },
    {
      value: 'Column 9',
    },
    {
      value: 'Column 10',
    },
    {
      value: 'Column 11',
    },
    {
      value: 'Column 12',
    },
    {
      value: 'Column 13',
    },
  ],
  trs: [
    {
      tds: [
        {
          value: 'Monthly Business Survey - Retail Sales Index',
        },
        {
          value: 'Annual Inward Foreign Direct Investment Survey',
        },
        {
          value: 'Business Register and Employment Survey',
        },
        {
          value: 'Quartely Survey of Building Materials Sand and Gravel',
        },
        {
          value: 'Monthly Survey of Building Materials Concrete Building Blocks',
        },
        {
          value: 'Monthly Business Survey - Retail Sales Index',
        },
        {
          value: 'Annual Inward Foreign Direct Investment Survey',
        },
        {
          value: 'Business Register and Employment Survey',
        },
        {
          value: 'Quartely Survey of Building Materials Sand and Gravel',
        },
        {
          value: 'Monthly Survey of Building Materials Concrete Building Blocks',
        },
        {
          value: 'Monthly Business Survey - Retail Sales Index',
        },
        {
          value: 'Annual Inward Foreign Direct Investment Survey',
        },
        {
          value: 'Business Register and Employment Survey',
        },
      ],
    },
  ],
};

describe('Component: Scrollable table', function() {
  beforeEach(function() {
    const component = renderComponent(params);

    Object.keys(component).forEach(key => {
      this[key] = component[key];
    });
  });

  afterEach(function() {
    if (this.wrapper) {
      this.wrapper.remove();
    }
  });

  describe('When the component initialises', function() {
    beforeEach(function() {
      new TableScroll(this.tableComponent);
    });

    it('should add shadow elements', function() {
      expect('div.table__left-shadow').to.exist;
      expect('div.table__right-shadow').to.exist;
    });

    describe('When the table component is scrolled,', function() {
      beforeEach('Scroll table', function() {
        this.tableScrollEl.scrollLeft = 10;
      });

      it('should show both shadow elements', function(done) {
        setTimeout(function() {
          expect('div.table__left-shadow.visible').to.exist;
          expect('div.table__right-shadow.visible').to.exist;
          done();
        }, 200);
      });
    });
  });
});

function renderComponent(params) {
  const html = renderTemplate('components/table/_test-template.njk', { params });

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);

  const tableComponent = wrapper.querySelector('.table-scrollable');
  const tableScrollEl = tableComponent.querySelector('.table-scrollable__content');
  const tableEl = tableComponent.querySelector('.table');

  tableEl.style.width = '101%';
  tableComponent.style.position = 'relative';
  tableScrollEl.style.width = '100%';
  tableScrollEl.style.overflow = 'visible';
  tableScrollEl.style.overflowX = 'scroll';

  return {
    wrapper,
    tableComponent,
    tableScrollEl,
    tableEl,
  };
}
