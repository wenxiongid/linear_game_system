define([
  'jquery'
], function(
  $
){
  var Helper={
    isFunction: function(fn){
      return $.isFunction(fn);
    },
    inherit: function(o) {
      var F = function() {};
      F.prototype = o;
      return new F();
    },
    inheritPrototype: function(subType, superType) {
      var _this=this,
        proto = _this.inherit(superType.prototype);
      proto.constructor = subType;
      subType.prototype = proto;
    },
    canvasSupport: function(){
      var el=document.createElement('canvas');
      return !!(el.getContext && el.getContext('2d'));
    },
    getNonceStr: function(length){
      var dict='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        noncestr='';
      length=length || 16;
      for(var i=0;i<length;i++){
        noncestr+=dict[Math.floor(Math.random() * dict.length)];
      }

      return noncestr;
    },
    get_rotate_pos: function(rotate, x, y) {
      var length = Math.sqrt(x * x + y * y),
        o_angle = Math.atan(y / x),
        new_angle = o_angle - rotate,
        new_x = Math.cos(new_angle) * length,
        new_y = Math.sin(new_angle) * length;

      return {
        x: new_x,
        y: new_y
      };
    },
    support_touch_event: function(){
      return !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
    },
    getEventPos: function(e){
      var eX=e.pageX,
        eY=e.pageY;
      if(!eX || !eY){
        eX=e.originalEvent.pageX;
        eY=e.originalEvent.pageY;
      }
      if(!eX || !eY){
        eX=e.originalEvent.touches[0].pageX;
        eY=e.originalEvent.touches[0].pageY;
      }
      return {
        x: eX,
        y: eY
      };
    }
  };
  Helper.mouseStartEvent=Helper.support_touch_event() ? 'touchstart' : 'mousedown';
  Helper.mouseEndEvent= Helper.support_touch_event() ? 'touchend' : 'mouseup';
  Helper.mouseMoveEvent= Helper.support_touch_event() ? 'touchmove' : 'mousemove';

  return Helper;
});
