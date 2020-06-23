<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT');
header('Content-Type: application/json');

use \Conn\Read;
use \Helpers\Helper;

require_once './_config/config.php';
$_SESSION = [];

ob_start();

$data = ["response" => 1, "error" => "", "data" => ""];

if (isset($_GET['data'])) {


    $read = new Read();
    $url = strip_tags(trim($_GET['data']));
    $include = "";
    $find = false;
    $var = [];

    $urlSplit = explode("/maestruToken/", $url);
    \Config\Config::setUser(!empty($urlSplit[1]) ? $urlSplit[1] : 0);
    $url = explode('/', $urlSplit[0]);

    foreach ($url as $i => $u) {
        if (!$find) {
            if (file_exists(PATH_HOME . "public/api/public/" . $include . "/{$u}.php")) {
                $include = PATH_HOME . "public/api/public/" . $include . "/{$u}.php";
                $find = true;
            } else {
                foreach (Helper::listFolder(PATH_HOME . VENDOR) as $lib) {
                    if (file_exists(PATH_HOME . VENDOR . $lib . "/public/api/public/" . $include . "/{$u}.php")) {
                        $include = PATH_HOME . VENDOR . $lib . "/public/api/public/" . $include . "/{$u}.php";
                        $find = true;
                        break;
                    }
                }

                if (!$find)
                    $include .= "/{$u}";
            }
        } elseif ($find) {
            $var[] = $u;
        }
    }

    if ($find) {
        include_once $include;

        if (!empty($data['error']))
            $data['response'] = 2;
        elseif (!isset($data) || !isset($data['response']) || !in_array($data['response'], [1, 2, 3, 4]))
            $data = ["response" => 5, "error" => "retorno inválido!", "data" => ""];
        elseif ($data['response'] === 3 && (!is_string($data['data']) || !preg_match("/^" . HOME . "/i", $data['data'])))
            $data = ["response" => 2, "error" => "url de redirecionamento inválida.", "data" => ""];
    } else {
        $data["response"] = 4;
        $data["error"] = "Rota não Encontrada.";
    }
}

//trabalha cabeçalho de Código de Resposta com base no response
if ($data['response'] === 1)
    header("HTTP/1.1 200 OK");
if ($data['response'] === 2)
    header("HTTP/1.1 400 Bad Request");
elseif ($data['response'] === 3)
    header("HTTP/1.1 301 Moved Permanently");
elseif ($data['response'] === 4)
    header("HTTP/1.1 404 Not Found");
elseif ($data['response'] === 5)
    header("HTTP/1.1 500 Internal Server Error");

echo json_encode(($data['response'] === 1 ? $data['data'] : $data['error']), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
ob_get_flush();