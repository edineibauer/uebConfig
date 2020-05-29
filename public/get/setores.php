<?php

$data['data'] = \Config\Config::getSetores((!empty($_SESSION['userlogin']['system']) ? $_SESSION['userlogin']['system'] : null));