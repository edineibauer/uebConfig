<?php

$token = filter_input(INPUT_POST, 'tokenPush', FILTER_DEFAULT);
$code = filter_input(INPUT_POST, 'code', FILTER_DEFAULT);

$create = new \Conn\Create();
$create->exeCreate("push_notifications", ["subscription" => $token, "usuario" => $_SESSION['userlogin']['id'], "code" => $code ?? "FCM", "system_id" => null]);