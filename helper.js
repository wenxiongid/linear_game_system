define(function(){
  var Helper={
    isFunction: function(){
      return !!(fn && toString.call(fn)=='[object Function]');
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
    }
  };

  return Helper;
});
