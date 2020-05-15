<?php

$data['data'] = [];
$setor = \Config\Config::getSetor();

foreach (\Config\Config::getRoutesFilesTo("tpl", "mustache") as $tpl => $tplDir) {
    $tplName = str_replace('.mustache', '', $tpl);
    if (!isset($data['data'][$tplName]) && preg_match("/\/tpl\/{$setor}\//i", $tplDir))
        $data['data'][$tplName] = file_get_contents($tplDir);
}

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

if (!isset($data['data']['header']))
    $data['data']["header"] = file_get_contents(PATH_HOME . VENDOR . "config/public/tpl/header.mustache");

if (!isset($data['data']['aside']))
    $data['data']["aside"] = file_get_contents(PATH_HOME . VENDOR . "config/public/tpl/aside.mustache");

if (!isset($data['data']['menuHeader']))
    $data['data']["menuHeader"] = file_get_contents(PATH_HOME . VENDOR . "config/public/tpl/menuHeader.mustache");

if (!isset($data['data']['note']))
    $data['data']["note"] = file_get_contents(PATH_HOME . VENDOR . "config/public/tpl/note.mustache");

if (!isset($data['data']['notificacoesEmpty']))
    $data['data']["notificacoesEmpty"] = file_get_contents(PATH_HOME . VENDOR . "config/public/tpl/notificacoesEmpty.mustache");

if (!isset($data['data']['installAppCard']))
    $data['data']["installAppCard"] = file_get_contents(PATH_HOME . VENDOR . "config/public/tpl/installAppCard.mustache");