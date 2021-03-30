<?php
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Origin: http://localhost:8000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET');
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once './_config/config.php';
$_SESSION = [];

use Route\Link;

$url = strip_tags(trim($_GET['data']));
if (!empty($url)) {

    $urlSplit = explode("/maestruToken/", $url);
    \Config\Config::setUser(!empty($urlSplit[1]) ? $urlSplit[1] : 0);
    $url = $urlSplit[0];
    $link = new Link($urlSplit[0]);

    if ($link->getRoute()) {

        try {
            if(!DEV && file_exists(PATH_HOME . "www/view/" . $_SESSION['userlogin']['setor'] . "/" . $link->getFile() . ".json")) {
                $data = ["response" => 1, "error" => "", "data" => file_get_contents(PATH_HOME . "www/view/" . $_SESSION['userlogin']['setor'] . "/" . $link->getFile() . ".json")];
            } else {

                ob_start();
                include_once $link->getRoute();
                $data = ["response" => 1, "error" => "", "data" => [
                    "title" => $link->getParam()['title'],
                    "descricao" => $link->getParam()['descricao'],
                    "css" => $link->getParam()['css'],
                    "js" => $link->getParam()['js'],
                    "jsPre" => $link->getParam()['jsPre'],
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
            }

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