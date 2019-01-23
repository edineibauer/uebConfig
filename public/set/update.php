<?php
if(filter_input(INPUT_POST, 'update', FILTER_VALIDATE_BOOLEAN))
    \Config\Config::updateSite();

$data['data'] = file_get_contents(PATH_HOME . '_config/updates/update.txt');