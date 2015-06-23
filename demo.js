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

  $(function(){
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
      charaterAction='normal';

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
      alert('hit: ' + myPath.offset);
    };

    stage.height=stageHeight;
    charater.height=stageHeight;
    $(window).on('resize', function(){
      var $this=$(this),
        w=$this.width(),
        h=$this.height(),
        newW=w/h*stageHeight;
      stage.width=newW;
      charater.width=newW;
    }).trigger('resize');

    var last_offset=0;

    timeline.bind('timeUpdate', function(timeOffset){
      var current_d_offset=timeOffset-last_offset;
      myPath.draw(myCharater.speed*current_d_offset);
      last_offset=timeOffset;
      myPath.addRandomNote();
    });

    myCharater.action(charaterAction);

    $('#jumpBtn').on('touchstart', function(e){
      if(charaterAction=='normal'){
        charaterAction='air';
        myCharater.action(charaterAction);
        setTimeout(function(){
          charaterAction='normal';
          myCharater.action(charaterAction);
        }, 500);
      }
    });
    $('#slideBtn').on('touchstart', function(e){
      if(charaterAction=='normal'){
        charaterAction='ground';
        myCharater.action(charaterAction);
        setTimeout(function(){
          charaterAction='normal';
          myCharater.action(charaterAction);
        }, 500);
      }
    });

    timeline.start();
  });
});