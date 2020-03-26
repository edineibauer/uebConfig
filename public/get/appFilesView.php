<?php

/**
 * Carrega os Arquivos bases de paginas e assets para este usuário
 */

use \Helpers\Helper;

// return values
$data['data'] = ["view" => []];

/**
 * View Offline
 */
$data['data']['view'] = (file_exists(PATH_HOME . "_config/offline/view.json") ? json_decode(file_get_contents(PATH_HOME . "_config/offline/view.json"), !0) : []);