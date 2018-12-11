<?php

$read = new \ConnCrud\Read();
$entidadesAllow = \Config\Config::getPermissoes((int) $_SESSION['userlogin']['setor']);
$data['data'] = [];

foreach (\Helpers\Helper::listFolder(PATH_HOME . "entity/cache") as $entityFile) {
    $entity = str_replace('.json', '', $entityFile);
    if(preg_match('/.json$/i', $entityFile) && in_array($entity, $entidadesAllow['read'])){
        $read->exeRead($entity, "ORDER BY id DESC");
        $data['data'][$entity] = $read->getResult();
    }
}