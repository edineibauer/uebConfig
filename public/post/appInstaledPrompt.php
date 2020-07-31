<?php

$success = filter_input(INPUT_POST, 'success', FILTER_VALIDATE_BOOLEAN);
$ios = filter_input(INPUT_POST, 'ios', FILTER_VALIDATE_BOOLEAN);

\Helpers\Helper::createFolderIfNoExist("_config/appInstall");
$dados = ["ios" => 0, "android" => 0];

if(file_exists(PATH_HOME . "_config/appInstall/appInstaledPrompt.json"))
    $dados = json_decode(file_get_contents(PATH_HOME . "_config/appInstall/appInstaledPrompt.json"), !0);

$dados[($ios ? "ios" : "android")]++;

$f = fopen(PATH_HOME . "_config/appInstall/appInstaledPrompt.json", "w");
fwrite($f, json_encode($dados));
fclose($f);


$data['data'] = 1;