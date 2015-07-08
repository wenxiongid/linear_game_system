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
    // _this.charaterImgData=_this.charater.ctx.getImageData(0, 0, _this.charater.canvas.width, _this.charater.canvas.height).data;
    $.each(_this.line, function(i, line){
      var new_line=[],
        node_offset,
        node_info,
        node_draw_info={},
        line_info;
      if(line_info=_this.option.lineInfo[i]){
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
                  if(i==0){
                    node_draw_info.y -= 80;
                  }
                  break;
                case 1:
                default:
              }
              node_draw_info.img=_this.option.nodeInfo[node_info.type][i];
              if(!node_draw_info.img.step && node_draw_info.img.step!=0){
                node_draw_info.img.step=0;
              }
              node_draw_info.img.step %= node_draw_info.img.stepCount;
              node_draw_info.y -= node_draw_info.img.height;
              node_draw_info.w=node_draw_info.img.width;
              node_draw_info.h=node_draw_info.img.height;
              // _this.ctx.fillRect(
              //   node_draw_info.x,
              //   node_draw_info.y,
              //   node_draw_info.w,
              //   node_draw_info.h
              // );
              _this.ctx.drawImage(
                node_draw_info.img.img,
                0,
                node_draw_info.img.height * node_draw_info.img.step,
                node_draw_info.img.width,
                node_draw_info.img.height,
                node_draw_info.x,
                node_draw_info.y,
                node_draw_info.w,
                node_draw_info.h
              );
              // _this.pathImgData=_this.ctx.getImageData(0, 0, _this.canvas.width, _this.canvas.height).data;
              if(!_this.checkHit(node_draw_info)){
                new_line.push(node_info);
              }
            }else{
              new_line.push(node_info);
            }
          }
        }
        _this.line[i]=new_line;
      }
    });
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
  Path.prototype.checkHit=function(nodeInfo){
    var _this=this,
      hitRect=_this.charater.hitRect,
      hitRectRange={
        top: hitRect.y,
        left: hitRect.x,
        right: hitRect.x + hitRect.w,
        bottom: hitRect.y + hitRect.h
      },
      nodeRectPoint=[{
        x: nodeInfo.x,
        y: nodeInfo.y
      }, {
        x: nodeInfo.x,
        y: nodeInfo.y + nodeInfo.h
      }, {
        x: nodeInfo.x + nodeInfo.w,
        y: nodeInfo.y
      }, {
        x: nodeInfo.x + nodeInfo.w,
        y: nodeInfo.y + nodeInfo.h
      }],
      insideCount=0,
      outsideCount=0,
      isHit=false;
    // rect check
    /*$.each(nodeRectPoint, function(i, point){
      if(
        point.x >= hitRectRange.left &&
        point.x <= hitRectRange.right &&
        point.y >= hitRectRange.top &&
        point.y <= hitRectRange.bottom
      ){
        insideCount++;
      }else{
        outsideCount++;
      }
    });
    if(insideCount>0){
      _this.charater.hit(nodeInfo.type);
      isHit=true;
    }*/

    // round check
    var hitCenter={
        x: hitRect.x + hitRect.w / 2,
        y: hitRect.y + hitRect.h / 2
      },
      nodeCenter={
        x: nodeInfo.x + nodeInfo.w / 2,
        y: nodeInfo.y + nodeInfo.h /2
      };
      minDistance=(hitRect.w + hitRect.h) / 4 + (nodeInfo.w + nodeInfo.h) /4;
    if(
      Math.pow(
        Math.pow(hitCenter.x - nodeCenter.x, 2) +
        Math.pow(hitCenter.y - nodeCenter.y, 2),
        0.5
      )<minDistance
    ){
      _this.charater.hit(nodeInfo.type);
      isHit=true;
    }

    return isHit;
  };

  // trandition check
  /*Path.prototype.checkHit=function(nodeInfo){
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
  };*/

  return Path;
});