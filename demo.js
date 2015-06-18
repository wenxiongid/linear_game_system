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
    var stage=document.getElementById('gameStage'),
      charater=document.getElementById('charater'),
      timeline=new TimeLine(),
      myPath=new Path(stage, {
        lineInfo: [{
          y: 350
        },{
          y: 400
        }]
      }),
      myCharater=new Character(charater),
      charaterAction='normal';

    myPath.noteFrequence=400;
    myPath.lineCount=3;
    myPath.addRandomNote=function(){
      var _this=this,
        addLineIndex=Math.floor(Math.random()*(_this.lineCount+_this.noteFrequence));
      if(addLineIndex<_this.lineCount){
        if(!_this.line[addLineIndex]){
          _this.line[addLineIndex]=[];
        }
        _this.line[addLineIndex].push(Math.floor(Math.random()*800)+_this.offset+_this.canvas.width);
      }
    };

    $(window).on('resize', function(){
      var $this=$(this),
        w=$this.width(),
        h=$this.height();
      stage.width=w;
      stage.height=h;
      charater.width=w;
      charater.height=h;
    }).trigger('resize');

    var last_offset=0;

    timeline.bind('timeUpdate', function(timeOffset){
      var current_d_offset=timeOffset-last_offset;
      myPath.draw(myCharater.speed*current_d_offset);
      last_offset=timeOffset;
      myPath.addRandomNote();
    });

    myCharater.action(charaterAction);

    $('#jumpBtn').on('click', function(e){
      if(charaterAction=='normal'){
        charaterAction='air';
        myCharater.action(charaterAction);
        setTimeout(function(){
          charaterAction='normal';
          myCharater.action(charaterAction);
        }, 500);
      }
    });
    $('#slideBtn').on('click', function(e){
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