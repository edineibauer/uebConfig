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

    $key = $_SERVER['HTTP_KEY'] ?? filter_input(INPUT_POST, 'key', FILTER_DEFAULT);
    $rota = str_replace('.php', '', strip_tags(trim($_GET['data'])));

    if (empty($key)) {
        $data = ["response" => 2, "error" => "'Key' não Informado", "data" => ""];
    } else {

        $read = new Read();
        $read->exeRead("api_chave", "WHERE chave = :key", "key={$key}");
        if ($read->getResult()) {
            $AllowRota = $read->getResult()[0]['rota_de_acesso'];
            if (empty($AllowRota) || $rota === $AllowRota) {

                $url = explode('/', $rota);
                $include = "";
                $find = false;
                $var = [];

                foreach ($url as $i => $u) {
                    if (!$find) {
                        if (file_exists(PATH_HOME . "public/api" . $include . "/{$u}.php")) {
                            $include = PATH_HOME . "public/api" . $include . "/{$u}.php";
                            $find = true;
                        } else {
                            foreach (Helper::listFolder(PATH_HOME . VENDOR) as $lib) {
                                if (file_exists(PATH_HOME . VENDOR . $lib . "/public/api" . $include . "/{$u}.php")) {
                                    $include = PATH_HOME . VENDOR . $lib . "/public/api" . $include . "/{$u}.php";
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
            } else {
                $data = ["response" => 2, "error" => "Chave de acesso não permite esta rota", "data" => ""];
            }
        } else {
            $data = ["response" => 2, "error" => "Chave de Acesso Inválida", "data" => ""];
        }
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