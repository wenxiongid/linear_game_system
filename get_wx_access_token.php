<?php
header('Content-Type: application/json; charset=utf-8');
$app_name=$_GET['name'];

require('info.php');

$mysqli=new mysqli($sql_info['host'], $sql_info['username'], $sql_info['password'], $sql_info['database']);

function get_new_token(){
  global $wx_info,
    $mysqli,
    $app_name;
  $new_info=json_decode(file_get_contents('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='.$wx_info['app_id'].'&secret='.$wx_info['app_secret']));
  $mysqli->query('UPDATE `token` SET `token`="'.$new_info->access_token.'", `expired`="'.$new_info->expires_in.'" WHERE `name`="'.$app_name.'"');
  $ret['token']=$new_info->access_token;
  return $ret;
}

if($app_name){
  if(!$mysqli->connect_errno){
    $res=$mysqli->query('SELECT `token`, UNIX_TIMESTAMP(`last_update`) last, `expired` FROM `token` WHERE `name`="'.$app_name.'"');
    if($info=$res->fetch_assoc()){
      if($info && time()>(int)$info['last']+(int)$info['expired']){
        $ret=get_new_token();
      }else{
        $ret['token']=$info['token'];
      }
    }else{
      $ret=get_new_token();
    }
  }else{
    $ret=get_new_token();
      }
  echo json_encode($ret);
}
?>