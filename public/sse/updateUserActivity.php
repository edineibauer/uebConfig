<?php

$data['data'] = "";
if (!empty($_SESSION['userlogin']) && !empty($_SESSION['userlogin']['token'])) {

    if(!file_exists(PATH_HOME . "_cdn/userActivity/" . $_SESSION['userlogin']['id'] . "/isOnline.json"))
        \Config\Config::createFile(PATH_HOME . "_cdn/userActivity/" . $_SESSION['userlogin']['id'] . "/isOnline.json", "");

    /**
     * Update the time when this user is online in the app
     */
    $dia = date("Y-m-d");
    if (file_exists(PATH_HOME . "_cdn/userActivity/" . $_SESSION['userlogin']['id'] . "/{$dia}.json")) {

        /**
         * Set the time now
         */
        $diaContent = json_decode(file_get_contents(PATH_HOME . "_cdn/userActivity/" . $_SESSION['userlogin']['id'] . "/{$dia}.json"), !0);
        $diaContent[] = date("H:i:s");
        \Config\Config::createFile(PATH_HOME . "_cdn/userActivity/" . $_SESSION['userlogin']['id'] . "/{$dia}.json", json_encode($diaContent));

    } else {

        /**
         * Cretae the file day
         */
        \Helpers\Helper::createFolderIfNoExist(PATH_HOME . "_cdn/userActivity");
        \Helpers\Helper::createFolderIfNoExist(PATH_HOME . "_cdn/userActivity/" . $_SESSION['userlogin']['id']);
        \Config\Config::createFile(PATH_HOME . "_cdn/userActivity/" . $_SESSION['userlogin']['id'] . "/{$dia}.json", json_encode([date("H:i:s")]));
    }
}