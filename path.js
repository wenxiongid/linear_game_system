define([
  'jquery'
], function(
  $
){
  var Path=function(wrapper, charater, direction, option){
    var _this=this;
    _this.$wrapper=$(wrapper);
    _this.charater=charater;
    _this.line={};
    _this.offset=0;
    _this.direction= direction || 1;//[0, 1, 2, 3]
    switch(_this.direction){
      case 0:
      case '0':
        _this.posParam={
          x: 'left',
          y: 'bottom'
        };
        break;
      case 1:
      case '1':
        _this.posParam={
          x: 'left',
          y: 'top'
        };
        break;
      case 2:
      case '2':
        _this.posParam={
          x: 'left',
          y: 'top'
        };
        break;
      case 3:
      case '3':
        _this.posParam={
          x: 'right',
          y: 'top'
        };
        break;
    }
    _this.option=$.extend({
      lineInfo:[],
      zoom: 1
    }, option || {});
    _this.zoom=_this.option.zoom;
    if(_this.option.width){
     _this.width=_this.option.width;
    }
    if(_this.option.height){
     _this.height=_this.option.height;
    }
  };

  Path.prototype.setNodePos=function(nodeInfo, lineIndex, isForce){
    var _this=this,
      drawInfo={},
      lineInfo=_this.option.lineInfo[lineIndex],
      cssParam={};
    drawInfo.x=Math.round(nodeInfo.offset- _this.offset);
    drawInfo.y=Math.round(_this.option.lineInfo[lineIndex].y);
    drawInfo.type=nodeInfo.type;
    drawInfo.className=lineInfo.nodeClass[nodeInfo.type];
    switch(nodeInfo.type){
      case 2://gold
        if(lineIndex==0){
          drawInfo.y -= 80;
        }
        break;
      case 1:
      default:
    }
    drawInfo.img=_this.option.nodeInfo[nodeInfo.type][lineIndex];
    if(!drawInfo.img.step && drawInfo.img.step!=0){
      drawInfo.img.step=0;
    }
    drawInfo.img.step %= drawInfo.img.stepCount;
    drawInfo.y -= drawInfo.img.height;
    drawInfo.w=drawInfo.img.width;
    drawInfo.h=drawInfo.img.height;
    cssParam={
      '-webkit-transform':'scale('+_this.zoom+')',
      '-moz-transform':'scale('+_this.zoom+')',
      '-o-transform':'scale('+_this.zoom+')',
      '-ms-transform':'scale('+_this.zoom+')',
      'transform':'scale('+_this.zoom+')'
    };
    cssParam[_this.posParam.y]=drawInfo.y * _this.zoom;
    cssParam[_this.posParam.x]=(drawInfo.x + _this.offset) * _this.zoom;
    if(!nodeInfo.$el){
      nodeInfo.$el=$('<div class="node '+ drawInfo.className+'"></div>');
      nodeInfo.$el.appendTo(_this.$wrapper).css(cssParam);
    }else{
      if(isForce){
        nodeInfo.$el.appendTo(_this.$wrapper).css(cssParam);
      }
    }

    return drawInfo;
  };

  Path.prototype.draw=function(d_offset, isForce){
    var _this=this,
      offset=_this.offset+d_offset,
      wrapperCssParam={
        '-webkit-transform':'translate3d('+ -_this.offset * _this.zoom+'px, 0px, 0px)',
        '-moz-transform':'translate3d('+ -_this.offset * _this.zoom+'px, 0px, 0px)',
        '-o-transform':'translate3d('+ -_this.offset * _this.zoom+'px, 0px, 0px)',
        '-ms-transform':'translate3d('+ -_this.offset * _this.zoom+'px, 0px, 0px)',
        'transform':'translate3d('+ -_this.offset * _this.zoom+'px, 0px, 0px)',
      };
      if(_this.width){
        wrapperCssParam.width=(_this.width + _this.offset) * _this.zoom;
      }
      if(_this.height){
        wrapperCssParam.height=(_this.height + _this.offset) * _this.zoom;
      }
    _this.offset=offset;
    _this.$wrapper.css(wrapperCssParam);
    
    var debug_node_count=0;
    $.each(_this.line, function(i, line){
      var new_line=[],
        node_offset,
        node_info,
        node_draw_info={},
        line_info,
        node_hit_info={},
        node_class='';  
      if(line_info=_this.option.lineInfo[i]){
        while(line.length){
          node_info=line.splice(0,1)[0];
          node_draw_info={};
          
          if(node_info.offset>=_this.offset){
            if(node_info.offset<=_this.offset + _this.width){
              node_draw_info=_this.setNodePos(node_info, i, isForce);
              node_hit_info={
                x: node_draw_info.x * _this.zoom,
                y: node_draw_info.y * _this.zoom,
                w: node_draw_info.w * _this.zoom,
                h: node_draw_info.h * _this.zoom,
                type: node_info.type
              };
              if(node_hit_info.x <= (_this.charater.hitRect.x + _this.charater.hitRect.w) && _this.checkHit(node_hit_info)){
                if(node_info.$el){
                  node_info.$el.remove();
                  node_info.$el=null;
                }
              }else{
                new_line.push(node_info);
              }
            }else{
              new_line.push(node_info);
            }
          }else{
            if(node_info.$el){
              node_info.$el.remove();
              node_info.$el=null;
            }
          }

          if(isForce && node_info.$el){
            _this.setNodePos(node_info, i, isForce);
          }
        }
        _this.line[i]=new_line;
        debug_node_count+=new_line.length;
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
        return false;// break
      }
    });
    if(!isExist){
      _this.line[lineIndex].push({
        offset: offset,
        type: type
      });
    }

    return !isExist;
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