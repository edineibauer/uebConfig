<?php
if(!empty($route->getVar())) {
    $force = $route->getVar()[0];
    if ($force === "force" && file_exists(PATH_HOME . "_config/updates/version.txt"))
        unlink(PATH_HOME . "_config/updates/version.txt");
}

$up = new \Config\UpdateSystem();

$data['response'] = 3;
$data['data'] = HOME;
