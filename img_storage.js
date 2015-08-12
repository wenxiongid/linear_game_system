define([
  'jquery',
  'megapix-image'
], function(
  $,
  MegaPixImage
){
  var imgList={},
    storage={},
    exports,
    hasLocalStorage=!!window.localStorage;

  storage.dataList={};
  storage.setItem=function(key, val){
    this.dataList[key]=val;
    if(hasLocalStorage){
      localStorage.setItem(key, val);
    }
  };
  storage.getItem=function(key){
    var val=this.dataList[key];
    if(!val && hasLocalStorage){
      val=localStorage.getItem(key);
      if(val){
        this.setItem(key, val);
      }
    }
    return val;
  };

  var getImage=function(url, refreshCache){
    var dtd,
      promise,
      imgInfo,
      dataURL='';
    refreshCache=true;
    if(url){
      if(imgInfo=imgList[url]){
        promise=imgInfo.promise;
      }else{
        dtd=$.Deferred();
        promise=dtd.promise();
        imgInfo={
          promise: promise
        };
        if(!refreshCache && (dataURL=storage.getItem(url))){
          dtd.resolve(dataURL);
        }else{
          imgInfo.img=new Image();
          imgInfo.img.onload=function(){
            var canvas=document.createElement('canvas');
            this.onload=null;
            mpImg=new MegaPixImage(this);
            mpImg.render(canvas);
            dataURL=canvas.toDataURL();
            imgInfo.dataURL=dataURL;
            storage.setItem(url, dataURL);
            dtd.resolve(dataURL);
          };
          imgInfo.img.src=url;
        }
        imgList[url]=imgInfo;
      }
    }
    return promise;
  };

  exports={
    getImage: getImage
  };

  return exports;
});