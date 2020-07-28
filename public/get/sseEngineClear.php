<?php

if(!empty($_SESSION['userlogin']['id'])) {
    foreach (\Helpers\Helper::listFolder(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}") as $item)
        unlink(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}/{$item}.json");
}