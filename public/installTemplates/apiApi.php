<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT');
header('Content-Type: application/json');

use \Conn\Read;
use \Helpers\Helper;

require_once './_config/config.php';
$_SESSION = [];

$url = strip_tags(trim($_GET['data']));
if (!empty($url)) {

    $key = $_SERVER['HTTP_KEY'] ?? filter_input(INPUT_POST, 'key', FILTER_DEFAULT);
    if (empty($key)) {
        $data = ["response" => 2, "error" => "'Key' não Informado", "data" => ""];
    } else {

        $read = new Read();
        $read->exeRead("api_chave", "WHERE chave = :key", "key={$key}");
        if ($read->getResult()) {
            $API = $read->getResult()[0];

            \Config\Config::setUser(0);
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