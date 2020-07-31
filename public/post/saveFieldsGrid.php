<?php

$type = filter_input(INPUT_POST, 'type', FILTER_DEFAULT);
$entity = filter_input(INPUT_POST, 'entity', FILTER_DEFAULT);
$fieldsn = array_filter(filter_input(INPUT_POST, 'fields', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY));
$fields = [];
foreach ($fieldsn as $item)
    $fields[] = $item;

\Helpers\Helper::createFolderIfNoExist(PATH_HOME . "_cdn/fieldsCustom");
\Helpers\Helper::createFolderIfNoExist(PATH_HOME . "_cdn/fieldsCustom/{$entity}");
\Helpers\Helper::createFolderIfNoExist(PATH_HOME . "_cdn/fieldsCustom/{$entity}/{$type}");

$f = fopen(PATH_HOME . "_cdn/fieldsCustom/{$entity}/{$type}/" . $_SESSION['userlogin']['id'] . ".json", "w+");
fwrite($f, json_encode($fields));
fclose($f);