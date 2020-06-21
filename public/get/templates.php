<?php

$data['data'] = [];
$setor = \Config\Config::getSetor();
$templatesSystem = ["header", "aside", "menuHeader", "installAppCard"];

foreach (\Config\Config::getRoutesFilesTo("tpl", "mustache") as $tpl => $tplDir) {
    $tplName = str_replace('.mustache', '', $tpl);
    if (in_array($tplName, $templatesSystem) && !isset($data['data'][$tplName]))
        $data['data'][$tplName] = file_get_contents($tplDir);
}