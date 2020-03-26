<?php

/**
 * Carrega os Arquivos bases de paginas e assets para este usuário
 */

use \Helpers\Helper;

// return values
$data['data'] = ["view" => []];
$setor = !empty($_SESSION['userlogin']) ? $_SESSION['userlogin']['setor'] : "0";

/**
 * View Offline
 */
$views = (file_exists(PATH_HOME . "_config/offline/{$setor}/view.json") ? json_decode(file_get_contents(PATH_HOME . "_config/offline/{$setor}/view.json"), !0) : []);
foreach ($views as $view)
    $data['data'][] = ['view' => $view, 'js' => (file_exists(PATH_HOME . "assetsPublic/view/{$setor}/{$view}.min.js") ? "assetsPublic/view/{$setor}/{$view}.min.js" : "assetsPublic/view/{$view}.min.js")];