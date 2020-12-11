<?php

/**
 * Exclui todo o cache
 */
\Helpers\Helper::recurseDelete(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id']);

if(file_exists(PATH_HOME . "_cdn/userActivity/{$_SESSION['userlogin']['id']}/isOnline.json"))
    unlink(PATH_HOME . "_cdn/userActivity/{$_SESSION['userlogin']['id']}/isOnline.json");