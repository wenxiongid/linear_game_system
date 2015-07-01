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
    _this.charaterImgData=_this.charater.ctx.getImageData(0, 0, _this.charater.canvas.width, _this.charater.canvas.height).data;
    $.each(_this.line, function(i, line){
      var new_line=[],
        node_offset,
        node_info={};
      if(_this.option.lineInfo[i]){
        while(line.length){
          node_offset=line.splice(0,1)[0];
          node_info={};
          node_info.x=Math.round(node_offset- _this.offset);
          node_info.y=Math.round(_this.option.lineInfo[i].y);
          node_info.w=20;
          node_info.h=20;
          
          if(node_offset>=_this.offset){
            new_line.push(node_offset);
            if(node_offset<=_this.offset + _this.canvas.width){
              _this.ctx.fillRect(node_info.x, node_info.y, node_info.w, node_info.h);
              _this.pathImgData=_this.ctx.getImageData(0, 0, _this.canvas.width, _this.canvas.height).data;
              _this.checkHit(i, node_info);
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

  Path.prototype.checkHit=function(lineIndex, noteInfo){
    var _this=this,
      start_point,
      end_point,
      isHit=false;
    for(var i=0; i<noteInfo.h; i++){
      start_point=(noteInfo.y+i)*_this.canvas.width+noteInfo.x;
      end_point=start_point+noteInfo.w;
      for(var j=start_point; j<end_point; j++){
        if(_this.charaterImgData[j * 4 + 3]>0 && _this.pathImgData[j * 4 + 3] >0){
          isHit=true;
          break;
        }
      }
      if(isHit){
        break;
      }
    }

    if(isHit){
      _this.charater.hit();
    }
    return isHit;
  };

  return Path;
});