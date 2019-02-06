<?php

/**
 * Carrega os Arquivos bases de paginas e assets para este usuário
 */

use \Helpers\Helper;

/**
 * @param string $path
 * @param array $dados
 * @return array
 */
function getAssets(string $path, array $dados): array
{
    foreach (Helper::listFolder(PATH_HOME . $path) as $asset) {

        /* Não verifica arquivos minificados */
        if (!preg_match('/.min./i', $asset)) {
            if (strpos($asset, ".")) {
                $extension = explode('&', pathinfo($asset, PATHINFO_EXTENSION))[0];

                if (in_array($extension, ["png", "jpg", "jpeg", "gif", "bmp", "tif", "tiff", "psd", "svg", "mp3", "aac", "ogg", "wma", "mid", "alac", "flac", "wav", "pcm", "aiff", "ac3", "mp4", "avi", "mkv", "mpeg", "flv", "wmv", "mov", "rmvb", "vob", "3gp", "mpg"]))
                    $dados['midia'][] = HOME . "{$path}/{$asset}";
                else
                    $dados['misc'][] = HOME . "{$path}/{$asset}";

            } else {
                $dados = getAssets("{$path}/{$asset}", $dados);
            }
        }
    }

    return $dados;
}

/**
 * Obtém os dados do diretório para consumo do usuário
 * @param string $path
 * @param array $dados
 * @return array
 */
function getCachedContent(string $path, array $dados): array
{
    //components templates VUE
    if (file_exists(PATH_HOME . "{$path}/components")) {
        foreach (Helper::listFolder(PATH_HOME . "{$path}/components") as $tpl) {
            $tplUrl = HOME . "{$path}/components/{$tpl}";
            if (preg_match('/\.html/i', $tpl) && !in_array($tplUrl, $dados['misc']))
                $dados['misc'][] = $tplUrl;
        }
    }

    //assets
    if (file_exists(PATH_HOME . "{$path}/assets"))
        $dados = getAssets("{$path}/assets", $dados);

    //views
    if (file_exists(PATH_HOME . "{$path}/view")) {
        foreach (Helper::listFolder(PATH_HOME . "{$path}/view") as $view) {
            $viewUrl = HOME . "view/" . str_replace('.php', '', $view);

            if (preg_match('/\.php$/i', $view) && $view !== "updateSystem.php" && !in_array($viewUrl, $dados['view']))
                $dados['view'][] = $viewUrl;
        }
    }

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
    "react" => [],
    "reactOnline" => [],
    "misc" => [HOME . "manifest.json"],
    "midia" => []
];

//CORE, create cache from all 'assetsPublic'
foreach (Helper::listFolder(PATH_HOME . "assetsPublic") as $item) {
    if (!is_dir(PATH_HOME . "assetsPublic/{$item}")) {

        //apenas arquivos dentro de assetsPublic
        if (strpos($item, ".") && !in_array(HOME . "assetsPublic/{$item}", $data['data']['core']))
            $data['data']['core'][] = HOME . "assetsPublic/{$item}";

    } else {

        //para cada diretório na pasta assetsPublic
        foreach (Helper::listFolder(PATH_HOME . "assetsPublic/{$item}") as $iten) {
            //se for arquivo dentro da pasta
            if (strpos($iten, ".")) {
                if ($item === "view" && !in_array(HOME . "assetsPublic/view/{$iten}", $data['data']['assets'])) {
                    $ext = ucfirst(pathinfo($iten, PATHINFO_EXTENSION));
                    $data['data']["view{$ext}"][] = HOME . "assetsPublic/view/{$iten}";
                } elseif ($item === "fonts" && !in_array(HOME . "assetsPublic/fonts/{$iten}", $data['data']['fonts'])) {
                    $data['data']['fonts'][] = HOME . "assetsPublic/fonts/{$iten}";
                } elseif ($item === "img" && !in_array(HOME . "assetsPublic/img/{$iten}", $data['data']['images'])) {
                    $data['data']['images'][] = HOME . "assetsPublic/img/{$iten}";
                }
            } elseif ($item === "react" && is_dir(PATH_HOME . "assetsPublic/react/{$iten}")) {
                foreach (Helper::listFolder(PATH_HOME . "assetsPublic/react/{$iten}") as $react) {
                    if (pathinfo($react, PATHINFO_EXTENSION) === "js" && !in_array(HOME . "assetsPublic/react/{$iten}/{$react}", $data['data']['react'])) {
                        $data['data']['react'][] = HOME . "assetsPublic/react/{$iten}/{$react}";
                    } elseif ($react === "online") {
                        foreach (Helper::listFolder(PATH_HOME . "assetsPublic/react/{$iten}/online") as $reactOnline) {
                            if (pathinfo($reactOnline, PATHINFO_EXTENSION) === "js" && !in_array(HOME . "assetsPublic/react/{$iten}/online/{$reactOnline}", $data['data']['reactOnline']))
                                $data['data']['reactOnline'][] = HOME . "assetsPublic/react/{$iten}/online/{$reactOnline}";
                        }

                    }
                }
            }
        }
    }
}

// public content
$data['data'] = getCachedContent('public', $data['data']);

// libs content
foreach (\Config\Config::getViewPermissoes() as $rota) {
    if (file_exists(PATH_HOME . VENDOR . $rota . "/public") && !in_array($rota, ['entity-ui', 'dev-ui']))
        $data['data'] = getCachedContent(VENDOR . $rota . '/public', $data['data']);
}