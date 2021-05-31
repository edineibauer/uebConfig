<?php

set_time_limit(360);

use Config\Config;
use \Helpers\Helper;

putenv('PATH='. getenv('PATH') .':/usr/local/bin:/opt/homebrew/bin');
putenv('ANDROID_HOME=~/Library/Android/sdk');
putenv('ANDROID_SDK_ROOT=~/Library/Android/sdk');
putenv('ANDROID_AVD_HOME=~/.android/avd');
putenv('JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk1.8.0_281.jdk/Contents/Home');

$feedbacks = [];
$prod = isset($_GET['p']) && $_GET['p'] == 1;
$folderCordova = isset($_GET['f']) && !empty($_GET['f']) ? strip_tags(trim($_GET['f'])) : "cordova";

$config = file_get_contents("_config/config.php");
$urlApp = str_replace(["http://", "https://", "/"], "", explode("')", explode("define('HOME_PRODUCTION', '", $config)[1])[0]);
$nameApp = explode("')", explode("define('SITENAME', '", $config)[1])[0];

if(!file_exists($folderCordova)) {

    //cria novo projeto com nome correto e ID do projeto HOME_PROD
    $appPlugins = file_exists("_config/appPlugins.json") ? json_decode(file_get_contents("_config/appPlugins.json"), !0) : [];
    exec("cordova create {$folderCordova} {$urlApp} {$nameApp} 2>&1", $feedbacks["create Cordova"]);
    exec("cd  {$folderCordova} && cordova platform add android && cordova platform add ios && cordova platform add browser 2>&1", $feedbacks["add Platforms"]);

    if(file_exists("cordova/google-services.json"))
        Config::createFile("{$folderCordova}/google-services.json", str_replace("paygas.com.br", $urlApp, file_get_contents( "cordova/google-services.json")));

    if(file_exists("cordova/build.json"))
        copy("cordova/build.json", "{$folderCordova}/build.json");

    /**
     * Adiciona todos os plugins ao app
     */
    foreach ($appPlugins as $appPlugin)
        exec("cd  {$folderCordova} && cordova plugin add {$appPlugin} 2>&1", $feedbacks["install Plugins"]);

    echo "<h1>Projeto criado, rode novamente para fazer build</h1>";
    echo "<pre>";
    var_dump($feedbacks);
    die;

} else {
    if(file_exists("cordova/google-services.json")) {
        $f = fopen("{$folderCordova}/google-services.json", "w");
        fwrite($f, str_replace("paygas.com.br", $urlApp, file_get_contents("cordova/google-services.json")));
        fclose($f);
    }

    if(file_exists("cordova/build.json"))
        copy("cordova/build.json", "{$folderCordova}/build.json");
}

/**
 * Update config.xml version if in prod
 */
if($prod && (isset($_GET['v']) && $_GET['v'] == 1) && file_exists("{$folderCordova}/config.xml")) {
    $c = file_get_contents("{$folderCordova}/config.xml");
    $v = explode('" ', explode(' version="', $c)[1])[0];
    $vv = explode(".", $v);

    $first = $vv[2] === "99" && $vv[1] === "99" ? (((int)$vv[0]) + 1) : $vv[0];
    $last = $vv[2] === "99" ? 0 : (((int)$vv[2]) + 1);
    $middle = $vv[2] === "99" ? (((int)$vv[1]) + 1) : $vv[1];

    $f = fopen("{$folderCordova}/config.xml", "w+");
    fwrite($f, str_replace(' version="' . $v . '" ', ' version="' . $first . '.' . $middle . '.' . $last . '" ', $c));
    fclose($f);
}

if (session_status() == PHP_SESSION_NONE)
    session_start();

$www = "{$folderCordova}/www";

if(!file_exists($www))
    mkdir($www, 0777);

/**
 * Create config file with HOME empty
 */
$home = explode("'", explode("define('HOME', '", $config)[1])[0];
$server = explode("'", explode("define('SERVER', '", $config)[1])[0];
$serverProduction = explode("'", explode("define('SERVER_PRODUCTION', '", $config)[1])[0];
$f = fopen("{$www}/config.php", "w+");
fwrite($f, str_replace(["define('HOME', '{$home}');", "define('DEV', 1);", "define('SERVICEWORKER', 0);", "define('SERVER', '{$server}');"], ["define('HOME', '');", "define('DEV', 0);", "define('SERVICEWORKER', 1);", "define('SERVER', '{$serverProduction}');"], $config));
fclose($f);

