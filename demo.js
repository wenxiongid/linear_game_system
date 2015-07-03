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
      });

    myPath.noteFrequence=7;
    myPath.lineCount=3;
    myPath.lastNode=myPath.canvas.width;
    myPath.addRandomNote=function(){
      var _this=this,
        addLineIndex=Math.floor(Math.random()*(_this.lineCount+_this.noteFrequence));
      if(addLineIndex<_this.lineCount){
        if(!_this.line[addLineIndex]){
          _this.line[addLineIndex]=[];
        }
        _this.lastNode=_this.lastNode+(500+Math.floor(Math.random()*300));
        if(_this.lastNode<_this.offset+_this.canvas.width){
          _this.lastNode=_this.offset+_this.canvas.width;
        }
        _this.line[addLineIndex].push(_this.lastNode);
      }
    };
    myCharater.hit=function(){
      var _this=this;
      console.log('hit: ' + myPath.offset);
      _this.speed=0;
      _this.action('hit');
      setTimeout(function(){
        _this.startSpeedUpTime=null;
        _this.action('normal');
        _this.speed=0;
        _this.startSpeedUp();
      }, 100);
    };

    stage.height=stageHeight;
    charater.height=stageHeight;
    $(window).on('resize orientationchange', function(){
      var $this=$(this),
        w=$this.width(),
        h=$this.height(),
        newW=w/h*stageHeight;
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

    var last_offset=0;

    timeline.bind('timeUpdate', function(timeOffset){
      var current_d_offset=timeOffset-last_offset;
      myPath.draw(myCharater.speed*current_d_offset);
      last_offset=timeOffset;
      myPath.addRandomNote();
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