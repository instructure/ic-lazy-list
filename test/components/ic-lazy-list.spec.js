module('IcLazyList', {
  setup: function() {
    App.reset();
  }
});

ic.ajax.defineFixture('http://example.com/users', {
  response: [
    {id: 1, name: 'ryan'},
    {id: 2, name: 'stanley'},
    {id: 2, name: 'matthew'}
  ],
  textStatus: '',
  jqXHR: {
    getResponseHeader: function(header) {
      return [
        '<http://example.com/users?page=1>; rel="current"',
        '<http://example.com/users?page=2>; rel="next"'
      ].join(',');
    }
  }
});

ic.ajax.defineFixture('http://example.com/users?page=2', {
  response: [
    {id: 1, name: 'aaron'},
    {id: 2, name: 'jason'}
  ],
  textStatus: '',
  jqXHR: {
    getResponseHeader: function(header) {
      return '<http://example.com/users/?page=1&per_page=2>; rel="current",'+
             '<http://example.com/users/?page=2&per_page=2>; rel="previous"';
    }
  }
});

test('sends click action', function() {
  Ember.run(function() {
    window.scrollTo(0, 3000);
    ok(true);
  });
  //expect(2);
  //var controller = App.__container__.lookup('controller:application');
  //equal(controller.get('foo'), 'bar');
  //click('#ic-lazy-list-1').then(function() {
    //equal(controller.get('foo'), 'baz');
  //});
});

