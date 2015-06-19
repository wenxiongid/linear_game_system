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
  };

  Charater.prototype.updateSpeed=function(){
    var _this=this;
    _this.speed=_this.option.speedBase*_this.option.speedTimes;
  };

  Charater.prototype.normal=function(){
    var _this=this;
    _this.option.speedBase=1;
    _this.updateSpeed();
    _this.ctx.translate(0, 0);
    _this.ctx.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
    _this.ctx.beginPath();
    _this.ctx.fillStyle='#c45';
    _this.ctx.arc(_this.option.hitPoint-50, 400, 50, 0, 2 * Math.PI, true);
    _this.ctx.fill();
    _this.ctx.closePath();
  };

  Charater.prototype.air=function(){
    var _this=this;
    _this.option.speedBase=1;
    _this.updateSpeed();
    _this.ctx.translate(0, 0);
    _this.ctx.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
    _this.ctx.beginPath();
    _this.ctx.fillStyle='#c45';
    _this.ctx.arc(_this.option.hitPoint-50, 300, 50, 0, 2 * Math.PI, true);
    _this.ctx.fill();
    _this.ctx.closePath();
  };

  Charater.prototype.ground=function(){
    var _this=this;
    _this.option.speedBase=0.8;
    _this.updateSpeed();
    _this.ctx.translate(0, 0);
    _this.ctx.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
    _this.ctx.beginPath();
    _this.ctx.fillStyle='#c45';
    _this.ctx.arc(_this.option.hitPoint-50, 450, 50, 0, 2 * Math.PI, true);
    _this.ctx.fill();
    _this.ctx.closePath();
  };

  Charater.prototype.action=function(type){
    var _this=this;
    switch(type){
      case 'air':
        _this.line='air';
        _this.air();
        break;
      case 'ground':
        _this.line='ground';
        _this.ground();
        break;
      default:
        _this.line='normal';
        _this.normal();
    }
  };

  return Charater;
});