<?php
$dic = Entity\Entity::dicionario();

//convert dicionário para referenciar colunas e não ids
$data['data'] = [];
if(!empty($dic)) {
    foreach ($dic as $entity => $metas)
        $data['data'][$entity] = \Entity\Metadados::getInfo($entity);
}