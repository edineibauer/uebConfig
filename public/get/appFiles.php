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

                if ($extension === "js")
                    $dados['js'][] = HOME . "{$path}/" . str_replace('.js', '.min.js', $asset) . "?v=" . VERSION;
                elseif ($extension === "css")
                    $dados['css'][] = HOME . "{$path}/" . str_replace('.css', '.css.js', $asset) . "?v=" . VERSION;
                elseif(in_array($extension, ["png", "jpg", "jpeg", "gif", "bmp", "tif", "tiff", "psd", "svg", "mp3", "aac", "ogg", "wma", "mid", "alac", "flac", "wav", "pcm", "aiff", "ac3", "mp4", "avi", "mkv", "mpeg", "flv", "wmv", "mov", "rmvb", "vob", "3gp", "mpg"]))
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
    // components templates VUE
    if (file_exists(PATH_HOME . "{$path}/components")) {
        foreach (Helper::listFolder(PATH_HOME . "{$path}/components") as $tpl) {
            $tplUrl = HOME . "{$path}/components/{$tpl}";
            if (preg_match('/\.html/i', $tpl) && !in_array($tplUrl, $dados['misc']))
                $dados['misc'][] = $tplUrl;
        }
    }

    //Assets
    if (file_exists(PATH_HOME . "{$path}/assets"))
        $dados = getAssets("{$path}/assets", $dados);

    //get
    if (file_exists(PATH_HOME . "{$path}/ajax/get")) {
        foreach (Helper::listFolder(PATH_HOME . "{$path}/ajax/get") as $get) {
            $getUrl = HOME . "get/" . str_replace('.php', '', $get);
            if (preg_match('/\.php$/i', $get) && !in_array($getUrl, $dados['get']))
                $dados['get'][] = $getUrl;
        }
    }

    //views
    if (file_exists(PATH_HOME . "{$path}/view")) {
        foreach (Helper::listFolder(PATH_HOME . "{$path}/view") as $view) {
            $viewUrl = HOME . "view/" . str_replace('.php', '', $view);

            if (preg_match('/\.php$/i', $view) && !in_array($viewUrl, $dados['view']))
                $dados['view'][] = $viewUrl;
        }
    }

    return $dados;
}

// return values
$data['data'] = [
    "core" => [HOME, HOME . "index"],
    "view" => [],
    "get" => [],
    "misc" => [HOME . "manifest.json"],
    "midia" => [],
    "js" => [],
    "css" => []
];

//rotas administrativas com restrição de acesso
$rotasAdm = ["dashboard", "ui-dev"];

//obtém as rotas permitidas
$rotas = json_decode(file_get_contents(PATH_HOME . "_config/route.json"), true);

//CORE, create cache from all 'assetsPublic'
foreach (Helper::listFolder(PATH_HOME . "assetsPublic") as $item) {
    if (is_dir(PATH_HOME . "assetsPublic/{$item}")) {
        if($item !== "view") {
            foreach (Helper::listFolder(PATH_HOME . "assetsPublic/{$item}") as $iten) {
                if (strpos($iten, ".") && !in_array(HOME . "assetsPublic/{$item}/{$iten}", $data['data']['core']))
                    $data['data']['core'][] = HOME . "assetsPublic/{$item}/{$iten}";
            }
        }

    } elseif (strpos($item, ".") && !in_array(HOME . "assetsPublic/{$item}", $data['data']['core'])) {
        $data['data']['core'][] = HOME . "assetsPublic/{$item}";
    }
}

// public content
$data['data'] = getCachedContent('public', $data['data']);

// libs content
foreach ($rotas as $rota) {
    if (!in_array($rota, $rotasAdm) && file_exists(PATH_HOME . VENDOR . $rota . "/public"))
        $data['data'] = getCachedContent(VENDOR . $rota . '/public', $data['data']);
}

// session content
if(!empty($_SESSION['userlogin'])) {
    foreach ($rotasAdm as $item) {
        if(($item !== "ui-dev" || $_SESSION['userlogin']['setor'] == 1) && file_exists(PATH_HOME . VENDOR . $item . "public"))
            $data['data'] = getCachedContent(VENDOR . $item . '/public', $data['data']);
    }
}