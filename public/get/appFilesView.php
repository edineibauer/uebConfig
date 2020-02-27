<?php

/**
 * Carrega os Arquivos bases de paginas e assets para este usuário
 */

use \Helpers\Helper;

// return values
$data['data'] = ["view" => [], "misc" => []];

/**
 * View Offline
 */
if (file_exists(PATH_HOME . "_config/viewOffline.json")) {
    foreach (json_decode(file_get_contents(PATH_HOME . "_config/viewOffline.json"), !0) as $item) {
        if (file_exists(PATH_HOME . "public/view/{$item}.php") || file_exists(PATH_HOME . "public/view/{$item}.html")) {
            $data['data']['view'][] = HOME . "view/" . str_replace(['.php', '.html'], '', $item);
        } else {
            foreach (Helper::listFolder(PATH_HOME . VENDOR) as $lib) {
                if (file_exists(PATH_HOME . VENDOR . $lib . "/public/view/{$item}.php") || file_exists(PATH_HOME . VENDOR . $lib . "/public/view/{$item}.html")) {
                    $data['data']['view'][] = HOME . "view/" . str_replace(['.php', '.html'], '', $item);
                    break;
                }
            }
        }
    }
}

/**
 * Assets Offline
 */
if (file_exists(PATH_HOME . "_config/viewOfflineAssets.json")) {
    foreach (json_decode(file_get_contents(PATH_HOME . "_config/viewOfflineAssets.json"), !0) as $item){
        $item = preg_match("/^public/i", $item) ? str_replace("public/", VENDOR . DOMINIO . "/", $item) : $item;
        $data['data']['misc'][] = HOME . $item;
    }
}
