<?php
$data['error'] = "erro";

try {
    //Adiciona constante KEY na config
    if (defined("KEY")) {
        $config = json_decode(file_get_contents(PATH_HOME . "_config/config.json"), true);
        unset($config['key']);

        \Config\Config::createConfig($config);
    }

    //remove composer biblioteca controle fixo
    if(file_exists(PATH_HOME . "composer.json")) {
        $comp = json_decode(file_get_contents(PATH_HOME . "composer.json"), true);
        foreach ($comp['require'] as $lib => $version) {
            if(preg_match('/^ueb\//i', $lib)) {
                $v = explode('.', $version);
                $comp['require'][$lib] = $v[0] . '.*';
            }
        }

        unlink(PATH_HOME . "composer.json");

        //Salva composer
        $f = fopen(PATH_HOME . "composer.json", "w+");
        fwrite($f, json_encode($comp));
        fclose($f);
    }

    $data['error'] = "";

} catch (Exception $e) {

}