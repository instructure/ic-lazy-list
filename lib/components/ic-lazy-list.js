+function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['ember', 'ic-ajax'], function(Ember, ajax) {
      return factory(Ember, ajax);
    });
  } else if (typeof exports === 'object') {
    module.exports = factory(require('ember'), require('ic-ajax'));
  } else {
    root.IcLazyList = factory(Ember, ic.ajax);
  }
}(this, function(Ember, ajax) {

  // taken from underscore, see license at
  // https://github.com/jashkenas/underscore/blob/master/LICENSE
  var throttle = function(func, wait) {
    var context, args, timeout, result;
    var previous = 0;
    var later = function() {
      previous = new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  var IcLazyList = Ember.Component.extend({

    tagName: 'ic-lazy-list',

    registerWithConstructor: function() {
      if (this.get('meta.next')) this.constructor.register(this);
    }.observes('meta.next'),

    unregisterFromConstructor: function() {
      if (!this.get('meta.next')) this.constructor.unregister(this);
    }.observes('meta.next'),

    setData: function() {
      this.set('data', Ember.ArrayProxy.create({
        content: []
      }));
      this.set('meta', Ember.Object.create());
    }.on('init'),

    loadRecords: function(href) {
      this.set('isLoading', true);
      ajax.raw(href || this.get('href')).then(this.ajaxCallback.bind(this));
    }.on('didInsertElement'),

    loadNextRecords: function() {
      this.loadRecords(this.get('meta.next'));
    },

    ajaxCallback: function(result) {
      this.get('data').pushObjects(this.normalize(result));
      this.set('meta', this.extractMeta(result));
      this.set('isLoading', false);
    },

    normalize: function(result) {
      var key = this.get('data-key');
      return key ? result.response[key] : result.response;
    },

    extractMeta: function(result) {
      var regex = /<(http.*?)>; rel="([a-z]*)",?/g;
      var links = {};
      var header = result.jqXHR.getResponseHeader('Link');
      if (!header) return links;
      var link;
      while (link = regex.exec(header)) {
        links[link[2]] = link[1];
      }
      return links;
    }

  });

  IcLazyList.reopenClass({

    views: [],

    scrollContainer: Ember.$(window),

    scrollBuffer: 500,

    register: function(view) {
      this.views.addObject(view);
      if (this.views.length === 1) {
        var handler = throttle(this.checkViews.bind(this), 100);
        this.scrollContainer.on('scroll.ic-lazy-list', handler);
      }
      Ember.run.scheduleOnce('afterRender', this, 'checkViews');
    },

    unregister: function(view) {
      this.views.removeObject(view);
      if (this.views.length === 0) {
        this.scrollContainer.off('scroll.ic-lazy-list');
      }
    },

    checkViews: function() {
      var bottom, view;
      for (var i = 0, l = this.views.length; i < l; i++) {
        view = this.views[i];
        if (view.get('isLoading')) {
          continue;
        }
        bottom = view.get('element').getBoundingClientRect().bottom;
        if (bottom <= window.innerHeight + this.scrollBuffer) {
          view.loadNextRecords();
        }
      }
    }

  });

  return IcLazyList;

});

