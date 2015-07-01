define([
  'event',
  'helper',
  'jquery'
], function(
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
      speedBase: 1.5,
      speedTimes: 0.3,
      hitPoint: 250
    }, option || {});
    _this.updateSpeed();
    _this.vY0=300;
    _this.g=450;
  };

  Charater.prototype.updateSpeed=function(){
    var _this=this;
    _this.speed=_this.option.speedBase*_this.option.speedTimes;
  };

  Charater.prototype.draw=function(y){
    var _this=this;
    _this.ctx.translate(0, 0);
    _this.ctx.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
    _this.ctx.beginPath();
    _this.ctx.fillStyle='#c45';
    _this.ctx.arc(_this.option.hitPoint-50, 400-y, 50, 0, 2 * Math.PI, true);
    _this.ctx.fill();
    _this.ctx.closePath();
  };

  Charater.prototype.normal=function(){
    var _this=this;
    _this.line='normal';
    _this.option.speedBase=1;
    _this.updateSpeed();
    _this.draw(0);
  };

  Charater.prototype.air=function(){
    var _this=this;
    _this.line='air';
    _this.option.speedBase=1;
    _this.updateSpeed();
    _this.startAirTime=(new Date()).getTime();
    _this.changeAirPos();
  };

  Charater.prototype.changeAirPos=function(){
    var _this=this,
      currentAirTime=(new Date()).getTime(),
      airTime=(currentAirTime-_this.startAirTime)/1000,
      newY=_this.vY0*airTime - _this.g * airTime * airTime / 2;
    if(newY>=0){
      _this.draw(newY);
      window.requestAnimationFrame(function(){
        _this.changeAirPos();
      });
    }else{
      _this.normal();
    }
  };

  Charater.prototype.ground=function(){
    var _this=this;
    _this.line='ground';
    _this.option.speedBase=0.8;
    _this.updateSpeed();
    _this.draw(-50);
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
      default:
        _this.normal();
    }
  };

  return Charater;
});