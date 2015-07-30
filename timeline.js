define([
  'request_frame',
  'helper',
  'event'
], function(
  w,
  Helper,
  EV
){
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
    if(_this.status!='running'){
      _this.startTime=(new Date()).getTime()-_this.timeOffset;
      _this.status='running';
      _this.updateTime();
    }
  };

  TimeLine.prototype.stop=function(){
    var _this=this;
    if(_this.status=='running'){
      window.cancelAnimationFrame(_this.runningTimer);
      _this.status='stop';
      _this.timeOffset=0;
    }
  };

  TimeLine.prototype.pause=function(){
    var _this=this;
    if(_this.status=='running'){
      window.cancelAnimationFrame(_this.runningTimer);
      _this.status='paused';
    }
  };

  TimeLine.prototype.updateTime=function(){
    var _this=this,
      currentTimeOffset,
      gapTimeOffset;
    if(_this.status=='running'){
      _this.runningTimer=w.requestAnimationFrame(function(){
        _this.updateTime();
      });
      currentTimeOffset=(new Date()).getTime() - _this.startTime;
      gapTimeOffset=currentTimeOffset-_this.timeOffset;
      _this.trigger('timeUpdate', {
        offset: _this.timeOffset,
        d_offset: gapTimeOffset
      });
      _this.timeOffset=currentTimeOffset;
    }
  };

  return TimeLine;
});