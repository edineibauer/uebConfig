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

if (!empty($_SESSION['userlogin'])) {
    \Helpers\Helper::createFolderIfNoExist(PATH_HOME . "_cdn/userSSE");
    \Helpers\Helper::createFolderIfNoExist(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}");
    include_once 'sseMoveToListenner.php';
}

$data['data'] = $content;