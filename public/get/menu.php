<?php

/**
 * @param string $dir
 * @return bool
 */
function checkFolder(string $dir): bool
{
    if (file_exists($dir)) {
        require_once $dir;
        return true;
    }
    return false;
}

$inc = false;
$setor = !empty($_SESSION['userlogin']) ? $_SESSION['userlogin']['setor'] : "0";

//Menu Personalizado
$inc = !empty($setor) && checkFolder(PATH_HOME . "public/dash/{$setor}/menu.php");
if (!$inc) {
    foreach (\Helpers\Helper::listFolder(PATH_HOME . VENDOR) as $lib) {
        if (!$inc)
            $inc = !empty($setor) && checkFolder(PATH_HOME . VENDOR . "{$lib}/public/dash/{$setor}/menu.php");
    }

    if (!$inc) {
        //Menu Personalizado Genérico
        $inc = checkFolder(PATH_HOME . "public/dash/menu.php");
        if (!$inc) {
            foreach (\Helpers\Helper::listFolder(PATH_HOME . VENDOR) as $lib) {
                if (!$inc)
                    $inc = checkFolder(PATH_HOME . VENDOR . "{$lib}/public/dash/menu.php");
            }

            //Menu Entity Genérico
            if (!$inc) {
                $menu = new \Config\Menu();
                $data['data'] = $menu->getMenu();
            }
        }
    }
}