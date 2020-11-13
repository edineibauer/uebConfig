<?php

if (session_status() == PHP_SESSION_NONE)
    session_start();

$www = file_exists("cordova") ? "cordova/www" : "www";

if(!file_exists($www))
    mkdir($www, 0777);

/**
 * Create config file with HOME empty
 */
$config = file_get_contents("_config/config.php");
$home = explode("'", explode("define('HOME', '", $config)[1])[0];
$server = explode("'", explode("define('SERVER', '", $config)[1])[0];
$serverTarget = explode("'", explode("define('SERVERPRODUCTION', '", $config)[1])[0];
$f = fopen("{$www}/config.php", "w+");
fwrite($f, str_replace(["define('HOME', '{$home}');", "define('DEV', '1');", "define('SERVER', '{$server}');"], ["define('HOME', '');", "define('DEV', '0');", "define('SERVER', '{$serverTarget}');"], $config));
fclose($f);

$f = fopen("{$www}/index.php", "w+");
$index = file_get_contents("index.php");
$service = explode(";", explode("const SERVICEWORKER = ", $index)[1])[0];
fwrite($f, str_replace(["include_once '_config/config.php';", "const SERVICEWORKER = {$service};"], ["", "const SERVICEWORKER = !1;"], $index));
fclose($f);

require_once "./{$www}/config.php";

/**
 * Remove www to create new
 */
if (file_exists(PATH_HOME . "{$www}/view"))
    \Helpers\Helper::recurseDelete(PATH_HOME . "{$www}/view");

if (file_exists(PATH_HOME . "{$www}/assetsPublic"))
    \Helpers\Helper::recurseDelete(PATH_HOME . "{$www}/assetsPublic");

/**
 * ------------- start Create views
 */
\Helpers\Helper::createFolderIfNoExist(PATH_HOME . "{$www}/view");
\Helpers\Helper::createFolderIfNoExist(PATH_HOME . "{$www}/assetsPublic");
\Helpers\Helper::createFolderIfNoExist(PATH_HOME . "{$www}/get");
\Helpers\Helper::createFolderIfNoExist(PATH_HOME . "{$www}/public");
\Helpers\Helper::createFolderIfNoExist(PATH_HOME . "{$www}/public/assets");

/**
 * ------------ start Create index
 */

ob_start();
include_once PATH_HOME . "{$www}/index.php";
$index = ob_get_contents();
ob_end_clean();

$manifest = explode('>', explode('<link rel="manifest" ', $index)[1])[0];
$index = str_replace('<link rel="manifest" ' . $manifest . '>', "", $index);
$index = str_replace('</head>', "    <script src=\"cordova.js\"></script>\n</head>", $index);

$f = fopen(PATH_HOME . "{$www}/index.html", "w+");
fwrite($f, $index);
fclose($f);


unlink( PATH_HOME . "{$www}/index.php");

/**
 * ------------- finish Create index
 */

/**
 * Create user session
 * and set setor at one of each time to create assets to this setor
 */
\Config\Config::setUser(0);
foreach (\Config\Config::getSetores() as $setor) {
    \Helpers\Helper::createFolderIfNoExist(PATH_HOME . "{$www}/view/{$setor}");
    \Helpers\Helper::createFolderIfNoExist(PATH_HOME . "{$www}/get/{$setor}");
    $_SESSION['userlogin']['setor'] = $setor;

    $views = [];
    foreach (\Config\Config::getRoutesTo("view") as $view) {
        if (!preg_match("/view\/0\/$/i", $view)) {
            foreach (\Helpers\Helper::listFolder($view) as $folderView) {
                if (is_dir($view . $folderView)) {
                    /**
                     * Check setor view
                     */
                    if (file_exists($view . $folderView . "/" . $setor)) {
                        foreach (\Helpers\Helper::listFolder($view . $folderView . "/" . $setor) as $item) {
                            if (!isset($views[$folderView]) && in_array(pathinfo($item, PATHINFO_EXTENSION), ["php", "html", "mustache"])) {
                                $views[$folderView] = $view . $folderView . "/" . $setor . "/" . $item;
                                break;
                            }
                        }
                    }

                    /**
                     * then, check default view
                     */
                    foreach (\Helpers\Helper::listFolder($view . $folderView) as $item) {
                        if (!isset($views[$folderView]) && in_array(pathinfo($item, PATHINFO_EXTENSION), ["php", "html", "mustache"])) {
                            $views[$folderView] = $view . $folderView . "/" . $item;
                            break;
                        }
                    }
                }
            }
        }
    }

    /**
     * for each view to this user, create assets
     */
    foreach ($views as $view => $dir) {
        $link = new \Route\Link($view);

        $data = ["response" => 1, "error" => "", "data" => ""];
        if ($link->getRoute()) {

            try {

                if(pathinfo($link->getRoute(), PATHINFO_EXTENSION) === "php") {
                    ob_start();
                    include_once $link->getRoute();
                    $content = ob_get_contents();
                    ob_end_clean();
                } else {
                    $content = file_get_contents($link->getRoute());
                }

                $data = ["response" => 1, "error" => "", "data" => [
                    "title" => $link->getParam()['title'],
                    "descricao" => $link->getParam()['descricao'],
                    "front" => array_merge($link->getParam()['front'], ["variaveis" => $link->getParam()['variaveis'] ?? []]),
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
                    "content" => $content
                ]];

            } catch (Exception $e) {
                $data = ["response" => 2, "error" => "Erro na resposta do Servidor", "data" => ""];
            }

        } else {
            $data["response"] = 4;
        }

        $f = fopen(PATH_HOME . "{$www}/view/{$setor}/{$view}.json", "w+");
        fwrite($f, json_encode($data));
        fclose($f);
    }

    /**
     * get requests to cache
     */
    foreach (["appFilesView", "appFilesViewUser", "currentFiles", "userCache"] as $get) {
        $data = ["data" => "", "response" => 1, "error" => ""];
        include PATH_HOME . VENDOR . "config/public/get/{$get}.php";
        $f = fopen(PATH_HOME . "{$www}/get/{$setor}/{$get}.json", "w+");
        fwrite($f, json_encode($data));
        fclose($f);
    }
}

/**
 * Copy assetsPublic to www
 */
\Helpers\Helper::recurseCopy(PATH_HOME . "assetsPublic", PATH_HOME . "{$www}/assetsPublic");
\Helpers\Helper::recurseCopy(PATH_HOME . "public/assets", PATH_HOME . "{$www}/public/assets");

if(file_exists(PATH_HOME . "{$www}/config.php"))
    unlink(PATH_HOME . "{$www}/config.php");