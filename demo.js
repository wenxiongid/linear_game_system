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

    myPath.noteFrequence=0.2;// (0, 1]
    myPath.goldFrequence=0.7;// [0, 1)
    myPath.lineCount=2;
    myPath.lastNote=myPath.canvas.width;
    myPath.lastGoldNote=myPath.canvas.width;
    myPath.addRandomNote=function(){
      var _this=this,
        addLineIndex=Math.floor(Math.random()*(_this.lineCount / _this.noteFrequence)),
        anotherLineIndex;
      if(addLineIndex<_this.lineCount){
        _this.lastNote=_this.lastNote+(600+Math.floor(Math.random()*300));
        if(_this.lastNote<_this.offset+_this.canvas.width){
          _this.lastNote=_this.offset+_this.canvas.width;
        }
        _this.addNote(addLineIndex, _this.lastNote, 1);
        switch(addLineIndex){
          case 0:
            anotherLineIndex=1;
            break;
          default:
            anotherLineIndex=0;
        }
        _this.addNote(anotherLineIndex, _this.lastNote, 2);
        _this.lastGoldNote=_this.lastNote;
      }else{
        if(Math.random()<_this.goldFrequence){
          _this.lastGoldNote=_this.lastGoldNote + 100;
          if(_this.lastGoldNote<_this.offset+_this.canvas.width){
            _this.lastGoldNote=_this.offset+_this.canvas.width;
          }
          _this.addNote(Math.floor(Math.random()*_this.lineCount), _this.lastGoldNote, 2);
        }
      }
    };
    myCharater.hit=function(type){
      var _this=this;
      console.log('hit: ' + myPath.offset+ ', type: '+type);
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