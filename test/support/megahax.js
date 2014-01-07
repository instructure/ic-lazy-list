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

