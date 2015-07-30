define([
  'http://res.wx.qq.com/open/js/jweixin-1.0.0.js',
  'helper'
], function(
  wx,
  Helper
){
  var WeChatConfig=function(id){
    var _this=this;
    _this.id=id;
    _this.nonceStr=Helper.getNonceStr();
    _this.wx_param={
      token: '',
      ticket: ''
    };
    _this.getToken();
  };

  WeChatConfig.prototype.getToken=function(){
    var _this=this;
    $.getJSON('wechat/get_wx_access_token.php', {
      name: _this.id
    }, function(data){
      if(data.token && data.ticket){
        _this.wx_param.token=data.token;
        _this.wx_param.ticket=data.ticket;
        _this.getSignature();
      }
    });
  };

  WeChatConfig.prototype.getSignature=function(){
    var _this=this;
    $.post('wechat/wx_sign.php', {
      ticket: _this.wx_param.ticket,
      nonceStr: _this.nonceStr,
      url: location.href.replace(location.hash, '')
    }, function(data){
      if(data.signature){
        _this.signature=data.signature;
        _this.init(data);
      }
    });
  };

  WeChatConfig.prototype.init=function(data){
    var _this=this;
    wx.config({
      debug: true,
      appId: _this.id,
      timestamp: data.timestamp,
      nonceStr: _this.nonceStr,
      signature: data.signature,
      jsApiList: [
        'onMenuShareTimeline',
        'onMenuShareAppMessage',
        'onMenuShareQQ',
        'onMenuShareWeibo',
        'onMenuShareQZone',
        'chooseImage',
        'previewImage'
      ]
    });
    wx.ready(function(){
      wx.checkJsApi({
        jsApiList: [
          'onMenuShareTimeline',
          'onMenuShareAppMessage',
          'onMenuShareQQ',
          'onMenuShareWeibo',
          'onMenuShareQZone',
          'chooseImage',
          'previewImage'
        ],
        success: function(res){
          console.log(res);
        }
      });
      wx.onMenuShareTimeline({
        title: '朋友圈分享测试标题',
        link: location.href,
        imgUrl: 'http://img14.360buyimg.com/cms/jfs/t1663/142/68569834/66736/c96cd6bd/556d753cN664ac098.png',
        success: function(){
          console.log('share success');
        },
        cancel: function(){
          console.log('share cancel');
        }
      });
      wx.onMenuShareAppMessage({
        title: 'wechat朋友分享测试标题'
      });
      wx.onMenuShareQQ({
        title: 'q朋友分享测试标题'
      });
      wx.onMenuShareWeibo({
        title: 'weibo分享测试标题'
      });
      wx.onMenuShareQZone({
        title: 'qzone分享测试标题'
      });
    });
  };

  return WeChatConfig;
});