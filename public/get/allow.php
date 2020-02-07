<?php
$setor = !empty($_SESSION['userlogin']) ? $_SESSION['userlogin']['setor'] : "0";
$data['data'] = \Config\Config::getPermission()[$setor];