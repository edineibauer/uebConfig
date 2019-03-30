<?php
$autosync = filter_input(INPUT_POST, 'autosync', FILTER_VALIDATE_BOOLEAN);
$limitoffline = filter_input(INPUT_POST, 'limitoffline', FILTER_DEFAULT);
$conf = json_decode(file_get_contents(PATH_HOME . "_config/config.json"), true);

$conf['autosync'] = $autosync ? 1 : 0;
$conf['limitoffline'] = $limitoffline;

\Config\Config::createConfig($conf);

$data['data'] = 1;