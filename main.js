+function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'ember',
      './lib/components/ic-lazy-list',
      './lib/templates'
    ], function(Ember, IcLazyList) {
      return factory(Ember, IcLazyList);
    });
  } else if (typeof exports === 'object') {
    module.exports = factory(
      require('ember'),
      require('./lib/components/ic-lazy-list'),
      require('./lib/templates')
    );
  } else {
    factory(Ember);
  }
}(this, function(Ember, IcLazyList) {

  Ember.Application.initializer({
    name: 'ic-lazy-list',
    initialize: function(container, application) {
      container.register('component:ic-lazy-list', IcLazyList);
    }
  });

  return {
    IcLazyListComponent: IcLazyListComponent
  };

});

