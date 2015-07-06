requirejs([
  'jquery',
  'helper',
  'timeline',
  'path',
  'charater'
], function(
  $,
  Helper,
  TimeLine,
  Path,
  Character
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

  $(function(){
    timeline=new TimeLine();
    var stageHeight=600,
      stage=document.getElementById('gameStage'),
      charater=document.getElementById('charater'),
      timeline=new TimeLine(),
      myCharater=new Character(charater),
      myPath=new Path(stage, myCharater, {
        lineInfo: [{
          y: 350
        },{
          y: 400
        }]
      }),
      getPoint=0;

    myPath.nodeFrequence=0.2;// (0, 1]
    myPath.goldFrequence=0.5;// [0, 1)
    myPath.lineCount=2;
    myPath.lastNode=Math.ceil(myPath.canvas.width / 50) * 50;
    myPath.lastGoldNode=myPath.lastNode;
    myPath.addRandomNode=function(){
      var _this=this,
        addLineIndex=Math.floor(Math.random()*(_this.lineCount / _this.nodeFrequence)),
        anotherLineIndex,
        startGridOffset=Math.ceil((_this.offset+_this.canvas.width) / 50) * 50,
        current_node;
      if(addLineIndex<_this.lineCount){
        current_node=_this.lastNode+(12+Math.floor(Math.random()*6)) * 50;
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
      // console.log('hit: ' + myPath.offset+ ', type: '+type);
      switch(type){
        case 2:
          updateResult(++getPoint);
          break;
        case 1:
        default:
          _this.speed=0;
        _this.action('hit');
        setTimeout(function(){
          _this.startSpeedUpTime=null;
          _this.action('normal');
          _this.speed=0;
          _this.startSpeedUp();
        }, 100);
      }
    };

    stage.height=stageHeight;
    charater.height=stageHeight;
    var windowW=0;
    $(window).on('resize orientationchange', function(){
      var $this=$(this),
        w=$this.width(),
        h=$this.height(),
        newW=w/h*stageHeight;
      windowW=w;
      stage.width=newW;
      charater.width=newW;
      if(timeline.isInit){
        if(w<h){
          timeline.pause();
        }else{
          timeline.start();
        }
      }
      myCharater.action('normal');
    }).trigger('resize');

    var last_offset=0,
      $worldBg=$('#worldBg'),
      $laneBg=$('#laneBg');

    timeline.bind('timeUpdate', function(timeOffset){
      var current_d_offset=timeOffset-last_offset;
      myPath.draw(myCharater.speed*current_d_offset);
      var world_offset=myPath.offset*0.1,
        lane_offset=myPath.offset;
      $worldBg.css({
        'width': windowW + world_offset,
        'transform': 'translate3d('+ -world_offset +'px, 0, 0)'
      });
      $laneBg.css({
        'width': windowW + lane_offset,
        'transform': 'translate3d('+ -lane_offset +'px, 0, 0)'
      });
      last_offset=timeOffset;
      myPath.addRandomNode();
    });

    myCharater.action('normal');

    $('#jumpBtn').on(btnEvent, function(e){
      if(myCharater.line=='normal'){
        myCharater.action('air');
      }
    });
    $('#slideBtn').on(btnEvent, function(e){
      if(myCharater.line=='normal'){
        myCharater.action('ground');
        setTimeout(function(){
          myCharater.action('normal');
        }, 500);
      }
    });
    $('#pauseStartBtn').on(btnEvent, function(e){
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
    });

    $('#startBtn').on(btnEvent, function(e){
      $('#mask').hide();
      timeline.isInit=true;
      timeline.start();
      myCharater.startSpeedUp();
    });
  });
});