<?php

$data['data'] = [];
$data['data']["header"] = file_get_contents(PATH_HOME . VENDOR . "config/public/tpl/header.mustache");
$data['data']["aside"] = file_get_contents(PATH_HOME . VENDOR . "config/public/tpl/aside.mustache");
$data['data']["menuHeader"] = file_get_contents(PATH_HOME . VENDOR . "config/public/tpl/menuHeader.mustache");
$data['data']["note"] = file_get_contents(PATH_HOME . VENDOR . "config/public/tpl/note.mustache");
$data['data']["notificacoesEmpty"] = file_get_contents(PATH_HOME . VENDOR . "config/public/tpl/notificacoesEmpty.mustache");
$data['data']["installAppCard"] = file_get_contents(PATH_HOME . VENDOR . "config/public/tpl/installAppCard.mustache");

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