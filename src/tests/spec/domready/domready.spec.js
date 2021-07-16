import domready from '../../../js/domready';

describe('DomReady function', function() {
  beforeEach(function() {
    this.spy = chai.spy(() => {});
  });

  describe('When the dom is ready', function() {
    beforeEach(function() {
      domready(this.spy);
    });

    it('callbacks should be run', function() {
      expect(this.spy).to.have.been.called();
    });
  });
});
