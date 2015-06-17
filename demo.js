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
      myPath=new Path(stage),
      myCharater=new Character(charater),
      charaterAction='normal';

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
      console.log(current_d_offset);
      myPath.draw(myCharater.speed*current_d_offset);
      last_offset=timeOffset;
    });

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