<?php

use Helpers\Check;
use \Helpers\Helper;
use \Conn\SqlCommand;

$entity = str_replace('-', '_', Check::name(strip_tags(trim(filter_input(INPUT_POST, "entidade", FILTER_DEFAULT)))));

/**
 *  Remove Campos de Entidades que usam esta entidade como relacionamento
 * @param string $user
 * @param string $entity
 */
function entityRelationRemove(string $user, string $entity)
{
    foreach (Helper::listFolder(PATH_HOME . "entity/{$user}") as $f) {
        if ($f !== "info" && preg_match('/\.json$/i', $f)) {

            $infoCC = json_decode(file_get_contents(PATH_HOME . "entity/{$user}/info/{$f}"), !0);
            $cc = json_decode(file_get_contents(PATH_HOME . "entity/{$user}/{$f}"), !0);

            $rew = !1;
            foreach ($cc as $i => $c) {
                if ($c['relation'] === $entity) {
                    $rew = !0;

                    if (!empty($infoCC[$c['format']]) && is_array($infoCC[$c['format']]) && $key = ((array_search($i, $infoCC[$c['format']])) !== false))
                        unset($infoCC[$c['format']][$key]);

                    //Remove from entity file
                    unset($cc[$i]);
                }
            }

            if ($rew) {
                $file = fopen(PATH_HOME . "entity/{$user}/{$f}", "w");
                fwrite($file, json_encode($cc));
                fclose($file);

                $file = fopen(PATH_HOME . "entity/{$user}/info/{$f}", "w");
                fwrite($file, json_encode($infoCC));
                fclose($file);
            }
        }
    }
}

/**
 *  Exclui Arquivos Metadados
 * @param string $user
 * @param string $entity
 */
function entityRemove(string $user, string $entity)
{
    if (file_exists(PATH_HOME . "entity/{$user}/" . $entity . ".json"))
        unlink(PATH_HOME . "entity/{$user}/" . $entity . ".json");

    if (file_exists(PATH_HOME . "entity/{$user}/info/" . $entity . ".json"))
        unlink(PATH_HOME . "entity/{$user}/info/" . $entity . ".json");
}

/**
 *  Obtém lista de usuários
 */
$users = ['cache'];
foreach (Helper::listFolder(PATH_HOME . "entity/cache/info") as $info) {
    if (preg_match("/\.json$/i", $info)) {
        $infoContent = json_decode(file_get_contents(PATH_HOME . "entity/cache/info/{$info}"), !0);
        if (!empty($infoContent['user']) && $infoContent['user'] === 1)
            $users[] = str_replace(".json", "", $info);
    }
}

foreach ($users as $user) {
    entityRelationRemove($user, $entity);
    entityRemove($user, $entity);
}

/**
 *  Exclui Banco de Dados
 */
$sql = new SqlCommand();
$sql->exeCommand("DROP TABLE " . PRE . $entity);


$data['data'] = 1;