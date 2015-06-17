define([
  'event',
  'helper'
], function(
  EV,
  Helper
){
  var Charater=function(canvas){
    var _this=this;
    _this.canvas=canvas;
    _this.ctx=_this.canvas.getContext('2d');
    _this.line='normal';
    _this.speed=0.2;
  };

  Charater.prototype.normal=function(){
    var _this=this;
    _this.speed=0.2;
    _this.ctx.translate(0, 0);
    _this.ctx.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
    _this.ctx.beginPath();
    _this.ctx.fillStyle='#c45';
    _this.ctx.arc(200, 400, 50, 0, 2 * Math.PI, true);
    _this.ctx.fill();
    _this.ctx.closePath();
  };

  Charater.prototype.air=function(){
    var _this=this;
    _this.speed=0.2;
    _this.ctx.translate(0, 0);
    _this.ctx.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
    _this.ctx.beginPath();
    _this.ctx.fillStyle='#c45';
    _this.ctx.arc(200, 300, 50, 0, 2 * Math.PI, true);
    _this.ctx.fill();
    _this.ctx.closePath();
  };

  Charater.prototype.ground=function(){
    var _this=this;
    _this.speed=0.1;
    _this.ctx.translate(0, 0);
    _this.ctx.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
    _this.ctx.beginPath();
    _this.ctx.fillStyle='#c45';
    _this.ctx.arc(200, 450, 50, 0, 2 * Math.PI, true);
    _this.ctx.fill();
    _this.ctx.closePath();
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