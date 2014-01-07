var syncForTest = function(fn) {
  var callSuper;

  if (typeof fn !== "function") { callSuper = true; }

  return function() {
    var override = false, ret;

    if (Ember.run && !Ember.run.currentRunLoop) {
      Ember.run.begin();
      override = true;
    }

    try {
      if (callSuper) {
        ret = this._super.apply(this, arguments);
      } else {
        ret = fn.apply(this, arguments);
      }
    } finally {
      if (override) {
        Ember.run.end();
      }
    }

    return ret;
  };
};

Ember.RSVP.Promise.prototype.then = syncForTest(Ember.RSVP.Promise.prototype.then);
module('IcLazyList', {
  setup: function() {
    Ember.run(App, 'reset');
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

test('loads records', function() {
  visit('/').then(function() {
    var component = Ember.View.views['lazy-list'];
    equal(component.get('data.length'), 3);
    window.scrollTo(0, 3000);
    stop();
    Ember.run.next(null, function() {
      start();
      equal(component.get('data.length'), 5);
    });
  });
});

