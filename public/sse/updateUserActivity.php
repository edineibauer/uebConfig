<?php

$data['data'] = "";
if (!empty($_SESSION['userlogin']) && !empty($_SESSION['userlogin']['token'])) {

    /**
     * Update the time when this user is online in the app
     */
    $dia = date("Y-m-d");
    if (!file_exists(PATH_HOME . "_cdn/userActivity/" . $_SESSION['userlogin']['id'] . "/{$dia}.json")) {
        \Helpers\Helper::createFolderIfNoExist(PATH_HOME . "_cdn/userActivity/" . $_SESSION['userlogin']['id']);
        $f = fopen(PATH_HOME . "_cdn/userActivity/" . $_SESSION['userlogin']['id'] . "/{$dia}.json", "w+");
        fwrite($f, "[]");
        fclose($f);
    }

    /**
     * Set the time now
     */
    $diaContent = json_decode(file_get_contents(PATH_HOME . "_cdn/userActivity/" . $_SESSION['userlogin']['id'] . "/{$dia}.json"), !0);
    $diaContent[] = date("H:i:s");

    /**
     * Save the file
     */
    $f = fopen(PATH_HOME . "_cdn/userActivity/" . $_SESSION['userlogin']['id'] . "/{$dia}.json", "w+");
    fwrite($f, json_encode($diaContent));
    fclose($f);
}