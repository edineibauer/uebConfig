<?php

use Config\Config;
use Helpers\Helper;

$list = [];
$data['data'] = [];
$setor = Config::getSetor();
$permissoes = Config::getPermission($setor);

//read all dicionarios
foreach (Helper::listFolder(PATH_HOME . "entity/cache") as $entity) {
    if ($entity !== "info" && substr($entity, -4, 4) === "json") {

        $entidade = substr($entity, 0, -5);

        /**
         * If is admin, or if not have permissions information, or if have read permission to my setor
         */
        if ($setor === "admin" || empty($permissoes[$entidade]) || (isset($permissoes[$entidade]['read']) && $permissoes[$entidade]['read']))
            $list[] = PRE . $entidade;
    }
}

$sql = new \Conn\SqlCommand();
$sql->exeCommand("SELECT TABLE_NAME, TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '" . DATABASE . "' AND TABLE_NAME IN ('" . implode("', '", $list) . "')");
if($sql->getResult()) {
    $tt = strlen(PRE);
    foreach ($sql->getResult() as $item)
        $data['data'][substr($item['TABLE_NAME'], $tt)] = (int) $item['TABLE_ROWS'];
}

$_SESSION['db'] = array_keys($data['data']);
$_SESSION['sseAction'] = ["create", "delete"];