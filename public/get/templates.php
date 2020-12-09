<?php

$data['data'] = [];
$setor = \Config\Config::getSetor();

/**
 * Templates dentro de appCore
 */
foreach (\Config\Config::getRoutesFilesTo("tpl/{$setor}/appCore", "mustache") as $name => $dir)
    $data['data'][str_replace(".mustache", "", $name)] = file_get_contents($dir);

foreach (\Config\Config::getRoutesFilesTo("tpl/appCore", "mustache") as $name => $dir)
    $data['data'][str_replace(".mustache", "", $name)] = file_get_contents($dir);