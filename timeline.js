define([
  'helper',
  'event'
], function(
  Helper,
  EV
){
  (function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||    // Webkit中此取消方法的名字变了
      window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
        var id = window.setTimeout(function() {
          callback(currTime + timeToCall);
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };
    }
    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
      };
    }
  }());

  var TimeLine= function(){
    var _this=this;
    EV.call(_this);
    _this.startTime=0;
    _this.timeOffset=0;
    _this.status='stop';
  };

  Helper.inheritPrototype(TimeLine, EV);

  TimeLine.prototype.start=function(){
    var _this=this;
    _this.startTime=(new Date()).getTime()-_this.timeOffset;
    _this.status='running';
    // _this.runningTimer=setInterval(function(){
    //   _this.updateTime();
    // }, 1000 / 24);
    _this.updateTime();
  };

  TimeLine.prototype.stop=function(){
    var _this=this;
    window.cancelAnimationFrame(_this.runningTimer);
    // clearInterval(_this.runningTimer);
    _this.status='stop';
    _this.timeOffset=0;
  };

  TimeLine.prototype.pause=function(){
    var _this=this;
    window.cancelAnimationFrame(_this.runningTimer);
    // clearInterval(_this.runningTimer);
    _this.status='paused';
  };

  TimeLine.prototype.updateTime=function(){
    var _this=this;
    if(_this.status=='running'){
      _this.runningTimer=window.requestAnimationFrame(function(){
        _this.updateTime();
      });
      _this.currentTime=(new Date()).getTime();
      _this.timeOffset=_this.currentTime-_this.startTime;
      _this.trigger('timeUpdate', _this.timeOffset);
    }
  };

  return TimeLine;
});