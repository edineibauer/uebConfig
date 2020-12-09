<?php

$data['data'] = [];
$setor = \Config\Config::getSetor();

/**
 * Templates base
 */
$templatesSystem = ["header", "aside", "menuHeader"];

/**
 * Templates dentro de appCore
 */
foreach (\Config\Config::getRoutesFilesTo("tpl/{$setor}/appCore", "mustache") as $name => $dir)
    $data['data'][str_replace(".mustache", "", $name)] = file_get_contents($dir);

foreach (\Config\Config::getRoutesFilesTo("tpl/appCore", "mustache") as $name => $dir)
    $data['data'][str_replace(".mustache", "", $name)] = file_get_contents($dir);

foreach (\Config\Config::getRoutesFilesTo("tpl", "mustache") as $tpl => $tplDir) {
    $tplName = str_replace('.mustache', '', $tpl);
    if (in_array($tplName, $templatesSystem) && !isset($data['data'][$tplName]))
        $data['data'][$tplName] = file_get_contents($tplDir);
}