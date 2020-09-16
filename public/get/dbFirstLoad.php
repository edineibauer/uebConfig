<?php

$data['data'] = [];

/**
 * Clear the user DB last historic ID, so
 * now we can get the new content
 */
foreach (\Helpers\Helper::listFolder(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}") as $item)
    unlink(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}/{$item}");

foreach (\Helpers\Helper::listFolder(PATH_HOME . "entity/cache") as $item) {
    if (pathinfo($item, PATHINFO_EXTENSION) === "json") {

        /**
         * For each entity on project
         */
        $entity = str_replace(".json", "", $item);

        /**
         * If the user have permissions to read the data entity
         */
        if (\Config\Config::haveEntityPermission($entity, ["read"])) {
            $data['data'][$entity] = \Entity\Entity::exeRead($entity);

            $json = new \Entity\Json();
            $hist = $json->get("historic");

            /**
             * save info that says to front that the data entity is send to front right now
             */
            \Helpers\Helper::createFolderIfNoExist(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}");
            $f = fopen(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}/db_{$entity}.json", "w");
            fwrite($f, $hist[$entity]);
            fclose($f);
        }
    }
}