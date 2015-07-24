<?php
header('Content-Type: application/json; charset=utf-8');
$app_name=$_GET['name'];

require('info.php');

function get_new_token(){
  global $wx_info,
    $mysqli,
    $app_name,
    $file_name;
  $new_info=json_decode(file_get_contents('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='.$wx_info['app_id'].'&secret='.$wx_info['app_secret']));
  if($new_info->access_token){
    $ret['token']=$new_info->access_token;
    $ret['expires_in']=$new_info->expires_in;
    $ret['ticket']=get_new_ticket($ret['token']);
    file_put_contents($file_name, json_encode($ret));
  }else{
    $ret=json_encode($new_info);
  }
  
  return $ret;
}

function get_new_ticket($token){
  global $app_name,
    $mysqli;
  $ticket_info=json_decode(file_get_contents('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='.$token.'&type=jsapi'));
  if($ticket_info->ticket){
    $ret=$ticket_info->ticket;
  }else{
    $ret='';
  }
  return $ret;
}

$file_name='wx_info/'.$app_name.'.json';
if($app_name){
  if(file_exists($file_name)){
    $res=json_decode(file_get_contents($file_name));
    if($res && time()>(int)$res['last']+(int)$res['expired'] || $res['token']=='' || $res['ticket']==''){
      $ret['token']=$res['token'];
      $ret['ticket']=$res['ticket'];
    }else{
      $ret=get_new_token();
    }
  }else{
    $ret=get_new_token();
  }


  if(!$mysqli->connect_errno){
    $res=$mysqli->query('SELECT `token`, `ticket`, UNIX_TIMESTAMP(`last_update`) last, `expired` FROM `token` WHERE `name`="'.$app_name.'"');
    if($info=$res->fetch_assoc()){
      if($info && time()>(int)$info['last']+(int)$info['expired'] || $info['token']=='' || $info['ticket']==''){
        $ret=get_new_token();
      }else{
        $ret['token']=$info['token'];
        $ret['ticket']=$info['ticket'];
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