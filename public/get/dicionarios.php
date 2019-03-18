<?php
$setor = !empty($_SESSION['userlogin']) ? $_SESSION['userlogin']['setor'] : "0";

//convert dicionário para referenciar colunas e não ids
$dicionario = [];
$dicionarioOrdenado = [];
foreach (Entity\Entity::dicionario() as $entity => $metas) {
    $indice = 99999;
    foreach ($metas as $i => $meta) {
        if ($meta['key'] !== "identifier") {
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