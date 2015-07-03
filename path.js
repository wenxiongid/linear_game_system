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
    _this.ctx.lineWidth=5;
    _this.charaterImgData=_this.charater.ctx.getImageData(0, 0, _this.charater.canvas.width, _this.charater.canvas.height).data;
    $.each(_this.line, function(i, line){
      var new_line=[],
        node_offset,
        node_info,
        node_draw_info={};
      if(_this.option.lineInfo[i]){
        while(line.length){
          node_info=line.splice(0,1)[0];
          node_draw_info={};
          node_draw_info.x=Math.round(node_info.offset- _this.offset);
          node_draw_info.y=Math.round(_this.option.lineInfo[i].y);
          node_draw_info.w=20;
          node_draw_info.h=20;
          node_draw_info.type=node_info.type;
          
          if(node_info.offset>=_this.offset){
            if(node_info.offset<=_this.offset + _this.canvas.width){
              switch(node_info.type){
                case 2://gold
                  _this.ctx.fillStyle='gold';
                  break;
                case 1:
                default:
                  _this.ctx.fillStyle='#000';
              }
              _this.ctx.fillRect(node_draw_info.x, node_draw_info.y, node_draw_info.w, node_draw_info.h);
              _this.pathImgData=_this.ctx.getImageData(0, 0, _this.canvas.width, _this.canvas.height).data;
              if(!_this.checkHit(i, node_draw_info)){
                new_line.push(node_info);
              }
            }else{
              new_line.push(node_info);
            }
          }
        }
        _this.line[i]=new_line;
        console.log(new_line.length);
      }
    });

    currentPoint=Math.round(currentPoint);
    _this.ctx.translate(0, 0);
    _this.ctx.beginPath();
    _this.ctx.strokeStyle='#000';
    while(currentPoint<_this.canvas.width){
      _this.ctx.moveTo(currentPoint, 0);
      _this.ctx.lineTo(currentPoint, _this.canvas.height);
      currentPoint+=_this.gap;
    }
    _this.ctx.stroke();
    _this.ctx.closePath();
  };

  Path.prototype.addNode=function(lineIndex, offset, type){
    var _this=this,
      isExist=false;
    if(!_this.line[lineIndex]){
      _this.line[lineIndex]=[];
    }
    $.each(_this.line[lineIndex], function(i, node){
      if(node.offset==offset){
        isExist=true;
      }
    });
    if(!isExist){
      _this.line[lineIndex].push({
        offset: offset,
        type: type
      });
    }
  };

  // simple check
  Path.prototype.checkHit=function(lineIndex, node){
    var _this=this;
    _this.hitPoint=_this.offset + _this.charater.option.hitPoint;
    if(node.offset<=_this.hitPoint && node.offset >= _this.hitPoint - 50){
      switch(lineIndex){
        case 0:
        case '0':
          if(_this.charater.line!='ground'){
            _this.charater.hit(node.type);
          }
          break;
        case 1:
        case '1':
          if(_this.charater.line!='air'){
            _this.charater.hit(node.type);
          }
          break;
        default:
          // 
      }
    }
  };

  // trandition check
  Path.prototype.checkHit=function(lineIndex, nodeInfo){
    var _this=this,
      start_point,
      end_point,
      isHit=false;
    for(var i=0; i<nodeInfo.h; i++){
      start_point=(nodeInfo.y+i)*_this.canvas.width+nodeInfo.x;
      end_point=start_point+nodeInfo.w;
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
      _this.charater.hit(nodeInfo.type);
    }
    return isHit;
  };

  return Path;
});