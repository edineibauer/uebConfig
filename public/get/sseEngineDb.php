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
                 * System id relation
                 */
                if (!empty($info['system'])) {

                    if (!isset($dicionarios[$info['system']]))
                        $dicionarios[$info['system']] = Metadados::getDicionario($info['system']);

                    $infSystem = Metadados::getInfo($info['system']);
                    if (!empty($infSystem['columns_readable'])) {
                        foreach ($infSystem['columns_readable'] as $column)
                            $selects .= ", system_" . $info['system'] . ".{$column} as {$info['system']}___{$column}";
                    }

                    $command .= " LEFT JOIN " . PRE . $info['system'] . " as system_" . $info['system'] . " ON system_" . $info['system'] . ".id = e.system_id";
                }

                /**
                 * Autorpub and Ownerpub id relation
                 */
                if (!empty($info['autor'])) {

                    if (!isset($dicionarios["usuarios"]))
                        $dicionarios["usuarios"] = Metadados::getDicionario("usuarios");

                    $infAutor = Metadados::getInfo("usuarios");
                    if (!empty($infAutor['columns_readable'])) {
                        foreach ($infAutor['columns_readable'] as $column)
                            $selects .= ", autor_user.{$column} as autor_user___{$column}";
                    }

                    $command .= " LEFT JOIN " . PRE . "usuarios as autor_user ON autor_user.id = e." . ($info['autor'] == 1 ? "autorpub" : "ownerpub");
                }

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
                            if ($i >= LIMITOFFLINE)
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
                             * Foreach register, check if have relationData to split
                             */
                            foreach ($register as $column => $value) {

                                /**
                                 * Check System ID relation
                                 */
                                if (!empty($info['system']) && strpos($column, $info['system'] . '___') !== false) {

                                    /**
                                     * Add item to a relation register system_id
                                     */
                                    $relationData["system_id"][str_replace($info['system'] . "___", "", $column)] = $value;

                                    /**
                                     * Remove item from base register
                                     */
                                    unset($register[$column]);
                                }

                                /**
                                 * Autorpub and Ownerpub id relation
                                 */
                                if (!empty($info['autor']) && strpos($column, 'autor_user___') !== false) {

                                    /**
                                     * Add item to a relation register
                                     */
                                    $relationData["usuarios"][str_replace("autor_user___", "", $column)] = $value;

                                    /**
                                     * Remove item from base register
                                     */
                                    unset($register[$column]);
                                }

                                /**
                                 * If have relation data together in the base register
                                 */
                                if (!empty($relations)) {
                                    foreach ($relations as $relation => $RelationColumn) {
                                        if (strpos($column, $relation . '___') !== false) {

                                            /**
                                             * Add item to a relation register
                                             */
                                            $relationData[$RelationColumn][str_replace($relation . "___", "", $column)] = $value;

                                            /**
                                             * Remove item from base register
                                             */
                                            unset($register[$column]);
                                        }
                                    }
                                }
                            }

                            if(!empty($info['system'])) {
                                /**
                                 * Check if the struct of relation data received have a ID
                                 * if not, so delete
                                 */
                                if (empty($relationData["system_id"]['id'])) {
                                    unset($relationData["system_id"]);

                                } else {

                                    /**
                                     * Decode all json on base relation register
                                     */
                                    foreach ($dicionarios[$info['system']] as $meta) {
                                        if ($meta['type'] === "json" && !empty($relationData["system_id"][$meta['column']]))
                                            $relationData["system_id"][$meta['column']] = json_decode($relationData["system_id"][$meta['column']], !0);
                                    }
                                }
                            }

                            if(!empty($info['autor'])) {
                                /**
                                 * Check if the struct of relation data received have a ID
                                 * if not, so delete
                                 */
                                if (empty($relationData["usuarios"]['id'])) {
                                    unset($relationData["usuarios"]);

                                } else {

                                    /**
                                     * Decode all json on base relation register
                                     */
                                    foreach ($dicionarios["usuarios"] as $meta) {
                                        if ($meta['type'] === "json" && !empty($relationData["usuarios"][$meta['column']]))
                                            $relationData["usuarios"][$meta['column']] = json_decode($relationData["usuarios"][$meta['column']], !0);
                                    }

                                    $relationData[$info['autor'] == 1 ? "autorpub" : "ownerpub"] = $relationData["usuarios"];
                                    unset($relationData["usuarios"]);
                                }
                            }

                            /**
                             * After separate the base data from the relation data
                             * check if the relation data have a ID an decode json
                             */
                            if (!empty($relations)) {
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