<?php
$dic = Entity\Entity::dicionario();

//convert dicionário para referenciar colunas e não ids
$info = [];
foreach ($dic as $entity => $metas)
   $info[$entity] = \Entity\Metadados::getInfo($entity);

$data['data'] = $info;