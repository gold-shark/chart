(function ($, undefined) {
  'use strict';

  var o = {
    start: 'touchstart',
    end: 'touchend'
  };

  $.event.special.tap = {
    setup: function () {
      $(this).off('click').on(o.start + ' ' + o.end, function (e) {
        o.e = e.originalEvent.changedTouches ? e.originalEvent.changedTouches[0] : e;
      }).on(o.start, function (e) {
        if (e.which && e.which !== 1) {
          return;
        }
        o.target = e.target;
        o.time = new Date().getTime();
        o.X = o.e.pageX;
        o.Y = o.e.pageY;
      }).on(o.end, function (e) {
        if (
          o.target === e.target &&
          ((new Date().getTime() - o.time) < 750) &&
          (Math.sqrt(Math.pow(o.X - o.e.pageX, 2) + Math.pow(o.Y - o.e.pageY, 2)) < 15)
        ) {
          e.type = 'tap';
          e.pageX = o.e.pageX;
          e.pageY = o.e.pageY;
          $.event.dispatch.call(this, e);
        }
      });
    },
    teardown: function () {
      $(this).off(o.start + ' ' + o.end);
    }
  };

  $.fn['tap'] = function (fn) {
    return this[fn ? 'on' : 'trigger']('tap', fn);
  };
}(jQuery));
