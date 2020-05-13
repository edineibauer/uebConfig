<?php

$setor = !empty($_SESSION['userlogin']) ? $_SESSION['userlogin']['setor'] : "0";

/**
 * Obtém as views que este usuário tem acesso
 * @param string $path
 * @param string $setor
 * @param array $list
 * @return array
 */
function getViewOffline(string $path, string $setor, array $list)
{
    if (file_exists($path)) {
        foreach (\Helpers\Helper::listFolder($path) as $param) {
            $view = str_replace(".json", "", $param);
            $p = json_decode(file_get_contents($path . "/" . $param), !0);

            /**
             * Se tiver permissão para acessar a view e
             * Se esta view ainda não foi adicionado na lista
             * Então adiciona a view a lista de views do usuário
             */
            if (!empty($p['offline']) && $p['offline'] && ((empty($p['setor']) || in_array($setor, $p['setor'])) && (empty($p['!setor']) || !in_array($setor, $p["!setor"]))) && !in_array($view, $list))
                $list[] = $view;
        }
    }

    return $list;
}

/**
 * Public Setor
 */
$list = getViewOffline("public/param/" . $setor, $setor, []);

/**
 * Public
 */
$list = getViewOffline("public/param", $setor, $list);

/**
 * Overload in Public
 */
if(file_exists(PATH_HOME. "public/overload")) {
    foreach (\Helpers\Helper::listFolder(PATH_HOME. "public/overload") as $libOverload) {
        $list = getViewOffline(PATH_HOME. "public/overload/" . $libOverload . "/param/" . $setor, "", []);
        $list = getViewOffline(PATH_HOME. "public/overload/" . $libOverload . "/param", $setor, []);
    }
}

/**
 * Overload in Libs
 */
foreach (\Helpers\Helper::listFolder(PATH_HOME . VENDOR) as $lib) {
    if (file_exists(PATH_HOME . VENDOR . $lib . "/public/overload")) {
        foreach (\Helpers\Helper::listFolder(PATH_HOME . VENDOR . $lib . "/public/overload") as $libOverload) {
            $list = getViewOffline(PATH_HOME . VENDOR . $lib . "/public/overload/" . $libOverload . "/param/" . $setor, "", []);
            $list = getViewOffline(PATH_HOME . VENDOR . $lib . "/public/overload/" . $libOverload . "/param", $setor, []);
        }
    }
}

/**
 * Libs Setor
 */
foreach (\Helpers\Helper::listFolder(PATH_HOME . VENDOR) as $lib)
    $list = getViewOffline(PATH_HOME . VENDOR . $lib . "/public/param/" . $setor, $setor, $list);

/**
 * Libs
 */
foreach (\Helpers\Helper::listFolder(PATH_HOME . VENDOR) as $lib)
    $list = getViewOffline(PATH_HOME . VENDOR . $lib . "/public/param", $setor, $list);

$data['data']['view'] = $list;