define([
  'jquery'
], function(
  $
){
  var ImgLoader=function(){
    var _this=this;
    _this.imgSrcList=[];
    _this.imgList={};
  };

  ImgLoader.prototype.load=function(src){
    var _this=this,
      loadDtd=$.Deferred(),
      loadPromise=loadDtd.promise(),
      tempImg;
    if(!_this.imgList[src]){
      tempImg=new Image();
      tempImg.onload=function(){
        _this.imgList[src]=tempImg;
        loadDtd.resolve(tempImg);
      };
      tempImg.src=src;
    }else{
      loadDtd.resolve(_this.imgList[src]);
    }
    return loadPromise;
  };

  return ImgLoader;
});