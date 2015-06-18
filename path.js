define([
  'jquery'
], function(
  $
){
  var Path=function(canvas, option){
    var _this=this;
    _this.canvas=canvas;
    _this.line={};
    _this.width=canvas.width;
    _this.gap=300;//test
    _this.ctx=_this.canvas.getContext('2d');
    _this.offset=0;
    _this.option=$.extend({
      lineInfo:[]
    }, option);
  };

  Path.prototype.draw=function(d_offset){
    var _this=this,
      offset=_this.offset+d_offset,
      currentPoint=-(offset % _this.gap) + _this.gap;
    _this.ctx.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
    _this.offset=offset;
    _this.ctx.strokeStyle='#000';
    _this.ctx.lineWidth=5;
    $.each(_this.line, function(i, line){
      var new_line=[],
        node_offset;
      if(_this.option.lineInfo[i]){
        while(line.length){
          node_offset=line.splice(0,1)[0];
          if(node_offset>=_this.offset){
            new_line.push(node_offset);
            if(node_offset<=_this.offset + _this.canvas.width){
              _this.ctx.fillRect(node_offset- _this.offset, _this.option.lineInfo[i].y, 20, 20);
            }
          }
        }
        _this.line[i]=new_line;
      }
    });
    currentPoint=Math.round(currentPoint);
    _this.ctx.translate(0, 0);
    _this.ctx.beginPath();
    // _this.ctx.strokeStyle='#000';
    // _this.ctx.lineWidth=5;
    while(currentPoint<_this.canvas.width){
      _this.ctx.moveTo(currentPoint, 0);
      _this.ctx.lineTo(currentPoint, _this.canvas.height);
      currentPoint+=_this.gap;
    }
    _this.ctx.stroke();
    _this.ctx.closePath();
  };

  Path.prototype.addNote=function(lineIndex, offset){
    var _this=this;
    _this.line[lineIndex].push(offset);
  };

  return Path;
});