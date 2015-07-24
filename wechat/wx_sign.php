<?php
header('Content-Type: application/json; charset=utf-8');
$ticket=$_POST['ticket'];
$noncestr=$_POST['nonceStr'];
$timestamp=$_POST['timestamp'];
$url=$_POST['url'];

if($ticket && $noncestr && $timestamp && $url){
  $ret['signature']=sha1('jsapi_ticket='.$ticket.'&noncestr='.$noncestr.'&timestamp='.$timestamp.'&url='.$url);
}else{
  $ret['signature']='';
}

echo json_encode($ret);
?>