define([
  'jquery'
], function(
  $
){
  var data={};

  var get_hash_data=function(){
    var hash=location.hash.replace('#', '').split('&');
    data={};
    $.each(hash, function(i, h_data){
      h_data=h_data.split('=');
      data[$.trim(h_data[0])]=$.trim(h_data[1]);
    });

    return data;
  };

  var parse_hash_data=function(){
    var new_hash=[];
    $.each(data, function(key, val){
      if(key){
        new_hash.push($.trim(key)+'='+$.trim(val));
      }
    });
    new_hash=new_hash.join('&');
    location.hash='#'+new_hash;
  };

  var update_hash_data=function(new_data){
    get_hash_data();
    $.extend(data, new_data);
    parse_hash_data();

    return data;
  };

  var clear_hash_data=function(){
    location.hash='';
  };

  return {
    get: get_hash_data,
    parse: parse_hash_data,
    update: update_hash_data,
    clear: clear_hash_data
  };
});