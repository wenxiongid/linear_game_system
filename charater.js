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
  var Charater=function(canvas, option){
    var _this=this;
    _this.canvas=canvas;
    _this.ctx=_this.canvas.getContext('2d');
    _this.line='normal';
    _this.option=$.extend({
      speedMax: 0.5,
      accelerate: 0.1,
      hitPoint: 250
    }, option || {});
    _this.vY0=350;
    _this.g=450;
    _this.speed=0;
    _this.actionTimer=0;
  };

  Charater.prototype.startSpeedUp=function(){
    var _this=this;
    if(!_this.isUppingSpeed){
      _this.speedUp();
    }
  };

  Charater.prototype.speedUp=function(){
    var _this=this,
      currentTime=(new Date()).getTime();
    if(_this.isHit){
      _this.isUppingSpeed=false;
      _this.startSpeedUpTime=null;
      _this.startSpeedUpSpeed=_this.speed;
    }else{
      if(!_this.startSpeedUpTime){
        _this.startSpeedUpTime=(new Date()).getTime();
        _this.startSpeedUpSpeed=_this.speed;
      }
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

  Charater.prototype.draw=function(y, type){
    var _this=this,
      charaterImg;
    _this.charaterY=y;
    _this.ctx.translate(0, 0);
    _this.ctx.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
    if(_this.isHit){
      charaterImg=_this.option.hitImg;
      if(_this.line=='ground'){
        y=-57;
      }else{
        y-=57;
      }
    }else{
      switch(type){
        case 'air':
          charaterImg=_this.option.jumpImg;
          break;
        case 'ground':
          charaterImg=_this.option.slideImg;
          y-=10;
          break;
        case 'hit':
          charaterImg=_this.option.hitImg;
          break;
        case 'normal':
          // go on
        default:
          switch(true){
            case _this.speed>0.4:
              charaterImg=_this.option.runImg;
              y+=21;
              break;
            case _this.speed>0 && _this.speed<=0.4:
              charaterImg=_this.option.walkImg;
              break;
            default:
              charaterImg=_this.option.standImg;
          }
      }
    }
    if(!charaterImg.step && charaterImg.step!=0){
      charaterImg.step=0;
    }
    charaterImg.step %= charaterImg.stepCount;
    _this.hitRect={
      x: _this.option.hitPoint-charaterImg.width + charaterImg.hitRect.offsetX,
      y: 320-y + charaterImg.hitRect.offsetY,
      w: charaterImg.hitRect.w,
      h: charaterImg.hitRect.h
    };
    // _this.ctx.fillStyle='#900';
    // _this.ctx.fillRect(
    //   _this.hitRect.x,
    //   _this.hitRect.y,
    //   _this.hitRect.w,
    //   _this.hitRect.h
    // );
    _this.ctx.drawImage(
      charaterImg.img,
      0,
      charaterImg.step*charaterImg.height,
      charaterImg.width,
      charaterImg.height,
      _this.option.hitPoint-charaterImg.width,
      320-y,
      charaterImg.width,
      charaterImg.height
    );
    charaterImg.step++;
  };

  Charater.prototype.drawHit=function(){
    var _this=this;
    clearTimeout(_this.actionTimer);
    _this.draw(_this.charaterY, 'hit');
  };

  Charater.prototype.normal=function(){
    var _this=this;
    clearTimeout(_this.actionTimer);
    _this.line='normal';
    _this.draw(0, 'normal');
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
      _this.draw(newY, 'air');
      w.requestAnimationFrame(function(){
        _this.changeAirPos();
      });
    }else{
      _this.action('normal');
    }
  };

  Charater.prototype.ground=function(){
    var _this=this;
    clearTimeout(_this.actionTimer);
    _this.isUppingSpeed=false;
    _this.line='ground';
    _this.draw(-50, 'ground');
    _this.speed*=0.9;
  };

  Charater.prototype.action=function(type){
    var _this=this;
    switch(type){
      case 'air':
        _this.air();
        break;
      case 'ground':
        _this.ground();
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