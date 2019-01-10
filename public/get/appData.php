<?php

$setor = empty($_SESSION['userlogin']['setor']) ? 0 : $_SESSION['userlogin']['setor'];
$read = new \Conn\Read();
$entidadesAllow = \Config\Config::getPermission();
$data['data'] = [];

foreach (\Helpers\Helper::listFolder(PATH_HOME . "entity/cache") as $entityFile) {
    $entity = str_replace('.json', '', $entityFile);
    if(preg_match('/.json$/i', $entityFile) && $entidadesAllow[$setor][$entity]['read']){
        //Verifica se é multitenancy, se for, adiciona cláusula para buscar somente os dados referentes ao usuário
        $info = \Entity\Metadados::getInfo($entity);
        $where = null;
        if(!empty($info['autor']) && $info['autor'] === 2)
            $where = "WHERE ownerpub = " . $_SESSION['userlogin']['id'] . " ";

        $read->exeRead($entity, $where);
        $data['data'][$entity] = $read->getResult();
    }
}