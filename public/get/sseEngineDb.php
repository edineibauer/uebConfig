<?php

use \Entity\Metadados;
use \Conn\SqlCommand;
use \Entity\Json;

\Helpers\Helper::createFolderIfNoExist(PATH_HOME . "_cdn/userTotalRegisterDB");
\Helpers\Helper::createFolderIfNoExist(PATH_HOME . "_cdn/userTotalRegisterDB/{$_SESSION['userlogin']['id']}");

/**
 * Check if have new data
 * if have, send it to front
 */
foreach (\Helpers\Helper::listFolder(PATH_HOME . "entity/cache") as $item) {
    if (pathinfo($item, PATHINFO_EXTENSION) === "json") {
        $entity = str_replace(".json", "", $item);
        if(\Config\Config::haveEntityPermission($entity, ["read"])) {

            $json = new Json();
            $hist = $json->get("historic");

            /**
             * Caso não haja o ID da última alteração nessa entidade, então cria o ID de alteração
             */
            if (empty($hist[$entity])) {
                $hist[$entity] = strtotime('now') . "-" . rand(1000000, 9999999);
                $json->save("historic", $hist);
            }

            $historyUserDB = (file_exists(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}/{$entity}.json") ? file_get_contents(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}/{$entity}.json") : 0);

            /**
             * Check if have new data
             * if have, send it to front
             */
            if ($hist[$entity] !== $historyUserDB) {

                $resultDbHistory[$entity] = $hist[$entity];
                $info = Metadados::getInfo($entity);

                if (!isset($dicionarios[$entity]))
                    $dicionarios[$entity] = Metadados::getDicionario($entity);

                /**
                 * Select the entity
                 */
                $selects = "";
                if (!empty($info['columns_readable'])) {
                    foreach ($info['columns_readable'] as $column)
                        $selects .= ($selects === "" ? "" : ", ") . "e.{$column}";
                }

                /**
                 * Read the entity
                 */
                $command = "FROM " . PRE . $entity . " as e";

                /**
                 * Include the data from each relation
                 */
                $relations = [];
                if (!empty($info['relation'])) {
                    foreach ($info['relation'] as $relationItem) {
                        $relationEntity = $dicionarios[$entity][$relationItem]['relation'];
                        $relations[$relationEntity] = $dicionarios[$entity][$relationItem]['column'];
                        $inf = Metadados::getInfo($relationEntity);
                        if (!isset($dicionarios[$relationEntity]))
                            $dicionarios[$relationEntity] = Metadados::getDicionario($relationEntity);

                        if (!empty($inf['columns_readable'])) {
                            foreach ($inf['columns_readable'] as $column)
                                $selects .= ", data_" . $dicionarios[$entity][$relationItem]['relation'] . ".{$column} as {$dicionarios[$entity][$relationItem]['relation']}___{$column}";
                        }
                        $command .= " LEFT JOIN " . PRE . $dicionarios[$entity][$relationItem]['relation'] . " as data_" . $dicionarios[$entity][$relationItem]['relation'] . " ON data_" . $dicionarios[$entity][$relationItem]['relation'] . ".id = e." . $dicionarios[$entity][$relationItem]['column'];
                    }
                }

                /**
                 * Set the limit result to return to front
                 */
                $command = "SELECT " . $selects . " {$command} ORDER BY id DESC";

                /**
                 * Execute the read command
                 */
                $sql = new SqlCommand();
                $sql->exeCommand($command);

                /**
                 * Convert join values into a array of relation data
                 * Convert json values into array
                 */
                if (empty($sql->getErro())) {
                    $resultDb[$entity] = [];
                    if (!empty($sql->getResult())) {
                        foreach ($sql->getResult() as $i => $register) {
                            if($i >= LIMITOFFLINE)
                                break;

                            /**
                             * Work on a variable with the data of relationData
                             */
                            $relationData = [];

                            /**
                             * Decode all json on base register
                             */
                            foreach ($dicionarios[$entity] as $meta) {
                                if ($meta['type'] === "json" && !empty($register[$meta['column']]))
                                    $register[$meta['column']] = json_decode($register[$meta['column']], !0);
                            }

                            /**
                             * If have relation data together in the base register
                             */
                            if (!empty($relations)) {
                                foreach ($register as $column => $value) {
                                    foreach ($relations as $relation => $RelationColumn) {
                                        if (strpos($column, $relation . '___') !== false) {

                                            /**
                                             * Add item to a relation register
                                             */
                                            $columnRelationName = str_replace($relation . "___", "", $column);
                                            $relationData[$RelationColumn][$columnRelationName] = $value;

                                            /**
                                             * Remove item from base register
                                             */
                                            unset($register[$column]);
                                        }
                                    }
                                }

                                /**
                                 * After separate the base data from the relation data
                                 * check if the relation data have a ID an decode json
                                 */
                                foreach ($relations as $relation => $RelationColumn) {

                                    /**
                                     * Check if the struct of relation data received have a ID
                                     * if not, so delete
                                     */
                                    if (empty($relationData[$RelationColumn]['id'])) {
                                        unset($relationData[$RelationColumn]);

                                    } else {

                                        /**
                                         * Decode all json on base relation register
                                         */
                                        foreach ($dicionarios[$relation] as $meta) {
                                            if ($meta['type'] === "json" && !empty($relationData[$RelationColumn][$meta['column']]))
                                                $relationData[$RelationColumn][$meta['column']] = json_decode($relationData[$RelationColumn][$meta['column']], !0);
                                        }
                                    }
                                }
                            }

                            $register["relationData"] = $relationData;
                            $resultDb[$entity][] = $register;
                        }
                    }
                }
            }
        }
    }
}