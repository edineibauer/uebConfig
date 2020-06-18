<?php

$fileInSetFolder = filter_input(INPUT_POST, 'fileInSetFolder', FILTER_DEFAULT) . ".php";
$post = filter_input(INPUT_POST, 'postData', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY);

$find = !1;
foreach (\Config\Config::getRoutesFilesTo("set", "php") as $file => $dir) {
    if($file === $fileInSetFolder) {
        $find = !0;
        include_once $dir;
        break;
    }
}

if(!$find)
    $data['error'] = "Arquivo {$fileInSetFolder} não encontrado nas pastas `public/set/`";