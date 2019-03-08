<?php
$setor = !empty($_SESSION['userlogin']) ? (!empty($_SESSION['userlogin']['setor']['entity']) ? $_SESSION['userlogin']['setor']['entity'] : "admin") : 0;
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