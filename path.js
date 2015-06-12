define(function(){
  var Path=function(canvas){
    var _this=this;
    _this.canvas=canvas;
    _this.width=canvas.width;
    _this.gap=300;//test
    _this.ctx=_this.canvas.getContext('2d');
    _this.offset=0;
  };

  Path.prototype.draw=function(d_offset){
    var _this=this,
      offset=_this.offset+d_offset,
      currentPoint=-(offset % _this.gap) + _this.gap;
    _this.offset=offset;
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