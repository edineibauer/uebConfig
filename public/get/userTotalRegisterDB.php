<?php

use Helpers\Helper;

$data['data'] = [];
foreach (Helper::listFolder(PATH_HOME . "entity/cache") as $entity) {
    $entidade = str_replace(".json", "", $entity);
    if(preg_match("/.json$/i", $entity) && \Config\Config::haveEntityPermissionRead($entidade)) {
        $read = new \Conn\Read();
        $read->setSelect("COUNT(id) as total");
        $read->exeRead($entidade);
        $data['data'][$entidade] = $read->getResult()[0]['total'];
    }
}