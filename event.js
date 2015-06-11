define(['helper'], function(Helper){
  var EV=function(){
    var _this=this;
    _this.eventList={};
  };

  EV.prototype.isFunction=function(fn){
    return !!(fn && toString.call(fn)=='[object Function]');
  };

  EV.prototype.bind=function(eventType, fn){
    var _this=this;
    if(!_this.eventList[eventType]){
      _this.eventList[eventType]=[];
    }
    if(_this.isFunction(fn)){
      _this.eventList[eventType].push(fn);
    }
  };

  EV.prototype.trigger=function(eventType){
    var _this=this,
      eventList=_this.eventList[eventType],
      paramList=Array.prototype.slice.call(arguments);
    paramList.splice(0,1);
    if(eventList){
      for(var i=0; i<eventList.length;i++){
        if(_this.isFunction(eventList[i])){
          eventList[i].apply(_this, paramList);
        }
      }
    }
  };

  return EV;
});