<?php
/**
 * Check if have new data
 * if have, send it to front
 */
$data['data'] = [];

/**
 * First clear the user DB last historic ID, so
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

            /**
             * Get last historic ID
             */
            $json = new \Entity\Json();
            $hist = $json->get("historic");

            /**
             * If not have historic ID, so
             * create a new One
             */
            if (empty($hist[$entity])) {
                $hist[$entity] = strtotime('now') . "-" . rand(1000000, 9999999);
                $json->save("historic", $hist);
            }

            /**
             * Check if have new data
             * if have, send it to front
             */
            $data['data'][$entity] = \Entity\Entity::exeRead($entity);

            /**
             * save info that says to front that the data entity is send to front right now
             */
            $f = fopen(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}/{$entity}.json", "w");
            fwrite($f, $hist[$entity]);
            fclose($f);
        }
    }
}