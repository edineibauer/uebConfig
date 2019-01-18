<?php
$dic = Entity\Entity::dicionario();

//convert dicionário para referenciar colunas e não ids
$dicionario = [];
$dicionarioOrdenado = [];
foreach ($dic as $entity => $metas) {
    $indice = 99999;
    foreach ($metas as $i => $meta) {
        if($meta['key'] !== "identifier") {
            $meta['id'] = $i;
            $dicionario[$entity][$meta['indice'] ?? $indice++] = $meta;
        }
    }
    ksort($dicionario[$entity]);
    foreach ($dicionario[$entity] as $i => $meta)
        $dicionarioOrdenado[$entity][$meta['column']] = $meta;
}

$data['data'] = $dicionarioOrdenado;