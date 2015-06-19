define([
  'jquery'
], function(
  $
){
  var Path=function(canvas, charater, option){
    var _this=this;
    _this.canvas=canvas;
    _this.charater=charater;
    _this.line={};
    _this.width=canvas.width;
    _this.gap=1000;//test
    _this.ctx=_this.canvas.getContext('2d');
    _this.offset=0;
    _this.option=$.extend({
      lineInfo:[]
    }, option || {});
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
          _this.checkHit(i, node_offset);
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

  Path.prototype.checkHit=function(lineIndex, note){
    var _this=this;
    _this.hitPoint=_this.offset + _this.charater.option.hitPoint;
    if(note<=_this.hitPoint && note >= _this.hitPoint - 50){
      switch(lineIndex){
        case 0:
        case '0':
          if(_this.charater.line!='ground'){
            _this.charater.hit();
          }
          break;
        case 1:
        case '1':
          if(_this.charater.line!='air'){
            _this.charater.hit();
          }
          break;
        default:
          // 
      }
    }
  };

  return Path;
});