$f = fopen("{$www}/index.php", "w+");
$index = file_get_contents("index.php");
$service = explode(";", explode("const SERVICEWORKER = ", $index)[1])[0];
fwrite($f, str_replace(["include_once '_config/config.php';", "const SERVICEWORKER = {$service};"], ["", "const SERVICEWORKER = !0;"], $index));
fclose($f);

require_once "./{$www}/config.php";

/**
 * Remove www to create new
 */
if (file_exists(PATH_HOME . "{$www}/view"))
    Helper::recurseDelete(PATH_HOME . "{$www}/view");

if (file_exists(PATH_HOME . "{$www}/assetsPublic"))
    Helper::recurseDelete(PATH_HOME . "{$www}/assetsPublic");

if (file_exists(PATH_HOME . "{$www}/get"))
    Helper::recurseDelete(PATH_HOME . "{$www}/get");

if (file_exists(PATH_HOME . "{$www}/public"))
    Helper::recurseDelete(PATH_HOME . "{$www}/public");

if(file_exists(PATH_HOME . "{$www}/index.html"))
    unlink(PATH_HOME . "{$www}/index.html");

if(file_exists(PATH_HOME . "{$www}/sseWork.js"))
    unlink(PATH_HOME . "{$www}/sseWork.js");

if(file_exists(PATH_HOME . "{$www}/.htaccess"))
    unlink(PATH_HOME . "{$www}/.htaccess");

if(file_exists(PATH_HOME . "{$www}/service-worker.js"))
    unlink(PATH_HOME . "{$www}/service-worker.js");

/**
 * ------------- start Create views
 */
Helper::createFolderIfNoExist(PATH_HOME . "{$www}/view");
Helper::createFolderIfNoExist(PATH_HOME . "{$www}/assetsPublic");
Helper::createFolderIfNoExist(PATH_HOME . "{$www}/get");
Helper::createFolderIfNoExist(PATH_HOME . "{$www}/public");
Helper::createFolderIfNoExist(PATH_HOME . "{$www}/public/assets");
Helper::createFolderIfNoExist(PATH_HOME . "{$folderCordova}/res");
Helper::createFolderIfNoExist(PATH_HOME . "{$folderCordova}/res/android");
Helper::createFolderIfNoExist(PATH_HOME . "{$folderCordova}/res/android/icon");
Helper::createFolderIfNoExist(PATH_HOME . "{$folderCordova}/res/android/splash");

copy(PATH_HOME . "assetsPublic/img/favicon-48.png", PATH_HOME . "{$folderCordova}/res/android/icon/drawable-ldpi-icon.png");
copy(PATH_HOME . "assetsPublic/img/favicon-72.png", PATH_HOME . "{$folderCordova}/res/android/icon/drawable-mdpi-icon.png");
copy(PATH_HOME . "assetsPublic/img/favicon-96.png", PATH_HOME . "{$folderCordova}/res/android/icon/drawable-hdpi-icon.png");
copy(PATH_HOME . "assetsPublic/img/favicon-144.png", PATH_HOME . "{$folderCordova}/res/android/icon/drawable-xhdpi-icon.png");
copy(PATH_HOME . "assetsPublic/img/favicon-192.png", PATH_HOME . "{$folderCordova}/res/android/icon/drawable-xxhdpi-icon.png");
copy(PATH_HOME . "assetsPublic/img/favicon-256.png", PATH_HOME . "{$folderCordova}/res/android/icon/drawable-xxxhdpi-icon.png");
copy(PATH_HOME . "assetsPublic/img/favicon.png", PATH_HOME . "{$folderCordova}/res/android/icon/drawable.png");

/**
 * @param string $file
 * @param string $dst
 * @param int $width
 * @param int $height
 */
function createSplash(string $file, string $dst, int $width, int $height) {
    $img = \WideImage\WideImage::load($file);
    $color = dechex($img->getColorAt(1,1));
    $background = $img->allocateColor(hexdec(substr($color, 0, 2)), hexdec(substr($color, 2, 2)), hexdec(substr($color, 4, 2)));
    $img->resizeCanvas($width, $height, 'center', 'center', $background)->saveToFile($dst);
}

