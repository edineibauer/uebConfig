<?php

$data['data'] = ["view" => [], "js" => []];
$setor = \Config\Config::getSetor();

foreach (\Config\Config::getRoutesFilesTo("view", "json") as $file => $fileDir) {

    $p = \Config\Config::getJsonFile($fileDir);
    $view = str_replace(".json", "", $file);

    /**
     * Se tiver permissão para acessar a view e
     * Se esta view ainda não foi adicionado na lista
     * Se estiver setada para funcionar offline
     * Se a view for específica do meu setor
     *
     * Então adiciona a view a lista de views do usuário
     */
    if (!empty($p['offline']) && $p['offline'] && \Config\Config::paramPermission($p) && !in_array($view, $data['data']['view'])) {
        $data['data']['view'][] = "view/" . $view;
        $data['data']['js'][] = (file_exists(PATH_HOME . "assetsPublic/view/{$setor}/{$view}.min.js") ? "assetsPublic/view/{$setor}/{$view}.min.js?v=" . VERSION : "assetsPublic/view/{$view}.min.js?v=" . VERSION);
    }
}