<?php

/**
 * Carrega os Arquivos bases de paginas e assets para este usuário
 */

use \Helpers\Helper;

/**
 * @param string $path
 * @param array $dados
 * @param string $domain
 * @return array
 */
function getAssetsMidias(string $path, array $dados, string $domain): array
{
    foreach (Helper::listFolder(PATH_HOME . $path) as $asset) {

        /* Não verifica arquivos minificados */
        if (!preg_match('/.min./i', $asset)) {
            if (strpos($asset, ".")) {
                $extension = explode('&', pathinfo($asset, PATHINFO_EXTENSION))[0];

                if (in_array($extension, ["png", "jpg", "jpeg", "gif", "bmp", "tif", "tiff", "psd", "svg", "mp3", "aac", "ogg", "wma", "mid", "alac", "flac", "wav", "pcm", "aiff", "ac3", "mp4", "avi", "mkv", "mpeg", "flv", "wmv", "mov", "rmvb", "vob", "3gp", "mpg"]))
                    $dados['midia'][] = HOME . "{$path}/{$asset}";

            } else {
                $dados = getAssetsMidias("{$path}/{$asset}", $dados, $domain);
            }
        }
    }

    return $dados;
}

/**
 * Obtém os dados do diretório para consumo do usuário
 * @param string $path
 * @param array $dados
 * @param string $domain
 * @return array
 */
function getCurrentCachedContent(string $path, array $dados, string $domain): array
{
    //assets
    if (file_exists(PATH_HOME . "{$path}/assets"))
        $dados = getAssetsMidias("{$path}/assets", $dados, $domain);

    //views
    if (file_exists(PATH_HOME . "{$path}/view/{$domain}.php"))
        $dados['view'][] = HOME . "view/" . $domain;

    return $dados;
}

// return values
$data['data'] = [
    "core" => [HOME, HOME . "index", HOME . "set"],
    "fonts" => [],
    "images" => [],
    "viewJs" => [],
    "viewCss" => [],
    "view" => [],
    "midia" => []
];

if (!empty($link->getVariaveis())) {
    $domain = "";
    foreach (array_reverse($link->getVariaveis()) as $variavel) {
        if ($variavel !== DOMINIO)
            $domain .= (!empty($domain) ? "/" : "") . $variavel;
    }
    if (empty($domain))
        $domain = "index";
} else {
    $domain = "index";
}

//CORE, create cache from all 'assetsPublic' root and current view
foreach (Helper::listFolder(PATH_HOME . "assetsPublic") as $item) {
    if (!is_dir(PATH_HOME . "assetsPublic/{$item}") && strpos($item, ".") && !in_array(HOME . "assetsPublic/{$item}", $data['data']['core']))
        $data['data']['core'][] = HOME . "assetsPublic/{$item}?v=" . VERSION;
}

//fonts
foreach (Helper::listFolder(PATH_HOME . "assetsPublic/fonts") as $iten)
    $data['data']['fonts'][] = HOME . "assetsPublic/fonts/{$iten}?v=" . VERSION;

//images
foreach (Helper::listFolder(PATH_HOME . "assetsPublic/img") as $iten)
    $data['data']['images'][] = HOME . "assetsPublic/img/{$iten}?v=" . VERSION;

//view assets
if (file_exists(PATH_HOME . "assetsPublic/view/{$domain}.min.css"))
    $data['data']["viewCss"][] = HOME . "assetsPublic/view/{$domain}.min.css?v=" . VERSION;
if (file_exists(PATH_HOME . "assetsPublic/view/{$domain}.min.js"))
    $data['data']["viewJs"][] = HOME . "assetsPublic/view/{$domain}.min.js?v=" . VERSION;

// public content
$data['data'] = getCurrentCachedContent('public', $data['data'], $domain);

// libs content
foreach (\Config\Config::getViewPermissoes() as $rota) {
    if (file_exists(PATH_HOME . VENDOR . $rota . "/public") && !in_array($rota, ['entity-ui', 'dev-ui', 'config', 'form']))
        $data['data'] = getCurrentCachedContent(VENDOR . $rota . '/public', $data['data'], $domain);
}