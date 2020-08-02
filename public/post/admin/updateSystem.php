<?php
/**
 * Update the class UpdateSystem, then execute
 */
unlink(PATH_HOME . VENDOR . "config/public/src/Config/UpdateSystem.php");
copy(PATH_HOME . "vendor/ueb/config/public/src/Config/UpdateSystem.php", PATH_HOME . VENDOR . "config/public/src/Config/UpdateSystem.php");
new \Config\UpdateSystem();

$data['data'] = !0;