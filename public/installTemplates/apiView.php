<?php
header('Access-Control-Allow-Methods: GET');
header('Content-Type: application/json');

require_once './_config/config.php';

if(!file_exists(PATH_HOME . "cacheSession")) {
    \Helpers\Helper::createFolderIfNoExist(PATH_HOME . "cacheSession");
    $f = fopen(PATH_HOME . "cacheSession/.htaccess", "w+");
    fwrite($f, "Deny from all");
    fclose($f);
}

session_save_path(PATH_HOME . "cacheSession");
if (session_status() == PHP_SESSION_NONE)
    session_start();

use Route\Link;

$url = strip_tags(trim($_GET['data']));
if (!empty($url)) {

    $urlSplit = explode("/maestruToken/", $url);
    \Config\Config::setUser(!empty($urlSplit[1]) ? $urlSplit[1] : 0);
    $link = new Link($urlSplit[0]);

    if ($link->getRoute()) {

        try {

            ob_start();
            include_once $link->getRoute();
            $data = ["response" => 1, "error" => "", "data" => [
                "title" => $link->getParam()['title'],
                "descricao" => $link->getParam()['descricao'],
                "front" => array_merge($link->getParam()['front'], ["variaveis" => $link->getParam()['variaveis'] ?? []]),
                "css" => $link->getParam()['css'],
                "js" => $link->getParam()['js'],
                "head" => $link->getParam()['head'] ?? [],
                "header" => $link->getParam()['header'],
                "navbar" => $link->getParam()['navbar'],
                "templates" => $link->getParam()['templates'],
                "setor" => $link->getParam()['setor'],
                "!setor" => $link->getParam()['!setor'],
                "redirect" => $link->getParam()['redirect'] ?? "403",
                "cache" => $link->getParam()['cache'] ?? !1,
                "content" => ob_get_contents()
            ]];
            ob_end_clean();

        } catch (Exception $e) {
            $data = ["response" => 2, "error" => "Erro na resposta do Servidor", "data" => ""];
        }

    } else {
        $data["response"] = 4;
    }
} else {
    $data["response"] = 4;
}

echo json_encode($data);