<?php

use \Entity\Metadados;
use \Conn\SqlCommand;
use \Entity\Json;

/**
 * Check if have new data
 * if have, send it to front
 */
foreach (\Helpers\Helper::listFolder(PATH_HOME . "entity/cache") as $item) {
    if (pathinfo($item, PATHINFO_EXTENSION) === "json") {
        $entity = str_replace(".json", "", $item);

        if (!isset($dicionarios[$entity]))
            $dicionarios[$entity] = Metadados::getDicionario($entity);

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
            $dicionario = Metadados::getDicionario($entity);

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
                foreach ($info['relation'] as $item) {
                    $relationEntity = $dicionarios[$entity][$item]['relation'];
                    $relations[$relationEntity] = ['countString' => strlen($relationEntity . "___"), "column" => $dicionarios[$entity][$item]['column']];
                    $inf = Metadados::getInfo($relationEntity);
                    if (!isset($dicionarios[$relationEntity]))
                        $dicionarios[$relationEntity] = Metadados::getDicionario($relationEntity);

                    if (!empty($inf['columns_readable'])) {
                        foreach ($inf['columns_readable'] as $column)
                            $selects .= ", data_" . $dicionarios[$entity][$item]['relation'] . ".{$column} as {$dicionarios[$entity][$item]['relation']}___{$column}";
                    }
                    $command .= " LEFT JOIN " . PRE . $dicionarios[$entity][$item]['relation'] . " as data_" . $dicionarios[$entity][$item]['relation'] . " ON data_" . $dicionarios[$entity][$item]['relation'] . ".id = e." . $dicionarios[$entity][$item]['column'];
                }
            }

            /**
             * Set the limit result to return to front
             */
            $command = "SELECT " . $selects . " {$command} LIMIT " . LIMITOFFLINE;

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
                if (!empty($relations) && !empty($sql->getResult())) {
                    foreach ($sql->getResult() as $item) {
                        $item["relationData"] = [];
                        $relationData = [];

                        foreach ($item as $column => $value) {
                            foreach ($relations as $relation => $dados) {
                                if (substr($column, 0, $dados['countString']) === $relation . "___") {
                                    $columnRelationName = str_replace($relation . "___", "", $column);
                                    foreach ($dicionarios[$relation] as $meta) {
                                        if($meta['column'] === $columnRelationName) {
                                            if($meta['type'] === "json")
                                                $value = json_decode($value, !0);
                                            break;
                                        }
                                    }
                                    $relationData[$dados['column']][$columnRelationName] = $value;
                                    unset($item[$column]);
                                }
                            }

                            if(!empty($relationData[$dados['column']]['id'])) {
                                foreach ($dicionarios[$entity] as $meta) {
                                    if($meta['column'] === $column) {
                                        if($meta['type'] === "json")
                                            $item[$column] = json_decode($value, !0);
                                        break;
                                    }
                                }
                            } else {
                                unset($relationData[$dados['column']]);
                            }
                        }
                        $item["relationData"] = $relationData;
                        $resultDb[$entity][] = $item;
                    }
                }
            }
        }
    }
}