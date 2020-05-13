<?php

$data['data']['view'] = [];
foreach (\Config\Config::getRoutesFilesTo("param", "json") as $file => $fileDir) {
    $p = \Config\Config::getJsonFile($fileDir);
    $view = str_replace(".json", "", $file);

    /**
     * Se tiver permissão para acessar a view e
     * Se esta view ainda não foi adicionado na lista
     * Então adiciona a view a lista de views do usuário
     */
    if (!empty($p['offline']) && $p['offline'] && \Config\Config::paramPermission($p) && !in_array($view, $data['data']['view']))
        $data['data']['view'][] = $view;
}