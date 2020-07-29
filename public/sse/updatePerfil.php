<?php

$data['data'] = "";
if(!empty($_SESSION['userlogin']) && !empty($_SESSION['userlogin']['token']))
    $data['data'] = $_SESSION['userlogin'];