<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Origin: http://localhost:8000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET');
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once './_config/config.php';

$url = strip_tags(trim($_GET['data']));
if (!empty($url)) {

    /**
     * Split the url into `/`
     * get the first as url and the rest as variables
     */
    $urlSplit = explode("/maestruToken/", $url);
    $token  = !empty($urlSplit[1]) ? $urlSplit[1] : 0;

    $urlSplit = explode("/maestruView/", $urlSplit[0]);
    $view  = !empty($urlSplit[1]) ? $urlSplit[1] : "";

    $variaveis = array_filter(explode('/', $urlSplit[0]));
    $route = "";

    \Config\Config::setUser($token);

    /**
     * Find the route to the GET request
     * @param array $variaveis
     * @param string $view
     * @return string
     */
    function findRouteGet(array &$variaveis, string $view): string
    {
        $url = "";
        $path = "";
        $setor = \Config\Config::getSetor();
        $count = count($variaveis);

        for ($i = 0; $i < $count; $i++) {
            $path .= ($i > 0 ? "/{$url}" : "");
            $url = array_shift($variaveis);

            if(!empty($view)) {
                if(file_exists(PATH_HOME . "public/view/{$view}/{$setor}/get{$path}/{$url}.php")) {
                    return PATH_HOME . "public/view/{$view}/{$setor}/get{$path}/{$url}.php";
                } elseif(file_exists(PATH_HOME . "public/view/{$view}/get{$path}/{$url}.php")) {
                    return PATH_HOME . "public/view/{$view}/get{$path}/{$url}.php";
                }
            }

            foreach (\Config\Config::getRoutesTo("get" . $path) as $item) {
                if (file_exists($item . $url . ".php"))
                    return $item . $url . ".php";
            }
        }

        return "";
    }

    $route = findRouteGet($variaveis, $view);

    if (!empty($route)) {
        ob_start();

        try {
            include_once $route;
            if (!empty($data['error'])) {
                $data["response"] = 2;
                $data["data"] = "";
            } elseif (!isset($data['data'])) {
                $conteudo = ob_get_contents();
                if(\Helpers\Check::isJson($conteudo))
                    $conteudo = json_decode($conteudo);

                $data = ["response" => 1, "error" => "", "data" => $conteudo];
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
    $data["response"] = 4;
}

echo json_encode($data);