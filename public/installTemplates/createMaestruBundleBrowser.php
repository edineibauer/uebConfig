<?php

use Config\Config;

if (session_status() == PHP_SESSION_NONE)
    session_start();

if(!file_exists("cordova/platforms/browser/www"))
    return;

require_once "./_config/config.php";

unlink(PATH_HOME . "cordova/platforms/browser/www/manifest.json");
Config::createFile(PATH_HOME . "cordova/platforms/browser/www/manifest.json", str_replace('"start_url": "./"', '"start_url": "./index.html?url=index"', file_get_contents("manifest.json")));


//copia service worker
if(file_exists(PATH_HOME . "service-worker-browser.js")) {
    $service = str_replace(["var VERSION = '';", "const HOME = '';", "const SERVER = '';"], ["var VERSION = '" . number_format(VERSION, 2) . "';", "const HOME = '" . HOME_PRODUCTION . "';", "const SERVER = '" . SERVER_PRODUCTION . "';"], file_get_contents(PATH_HOME . "service-worker-browser.js"));

    Config::createFile(PATH_HOME . "cordova/platforms/browser/www/service-worker.js", $service);
}