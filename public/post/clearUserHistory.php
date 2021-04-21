<?php

if(!empty($_SESSION['userlogin']['id']) && file_exists(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}"))
    \Helpers\Helper::recurseDelete(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}");