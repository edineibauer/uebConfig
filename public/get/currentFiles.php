<?php

/**
 * Carrega os Arquivos bases de core genérico
 */

use \Helpers\Helper;

// return values
$data['data'] = [
    "assetsPublic" => [],
    "core-assets" => [HOME . "manifest.json?v=" . VERSION]
];

//CORE, create cache from all 'assetsPublic' root and current view
foreach (Helper::listFolder(PATH_HOME . "assetsPublic") as $item) {
    if (!is_dir(PATH_HOME . "assetsPublic/{$item}") && strpos($item, ".") && !in_array(HOME . "assetsPublic/{$item}", $data['data']['core']))
        $data['data']['assetsPublic'][] = HOME . "assetsPublic/{$item}?v=" . VERSION;
}

//fonts
foreach (Helper::listFolder(PATH_HOME . "assetsPublic/fonts") as $iten)
    $data['data']['assetsPublic'][] = HOME . "assetsPublic/fonts/{$iten}?v=" . VERSION;

//images
foreach (Helper::listFolder(PATH_HOME . "assetsPublic/img") as $iten)
    $data['data']['assetsPublic'][] = HOME . "assetsPublic/img/{$iten}?v=" . VERSION;