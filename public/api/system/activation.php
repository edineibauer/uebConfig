<?php

use \Config\Config;

if(!defined("KEY") && !empty($key)) {

    //Adiciona constante KEY na config
    $config = json_decode(file_get_contents(PATH_HOME . "_config/config.json"), true);
    $config['key'] = $key;
    Config::createConfig($config);

    //retorna versão das bibliotecas e força o uso de versões fixas
    $comp = json_decode(file_get_contents(PATH_HOME . "composer.json"), true);
    $teste = json_decode(file_get_contents(PATH_HOME . "composer.lock"), true);
    $data['data'] = [];
    foreach ($teste['packages'] as $package) {
        if (preg_match('/^ueb\//i', $package['name'])){
            $data['data'][] = ["versao" => $package['version'], "biblioteca" => $package['name']];

            //adiciona dependencias para o composer.json
            $comp['require'][$package['name']] = $package['version'];
        }
    }

    unlink(PATH_HOME . "composer.json");

    //salva composer.json
    $f = fopen(PATH_HOME . "composer.json", "w+");
    fwrite($f, str_replace('\/', '/', json_encode($comp)));
    fclose($f);
} else {
    $data['error'] = "chave já definida ou não informada";
}