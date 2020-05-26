<?php

/**
 * Carrega os Arquivos bases de core genérico
 */

use \Helpers\Helper;

/**
 * Obtém os templates utilizados nas views que este usuário tem acesso
 * @param string $path
 * @param string $setor
 * @param array $list
 * @return array
 */
function getOfflineAssetsPath(string $path, string $setor, array $list)
{
    if (file_exists($path)) {
        foreach (\Helpers\Helper::listFolder($path) as $param) {
            $p = json_decode(file_get_contents($path . "/" . $param), !0);

            if (!empty($p['templates']) && is_array($p['templates'])) {

                $permissionToView = $setor === "" || ((empty($p['setor']) || in_array($setor, $p['setor'])) && (empty($p['!setor']) || !in_array($setor, $p["!setor"])));

                /**
                 * Se tiver permissão para acessar a view e
                 * Se este template ainda não foi adicionado na lista
                 * Então adiciona o template a lista de templates do usuário
                 */
                if ($permissionToView) {
                    foreach ($p['templates'] as $template) {
                        if (!in_array($template, array_keys($list)))
                            $list[$template] = \Config\Config::getTemplateContent($template);
                    }
                }
            }
        }
    }

    return $list;
}

/**
 * Obtém lista de assets para armazenar offline
 * @return string[]
 */
function getOfflineAssets(): array
{
    $list = [HOME . "manifest.json?v=" . VERSION];

    if (!empty($_SESSION['userlogin']) && !empty($_SESSION['userlogin']['imagem']))
        $list[] = $_SESSION['userlogin']['imagem']['urls']['100'];

    $assetsDir = \Config\Config::getRoutesTo("assets");
    foreach (\Config\Config::getRoutesFilesTo("param", "json") as $asset => $fileDir) {
        $p = \Config\Config::getJsonFile($fileDir);
        if (!empty($p['offlineAssets']) && \Config\Config::paramPermission($p)) {
            foreach ($p['offlineAssets'] as $offlineAsset) {
                foreach ($assetsDir as $assetDir) {
                    if (file_exists($assetDir . $offlineAsset)) {
                        $list[] = $assetDir . $offlineAsset;
                        break;
                    }
                }
            }
        }
    }

    return array_unique($list);
}

// return values
$data['data'] = [
    "core" => [HOME, HOME . "index", HOME . "set"],
    "fonts" => [],
    "images" => [],
    "misc" => getOfflineAssets()
];

//CORE, create cache from all 'assetsPublic' root and current view
foreach (Helper::listFolder(PATH_HOME . "assetsPublic") as $item) {
    if ($item !== "tableCore.min.js" && $item !== "tableReportCore.min" && !is_dir(PATH_HOME . "assetsPublic/{$item}") && strpos($item, ".") && !in_array(HOME . "assetsPublic/{$item}", $data['data']['core']))
        $data['data']['core'][] = HOME . "assetsPublic/{$item}?v=" . VERSION;
}

//CORE, create cache from all 'assetsPublic' root and current view
$setor = empty($_SESSION['userlogin']) ? "0" : $_SESSION['userlogin']['setor'];
foreach (Helper::listFolder(PATH_HOME . "assetsPublic/core/" . $setor) as $item) {
    if (!is_dir(PATH_HOME . "assetsPublic/{$item}") && strpos($item, ".") && !in_array(HOME . "assetsPublic/{$item}", $data['data']['core']))
        $data['data']['core'][] = HOME . "assetsPublic/core/{$setor}/{$item}?v=" . VERSION;
}

//fonts
foreach (Helper::listFolder(PATH_HOME . "assetsPublic/fonts") as $iten)
    $data['data']['fonts'][] = HOME . "assetsPublic/fonts/{$iten}?v=" . VERSION;

//images
foreach (Helper::listFolder(PATH_HOME . "assetsPublic/img") as $iten)
    $data['data']['images'][] = HOME . "assetsPublic/img/{$iten}?v=" . VERSION;