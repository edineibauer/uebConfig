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
$data['data']['view'] = (file_exists(PATH_HOME . "_config/offline/{$setor}/view.json") ? json_decode(file_get_contents(PATH_HOME . "_config/offline/{$setor}/view.json"), !0) : []);

/*
if (file_exists(PATH_HOME . "_config/offline/{$setor}/view.json")) {
    foreach (json_decode(file_get_contents(PATH_HOME . "_config/offline/{$setor}/view.json"), !0) as $item) {

        $find = !1;
        if (file_exists(PATH_HOME . "public/view/{$setor}/{$item}.php") || file_exists(PATH_HOME . "public/view/{$setor}/{$item}.html") || file_exists(PATH_HOME . "public/view/{$item}.php") || file_exists(PATH_HOME . "public/view/{$item}.html")) {

            $data['data']['view'][] = HOME . "view/" . str_replace(['.php', '.html'], '', $item);

        } else {

            foreach (Helper::listFolder(PATH_HOME . VENDOR) as $lib) {
                foreach (Helper::listFolder(PATH_HOME . VENDOR) as $libOverload) {
                    if ($libOverload !== $lib) {
                        if (file_exists(PATH_HOME . VENDOR . $libOverload . "/public/overload/{$lib}/view/{$item}.php") || file_exists(PATH_HOME . VENDOR . $libOverload . "/public/overload/{$lib}/view/{$item}.html")) {
                            $findItem = !0;
                            break;
                        }
                    }
                }

                if (file_exists(PATH_HOME . VENDOR . $lib . "/public/view/{$setor}/{$item}.php") || file_exists(PATH_HOME . VENDOR . $lib . "/public/view/{$setor}/{$item}.html") || file_exists(PATH_HOME . VENDOR . $lib . "/public/view/{$item}.php") || file_exists(PATH_HOME . VENDOR . $lib . "/public/view/{$item}.html")) {
                    $data['data']['view'][] = HOME . "view/" . str_replace(['.php', '.html'], '', $item);
                    break;
                }
            }
        }

        if($findItem)
            $data['data']['view'][] = HOME . "view/" . str_replace(['.php', '.html'], '', $item);
    }
}*/