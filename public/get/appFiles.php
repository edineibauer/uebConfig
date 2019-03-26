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

                if (!in_array($extension, ["png", "jpg", "jpeg", "gif", "bmp", "tif", "tiff", "psd", "svg", "mp3", "aac", "ogg", "wma", "mid", "alac", "flac", "wav", "pcm", "aiff", "ac3", "mp4", "avi", "mkv", "mpeg", "flv", "wmv", "mov", "rmvb", "vob", "3gp", "mpg"]))
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
    "viewJs" => [],
    "viewCss" => [],
    "view" => [],
    "misc" => [HOME . "manifest.json"]
];

//CORE, create cache from all 'assetsPublic'
foreach (Helper::listFolder(PATH_HOME . "assetsPublic") as $item) {
    if (is_dir(PATH_HOME . "assetsPublic/{$item}")) {

        //para cada diretório na pasta assetsPublic
        foreach (Helper::listFolder(PATH_HOME . "assetsPublic/{$item}") as $iten) {
            //se for arquivo dentro da pasta
            if (strpos($iten, ".")) {
                if ($item === "view") {
                    $ext = ucfirst(pathinfo($iten, PATHINFO_EXTENSION));
                    $data['data']["view{$ext}"][] = HOME . "assetsPublic/view/{$iten}?v=" . VERSION;
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