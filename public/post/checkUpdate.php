<?php
if(filter_input(INPUT_POST, 'update', FILTER_VALIDATE_BOOLEAN))
    \Config\Config::updateSite();

$data['data'] = [
    'version_server' => ((float) json_decode(file_get_contents(PATH_HOME . '_config/config.json'), !0)['version']),
    "version_app" => ""
];

if(file_exists(PATH_HOME . "_cdn/version_required.json"))
    $data['data']['version_app'] = file_get_contents(PATH_HOME . "_cdn/version_required.json");