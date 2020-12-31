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

            $historyUserDB = file_exists(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}/db_{$entity}.json") ? file_get_contents(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}/db_{$entity}.json") : -1;

            /**
             * Check if have new data
             * if have, send it to front
             */
            if ($hist[$entity] != $historyUserDB) {
                foreach (array_reverse(\Helpers\Helper::listFolder(PATH_HOME . "_cdn/update/{$entity}")) as $upId) {
                    if ($upId === $historyUserDB . ".json")
                        break;

                    $content = json_decode(file_get_contents(PATH_HOME . "_cdn/update/{$entity}/{$upId}"), !0);
                    if (!empty($content['id'])) {
                        if ($content['db_action'] === "delete")
                            $resultDb[$entity][$content['id']] = $content['id'];
                        elseif (!isset($resultDb[$entity][$content['id']]))
                            $resultDb[$entity][$content['id']] = \Entity\Entity::exeRead($entity, $content['id'])[0];
                    }
                }

                if (!empty($resultDb[$entity]))
                    $resultDb[$entity] = array_values($resultDb[$entity]);

                $resultDbHistory[$entity] = $hist[$entity];
            }
        }
    }
}