<?php

$graficos = [];

if(file_exists(PATH_HOME . "_config/graficos.json"))
    $graficos = array_reverse(json_decode(file_get_contents(PATH_HOME . "_config/graficos.json"), !0));

$data['data'] = $graficos;