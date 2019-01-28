<?php
$setor = empty($_SESSION['userlogin']['setor']) ? 0 : (int)$_SESSION['userlogin']['setor'];
$entityNot = \Config\Config::getEntityNotAllow()[$setor];

//convert dicionário para referenciar colunas e não ids
$dicionario = [];
$dicionarioOrdenado = [];
foreach (Entity\Entity::dicionario() as $entity => $metas) {
    $indice = 99999;
    foreach ($metas as $i => $meta) {
        if ($meta['key'] !== "identifier" && !in_array($entity, $entityNot)) {
            $meta['id'] = $i;
            $dicionario[$entity][$meta['indice'] ?? $indice++] = $meta;
        }
    }

    if (!empty($dicionario[$entity])) {
        ksort($dicionario[$entity]);
        foreach ($dicionario[$entity] as $i => $meta)
            $dicionarioOrdenado[$entity][$meta['column']] = $meta;
    }
}

$data['data'] = $dicionarioOrdenado;