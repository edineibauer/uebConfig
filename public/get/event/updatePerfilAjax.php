<?php
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');

if(!empty($_SESSION['userlogin']) && !empty($_SESSION['userlogin']['token'])) {

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

        echo $stringLogin;
    } else {
        echo "";
    }
}