createSplash(PATH_HOME . "assetsPublic/img/favicon-48.png", PATH_HOME . "{$folderCordova}/res/android/splash/splash-port-ldpi.png", 200, 320);
createSplash(PATH_HOME . "assetsPublic/img/favicon-72.png", PATH_HOME . "{$folderCordova}/res/android/splash/splash-port-mdpi.png", 320, 480);
createSplash(PATH_HOME . "assetsPublic/img/favicon-96.png", PATH_HOME . "{$folderCordova}/res/android/splash/splash-port-hdpi.png", 480, 800);
createSplash(PATH_HOME . "assetsPublic/img/favicon-144.png", PATH_HOME . "{$folderCordova}/res/android/splash/splash-port-xhdpi.png", 720, 1280);
createSplash(PATH_HOME . "assetsPublic/img/favicon-192.png", PATH_HOME . "{$folderCordova}/res/android/splash/splash-port-xxhdpi.png", 960, 1600);
createSplash(PATH_HOME . "assetsPublic/img/favicon-256.png", PATH_HOME . "{$folderCordova}/res/android/splash/splash-port-xxxhdpi.png", 1280, 1920);

createSplash(PATH_HOME . "assetsPublic/img/favicon-48.png", PATH_HOME . "{$folderCordova}/res/android/splash/splash-land-ldpi.png", 320, 200);
createSplash(PATH_HOME . "assetsPublic/img/favicon-72.png", PATH_HOME . "{$folderCordova}/res/android/splash/splash-land-mdpi.png", 480, 320);
createSplash(PATH_HOME . "assetsPublic/img/favicon-96.png", PATH_HOME . "{$folderCordova}/res/android/splash/splash-land-hdpi.png", 800, 480);
createSplash(PATH_HOME . "assetsPublic/img/favicon-144.png", PATH_HOME . "{$folderCordova}/res/android/splash/splash-land-xhdpi.png", 1280, 720);
createSplash(PATH_HOME . "assetsPublic/img/favicon-192.png", PATH_HOME . "{$folderCordova}/res/android/splash/splash-land-xxhdpi.png", 1600, 960);
createSplash(PATH_HOME . "assetsPublic/img/favicon-256.png", PATH_HOME . "{$folderCordova}/res/android/splash/splash-land-xxxhdpi.png", 1920, 1280);

/**
 * Escreve plugins variáveis ao config.xml
 */
if(file_exists(PATH_HOME . "_config/appConfig.xml")) {
    $extraConfig = str_replace(['{$url}', '{$theme}'], [HOME, THEME], file_get_contents(PATH_HOME . "_config/appConfig.xml"));
    $configXml = str_replace("</widget>", "\n" . $extraConfig . "\n</widget>", file_get_contents(PATH_HOME . "{$folderCordova}/config.xml"));
    Config::createFile(PATH_HOME . "{$folderCordova}/config.xml", $configXml);
}

/**
 * ------------ start Create index
 */

ob_start();
include_once PATH_HOME . "{$www}/index.php";
$index = str_replace('</head>', "<script src=\"cordova.js\"></script>\n</head>", ob_get_contents());
ob_end_clean();

//$manifest = explode('>', explode('<link rel="manifest" ', $index)[1])[0];
//$index = str_replace('<link rel="manifest" ' . $manifest . '>', "", $index);
Config::createFile(PATH_HOME . "{$www}/index.html", $index);
unlink( PATH_HOME . "{$www}/index.php");

/**
 * ------------- finish Create index
 */

/**
 * Create user session
 * and set setor at one of each time to create assets to this setor
 */
