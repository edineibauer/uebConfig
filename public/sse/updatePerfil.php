<?php

$data['data'] = $_SESSION['userlogin'];
if(isset($data['data']['lastview']))
    unset($data['data']['lastview']);