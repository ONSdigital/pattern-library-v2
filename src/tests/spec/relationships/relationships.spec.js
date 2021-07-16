import Relationships from '../../../components/relationships/relationships';
import renderTemplate from '../../helpers/render-template';

const params = {
  dontWrap: true,
  title: 'Thinking of Joe Bloggs, Amanda Bloggs is their <em>…</em>',
  // eslint-disable-next-line prettier/prettier
  playback: "Amanda Bloggs is Joe Bloggs' <em>…</em>",
  name: 'relationship',
  radios: [
    {
      id: 'husband-wife',
      value: 'husband-wife',
      label: {
        text: 'Husband or wife',
      },
      attributes: {
        'data-title': 'Thinking of Joe Bloggs, Amanda Bloggs is their <em>husband or wife</em>',
        // eslint-disable-next-line prettier/prettier
        'data-playback': "Amanda Bloggs is Joe Bloggs' <em>husband or wife</em>",
      },
    },
    {
      id: 'civil-partner',
      value: 'civil-partner',
      label: {
        text: 'Legally registered civil partner',
      },
      attributes: {
        'data-title': 'Thinking of Joe Bloggs, Amanda Bloggs is their <em>legally registered civil partner</em>',
        // eslint-disable-next-line prettier/prettier
        'data-playback': "Amanda Bloggs is Joe Bloggs' <em>legally registered civil partner</em>",
      },
    },
    {
      id: 'partner',
      value: 'partner',
      label: {
        text: 'Partner',
      },
      attributes: {
        'data-title': 'Thinking of Joe Bloggs, Amanda Bloggs is their <em>partner</em>',
        // eslint-disable-next-line prettier/prettier
        'data-playback': "Amanda Bloggs is Joe Bloggs' <em>partner</em>",
      },
    },
    {
      id: 'son-daughter',
      value: 'son-daughter',
      label: {
        text: 'Son or daughter',
      },
      attributes: {
        'data-title': 'Thinking of Joe Bloggs, Amanda Bloggs is their <em>son or daughter</em>',
        // eslint-disable-next-line prettier/prettier
        'data-playback': "Amanda Bloggs is Joe Bloggs' <em>son or daughter</em>",
      },
    },
    {
      id: 'stepchild',
      value: 'stepchild',
      label: {
        text: 'Stepchild',
      },
      attributes: {
        'data-title': 'Thinking of Joe Bloggs, Amanda Bloggs is their <em>stepchild</em>',
        // eslint-disable-next-line prettier/prettier
        'data-playback': "Amanda Bloggs is Joe Bloggs' <em>stepchild</em>",
      },
    },
    {
      id: 'brother-sister',
      value: 'brother-sister',
      label: {
        text: 'Brother or sister',
      },
      attributes: {
        'data-title': 'Thinking of Joe Bloggs, Amanda Bloggs is their <em>brother or sister</em>',
        // eslint-disable-next-line prettier/prettier
        'data-playback': "Amanda Bloggs is Joe Bloggs' <em>brother or sister</em>",
      },
    },
    {
      id: 'stepbrother-stepsister',
      value: 'stepbrother-stepsister',
      label: {
        text: 'Stepbrother or stepsister',
      },
      attributes: {
        'data-title': 'Thinking of Joe Bloggs, Amanda Bloggs is their <em>stepbrother or sister</em>',
        // eslint-disable-next-line prettier/prettier
        'data-playback': "Amanda Bloggs is Joe Bloggs' <em>stepbrother or sister</em>",
      },
    },
    {
      id: 'mother-father',
      value: 'mother-father',
      label: {
        text: 'Mother or father',
      },
      attributes: {
        'data-title': 'Thinking of Joe Bloggs, Amanda Bloggs is their <em>mother or father</em>',
        // eslint-disable-next-line prettier/prettier
        'data-playback': "Amanda Bloggs is Joe Bloggs' <em>mother or father</em>",
      },
    },
    {
      id: 'stepmother-stepfather',
      value: 'stepmother-stepfather',
      label: {
        text: 'Stepmother or stepfather',
      },
      attributes: {
        'data-title': 'Thinking of Joe Bloggs, Amanda Bloggs is their <em>stepmother or stepfather</em>',
        // eslint-disable-next-line prettier/prettier
        'data-playback': "Amanda Bloggs is Joe Bloggs' <em>stepmother or stepfather</em>",
      },
    },
    {
      id: 'grandchild',
      value: 'grandchild',
      label: {
        text: 'Grandchild',
      },
      attributes: {
        'data-title': 'Thinking of Joe Bloggs, Amanda Bloggs is their <em>grandchild</em>',
        // eslint-disable-next-line prettier/prettier
        'data-playback': "Amanda Bloggs is Joe Bloggs' <em>grandchild</em>",
      },
    },
    {
      id: 'grandparent',
      value: 'grandparent',
      label: {
        text: 'Grandparent',
      },
      attributes: {
        'data-title': 'Thinking of Joe Bloggs, Amanda Bloggs is their <em>grandparents</em>',
        // eslint-disable-next-line prettier/prettier
        'data-playback': "Amanda Bloggs is Joe Bloggs' <em>grandparents</em>",
      },
    },
    {
      id: 'other-relation',
      value: 'other-relation',
      label: {
        text: 'Other relation',
      },
      attributes: {
        'data-title': 'Thinking of Joe Bloggs, Amanda Bloggs is their <em>other relation</em>',
        // eslint-disable-next-line prettier/prettier
        'data-playback': "Amanda Bloggs is Joe Bloggs' <em>other relation</em>",
      },
    },
    {
      id: 'unrelated',
      value: 'unrelated',
      label: {
        text: 'Unrelated',
        description: 'Including foster child',
      },
      attributes: {
        'data-title': 'Thinking of Joe Bloggs, Amanda Bloggs is <em>unrelated</em> to Joe Bloggs',
        'data-playback': 'Amanda Bloggs is <em>unrelated</em> to Joe Bloggs',
      },
    },
  ],
};

describe('Component: Relationships', function() {
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

  describe('Given that the component has not initialised', function() {
    it('then the playback paragraph should not be visible', function() {
      expect(this.playback.classList.contains('u-d-no')).to.equal(true);
    });

    describe('when the component initialises', function() {
      beforeEach(function() {
        this.instance = new Relationships(this.context);
      });

      it('then the playback paragraph should become visible', function() {
        expect(this.playback.classList.contains('u-d-no')).to.equal(false);
      });

      describe('when the user selects a relationship', function() {
        beforeEach(function() {
          this.selectedRadio = this.radios[0];
          this.selectedRadio.click();
        });

        it('the question title should be changed to reflect the relationship', function() {
          expect(this.h1.innerHTML).to.equal(this.selectedRadio.getAttribute('data-title'));
        });

        it('the playback should be changed to reflect the relationship', function() {
          expect(this.playback.innerHTML).to.equal(this.selectedRadio.getAttribute('data-playback'));
        });
      });
    });
  });
});

function renderComponent(params) {
  const html = renderTemplate('components/relationships/_test-template.njk', { params });

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);

  const context = document.querySelector('.js-relationships');
  const h1 = wrapper.querySelector('h1');
  const radios = [...context.querySelectorAll('input[type=radio]')];
  const playback = context.querySelector('.js-relationships-playback');
  return {
    wrapper,
    context,
    h1,
    radios,
    playback,
  };
}
