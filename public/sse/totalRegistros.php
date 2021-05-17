<?php

use Config\Config;
use Helpers\Helper;

$list = [];
$data['data'] = [];
$setor = Config::getSetor();
$permissoes = Config::getPermission($setor);
$sql = new \Conn\SqlCommand();

//read all dicionarios
foreach (Helper::listFolder(PATH_HOME . "entity/cache") as $entity) {
    if (!in_array($entity, ["info", "api_chave.json", "login_attempt.json", "usuarios_token.json"]) && substr($entity, -4, 4) === "json") {

        $entidade = substr($entity, 0, -5);

        /**
         * If is admin, or if not have permissions information, or if have read permission to my setor
         */
        if ($setor === "admin" || empty($permissoes[$entidade]) || (isset($permissoes[$entidade]['read']) && $permissoes[$entidade]['read'])) {
            $sql->exeCommand("SELECT COUNT(*) as total FROM " . PRE . $entidade);
            $data['data'][$entidade] = (int) ($sql->getResult() ? $sql->getResult()[0]['total'] : 0);
        }
    }
}

$_SESSION['db'] = array_keys($data['data']);
$_SESSION['sseAction'] = ["create", "delete"];