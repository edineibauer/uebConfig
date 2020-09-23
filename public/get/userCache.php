<?php
$setor = \Config\Config::getSetor();
$data['data'] = [];

$content = [
    "allow" => \Config\Config::getPermission($setor) ?? [],
    "dicionario" => \Entity\Entity::dicionario(null, !0),
    "info" => \Entity\Entity::info(),
    "template" => [],
    "menu" => [],
    "navbar" => [],
    "react" => [],
    "relevant" => [],
    "general" => [],
    "graficos" => [],
    "totalRegisters" => [],
];

//include 'dbFirstLoad.php';
//$content['db'] = $data['data'];

include 'templates.php';
$content['template'] = $data['data'];

include 'menu.php';
$content['menu'] = $data['data'];

include 'navbar.php';
$content['navbar'] = $data['data'];

include 'react.php';
$content['react'] = $data['data'];

include 'relevant.php';
$content['relevant'] = $data['data'];

include 'general.php';
$content['general'] = $data['data'];

include 'graficos.php';
$content['graficos'] = $data['data'];

foreach (\Helpers\Helper::listFolder(PATH_HOME . "_cdn/userTotalRegisterDB/{$_SESSION['userlogin']['id']}") as $item)
    $content['totalRegisters'][str_replace(".json", "", $item)] = file_get_contents(PATH_HOME . "_cdn/userTotalRegisterDB/{$_SESSION['userlogin']['id']}/{$item}");

$data['data'] = $content;