requirejs([
  'jquery',
  'helper',
  'timeline',
  'path',
  'charater',
  'img_loader'
], function(
  $,
  Helper,
  TimeLine,
  Path,
  Character,
  ImgLoader
){
  if(!Helper.canvasSupport()){
    return;
  }
  function support_touch_event(){
    return !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
  }

  var btnEvent=support_touch_event() ? 'touchstart' : 'click';

  var updateResult=function(point){
    $('#result').text(point);
  };

  var myImgLoader=new ImgLoader();

  $(function(){
    timeline=new TimeLine();
    var stageHeight=600,
      // stage=document.getElementById('gameStage'),
      // charater=document.getElementById('charater'),
      timeline=new TimeLine(),
      myCharater,
      myPath,
      getPoint=0,
      $charater=$('.charaterC'),
      $nodeWrapper=$('#nodeWrapper');

    var charater_path_init=function(){
      myPath.nodeFrequence=0.2;// (0, 1]
      myPath.goldFrequence=0.5;// [0, 1)
      myPath.lineCount=2;
      myPath.lastNode=Math.ceil(myPath.width / 50) * 50;
      myPath.lastGoldNode=myPath.lastNode;
      myPath.addRandomNode=function(){
        var _this=this,
          addLineIndex=Math.floor(Math.random()*(_this.lineCount / _this.nodeFrequence)),
          anotherLineIndex,
          startGridOffset=Math.ceil((_this.offset+_this.width) / 50) * 50,
          current_node;
        if(addLineIndex<_this.lineCount){
          current_node=_this.lastNode+(18+Math.floor(Math.random()*6)) * 50;
          if(current_node<startGridOffset){
            current_node=startGridOffset;
          }
          if(current_node<startGridOffset + 12 * 50){
            _this.addNode(addLineIndex, current_node, 1);
            _this.lastNode=current_node;
            switch(addLineIndex){
              case 0:
                anotherLineIndex=1;
                break;
              default:
                anotherLineIndex=0;
            }
            _this.addNode(anotherLineIndex, current_node, 2);
            _this.lastGoldNode=_this.lastNode;
          }
        }else{
          if(Math.random()<_this.goldFrequence){
            _this.lastGoldNode=_this.lastGoldNode + 2 * 50;
            if(_this.lastGoldNode<startGridOffset){
              _this.lastGoldNode=startGridOffset;
            }
            if(_this.lastGoldNode<startGridOffset + 12 * 50){
              _this.addNode(Math.floor(Math.random()*_this.lineCount), _this.lastGoldNode, 2);
            }
          }
        }
      };
      myCharater.hit=function(type){
        var _this=this;
        switch(type){
          case 2:
            updateResult(++getPoint);
            break;
          case 1:
          default:
            setTimeout(function(){
              _this.speed=0;
              _this.isHit=true;
              _this.action('hit');
              setTimeout(function(){
                _this.startSpeedUpTime=null;
                _this.isHit=false;
                _this.action('normal');
                _this.speed=0;
                _this.startSpeedUp();
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
      myImgLoader.load('img/stand.png'),
      myImgLoader.load('img/walk.png'),
      myImgLoader.load('img/run.png'),
      myImgLoader.load('img/jump.png'),
      myImgLoader.load('img/slide.png'),
      myImgLoader.load('img/hit.png'),
      myImgLoader.load('img/gold.png'),
      myImgLoader.load('img/a_node.png'),
      myImgLoader.load('img/g_node.png')
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
      myCharater=new Character($charater, {
        zoom: canvas_zoom,
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
      myPath=new Path($nodeWrapper, myCharater, {
        zoom: canvas_zoom,
        width: windowW / canvas_zoom,
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
            width: 56,
            height: 68,
            stepCount: 1
          }, {
            img: goldImg,
            width: 56,
            height: 68,
            stepCount: 1
          }]
        }
      });
      update_air_node_step();

      charater_path_init();
    });

    var last_offset=0,
      $worldBg=$('#worldBg'),
      $laneBg=$('#laneBg'),
      oWorldWidth=0;

    var isBgInited=false,
      initBg=function(windowWidth){
        if(!isBgInited){
          isBgInited=true;
        }
        oWorldWidth=2 * 1200 * windowWidth / 689;
        $worldBg.css({
          'width': oWorldWidth
        });
      };

    // stage.height=stageHeight;
    // charater.height=stageHeight;
    var windowW=0,
      canvas_zoom=1,
      world_zoom=1;
    $(window).on('resize orientationchange', function(){
      var $this=$(this),
        w=$this.width(),
        h=$this.height(),
        newW=w/h*stageHeight;
      windowW=w;
      // stage.width=newW;
      // charater.width=newW;
      canvas_zoom=h / stageHeight;
      world_zoom=h / 689;
      if(timeline.isInit){
        if(w<h){
          timeline.pause();
        }else{
          timeline.start();
        }
      }
      if(myCharater && myCharater.action){
        myCharater.zoom=canvas_zoom;
        myCharater.action('normal');
      }
      if(myPath){
        myPath.zoom=canvas_zoom;
        myPath.width=windowW / canvas_zoom;
      }
      initBg(windowW);
    }).trigger('resize');

    timeline.bind('timeUpdate', function(timeOffset){
      var current_d_offset=timeOffset-last_offset;
      myPath.draw(myCharater.speed*current_d_offset);
      var world_offset=myPath.offset*0.1,
        lane_offset=myPath.offset * canvas_zoom;
      while(world_offset>=1277 * world_zoom){
        world_offset-=1277 * world_zoom;
      }
      $worldBg.css({
        'width': oWorldWidth,
        '-webkit-transform':'translate3d('+ -world_offset +'px, 0,0)',
        '-moz-transform':'translate3d('+ -world_offset +'px, 0,0)',
        '-o-transform':'translate3d('+ -world_offset +'px, 0,0)',
        '-ms-transform':'translate3d('+ -world_offset +'px, 0,0)',
        'transform':'translate3d('+ -world_offset +'px, 0,0)'
      });
      $laneBg.css({
        'width': windowW + lane_offset,
        '-webkit-transform':'translate3d('+ -lane_offset +'px, 0,0)',
        '-moz-transform':'translate3d('+ -lane_offset +'px, 0,0)',
        '-o-transform':'translate3d('+ -lane_offset +'px, 0,0)',
        '-ms-transform':'translate3d('+ -lane_offset +'px, 0,0)',
        'transform':'translate3d('+ -lane_offset +'px, 0,0)'
      });
      last_offset=timeOffset;
      myPath.addRandomNode();
    });

    $('#jumpBtn').on(btnEvent, function(e){
      e.preventDefault();
      if(myCharater.line=='normal'){
        myCharater.action('air');
      }
      return false;
    });
    $('#slideBtn').on(btnEvent, function(e){
      e.preventDefault();
      if(myCharater.line=='normal'){
        myCharater.action('ground');
        setTimeout(function(){
          myCharater.action('normal');
        }, 800);
      }
      return false;
    });
    $('#pauseStartBtn').on(btnEvent, function(e){
      e.preventDefault();
      switch(timeline.status){
        case 'running':
          $(this).text('run');
          timeline.pause();
          break;
        case 'paused':
        case 'stop':
        default:
          $(this).text('pause');
          timeline.start();
      }
      return false;
    });

    $('#startBtn').on(btnEvent, function(e){
      e.preventDefault();
      $('#mask').hide();
      timeline.isInit=true;
      timeline.start();
      myCharater.action('normal');
      return false;
    });

    $(document).on('touchmove', function(e){
      e.preventDefault();
    });
  });
});