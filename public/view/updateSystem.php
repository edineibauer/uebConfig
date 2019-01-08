<?php
if(!empty($link->getVariaveis())) {
    $force = $link->getVariaveis()[0];
    if ($force === "force" && file_exists(PATH_HOME . "_config/updates/version.txt"))
        unlink(PATH_HOME . "_config/updates/version.txt");
}

$up = new \Config\UpdateSystem();

$data['response'] = 3;
$data['data'] = HOME;
