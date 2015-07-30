define([
  'request_frame',
  'event',
  'helper',
  'jquery'
], function(
  w,
  EV,
  Helper,
  $
){
  var Charater=function(el, timeline, option){
    var _this=this;
    _this.$el=$(el);
    _this.line='normal';
    _this.timeline=timeline;
    _this.option=$.extend({
      speedMax: 0.5,
      accelerate: 0.1,
      hitPoint: 250
    }, option || {});
    _this.zoom=_this.option.zoom;
    _this.vY0=350;
    _this.g=500;
    _this.speed=0;
    _this.actionTimer=0;

    _this.y=0;
  };

  Charater.prototype.startSpeedUp=function(){
    var _this=this;
    if(!_this.isUppingSpeed){
      _this.speedUp();
    }
  };

  Charater.prototype.speedUp=function(){
    var _this=this;
    if(_this.isHit){
      _this.isUppingSpeed=false;
      _this.startSpeedUpTime=null;
      _this.startSpeedUpSpeed=_this.speed;
    }else{
      if(!_this.startSpeedUpTime){
        _this.startSpeedUpTime=_this.timeline.timeOffset;
        _this.startSpeedUpSpeed=_this.speed;
      }
      _this.isUppingSpeed=true;
    }
  };

  Charater.prototype.updateSpeed=function(){
    var _this=this,
      currentTime=_this.timeline.timeOffset;
    if(_this.isUppingSpeed){
      if(_this.speed<_this.option.speedMax){
        _this.isUppingSpeed=true;
        _this.speed=_this.startSpeedUpSpeed + (currentTime - _this.startSpeedUpTime)/ 1000 * _this.option.accelerate;
        w.requestAnimationFrame(function(){
          _this.speedUp();
        });
      }else{
        _this.isUppingSpeed=false;
        _this.speed=_this.option.speedMax;
      }
    }
  };

  Charater.prototype.render=function(){
    var _this=this;
    if(_this.line=='air'){
      _this.changeAirPos();
    }
    _this.updateSpeed();
    _this.draw(_this.y, _this.type);
  };

  Charater.prototype.draw=function(y, type){
    var _this=this,
      charaterImg,
      charaterClassName,
      rotate=0,
      x=0;
    _this.charaterY=y;
    if(_this.isHit){
      charaterClassName='hit';
      charaterImg=_this.option.hitImg;
      if(_this.line=='ground'){
        y=-57;
      }else{
        y-=57;
      }
    }else{
      switch(type){
        case 'air':
          charaterClassName='jump';
          charaterImg=_this.option.jumpImg;
          break;
        case 'ground':
          charaterClassName='slide';
          charaterImg=_this.option.slideImg;
          y-=10;
          break;
        case 'hit':
          charaterClassName='hit';
          charaterImg=_this.option.hitImg;
          break;
        case 'normal':
          // go on
        default:
          switch(true){
            case _this.speed>0.4:
              charaterClassName='run';
              charaterImg=_this.option.runImg;
              rotate=15;
              y=32;
              x=48;
              break;
            case _this.speed>0 && _this.speed<=0.4:
              charaterClassName='walk';
              charaterImg=_this.option.walkImg;
              break;
            default:
              charaterClassName='stand';
              charaterImg=_this.option.standImg;
          }
      }
    }
    if(!charaterImg.step && charaterImg.step!=0){
      charaterImg.step=0;
    }
    charaterImg.step %= charaterImg.stepCount;
    _this.hitRect={
      x: (_this.option.hitPoint-charaterImg.width + charaterImg.hitRect.offsetX) * _this.zoom,
      y: (320-y + charaterImg.hitRect.offsetY) * _this.zoom,
      w: charaterImg.hitRect.w * _this.zoom,
      h: charaterImg.hitRect.h * _this.zoom
    };
    _this.$el
      .removeClass('jump slide hit run walk stand')
      .addClass(charaterClassName)
      .css({
        '-webkit-transform':'scale('+_this.zoom+') translate3d('+(_this.option.hitPoint-charaterImg.width + x)+'px, '+(320-y)+'px, 0px) rotate('+rotate+'deg)',
        '-moz-transform':'scale('+_this.zoom+') translate3d('+(_this.option.hitPoint-charaterImg.width + x)+'px, '+(320-y)+'px, 0px) rotate('+rotate+'deg)',
        '-o-transform':'scale('+_this.zoom+') translate3d('+(_this.option.hitPoint-charaterImg.width + x)+'px, '+(320-y)+'px, 0px) rotate('+rotate+'deg)',
        '-ms-transform':'scale('+_this.zoom+') translate3d('+(_this.option.hitPoint-charaterImg.width + x)+'px, '+(320-y)+'px, 0px) rotate('+rotate+'deg)',
        'transform':'scale('+_this.zoom+') translate3d('+(_this.option.hitPoint-charaterImg.width + x)+'px, '+(320-y)+'px, 0px) rotate('+rotate+'deg)'
      });
    charaterImg.step++;
  };

  Charater.prototype.drawHit=function(){
    var _this=this;
    clearTimeout(_this.actionTimer);
    _this.y=_this.charaterY;
    _this.type='hit';
  };

  Charater.prototype.normal=function(){
    var _this=this;
    clearTimeout(_this.actionTimer);
    _this.line='normal';
    _this.y=0;
    _this.type='normal';
    _this.actionTimer=setTimeout(function(){
      _this.normal();
    }, 100);
  };

  Charater.prototype.air=function(){
    var _this=this;
    clearTimeout(_this.actionTimer);
    _this.line='air';
    _this.startAirTime=(new Date()).getTime();
    _this.changeAirPos();
  };

  Charater.prototype.changeAirPos=function(){
    var _this=this,
      currentAirTime=(new Date()).getTime(),
      airTime=(currentAirTime-_this.startAirTime)/1000,
      newY=_this.vY0*airTime - _this.g * airTime * airTime / 2;
    if(newY>=0){
      _this.y=newY;
      _this.type='air';
    }else{
      _this.normal();
    }
  };

  Charater.prototype.ground=function(){
    var _this=this;
    clearTimeout(_this.actionTimer);
    _this.isUppingSpeed=false;
    _this.line='ground';
    _this.y=-50;
    _this.type='ground';
    _this.speed*=0.9;
  };

  Charater.prototype.action=function(type){
    var _this=this;
    switch(type){
      case 'air':
        if(_this.line=='normal' || !_this.isHit){
          _this.air();
        }
        break;
      case 'ground':
        if(_this.line=='normal' || !_this.isHit){
          _this.ground();
        }
        break;
      case 'hit':
        _this.drawHit();
        break;
      case 'stand':
        _this.normal();
        break;
      default:
        _this.startSpeedUpTime=null;
        if(!_this.isHit){
          _this.startSpeedUp();
        }
        _this.normal();
    }
  };

  return Charater;
});