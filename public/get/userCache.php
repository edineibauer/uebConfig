<?php
$setor = \Config\Config::getSetor();
$data['data'] = [];

$content = [
    "allow" => \Config\Config::getPermission()[$setor] ?? [],
    "dicionario" => \Entity\Entity::dicionario(),
    "info" => \Entity\Entity::info(),
    "template" => [],
    "menu" => [],
    "navbar" => [],
    "react" => [],
    "relevant" => [],
    "general" => [],
    "graficos" => []
];

include_once 'templates.php';
$content['template'] = $data['data'];

include_once 'menu.php';
$content['menu'] = $data['data'];

include_once 'navbar.php';
$content['navbar'] = $data['data'];

include_once 'react.php';
$content['react'] = $data['data'];

include_once 'relevant.php';
$content['relevant'] = $data['data'];

include_once 'general.php';
$content['general'] = $data['data'];

include_once 'graficos.php';
$content['graficos'] = $data['data'];

$data['data'] = $content;