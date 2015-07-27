<?php
header('Content-Type: application/json; charset=utf-8');
$ticket=$_POST['ticket'];
$noncestr=$_POST['nonceStr'];
$url=$_POST['url'];

$ret['ticket']=$_POST['ticket'];
$ret['nonceStr']=$_POST['nonceStr'];
$ret['timestamp']=time();
if($ticket && $noncestr && $url){
  $ret['raw']='jsapi_ticket='.$ticket.'&noncestr='.$noncestr.'&timestamp='.$ret['timestamp'].'&url='.$url;
  $ret['signature']=sha1($ret['raw']);
}else{
  $ret['signature']='';
}

echo json_encode($ret);
?>