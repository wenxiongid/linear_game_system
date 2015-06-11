define(function(){
  var Path=function(canvas){
    var _this=this;
    _this.canvas=canvas;
    _this.width=canvas.width;
    _this.gap=100;//test
    _this.ctx=_this.canvas.getContext('2d');
  };

  Path.prototype.draw=function(offset){
    var _this=this,
      currentPoint=-(offset % _this.gap) + _this.gap;
    currentPoint=Math.round(currentPoint);
    _this.ctx.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
    _this.ctx.translate(0, 0);
    _this.ctx.beginPath();
    _this.ctx.strokeStyle='#000';
    _this.ctx.lineWidth=5;
    while(currentPoint<_this.canvas.width){
      _this.ctx.moveTo(currentPoint, 0);
      _this.ctx.lineTo(currentPoint, _this.canvas.height);
      currentPoint+=_this.gap;
    }
    _this.ctx.stroke();
    _this.ctx.closePath();
  };

  return Path;
});