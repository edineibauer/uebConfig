<?php

$data['data'] = "";
$user = $_SESSION['userlogin'];
unset($user['lastview']);
if(!empty($_SESSION['userlogin']) && !empty($_SESSION['userlogin']['token']))
    $data['data'] = $user;