<?php
$ticket=$_POST['ticket'];
$noncestr=$_POST['noncestr'];
$timestamp=$_POST['timestamp'];
$url=$_POST['url'];

if($ticket && $noncestr && $timestamp && $url){
  $ret['signature']=sha1('jsapi_ticket='.$ticket.'&noncestr='.$noncestr.'&timestamp='.$timestamp.'&url='.$url);
}else{
  $ret['signature']='';
}

echo json_encode($ret);
?>