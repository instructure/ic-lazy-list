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

test('loads initial records', function() {
  visit('/').then(function() {
    var component = Ember.View.views['lazy-list'];
    equal(component.get('data.length'), 3);
  });
});

test('loads next page of records', function() {
  visit('/').then(function() {
    var component = Ember.View.views['lazy-list'];
    equal(component.get('data.length'), 3);
    window.scrollTo(0, 3000);
    $(window).trigger('scroll');
    equal(component.get('data.length'), 5);
  });
});

