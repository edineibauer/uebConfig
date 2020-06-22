<?php
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');

if(!empty($_SESSION['userlogin']) && !empty($_SESSION['userlogin']['token'])) {
    function sendMsg($id, $msg)
    {
        echo "id: $id" . PHP_EOL;
        echo "data: $msg" . PHP_EOL;
        echo PHP_EOL;
        ob_flush();
        flush();
    }

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