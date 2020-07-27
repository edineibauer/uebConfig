<?php
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');

use Helpers\Helper;

if(!empty($_SESSION['userlogin']) && !empty($_SESSION['userlogin']['token'])) {
    function sendMsg($id, $msg)
    {
        echo "id: $id" . PHP_EOL;
        echo "data: $msg" . PHP_EOL;
        echo PHP_EOL;
        ob_flush();
        flush();
    }

    /**
     * Update the time when this user is online in the app
     */
    $dia = date("Y-m-d");
    if(!file_exists(PATH_HOME . "_cdn/userActivity/" . $_SESSION['userlogin']['id'] . "/{$dia}.json")) {
        Helper::createFolderIfNoExist(PATH_HOME . "_cdn/userActivity/" . $_SESSION['userlogin']['id']);
        $f = fopen(PATH_HOME . "_cdn/userActivity/" . $_SESSION['userlogin']['id'] . "/{$dia}.json", "w+");
        fwrite($f, "[]");
        fclose($f);
    }

    /**
     * Set the time now
     */
    $dia = json_decode(file_get_contents(PATH_HOME . "_cdn/userActivity/" . $_SESSION['userlogin']['id'] . "/{$dia}.json"), !0);
    $dia[] = date("H:i:s");

    /**
     * Save the file
     */
    $f = fopen(PATH_HOME . "_cdn/userActivity/" . $_SESSION['userlogin']['id'] . "/{$dia}.json", "w+");
    fwrite($f, json_encode($dia));
    fclose($f);

    /**
     * Convert user in string to compare information persistence
     */
    $stringLogin = json_encode($_SESSION['userlogin']);

    /**
     * Busca last para ver se houve diferença no perfil
     * se não houver, não retorna os dados de perfil.
     */
    $last = file_get_contents(PATH_HOME . "_cdn/userPerfil/" . $_SESSION['userlogin']['id'] . ".json");
    if($last !== $stringLogin) {

        /**
         * Salva perfil do usuário em last
         */
        $f = fopen(PATH_HOME . "_cdn/userPerfil/" . $_SESSION['userlogin']['id'] . ".json", "w+");
        fwrite($f, $stringLogin);
        fclose($f);

        sendMsg(time(), $stringLogin);
    } else {
        sendMsg(time(), "");
    }
}