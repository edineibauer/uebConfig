<?php

/**
 * Carrega os Arquivos bases de core genérico
 */

use \Helpers\Helper;

// return values
$data['data'] = [
    "core" => [HOME . "index"],
    "fonts" => [],
    "images" => [],
    "misc" => [HOME . "manifest.json?v=" . VERSION]
];

//CORE, create cache from all 'assetsPublic' root and current view
foreach (Helper::listFolder(PATH_HOME . "assetsPublic") as $item) {
    if (!is_dir(PATH_HOME . "assetsPublic/{$item}") && strpos($item, ".") && !in_array(HOME . "assetsPublic/{$item}", $data['data']['core']))
        $data['data']['core'][] = HOME . "assetsPublic/{$item}?v=" . VERSION;
}

//fonts
foreach (Helper::listFolder(PATH_HOME . "assetsPublic/fonts") as $iten)
    $data['data']['fonts'][] = HOME . "assetsPublic/fonts/{$iten}?v=" . VERSION;

//images
foreach (Helper::listFolder(PATH_HOME . "assetsPublic/img") as $iten) {
    if($iten !== "splashscreens")
        $data['data']['images'][] = HOME . "assetsPublic/img/{$iten}?v=" . VERSION;
}