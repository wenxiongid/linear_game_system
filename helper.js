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
    }
  };

  return Helper;
});
