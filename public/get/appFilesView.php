<?php

/**
 * Obtém as views que este usuário tem acesso
 * @param string $path
 * @param string $setor
 * @param array $list
 * @return array
 */
function getViewOffline(string $path, string $setor, array $list)
{
    if (file_exists($path . "public/param")) {
        foreach (\Helpers\Helper::listFolder($path . "public/param") as $param) {
            $view = str_replace(".json", "", $param);
            $p = json_decode(file_get_contents($path . "public/param/" . $param), !0);

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
 * Para cada biblioteca
 * busca as views que tenho acesso e obtém os templates utilizados nessa view
 */
$setor = !empty($_SESSION['userlogin']) ? $_SESSION['userlogin']['setor'] : "0";
$list = getViewOffline("", $setor, []);
foreach (\Helpers\Helper::listFolder(PATH_HOME . VENDOR) as $lib)
    $list = getViewOffline(PATH_HOME . VENDOR . $lib . "/", $setor, $list);

$data['data']['view'] = $list;