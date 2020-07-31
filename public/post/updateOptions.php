<?php
$conf = json_decode(file_get_contents(PATH_HOME . "_config/config.json"), true);
$conf['homepage'] = filter_input(INPUT_POST, 'homepage', FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
$conf['serviceworker'] = filter_input(INPUT_POST, 'serviceworker', FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
$conf['dev'] = filter_input(INPUT_POST, 'dev', FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
$conf['limitoffline'] = filter_input(INPUT_POST, 'limitoffline', FILTER_DEFAULT);

\Config\Config::createConfig($conf);

$data['data'] = 1;