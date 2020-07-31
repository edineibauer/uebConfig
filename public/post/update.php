<?php
if(filter_input(INPUT_POST, 'update', FILTER_VALIDATE_BOOLEAN))
    \Config\Config::updateSite();

$data['data'] = (float) json_decode(file_get_contents(PATH_HOME . '_config/config.json'), !0)['version'];