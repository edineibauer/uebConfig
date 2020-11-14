<?php

foreach (\Helpers\Helper::listFolder(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}") as $item)
    unlink(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}/{$item}");

if(file_exists(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}"))
    rmdir(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}");