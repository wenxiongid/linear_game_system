define([
  'jquery',
  'get_rotated_url',
  'event',
  'helper',
  'face_tmpl_info'
], function(
  $,
  getRotatedUrl,
  EV,
  Helper,
  tmplInfo
) {
  var FaceController = function(input, originalImgContainer, markers, adstractContainer, option) {
    var _this = this;
    EV.call(_this);
    _this.$input = $(input);
    _this.$originalImgContainer = $(originalImgContainer);
    _this.$adstractContainer=$(adstractContainer);
    _this.$eye1 = $(markers.eye1);
    _this.$eye2 = $(markers.eye2);
    _this.$mouth = $(markers.mouth);
    _this.$markerWrapper = _this.$mouth.parent();
    _this.face_canvas=document.createElement('canvas');
    _this.face_ctx=_this.face_canvas.getContext('2d');
    _this.option = $.extend({
      colorMode: false
    }, option || {});
    _this.nakeInfo = _this.option.colorMode ? tmplInfo.nake_color : tmplInfo.nake;
    _this.init();
  };

  Helper.inheritPrototype(FaceController, EV);

  FaceController.prototype.init = function() {
    var _this = this;
    _this.$adstractContainer.append('<img src="tmpl_img/'+_this.nakeInfo.img+'" />').css({
      'width': _this.nakeInfo.width,
      'height': _this.nakeInfo.height,
      'margin-left': -_this.nakeInfo.width / 2 + 'px'
    });
    _this.$input.on('change', function(e) {
      var file,
        reader;
      if (window.File && window.FileReader && window.FileList && window.Blob) {
        file = e.target.files[0];
        if (file && file.type.match('image.*')) {
          _this.trigger('start_load');
          reader = new FileReader();
          reader.onload = function(e) {
            getRotatedUrl(e.target.result, function(url) {
              var _img = new Image();
              _img.onload = function() {
                _this.trigger('load_complete', this);
                _this.originalImgInfo={
                  width: this.width,
                  height: this.height,
                  zoom: this.width / _this.$originalImgContainer.width()
                };
                _this.originalImgUrl=this.src;
                _this.$originalImgContainer.css({
                  'background-image': 'url("' + this.src + '")',
                  'background-size': _this.$originalImgContainer.width() + 'px auto'
                });
                _img = null;
              };
              _img.src = url;
              _this.imgBase64 = url;
            });
            reader = null;
          };

          reader.readAsDataURL(file);
        } else {
          _this.trigger('not_image');
        }
      } else {
        _this.trigger('not_support');
      }
      _this.$input.val('');
    });

    $([_this.$eye1, _this.$eye2, _this.$mouth]).each(function(i, el) {
      $(el).on(Helper.mouseStartEvent + '.face', function(e) {
        e.stopPropagation();
        e.preventDefault();
        var $this = $(this),
          ePos = Helper.getEventPos(e);
        $this.data('pos', {
          oLeft: parseInt($this.css('left'), 10),
          oTop: parseInt($this.css('top'), 10),
          pageX: ePos.x,
          pageY: ePos.y
        }).on(Helper.mouseMoveEvent + '.face', function(e) {
          e.stopPropagation();
          e.preventDefault();
          var $this = $(this),
            posInfo = $this.data('pos'),
            ePos = Helper.getEventPos(e),
            newX = posInfo.oLeft + (ePos.x - posInfo.pageX) / 3,
            newY = posInfo.oTop + (ePos.y - posInfo.pageY) / 3;
          if (newX < 0) {
            newX = 0;
          }
          if (newY < 0) {
            newY = 0;
          }
          if (newX > _this.$markerWrapper.width()) {
            newX = _this.$markerWrapper.width();
          }
          if (newY > _this.$markerWrapper.height()) {
            newY = _this.$markerWrapper.height();
          }
          $this.css({
            left: posInfo.oLeft + (ePos.x - posInfo.pageX) / 3 + 'px',
            top: posInfo.oTop + (ePos.y - posInfo.pageY) / 3 + 'px'
          });
        });
      });
    });

    _this.$adstractContainer.on(Helper.mouseStartEvent+'.face', function(e){
      e.stopPropagation();
      e.preventDefault();
      var $this=$(this),
        ePos = Helper.getEventPos(e),
        bgPos=$this.css('background-position').split(' ');
      $this.data('pos', {
        oLeft: parseInt(bgPos[0], 10) || 0,
        oTop: parseInt(bgPos[1], 10) || 0,
        pageX: ePos.x,
        pageY: ePos.y
      }).on(Helper.mouseMoveEvent+'.face', function(e){
        e.stopPropagation();
        e.preventDefault();
        var $this=$(this),
          posInfo=$this.data('pos'),
          ePos = Helper.getEventPos(e),
          newX = posInfo.oLeft + (ePos.x - posInfo.pageX) / 3,
          newY = posInfo.oTop + (ePos.y - posInfo.pageY) / 3;
        $this.css({
          'background-position': newX+'px '+newY+'px'
        });
        _this.adstractPos={
          x: newX,
          y: newY
        };
      });
    });

    $(window).on(Helper.mouseEndEvent, function(e) {
      $([_this.$eye1, _this.$eye2, _this.$mouth, _this.$adstractContainer]).each(function(i, el) {
        $(el).off(Helper.mouseMoveEvent + '.face');
      });
    });
  };

  FaceController.prototype.adjust = function() {
    var _this = this,
      eye_y = 0,
      rect = {},
      base_rect = {},
      target = {},
      parse_bg_size,
      bg_pos = _this.$markerWrapper.css('background-position').split(' ');
    bg_pos[0] = parseInt(bg_pos[0], 10);
    bg_pos[1] = parseInt(bg_pos[1], 10);

    // 以下取得面部范围rect和亮度参照范围base_rect
    var eye1_x = parseInt(_this.$eye1.css('left'), 10) + _this.$eye1.width() / 2 - bg_pos[0],
      eye2_x = parseInt(_this.$eye2.css('left'), 10) + _this.$eye2.width() / 2 - bg_pos[0],
      eye1_y = parseInt(_this.$eye1.css('top'), 10) + _this.$eye1.height() / 2 - bg_pos[1],
      eye2_y = parseInt(_this.$eye2.css('top'), 10) + _this.$eye1.height() / 2 - bg_pos[1],
      mouth_x = parseInt(_this.$mouth.css('left'), 10) + _this.$mouth.width() / 2 - bg_pos[0],
      mouth_y = parseInt(_this.$mouth.css('top'), 10) + _this.$mouth.height() / 2 - bg_pos[1],
      current_eye_width = Math.sqrt((eye1_x - eye2_x) * (eye1_x - eye2_x) + (eye1_y - eye2_y) * (eye1_y - eye2_y)),
      rotate_offset = {
        x: 0,
        y: 0
      };

    var l_eye = {},
      r_eye = {},
      rotate = 0;
    if (eye1_x < eye2_x) {
      l_eye.x = eye1_x;
      l_eye.y = eye1_y;
      r_eye.x = eye2_x;
      r_eye.y = eye2_y;
    } else {
      l_eye.x = eye2_x;
      l_eye.y = eye2_y;
      r_eye.x = eye1_x;
      r_eye.y = eye1_y;
    }
    rotate = Math.atan((r_eye.y - l_eye.y) / (r_eye.x - l_eye.x));

    var new_left_eye_pos = Helper.get_rotate_pos(rotate, l_eye.x, l_eye.y),
      new_right_eye_pos = Helper.get_rotate_pos(rotate, r_eye.x, r_eye.y),
      mouth_pos = Helper.get_rotate_pos(rotate, mouth_x, mouth_y),
      eye_mouth_dist = mouth_pos.y - new_left_eye_pos.y;

    eye_y = Math.max(new_left_eye_pos.y, new_left_eye_pos.y);

    rect.x = new_left_eye_pos.x - current_eye_width / 6 - _this.$eye1.width() / 2;
    base_rect.x = new_left_eye_pos.x + _this.$eye1.width() / 2;

    rect.w = current_eye_width * 8 / 6 + _this.$eye2.width();
    base_rect.w = current_eye_width - _this.$eye1.width() / 2 - _this.$eye2.width() / 2;

    rect.y = eye_y - _this.$eye1.height() / 2;
    base_rect.y = eye_y + _this.$eye1.height() / 2;

    rect.h = (mouth_pos.y + _this.$mouth.height() / 2 - rect.y);
    base_rect.h = mouth_pos.y - eye_y - _this.$mouth.height() / 2 - _this.$eye1.height() / 2;

    // 彩色模式范围扩大
    if (_this.option.colorMode) {
      rect.x -= current_eye_width / 6;
      rect.y -= _this.$eye1.height();
      rect.w += current_eye_width / 3;
      rect.h += _this.$eye1.height() * 2;
    }

    var img_zoom = _this.originalImgInfo.zoom;
      tmpl_zoom = _this.nakeInfo.eye_width / (current_eye_width * img_zoom);
    eye_mouth_dist *= img_zoom;
    rect.x *= img_zoom;
    rect.y *= img_zoom;
    rect.w *= img_zoom;
    rect.h *= img_zoom;
    base_rect.x *= img_zoom;
    base_rect.y *= img_zoom;
    base_rect.w *= img_zoom;
    base_rect.h *= img_zoom;
    // 以上取得面部范围rect和亮度参照范围base_rect
    
    var t_img=new Image();
    t_img.onload=function(){
      var base_arr,
        o_level = 0,
        o_contras = 0,
        sort_data = [],
        rotated_canvas = document.createElement('canvas'),
        rotated_ctx = rotated_canvas.getContext('2d'),
        base_canvas = document.createElement('canvas'),
        base_ctx = base_canvas.getContext('2d');

      if (rect.x < 0) {
        rotate_offset.x = -rect.x;
        rect.x = 0;
      }
      if (rect.y < 0) {
        rotate_offset.y = -rect.y;
        rect.y = 0;
      }
      if ((rect.x + rect.w) > this.width) {
        rotate_offset.x = this.width - (rect.x + rect.w);
        rect.x += rotate_offset.x;
      }
      if ((rect.y + rect.h) > this.height) {
        rotate_offset.y = this.height - (rect.y + rect.h);
        rect.y += rotate_offset.y;
      }

      rotated_canvas.width = this.width;
      rotated_canvas.height = this.height;
      rotated_ctx.translate(rotate_offset.x, rotate_offset.y);
      rotated_ctx.rotate(-rotate);
      rotated_ctx.drawImage(t_img, 0, 0);

      _this.face_canvas.width = rect.w * tmpl_zoom;
      _this.face_canvas.height = rect.h * tmpl_zoom;
      base_canvas.width = base_rect.w * tmpl_zoom;
      base_canvas.height = base_rect.h * tmpl_zoom;
      eye_mouth_dist *= tmpl_zoom;

      _this.face_canvas.height = _this.face_canvas.height * _this.nakeInfo.eye_mouth_dist / eye_mouth_dist;

      _this.face_ctx.drawImage(rotated_canvas, rect.x, rect.y, rect.w, rect.h, 0, 0, _this.face_canvas.width, _this.face_canvas.height);
      base_ctx.drawImage(rotated_canvas, base_rect.x, base_rect.y, base_rect.w, base_rect.h, 0, 0, base_canvas.width, base_canvas.height);

      if (!_this.option.colorMode) {
        // 取图片基准亮度、对比度
        base_arr = base_ctx.getImageData(0, 0, base_canvas.width, base_canvas.height);
        // 去色
        for (var i = 0; i < base_arr.data.length; i += 4) {
          var new_val = Math.max(base_arr.data[i], base_arr.data[i + 1], base_arr.data[i + 2]);
          base_arr.data[i] = base_arr.data[i + 1] = base_arr.data[i + 2] = new_val;
          sort_data.push(new_val);
        }

        sort_data.sort(function(a, b) {
          return a - b;
        });
        for (var k = 0; k < sort_data.length; k++) {
          o_level += sort_data[k];
        }
        o_level /= sort_data.length;
        console.log('o_level', o_level);
        base_arr = null;
        base_canvas = null;
        base_ctx = null;
        sort_data = null;

        // 根据基准调整面部亮度、对比度
        face_arr = _this.face_ctx.getImageData(0, 0, _this.face_canvas.width, _this.face_canvas.height);

        for (var j = 0; j < face_arr.data.length; j += 4) {
          var new_b_val = Math.max(face_arr.data[j], face_arr.data[j + 1], face_arr.data[j + 2]);
          o_contras += Math.sqrt((new_b_val - o_level) * (new_b_val - o_level));

          face_arr.data[j] = face_arr.data[j + 1] = face_arr.data[j + 2] = new_b_val;
        }

        o_contras /= face_arr.data.length;
        console.log('o_contras', o_contras);

        for (var j = 0; j < face_arr.data.length; j += 4) {
          var new_f_val = face_arr.data[j];
          new_f_val = new_f_val + (new_f_val - o_level) * (20 - o_contras) / 20 * 6; // contras
          new_f_val += (300 - o_level) * (300 - new_f_val) / 300 * (o_contras + 35) / 35; // brightness
          face_arr.data[j] = face_arr.data[j + 1] = face_arr.data[j + 2] = new_f_val;
        }

        _this.face_ctx.putImageData(face_arr, 0, 0, 0, 0, t_img.width, t_img.height);
        face_arr = null;
      }

      var face_base64=_this.face_canvas.toDataURL();
      _this.trigger('face_ready', face_base64);
      _this.$adstractContainer.css({
        'background-image': 'url("'+face_base64+'")',
        'background-position': '0px 0px'
      });
      _this.adstractPos={
        x: 0,
        y: 0
      };
    };
    t_img.src=_this.originalImgUrl;
  };

  FaceController.prototype.adstract=function(){
    var _this=this,
      canvas=document.createElement('canvas'),
      ctx=canvas.getContext('2d'),
      imgArr;
    canvas.width=_this.nakeInfo.width;
    canvas.height=_this.nakeInfo.height;
    ctx.drawImage(_this.face_canvas, _this.adstractPos.x, _this.adstractPos.y);

    var tempImg=new Image();
    tempImg.onload=function(){
      ctx.drawImage(this, 0, 0);
      imgArr=ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < imgArr.data.length; i += 4) {
        var new_grey_val;
        if(_this.option.colorMode){
          new_grey_val = (imgArr.data[i]+ imgArr.data[i + 1]+ imgArr.data[i + 2])/3;
        }else{
          new_grey_val = Math.max(imgArr.data[i], imgArr.data[i + 1], imgArr.data[i + 2]);
        }
        if (new_grey_val % 2) {
          new_grey_val += 1;
        }
        // 去色
        if (!_this.option.colorMode) {
          imgArr.data[i] = imgArr.data[i + 1] = imgArr.data[i + 2] = new_grey_val;
        }
        // 根据亮度设置透明度
        if (new_grey_val) {
          var new_alpha=255 - new_grey_val;
          imgArr.data[i + 3] = new_alpha;
        }
      }
      ctx.putImageData(imgArr, 0, 0, 0, 0, canvas.width, canvas.height);
      _this.trigger('face_complete', canvas.toDataURL());
    };
    tempImg.src='tmpl_img/'+_this.nakeInfo.img;
  };

  return FaceController;
});