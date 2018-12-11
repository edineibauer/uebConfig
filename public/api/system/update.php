<?php
$newKey = trim(strip_tags(filter_input(INPUT_POST, 'newKey', FILTER_DEFAULT)));
$data['error'] = "erro";

try {
    //Adiciona constante KEY na config
    $config = json_decode(file_get_contents(PATH_HOME . "_config/config.json"), true);
    $config['key'] = $newKey;
    \Config\Config::createConfig($config);

    $data['error'] = "";

} catch (Exception $e) {

}