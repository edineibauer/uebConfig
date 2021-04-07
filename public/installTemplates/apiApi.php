<?php

if (isset($_SERVER['HTTP_ORIGIN'])) {
    $origin = $_SERVER['HTTP_ORIGIN'];
    $allowed_domains = $var_cors_replace;

    if (in_array($origin, $allowed_domains) || in_array("*", $allowed_domains))
        header('Access-Control-Allow-Origin: ' . $origin);

    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
}

use \Conn\Read;

require_once './_config/config.php';
$_SESSION = [];

$url = strip_tags(trim($_GET['data']));
if (!empty($url)) {

    /**
     * Recebe dados
     */
    if (empty($_POST)) {
        $putfp = fopen('php://input', 'r');
        $putdata = '';
        while ($dataRead = fread($putfp, 1024))
            $putdata .= $dataRead;
        fclose($putfp);

        if (isset(getallheaders()['Content-Type']) && getallheaders()['Content-Type'] === "application/json") {
            $dados = json_decode($putdata, !0);
        } else {
            if(is_array($putdata))
                parse_str($putdata, $dados);
            elseif(is_string($putdata) && \Helpers\Check::isJson($putdata))
                $dados = json_decode($putdata, !0);
        }
    }

    if (empty($dados) && !empty($_POST)) {
        $dados = $_POST;

        if (getallheaders()['Content-Type'] === "application/json")
            $dados = json_decode($dados, !0);
    }

    $key = $_SERVER['HTTP_KEY'] ?? $dados['key'] ?? null;

    if(empty($key)) {
        $urlSplit = explode("/maestruKey/", $url);
        if(!empty($urlSplit[1])) {
            $key = $urlSplit[1];
            $url = str_replace("/maestruKey/{$key}", "", $url);
        }
    }

    if (empty($key)) {
        $data = ["response" => 2, "error" => "'key' não Informado", "data" => ""];
    } else {

        $read = new Read();
        $read->exeRead("api_chave", "WHERE chave = :key", "key={$key}", !0, !0, !0);
        if ($read->getResult()) {
            $API = $read->getResult()[0];
            $token = 0;

            if(!empty($API['usuario'])) {
                $read->exeRead("usuarios_token", "WHERE usuario = :ui", "ui={$API['usuario']}", !0, !0, !0);
                if($read->getResult()) {
                    $token = $read->getResult()[0]['token'];
                } else {
                    $read->exeRead("usuarios", "WHERE id = :ui", "ui={$API['usuario']}", !0, !0, !0);
                    if($read->getResult()) {
                        $token = md5("tokes" . rand(9999, 99999) . md5(base64_encode(date("Y-m-d H:i:s"))) . rand(0, 9999));
                        $create = new \Conn\Create();
                        $create->exeCreate("usuarios_token", ['token' => $token, "token_expira" => date("Y-m-d H:i:s"), "usuario" => $API['usuario']]);
                    }
                }
            }
            \Config\Config::setUser($token);

            $variaveis = array_filter(explode('/', $url));
            $route = "";

            /**
             * Find the route to the GET request
             * @param array $variaveis
             * @return string
             */
            function findRouteGet(array &$variaveis): string
            {
                $url = "";
                $path = "";
                $count = count($variaveis);
                for ($i = 0; $i < $count; $i++) {
                    $path .= ($i > 0 ? "/{$url}" : "");
                    $url = array_shift($variaveis);
                    foreach (\Config\Config::getRoutesTo("api" . $path) as $item) {
                        if (file_exists($item . $url . ".php"))
                            return $item . $url . ".php";
                    }
                }

                return "";
            }

            $route = findRouteGet($variaveis);

            if (!empty($route)) {
                ob_start();

                try {
                    include_once $route;
                    if (isset($data['error'])) {
                        $data["response"] = 2;
                        $data["data"] = "";
                    } elseif (!isset($data['data'])) {
                        $data = ["response" => 1, "error" => "", "data" => ob_get_contents()];
                    } elseif (!isset($data['response'])) {
                        $data['response'] = 1;
                        $data['error'] = "";
                    }

                    if (is_string($data['data']) && preg_match('/^http/i', $data['data']))
                        $data = ["response" => 3, "error" => "", "data" => $data['data']];

                } catch (Exception $e) {
                    $data = ["response" => 2, "error" => "Erro na resposta do Servidor", "data" => ""];
                }

                ob_end_clean();
            } else {
                $data['response'] = 4;
            }

        } else {
            $data = ["response" => 2, "error" => "Chave de Acesso Inválida", "data" => ""];
        }
    }
} else {
    $data["response"] = 4;
}

echo json_encode($data);