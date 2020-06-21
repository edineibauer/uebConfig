<?php
$pass = \Helpers\Check::password(filter_input(INPUT_POST, 'pass', FILTER_DEFAULT));

$read = new \Conn\Read();
$read->exeRead("usuarios", "WHERE nome = 'Admin' AND status = 1 AND password = '{$pass}'");
if($read->getResult()) {

    /**
     * Update the class UpdateSystem, then execute
     */
    unlink(PATH_HOME . VENDOR . "config/public/src/Config/UpdateSystem.php");
    copy(PATH_HOME . "vendor/ueb/config/public/src/Config/UpdateSystem.php", PATH_HOME . VENDOR . "config/public/src/Config/UpdateSystem.php");
    new \Config\UpdateSystem();
}

$data['data'] = $read->getResult()? !0 : !1;