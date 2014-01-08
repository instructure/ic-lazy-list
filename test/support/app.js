var App = Ember.Application.create({
  // wont' work with this :\
  //rootElement: '#qunit-fixture'
});
App.setupForTesting();
App.injectTestHelpers();
