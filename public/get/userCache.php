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
    "totalRegisters" => []
];

include 'userTotalRegisterDB.php';
$content['totalRegisters'] = $data['data'];

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

$data['data'] = $content;