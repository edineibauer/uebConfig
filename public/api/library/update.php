<?php
$lib = trim(strip_tags(filter_input(INPUT_POST, 'lib', FILTER_DEFAULT)));
$version = trim(strip_tags(filter_input(INPUT_POST, 'version', FILTER_DEFAULT)));
$data['error'] = "erro";

if(file_exists(PATH_HOME . "composer.json")) {
    try {
        $comp = json_decode(file_get_contents(PATH_HOME . "composer.json"), true);
        $comp['require'][$lib] = $version;

        unlink(PATH_HOME . "composer.json");

        $f = fopen(PATH_HOME . "composer.json", "w+");
        fwrite($f, str_replace("\/", "/", json_encode($comp)));
        fclose($f);

        $data['error'] = "";
    } catch (Exception $e) {
    }
}