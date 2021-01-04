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

            /**
             * Caso não haja o ID da última alteração nessa entidade, então cria o ID de alteração
             */
            $json = new Json();
            $hist = $json->get("historic");
            if (empty($hist[$entity])) {
                $hist[$entity] = strtotime('now') . "-" . rand(1000000, 9999999);
                $json->save("historic", $hist);
            }

            $resultDb[$entity] = !1;
            $resultDbHistory[$entity] = $hist[$entity];

            /**
             * Check if have new data
             * if have, send it to front
             */
            $dirPathCacheDB = PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}/db_{$entity}.json";
            if (file_exists($dirPathCacheDB))
                $resultDb[$entity] = file_get_contents($dirPathCacheDB) !== $hist[$entity];
        }
    }
}