<?php

$url = strip_tags(trim(filter_input(INPUT_POST, 'route', FILTER_DEFAULT)));
$view = strip_tags(trim(filter_input(INPUT_POST, 'view', FILTER_DEFAULT)));
$rr = $view . "_" . str_replace('/', '[@]', $url);

if (!empty($url) && !file_exists(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id'] . "/get/" . $rr . ".json")) {

    /**
     * Split the url into `/`
     * get the first as url and the rest as variables
     */
    $variaveis = array_filter(explode('/', $url));
    $route = "";

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

        $views = [];
        foreach (\Config\Config::getRoutesTo("view") as $v)
            $views = array_merge($views, \Helpers\Helper::listFolder($v));

        for ($i = 0; $i < $count; $i++) {
            $path .= ($i > 0 ? "/{$url}" : "");
            $url = array_shift($variaveis);

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
            if(!empty($path)) {
                foreach ($views as $vv) {
                    foreach (\Config\Config::getRoutesFilesTo("view/{$vv}/get", "php") as $vvv) {
                        if("/" . pathinfo($vvv, PATHINFO_FILENAME) === $path)
                            return $vvv;
                    }
                }
            }
        }

        return "";
    }

    $route = findRouteGet($variaveis, $view);

    /**
     * Register view request update realtime
     */
    if (!empty($route)) {
        \Helpers\Helper::createFolderIfNoExist(PATH_HOME . "_cdn/userSSE");
        \Helpers\Helper::createFolderIfNoExist(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id']);
        \Helpers\Helper::createFolderIfNoExist(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id'] . "/get");
        \Config\Config::createFile(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id'] . "/get/" . $rr . ".json", json_encode(["route" => $rr, "path" => $route, "haveUpdate" => "0"]));
    }
}