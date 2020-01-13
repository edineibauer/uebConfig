<?php

/**
 * @param string $lib
 * @param string $setor
 * @param array $list
 * @return array
 */
function getTemplates(string $lib, string $setor, array $list)
{
    /**
     * Se existir templates nesta lib
     */
    if (file_exists(PATH_HOME . VENDOR . $lib . "/public/tpl")) {

        /**
         * Para cada template dentro desta lib
         */
        foreach (\Helpers\Helper::listFolder(PATH_HOME . VENDOR . $lib . "/public/tpl") as $tpl) {
            if (preg_match("/\.(mst|mustache)$/i", $tpl)) {
                $nameTpl = str_replace(['.mst', '.mustache'], '', $tpl);

                /**
                 * Se este template ainda não foi adicionado na lista, então adiciona
                 */
                if (!in_array($nameTpl, array_keys($list))) {

                    /**
                     * busca overload do template atual da lib em PUBLIC
                     */
                    if (file_exists(PATH_HOME . "public/overload/{$lib}/tpl/{$setor}/{$nameTpl}.mustache")) {
                        $list[$nameTpl] = file_get_contents(PATH_HOME . "public/overload/{$lib}/tpl/{$setor}/{$nameTpl}.mustache");
                    } elseif (file_exists(PATH_HOME . "public/overload/{$lib}/tpl/{$nameTpl}.mustache")) {
                        $list[$nameTpl] = file_get_contents(PATH_HOME . "public/overload/{$lib}/tpl/{$nameTpl}.mustache");
                    } else {

                        /**
                         * Busta overload do template atual da lib em outras libs
                         */
                        foreach (\Helpers\Helper::listFolder(PATH_HOME . VENDOR) as $libOverload) {
                            if ($libOverload !== $lib) {
                                if (file_exists(PATH_HOME . VENDOR . $libOverload . "/public/overload/{$lib}/tpl/{$setor}/{$nameTpl}.mustache")) {
                                    $list[$nameTpl] = file_get_contents(PATH_HOME . VENDOR . $libOverload . "/public/overload/{$lib}/tpl/{$setor}/{$nameTpl}.mustache");
                                } elseif (file_exists(PATH_HOME . VENDOR . $libOverload . "/public/overload/{$lib}/tpl/{$nameTpl}.mustache")) {
                                    $list[$nameTpl] = file_get_contents(PATH_HOME . VENDOR . $libOverload . "/public/overload/{$lib}/tpl/{$nameTpl}.mustache");
                                }
                            }
                        }
                    }

                    /**
                     * Caso não tenha encontrado overload do template, adiciona o template original
                     */
                    if (!in_array($nameTpl, array_keys($list)))
                        $list[$nameTpl] = file_get_contents(PATH_HOME . VENDOR . $lib . "/public/tpl/{$tpl}");
                }
            }
        }
    }

    return $list;
}

$list = [];
$setor = !empty($_SESSION['userlogin']) ? $_SESSION['userlogin']['setor'] : "0";

// busca os templates em PUBLIC, estes templates não possuem OVERLOAD
foreach (\Helpers\Helper::listFolder(PATH_HOME . "public/tpl") as $tpl) {
    if (preg_match('/\.(mst|mustache)$/i', $tpl)) {
        $nameTpl = str_replace(['.mst', '.mustache'], '', $tpl);
        if (!in_array($nameTpl, array_keys($list)))
            $list[$nameTpl] = file_get_contents(PATH_HOME . "public/tpl/" . $tpl);
    }
}

//search in VENDOR
foreach (\Helpers\Helper::listFolder(PATH_HOME . VENDOR) as $lib)
    $list = getTemplates($lib, $setor, $list);

$data['data'] = $list;