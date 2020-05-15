<?php

$data['data']['view'] = [];
$setor = \Config\Config::getSetor();

foreach (\Config\Config::getRoutesFilesTo("param", "json") as $file => $fileDir) {

    $p = \Config\Config::getJsonFile($fileDir);
    $view = str_replace(".json", "", $file);

    /**
     * Se tiver permissão para acessar a view e
     * Se esta view ainda não foi adicionado na lista
     * Se estiver setada para funcionar offline
     * Se a view não for específica de um setor
     *
     * Então adiciona a view a lista de views do usuário
     */
    if (!empty($p['offline']) && $p['offline'] && \Config\Config::paramPermission($p) && !in_array($view, $data['data']['view']) && !preg_match("/\/param\/{$setor}\//i", $fileDir))
        $data['data']['view'][] = $view;
}