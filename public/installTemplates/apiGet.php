<?php

if (isset($_SERVER['HTTP_ORIGIN'])) {
    $origin = $_SERVER['HTTP_ORIGIN'];
    $allowed_domains = $var_cors_replace;

    if (in_array($origin, $allowed_domains) || in_array("*", $allowed_domains))
        header('Access-Control-Allow-Origin: ' . $origin);

    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}

header('Access-Control-Allow-Methods: GET, OPTIONS');
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
}

require_once './_config/config.php';

$url = strip_tags(trim($_GET['data']));
$viewGetReceived = "";
$token = 0;

if (!empty($url)) {

    /**
     * Split the url into `/`
     * get the first as url and the rest as variables
     */
    if (preg_match("/\/maestruToken\//i", $url))
        list($url, $token) = explode("/maestruToken/", $url);

    if (preg_match("/\/maestruView\//i", $url))
        list($url, $viewGetReceived) = explode("/maestruView/", $url);

    $variaveis = array_filter(explode('/', $url));
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
        $count = count($variaveis) + 1;

        $views = [];
        foreach (\Config\Config::getRoutesTo("view") as $v)
            $views = array_merge($views, \Helpers\Helper::listFolder($v));

        for ($i = 0; $i < $count; $i++) {
            $path .= ($i > 0 ? "/{$url}" : "");
            $url = array_shift($variaveis);

            /**
             * Search for view on view (if have maestruView)
             */
            if (!empty($view)) {
                if (file_exists(PATH_HOME . "public/view/{$view}/{$setor}/get{$path}/{$url}.php")) {
                    return PATH_HOME . "public/view/{$view}/{$setor}/get{$path}/{$url}.php";
                } elseif (file_exists(PATH_HOME . "public/view/{$view}/get{$path}/{$url}.php")) {
                    return PATH_HOME . "public/view/{$view}/get{$path}/{$url}.php";
                }
            }

            /**
             * Search on get folder
             */
            foreach (\Config\Config::getRoutesTo("get" . $path) as $item) {
                if (file_exists($item . $url . ".php"))
                    return $item . $url . ".php";
            }

            /**
             * Search on all view get folders
             */
            foreach ($views as $vv) {
                foreach (\Config\Config::getRoutesFilesTo("view/{$vv}/get", "php") as $vvv) {
                    if ("/" . pathinfo($vvv, PATHINFO_FILENAME) === $path . "/{$url}")
                        return $vvv;
                }
            }
        }

        return "";
    }

    $route = findRouteGet($variaveis, explode("[@]", $viewGetReceived)[0]);

    if (!empty($route)) {

        $_SESSION['sseRule'] = 'db';
        $_SESSION['sseAction'] = ['create', 'update', 'delete'];
        $_SESSION['db'] = [];
        ob_start();

        try {
            include_once $route;
            if (!empty($data['error'])) {
                $data["response"] = 2;
                $data["data"] = "";
            } elseif (!isset($data['data'])) {
                $conteudo = ob_get_contents();
                if (\Helpers\Check::isJson($conteudo))
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

        @ob_end_clean();

        /**
         * Register get request update on sse control to update in realtime
         */
        if (!empty($viewGetReceived) && !empty($route)) {
            $name = $viewGetReceived . "___" . str_replace('/', '[@]', $url);

            \Helpers\Helper::createFolderIfNoExist(PATH_HOME . "_cdn/userSSE");
            \Helpers\Helper::createFolderIfNoExist(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id']);
            \Helpers\Helper::createFolderIfNoExist(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id'] . "/get");
            \Config\Config::createFile(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id'] . "/get/" . $name . ".json", json_encode(
                [
                    "view" => str_replace("[@]", "/", $viewGetReceived),
                    "request" => $url,
                    "route" => $name,
                    "path" => $route,
                    "variaveis" => $variaveis,
                    "haveUpdate" => "0",
                    "db" => $_SESSION['db'],
                    "action" => $_SESSION['sseAction'] ?? "",
                    "rule" => $_SESSION['sseRule'] ?? '*'
                ]));
        }

    } else {
        $data['response'] = 4;
    }
} else {
    $data["response"] = 4;
}

echo json_encode($data);