\Config\Config::setUser("T!123");
$setorApp = (file_exists(PATH_HOME . "_config/appSetorAllow.json") ? json_decode(file_get_contents(PATH_HOME . "_config/appSetorAllow.json"), true) : []);
foreach (\Config\Config::getSetores() as $setor) {
    /**
     * Não cria os arquivos para este setor de usuário,
     * pois não esta na lista de permitidos para o uso do app
     */
    if(!empty($setorApp) && !in_array($setor, $setorApp)) {
        if(file_exists(PATH_HOME . "{$www}/assetsPublic/view/{$setor}"))
            Helper::recurseDelete(PATH_HOME . "{$www}/assetsPublic/view/{$setor}");

        if(file_exists(PATH_HOME . "{$www}/public/assets/appCore/{$setor}"))
            Helper::recurseDelete(PATH_HOME . "{$www}/public/assets/appCore/{$setor}");

        if(file_exists(PATH_HOME . "{$www}/public/assets/{$setor}"))
            Helper::recurseDelete(PATH_HOME . "{$www}/public/assets/{$setor}");

        continue;
    }

    Helper::createFolderIfNoExist(PATH_HOME . "{$www}/view/{$setor}");
    Helper::createFolderIfNoExist(PATH_HOME . "{$www}/get/{$setor}");
    $_SESSION['userlogin']['setor'] = $setor;

    $views = [];
    foreach (\Config\Config::getRoutesTo("view") as $view) {
        if (!preg_match("/view\/0\/$/i", $view)) {
            foreach (Helper::listFolder($view) as $folderView) {
                if (is_dir($view . $folderView)) {
                    /**
                     * Check setor view
                     */
                    if (file_exists($view . $folderView . "/" . $setor)) {
                        foreach (Helper::listFolder($view . $folderView . "/" . $setor) as $item) {
                            if (!isset($views[$folderView]) && in_array(pathinfo($item, PATHINFO_EXTENSION), ["php", "html", "mustache"])) {
                                $views[$folderView] = $view . $folderView . "/" . $setor . "/" . $item;
                                break;
                            }
                        }
                    }

                    /**
                     * then, check default view
                     */
                    foreach (Helper::listFolder($view . $folderView) as $item) {
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
                    include $link->getRoute();
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

        Config::createFile(PATH_HOME . "{$www}/view/{$setor}/{$view}.json", json_encode($data));
    }

    /**
     * get requests to cache
     */
    foreach (["appFilesView", "appFilesViewUser", "currentFiles", "userCache"] as $get) {
        $data = ["data" => "", "response" => 1, "error" => ""];
        include PATH_HOME . VENDOR . "config/public/get/{$get}.php";
        Config::createFile(PATH_HOME . "{$www}/get/{$setor}/{$get}.json", json_encode($data));
    }
}

/**
 * Copy assetsPublic to www
 */
Helper::recurseCopy(PATH_HOME . "assetsPublic", PATH_HOME . "{$www}/assetsPublic");
Helper::recurseCopy(PATH_HOME . "public/assets", PATH_HOME . "{$www}/public/assets");

if(file_exists(PATH_HOME . VENDOR . "config/public/installTemplates/sseWork.js"))
    Config::createFile(PATH_HOME . "{$www}/sseWork.js", str_replace("var SERVER = ''", "var SERVER = '" . $serverProduction . "'", file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/sseWork.js")));

//copia service worker
if(file_exists(PATH_HOME . VENDOR . "config/public/installTemplates/service-worker-browser.js")) {
    $service = str_replace(["var VERSION = '';", "const HOME = '';", "const SERVER = '';"], ["var VERSION = '" . number_format(VERSION, 2) . "';", "const HOME = '" . HOME_PRODUCTION . "';", "const SERVER = '" . SERVER_PRODUCTION . "';"], file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/service-worker-browser.js"));
    Config::createFile(PATH_HOME . "{$www}/service-worker.js", $service);
}

if(file_exists(PATH_HOME . "manifest.json"))
    Config::createFile(PATH_HOME . "{$www}/manifest.json", str_replace('"start_url": "./"', '"start_url": "./index.html?url=index"', file_get_contents(PATH_HOME . "manifest.json")));

//copia .htaccess
if(file_exists(PATH_HOME . VENDOR . "config/public/installTemplates/htaccessBrowser.txt"))
    Config::createFile(PATH_HOME . "{$www}/.htaccess", file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/htaccessBrowser.txt"));

if(file_exists(PATH_HOME . "{$www}/config.php"))
    unlink(PATH_HOME . "{$www}/config.php");

//falta copiar/criar o arquivo google-services.json na pasta do projeto cordova (plugin FCM)
//falta criar o arquivo build.json (chave do app android release)

if($prod) {
    exec("cd {$folderCordova} && cordova build browser --prod 2>&1", $feedbacks["browser build prod"]);

    Config::createFile("{$www}/index.html", str_replace("const SERVICEWORKER = !0;", "const SERVICEWORKER = !1;", file_get_contents("{$www}/index.html")));

    exec("cd {$folderCordova} && cordova build android --release 2>&1", $feedbacks["android build prod"]);
//    exec("cd {$folderCordova}/platforms/android && ./gradlew bundle 2>&1", $feedbacks["android bundle"]);

} else {
    exec("cd {$folderCordova} && cordova build browser 2>&1", $feedbacks["browser build dev"]);

    Config::createFile("{$www}/index.html", str_replace("const SERVICEWORKER = !0;", "const SERVICEWORKER = !1;", file_get_contents("{$www}/index.html")));

    exec("cd {$folderCordova} && cordova build android 2>&1", $feedbacks["android build dev"]);
}

echo "<pre>";
var_dump($feedbacks);