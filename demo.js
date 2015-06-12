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

    timeline.bind('timeUpdate', function(timeOffset){
      myPath.draw(myCharater.speed);
      myCharater.action(charaterAction);
    });

    $('#jumpBtn').on('click', function(e){
      if(charaterAction=='normal'){
        charaterAction='air';
        setTimeout(function(){
          charaterAction='normal';
        }, 500);
      }
    });
    $('#slideBtn').on('click', function(e){
      if(charaterAction=='normal'){
        charaterAction='ground';
        setTimeout(function(){
          charaterAction='normal';
        }, 500);
      }
    });

    timeline.start();
  });
});