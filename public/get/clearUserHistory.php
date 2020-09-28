<?php

foreach (\Helpers\Helper::listFolder(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}") as $item) {
    if(is_file(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}/{$item}"))
        unlink(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}/{$item}");
}