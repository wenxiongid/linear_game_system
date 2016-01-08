requirejs([
  'jquery',
  'helper',
  'timeline',
  'path',
  'charater',
  'img_storage'
], function(
  $,
  Helper,
  TimeLine,
  Path,
  Character,
  ImgStorage
){
  // UI display
  function updateResult(point){
    $('#result').text(point);
  }
  function showResult(){
    // $restTime.text('0.00');
    myCharater.action('stand');
    $('#resultMask').show();
    $('.result-gold').text(getPoint);
    $('.result-node').text(getNode);
  }
  function showRotateTips(type){
    var $rotateTipsMask=$('#rotateTipsMask');
    switch(type){
      case 'toVert':
        $rotateTipsMask.removeClass('hide');
        $('.rotate-to-vert', $rotateTipsMask).removeClass('hide');
        break;
      case 'toHori':
        $rotateTipsMask.removeClass('hide');
        $('.rotate-to-hori', $rotateTipsMask).removeClass('hide');
        break;
      case 'none'://go on
      default:
        $rotateTipsMask.addClass('hide');
        $('.rotate-to-hori, .rotate-to-vert', $rotateTipsMask).addClass('hide');
    }
  }
  // UI display end

  var $restTime,
    myCharater,
    getPoint=0,
    getNode=0,
    stageHeight=600,
    timeline=new TimeLine(),
    myPath,
    windowInfo={
      width: 0,
      bgZoom:1,
      stageZoom: 1
    },
    pageType='hori',
    gameIsOver = false;

  $(function(){
    // page view fixed
    $(document).on('touchmove', function(e){
      e.preventDefault();
    });
    // page view fixed end

    // dom var init
    var $charater=$('.charaterC'),
      $nodeWrapper=$('#nodeWrapper'),
      $worldBg=$('#worldBg'),
      $laneBg=$('#laneBg');
    $restTime=$('#restTime');

    var initBg=(function(){
      var oWorldWidth=0,
        isBgInited=false;

      return function(windowWidth){
        if(!isBgInited){
          isBgInited=true;
        }
        oWorldWidth=2 * 1200 * windowWidth / 689;
        $worldBg.css({
          'width': oWorldWidth
        });
      };
    })();
    // dom var init end

    // stage render
    var renderStage=function(timeOffsetInfo, isForce){
      var current_d_offset=0,
        time_offset=0,
        world_offset,
        lane_offset;
      if(timeOffsetInfo){
        current_d_offset=timeOffsetInfo.d_offset || 0;
        time_offset=timeOffsetInfo.offset || 0;
      }
      if(!gameIsOver){
        if(myPath){
          world_offset=myPath.offset*0.1;
          lane_offset=myPath.offset * windowInfo.stageZoom;
          myPath.draw(myCharater.speed*current_d_offset, isForce);
          myPath.addRandomNode();
        }else{
          world_offset=0;
          lane_offset=0;
        }

        if(myCharater){
          myCharater.render();
        }

        while(world_offset>=1277 * windowInfo.bgZoom){
          world_offset-=1277 * windowInfo.bgZoom;
        }
        $worldBg.css({
          '-webkit-transform':'translate3d('+ -world_offset +'px, 0,0)',
          '-moz-transform':'translate3d('+ -world_offset +'px, 0,0)',
          '-o-transform':'translate3d('+ -world_offset +'px, 0,0)',
          '-ms-transform':'translate3d('+ -world_offset +'px, 0,0)',
          'transform':'translate3d('+ -world_offset +'px, 0,0)'
        });
        $laneBg.css({
          'width': windowInfo.width + lane_offset,
          '-webkit-transform':'translate3d('+ -lane_offset +'px, 0,0)',
          '-moz-transform':'translate3d('+ -lane_offset +'px, 0,0)',
          '-o-transform':'translate3d('+ -lane_offset +'px, 0,0)',
          '-ms-transform':'translate3d('+ -lane_offset +'px, 0,0)',
          'transform':'translate3d('+ -lane_offset +'px, 0,0)'
        });
        $restTime.text((time_offset / 1000).toFixed(2));
      }else{
        timeline.stop();
        showResult();
      }
    };
    // stage render end

    $(window).on('resize orientationchange', function(){
      var $this=$(this),
        w=$this.width(),
        h=$this.height(),
        newW=w/h*stageHeight;
      windowInfo.width=w;
      windowInfo.stageZoom=h / stageHeight;
      windowInfo.bgZoom=h / 689;

      switch(pageType){
        case 'vert':
          if(w>h){
            showRotateTips('toVert');
          }else{
            showRotateTips('none');
          }
          break;
        case 'hori':
          if(w<h){
            showRotateTips('toHori');
          }else{
            showRotateTips('none');
          }
          break;
      }
      if(myCharater && myCharater.action){
        myCharater.zoom=windowInfo.stageZoom;
        myCharater.action('normal');
      }
      if(myPath){
        myPath.zoom=windowInfo.stageZoom;
        myPath.width=w / windowInfo.stageZoom;
      }
      if(timeline.isInit){
        if(w<h){
          timeline.pause();
        }else{
          timeline.start();
        }
      }
      renderStage({
        offset: timeline.timeOffset,
        d_offset: timeline.gapTimeOffset
      }, true);
      initBg(w);
    }).trigger('resize');

    var charater_path_init=function(){
      myPath.nodeFrequence=0.03;// (0, 1]
      myPath.goldFrequence=1;// (0, 1]
      myPath.lineCount=2;
      myPath.grid=100;
      myPath.lastNode=Math.ceil(myPath.width / myPath.grid) * myPath.grid;
      myPath.lastGoldNode=myPath.lastNode;
      myPath.addRandomNode=function(){
        var _this=this,
          startGridOffset=Math.ceil((_this.offset+_this.width) / _this.grid) * _this.grid,
          goldAddLine=Math.floor(Math.random() * _this.lineCount / _this.goldFrequence),
          current_gold_node_offset,
          current_node_offset,
          node_insert_line_index;
        // add gold node
        if(goldAddLine<_this.lineCount){
          current_gold_node_offset=_this.lastGoldNode + 9 * _this.grid;
          if(current_gold_node_offset < startGridOffset){
            current_gold_node_offset = startGridOffset;
          }
          if(current_gold_node_offset<startGridOffset + 12 * _this.grid){
            _this.lastGoldNode=current_gold_node_offset;
            _this.addNode(goldAddLine, current_gold_node_offset, 2);
          }
        }
        // add node
        if(Math.random()<_this.nodeFrequence){
          current_node_offset= _this.lastNode+(9+Math.floor(Math.random()*3)) * _this.grid;
          if(current_node_offset<startGridOffset){
            current_node_offset=startGridOffset;
          }

          node_insert_line_index=Math.floor(Math.random() * _this.lineCount);
          if(_this.addNode(node_insert_line_index, current_node_offset, 1)){
            _this.lastNode=current_node_offset;
          }else{
            $.each(_this.line, function(i, line){
              var has_position=true;
              if(i==node_insert_line_index){
                return true;//continue
              }
              $.each(line, function(j, node){
                if(node.offset==current_node_offset){
                  has_position=false;
                  return false;// break
                }
              });
              if(has_position){
                node_insert_line_index=i;
                return false;// break
              }
            });
            if(node_insert_line_index>=0){
              _this.lastNode=current_node_offset;
              _this.addNode(node_insert_line_index, _this.lastNode, 1);
            }
          }
        }
      };
      myCharater.hit=function(type){
        var _this=this;
        switch(type){
          case 2:
            updateResult(++getPoint);
            // if(getPoint >= 5){
            //   setTimeout(function(){
            //     gameIsOver = true;
            //   }, 200);
            // }
            break;
          case 1:
          default:
            clearTimeout(_this.hitTimer);
            _this.hitTimer=setTimeout(function(){
              getNode++;
              _this.speed=0;
              _this.isHit=true;
              _this.action('hit');
              clearTimeout(_this.recoveryTimer);
              _this.recoveryTimer=setTimeout(function(){
                _this.startSpeedUpTime=null;
                _this.isHit=false;
                _this.speed=0;
                _this.action('normal');
              }, 1000);
            }, 10);
        }
      };

      myCharater.action('stand');
    };

    var update_air_node_step=function(){
      myPath.option.nodeInfo[1][0].step++;
      setTimeout(update_air_node_step, 500);
    };

    $.when(
      ImgStorage.getImage('img/stand_c.png'),
      ImgStorage.getImage('img/walk_c.png'),
      ImgStorage.getImage('img/run_c.png'),
      ImgStorage.getImage('img/jump_c.png'),
      ImgStorage.getImage('img/slide_c.png'),
      ImgStorage.getImage('img/hit_c.png'),
      ImgStorage.getImage('img/618logo_s.png'),
      ImgStorage.getImage('img/a_node.png'),
      ImgStorage.getImage('img/g_node.png')
    ).done(function(
      standImg,
      walkImg,
      runImg,
      jumpImg,
      slideImg,
      hitImg,
      goldImg,
      airNodeImg,
      groundNodeImg
    ){
      myCharater=new Character($charater, timeline, {
        zoom: windowInfo.stageZoom,
        standImg: {
          img: standImg,
          width: 132,
          height: 218,
          stepCount: 1,
          hitRect: {
            offsetX: 0,
            offsetY: 0,
            w: 132,
            h: 218
          }
        },
        walkImg: {
          img: walkImg,
          width: 132,
          height: 220,
          stepCount: 4,
          hitRect: {
            offsetX: 0,
            offsetY: 0,
            w: 132,
            h: 220
          }
        },
        runImg: {
          img: runImg,
          width: 161,
          height: 241,
          stepCount: 4,
          hitRect: {
            offsetX: 15,
            offsetY: 15,
            w: 134,
            h: 220
          }
        },
        jumpImg: {
          img: jumpImg,
          width: 132,
          height: 195,
          stepCount: 1,
          hitRect: {
            offsetX: 0,
            offsetY: 0,
            w: 132,
            h: 195
          }
        },
        slideImg: {
          img: slideImg,
          width: 231,
          height: 179,
          stepCount: 1,
          hitRect: {
            offsetX: 31,
            offsetY: 18,
            w: 199,
            h: 153
          }
        },
        hitImg: {
          img: hitImg,
          width: 221,
          height: 172,
          stepCount: 1,
          hitRect: {
            offsetX: 0,
            offsetY: 27,
            w: 205,
            h: 135
          }
        }
      });
      myCharater.render();

      myPath=new Path($nodeWrapper, myCharater, 1, {
        zoom: windowInfo.stageZoom,
        width: windowInfo.width / windowInfo.stageZoom,
        lineInfo: [{
          y: 380,
          nodeClass: {
            1: 'air-node',
            2: 'gold-node'
          }
        },{
          y: 540,
          nodeClass: {
            1: 'ground-node',
            2: 'gold-node'
          }
        }],
        nodeInfo: {
          1: [{
            img: airNodeImg,
            width: 102,
            height: 116,
            stepCount: 2
          }, {
            img: groundNodeImg,
            width: 73,
            height: 116,
            stepCount: 1
          }],
          2: [{
            img: goldImg,
            width: 70,
            height: 63,
            stepCount: 1
          }, {
            img: goldImg,
            width: 70,
            height: 63,
            stepCount: 1
          }]
        }
      });
      update_air_node_step();
      charater_path_init();
    });

    timeline.bind('timeUpdate', function(timeOffsetInfo){
      renderStage(timeOffsetInfo);
    });

    // charater control
    $('#jumpBtn').on(Helper.mouseStartEvent, function(e){
      e.preventDefault();
      myCharater.action('air');
      return false;
    });
    $('#slideBtn').on(Helper.mouseStartEvent, function(e){
      e.preventDefault();
      if(myCharater.line=='normal'){
        myCharater.action('ground');
        clearTimeout(myCharater.actionTimer);
        myCharater.actionTimer=setTimeout(function(){
          myCharater.action('normal');
        }, 800);
      }
      return false;
    });
    // charater control end

    // game time control
    $('#pauseStartBtn').on(Helper.mouseStartEvent, function(e){
      e.preventDefault();
      switch(timeline.status){
        case 'running':
          $(this).text('run');
          timeline.pause();
          $('body').addClass('paused');
          break;
        case 'paused':
        case 'stop':
        default:
          $(this).text('pause');
          timeline.start();
          $('body').removeClass('paused');
      }
      return false;
    });
    // game time control end

    // game start
    $('#startBtn').on(Helper.mouseStartEvent, function(e){
      e.preventDefault();
      $('#initMask').hide();
      timeline.isInit=true;
      timeline.start();
      myCharater.action('normal');
      return false;
    });
    // game start end
  });
});