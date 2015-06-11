requirejs([
  'jquery',
  'helper',
  'timeline',
  'path'
], function(
  $,
  Helper,
  TimeLine,
  Path
){
  if(!Helper.canvasSupport()){
    return;
  }

  $(function(){
    var stage=document.getElementById('gameStage'),
      timeline=new TimeLine(),
      myPath=new Path(stage),
      runningSpeed=0.05;

    $(window).on('resize', function(){
      var $this=$(this);
      stage.width=$this.width();
      stage.height=$this.height();
    }).trigger('resize');

    timeline.bind('timeUpdate', function(timeOffset){
      myPath.draw(timeOffset * runningSpeed);
    });

    timeline.start();
  });
});