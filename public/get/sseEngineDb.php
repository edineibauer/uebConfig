<?php

use Entity\Json;

/**
 * Check if have new data
 * if have, send it to front
 */
foreach (\Helpers\Helper::listFolder(PATH_HOME . "entity/cache") as $item) {
    if (pathinfo($item, PATHINFO_EXTENSION) === "json") {
        $entity = str_replace(".json", "", $item);

        if (\Config\Config::haveEntityPermission($entity, ["read"])) {

            $json = new Json();
            $hist = $json->get("historic");

            /**
             * Caso não haja o ID da última alteração nessa entidade, então cria o ID de alteração
             */
            if (empty($hist[$entity])) {
                $hist[$entity] = strtotime('now') . "-" . rand(1000000, 9999999);
                $json->save("historic", $hist);
            }

            /**
             * Check if have new data
             * if have, send it to front
             */
            if (file_exists(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}/db_{$entity}.json") && $hist[$entity] !== file_get_contents(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}/db_{$entity}.json")) {
                $resultDbHistory[$entity] = $hist[$entity];
                $resultDb[$entity] = \Entity\Entity::exeRead($entity);
            }
        }
    }
}