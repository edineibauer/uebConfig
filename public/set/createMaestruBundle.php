<?php

die;

if (session_status() == PHP_SESSION_NONE)
    session_start();

/**
 * Create config file with HOME empty
 */
$config = file_get_contents("_config/config.php");
$home = explode("'", explode("define('HOME', '", $config)[1])[0];
$f = fopen("bundle/config.php", "w+");
fwrite($f, str_replace(["define('HOME', '{$home}');", "define('DEV', '1');"], ["define('HOME', '');", "define('DEV', '0');"], $config));
fclose($f);

$f = fopen("bundle/index.php", "w+");
fwrite($f, str_replace("include_once '_config/config.php';", "", file_get_contents("index.php")));
fclose($f);

require_once './bundle/config.php';

/**
 * Remove bundle to create new
 */
if (file_exists(PATH_HOME . "bundle/view"))
    \Helpers\Helper::recurseDelete(PATH_HOME . "bundle/view");

if (file_exists(PATH_HOME . "bundle/assetsPublic"))
    \Helpers\Helper::recurseDelete(PATH_HOME . "bundle/assetsPublic");

/**
 * ------------- start Create views
 */
\Helpers\Helper::createFolderIfNoExist(PATH_HOME . "bundle");
\Helpers\Helper::createFolderIfNoExist(PATH_HOME . "bundle/view");
\Helpers\Helper::createFolderIfNoExist(PATH_HOME . "bundle/assetsPublic");

/**
 * ------------ start Create index
 */

ob_start();
include_once PATH_HOME . 'bundle/index.php';
$index = ob_get_contents();
ob_end_clean();

$f = fopen(PATH_HOME . "bundle/index.html", "w+");
fwrite($f, $index);
fclose($f);

unlink( PATH_HOME . 'bundle/index.php');

/**
 * ------------- finish Create index
 */

/**
 * Create user session
 * and set setor at one of each time to create assets to this setor
 */
\Config\Config::setUser(0);
foreach (\Config\Config::getSetores() as $setor) {
    \Helpers\Helper::createFolderIfNoExist(PATH_HOME . "bundle/view/{$setor}");
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
                            if (!isset($views[$folderView]) && in_array(pathinfo($item, PATHINFO_EXTENSION), ["php", "html"])) {
                                $views[$folderView] = $view . $folderView . "/" . $setor . "/" . $item;
                                break;
                            }
                        }
                    }

                    /**
                     * then, check default view
                     */
                    foreach (\Helpers\Helper::listFolder($view . $folderView) as $item) {
                        if (!isset($views[$folderView]) && in_array(pathinfo($item, PATHINFO_EXTENSION), ["php", "html"])) {
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

        $f = fopen(PATH_HOME . "bundle/view/{$setor}/{$view}.json", "w+");
        fwrite($f, json_encode($data));
        fclose($f);
    }
}

/**
 * Copy manifest
 */
copy(PATH_HOME . "manifest.json", PATH_HOME . "bundle/manifest.json");

/**
 * Copy assetsPublic to bundle
 */
\Helpers\Helper::recurseCopy(PATH_HOME . "assetsPublic", PATH_HOME . "bundle/assetsPublic");
unlink(PATH_HOME . "bundle/config.php");