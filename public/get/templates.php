<?php

$data['data'] = [];
foreach (\Config\Config::getRoutesFilesTo("param", "json") as $fileDir) {
    $p = \Config\Config::getJsonFile($fileDir);

    /**
     * Se tiver permissão para acessar a view e
     * Se este template ainda não foi adicionado na lista
     * Então adiciona o template a lista de templates do usuário
     */
    if (!empty($p['templates']) && is_array($p['templates']) && \Config\Config::paramPermission($p)) {
        foreach ($p['templates'] as $template) {
            if (!in_array($template, array_keys($data['data'])))
                $data['data'][$template] = \Config\Config::getTemplateContent($template);
        }
    }
}