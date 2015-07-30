define([
  'jquery',
  'megapix-image',
  'exif'
], function(
  $,
  MegaPixImage,
  EXIF
){
  return function(url, cb){
    if(!$.isFunction(cb)){
      return false;
    }
    var img=new Image(),
      mpImg,
      canvas=$('<canvas></canvas>')[0],
      ctx=canvas.getContext('2d'),
      exif={};

    img.onload=function(){
      mpImg=new MegaPixImage(img);
      EXIF.getData(img, function(){
        var exif_list=EXIF.pretty(this).split('\n');
        $.each(exif_list, function(i, ex){
          var _ex=ex.split(':');
          exif[$.trim(_ex[0]).toLowerCase()]=$.trim(_ex[1]);
        });
        mpImg.render(canvas, {
          maxWidth: 800,
          maxHeight: 800,
          orientation: parseInt(exif.orientation, 10)
        });
        
        img=null;
        cb(canvas.toDataURL());
      });
    };
    img.src=url;
  };
});