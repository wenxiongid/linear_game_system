requirejs([
  'jquery',
  'helper',
  'timeline',
  'path',
  'charater',
  'img_loader',
  'http://res.wx.qq.com/open/js/jweixin-1.0.0.js'
], function(
  $,
  Helper,
  TimeLine,
  Path,
  Character,
  ImgLoader,
  wx
){
  var dict='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    nonceStr='',
    wx_param={
      token: '',
      ticket: ''
    };
  for(var i=0;i<16;i++){
    nonceStr+=dict[Math.floor(Math.random() * dict.length)];
  }

  function init_wx(){
    var signature;
    $.post('wechat/wx_sign.php', {
      ticket: wx_param.ticket,
      nonceStr: nonceStr,
      url: location.href.replace(location.hash, '')
    }, function(data){
      if(data.signature){
        wx.config({
          debug: true,
          appId: 'wx90c209e66b64c9dd',
          timestamp: data.timestamp,
          nonceStr: nonceStr,
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
      }
    });

    wx.ready(function(){
      wx.error(function(res){
        console.log(res);
      });
      wx.onMenuShareTimeline({
        title: '朋友圈分享测试标题'
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
  }

  $.getJSON('wechat/get_wx_access_token.php', {
    name: 'abc'
  }, function(data){
    if(data.token && data.ticket){
      wx_param.token=data.token;
      wx_param.ticket=data.ticket;
      init_wx();
    }
  });

  function support_touch_event(){
    return !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
  }

  var btnEvent=support_touch_event() ? 'touchstart' : 'click';

  var updateResult=function(point){
    $('#result').text(point);
  };

  var myImgLoader=new ImgLoader();

  var $restTime,
    myCharater,
    getPoint=0,
    getNode=0;

  function showResult(){
    $restTime.text('0.00');
    myCharater.action('stand');
    $('#resultMask').show();
    $('.result-gold').text(getPoint);
    $('.result-node').text(getNode);
  }

  $(function(){
    timeline=new TimeLine();
    var stageHeight=600,
      timeline=new TimeLine(),
      myPath,
      $charater=$('.charaterC'),
      $nodeWrapper=$('#nodeWrapper');

    var charater_path_init=function(){
      myPath.nodeFrequence=0.03;// (0, 1]
      myPath.goldFrequence=1;// (0, 1]
      myPath.lineCount=2;
      myPath.grid=100;
      myPath.lastNode=Math.ceil(myPath.width / myPath.grid) * myPath.grid;
      myPath.lastGoldNode=myPath.lastNode;
      myPath.addRandomNode=function(){
        var _this=this,
          startGridOffset=Math.ceil((_this.offset+_this.width) / _this.grid) * _this.grid,
          goldAddLine=Math.floor(Math.random() * _this.lineCount / _this.goldFrequence),
          current_gold_node_offset,
          current_node_offset,
          node_insert_line_index;
        if(goldAddLine<_this.lineCount){
          current_gold_node_offset=_this.lastGoldNode + _this.grid;
          if(_this.lastGoldNode<startGridOffset){
            current_gold_node_offset=startGridOffset;
          }
          if(current_gold_node_offset<startGridOffset + 12 * _this.grid){
            _this.lastGoldNode=current_gold_node_offset;
            _this.addNode(goldAddLine, _this.lastGoldNode, 2);
          }
        }
        if(Math.random()<_this.nodeFrequence){
          current_node_offset= _this.lastNode+(9+Math.floor(Math.random()*3)) * _this.grid;
          if(current_node_offset<startGridOffset){
            current_node_offset=startGridOffset;
          }
          
          node_insert_line_index=Math.floor(Math.random() * _this.lineCount);
          if(_this.addNode(node_insert_line_index, current_node_offset, 1)){
            _this.lastNode=current_node_offset;
            _this.addNode(1-node_insert_line_index, _this.lastNode, 2);
          }else{
            $.each(_this.line, function(i, line){
              var has_position=true;
              if(i==node_insert_line_index){
                return true;//continue
              }
              $.each(line, function(j, node){
                if(node.offset==current_node_offset){
                  has_position=false;
                  return false;// break
                }
              });
              if(has_position){
                node_insert_line_index=i;
                return false;// break
              }
            });
            if(node_insert_line_index>=0){
              _this.lastNode=current_node_offset;
              _this.addNode(node_insert_line_index, _this.lastNode, 1);
              _this.addNode(1-node_insert_line_index, _this.lastNode, 2);
            }
          }
        }
        
      };
      myCharater.hit=function(type){
        var _this=this;
        switch(type){
          case 2:
            updateResult(++getPoint);
            break;
          case 1:
          default:
            setTimeout(function(){
              getNode++;
              _this.speed=0;
              _this.isHit=true;
              _this.action('hit');
              setTimeout(function(){
                _this.startSpeedUpTime=null;
                _this.isHit=false;
                _this.action('normal');
                _this.speed=0;
                _this.startSpeedUp();
              }, 1000);
            }, 10);
            
        }
      };

      myCharater.action('stand');
    };

    var update_air_node_step=function(){
      myPath.option.nodeInfo[1][0].step++;
      setTimeout(update_air_node_step, 500);
    };

    $.when(
      myImgLoader.load('img/stand.png'),
      myImgLoader.load('img/walk.png'),
      myImgLoader.load('img/run.png'),
      myImgLoader.load('img/jump.png'),
      myImgLoader.load('img/slide.png'),
      myImgLoader.load('img/hit.png'),
      myImgLoader.load('img/gold.png'),
      myImgLoader.load('img/a_node.png'),
      myImgLoader.load('img/g_node.png')
    ).done(function(
      standImg,
      walkImg,
      runImg,
      jumpImg,
      slideImg,
      hitImg,
      goldImg,
      airNodeImg,
      groundNodeImg
    ){
      myCharater=new Character($charater, timeline, {
        zoom: canvas_zoom,
        standImg: {
          img: standImg,
          width: 132,
          height: 218,
          stepCount: 1,
          hitRect: {
            offsetX: 0,
            offsetY: 0,
            w: 132,
            h: 218
          }
        },
        walkImg: {
          img: walkImg,
          width: 132,
          height: 220,
          stepCount: 4,
          hitRect: {
            offsetX: 0,
            offsetY: 0,
            w: 132,
            h: 220
          }
        },
        runImg: {
          img: runImg,
          width: 161,
          height: 241,
          stepCount: 4,
          hitRect: {
            offsetX: 15,
            offsetY: 15,
            w: 134,
            h: 220
          }
        },
        jumpImg: {
          img: jumpImg,
          width: 132,
          height: 195,
          stepCount: 1,
          hitRect: {
            offsetX: 0,
            offsetY: 0,
            w: 132,
            h: 195
          }
        },
        slideImg: {
          img: slideImg,
          width: 231,
          height: 179,
          stepCount: 1,
          hitRect: {
            offsetX: 31,
            offsetY: 18,
            w: 199,
            h: 153
          }
        },
        hitImg: {
          img: hitImg,
          width: 221,
          height: 172,
          stepCount: 1,
          hitRect: {
            offsetX: 0,
            offsetY: 27,
            w: 205,
            h: 135
          }
        }
      });
      myCharater.render();

      myPath=new Path($nodeWrapper, myCharater, {
        zoom: canvas_zoom,
        width: windowW / canvas_zoom,
        lineInfo: [{
          y: 380,
          nodeClass: {
            1: 'air-node',
            2: 'gold-node'
          }
        },{
          y: 540,
          nodeClass: {
            1: 'ground-node',
            2: 'gold-node'
          }
        }],
        nodeInfo: {
          1: [{
            img: airNodeImg,
            width: 102,
            height: 116,
            stepCount: 2
          }, {
            img: groundNodeImg,
            width: 73,
            height: 116,
            stepCount: 1
          }],
          2: [{
            img: goldImg,
            width: 56,
            height: 68,
            stepCount: 1
          }, {
            img: goldImg,
            width: 56,
            height: 68,
            stepCount: 1
          }]
        }
      });
      update_air_node_step();

      charater_path_init();
    });

    var last_offset=0,
      $worldBg=$('#worldBg'),
      $laneBg=$('#laneBg'),
      oWorldWidth=0;

    var isBgInited=false,
      initBg=function(windowWidth){
        if(!isBgInited){
          isBgInited=true;
        }
        oWorldWidth=2 * 1200 * windowWidth / 689;
        $worldBg.css({
          'width': oWorldWidth
        });
      };

    var windowW=0,
      canvas_zoom=1,
      world_zoom=1;
    $(window).on('resize orientationchange', function(){
      var $this=$(this),
        w=$this.width(),
        h=$this.height(),
        newW=w/h*stageHeight;
      windowW=w;
      canvas_zoom=h / stageHeight;
      world_zoom=h / 689;
      if(timeline.isInit){
        if(w<h){
          timeline.pause();
        }else{
          timeline.start();
        }
      }
      if(myCharater && myCharater.action){
        myCharater.zoom=canvas_zoom;
        myCharater.action('normal');
      }
      if(myPath){
        myPath.zoom=canvas_zoom;
        myPath.width=windowW / canvas_zoom;
      }
      initBg(windowW);
    }).trigger('resize');

    $restTime=$('#restTime');

    timeline.bind('timeUpdate', function(timeOffset){
      var current_d_offset,
        world_offset,
        lane_offset;
      if(timeOffset<30 * 1000){
        current_d_offset=timeOffset-last_offset;
        world_offset=myPath.offset*0.1;
        lane_offset=myPath.offset * canvas_zoom;
        myPath.draw(myCharater.speed*current_d_offset);
        myCharater.render();
        
        while(world_offset>=1277 * world_zoom){
          world_offset-=1277 * world_zoom;
        }
        $worldBg.css({
          'width': oWorldWidth,
          '-webkit-transform':'translate3d('+ -world_offset +'px, 0,0)',
          '-moz-transform':'translate3d('+ -world_offset +'px, 0,0)',
          '-o-transform':'translate3d('+ -world_offset +'px, 0,0)',
          '-ms-transform':'translate3d('+ -world_offset +'px, 0,0)',
          'transform':'translate3d('+ -world_offset +'px, 0,0)'
        });
        $laneBg.css({
          'width': windowW + lane_offset,
          '-webkit-transform':'translate3d('+ -lane_offset +'px, 0,0)',
          '-moz-transform':'translate3d('+ -lane_offset +'px, 0,0)',
          '-o-transform':'translate3d('+ -lane_offset +'px, 0,0)',
          '-ms-transform':'translate3d('+ -lane_offset +'px, 0,0)',
          'transform':'translate3d('+ -lane_offset +'px, 0,0)'
        });
        last_offset=timeOffset;
        myPath.addRandomNode();
        $restTime.text((30 - timeOffset/1000).toFixed(2));
      }else{
        timeline.stop();
        showResult();
      }
    });

    $('#jumpBtn').on(btnEvent, function(e){
      e.preventDefault();
      if(myCharater.line=='normal' && !myCharater.isHit){
        myCharater.action('air');
      }
      return false;
    });
    $('#slideBtn').on(btnEvent, function(e){
      e.preventDefault();
      if(myCharater.line=='normal' && !myCharater.isHit){
        myCharater.action('ground');
        setTimeout(function(){
          myCharater.action('normal');
        }, 800);
      }
      return false;
    });
    $('#pauseStartBtn').on(btnEvent, function(e){
      e.preventDefault();
      switch(timeline.status){
        case 'running':
          $(this).text('run');
          timeline.pause();
          $('body').addClass('paused');
          break;
        case 'paused':
        case 'stop':
        default:
          $(this).text('pause');
          timeline.start();
          $('body').removeClass('paused');
      }
      return false;
    });

    $('#startBtn').on(btnEvent, function(e){
      e.preventDefault();
      $('#mask').hide();
      timeline.isInit=true;
      timeline.start();
      myCharater.action('normal');
      return false;
    });

    $(document).on('touchmove', function(e){
      e.preventDefault();
    });
  });
});