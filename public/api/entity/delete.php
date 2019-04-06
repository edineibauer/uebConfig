<?php

use Helpers\Check;
use \Helpers\Helper;
use \Conn\SqlCommand;

$entity = str_replace('-', '_', Check::name(strip_tags(trim(filter_input(INPUT_POST, "entidade", FILTER_DEFAULT)))));

/**
 *  Remove Campos de Entidades que usam esta entidade como relacionamento
 */
foreach (Helper::listFolder(PATH_HOME . "entity/cache") as $f) {
    if ($f !== "info" && preg_match('/\.json$/i', $f)) {

        $infoCC = json_decode(file_get_contents(PATH_HOME . "entity/cache/info/{$f}"), !0);
        $cc = json_decode(file_get_contents(PATH_HOME . "entity/cache/{$f}"), !0);

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
            $file = fopen(PATH_HOME . "entity/cache/{$f}", "w");
            fwrite($file, json_encode($cc));
            fclose($file);

            $file = fopen(PATH_HOME . "entity/cache/info/{$f}", "w");
            fwrite($file, json_encode($infoCC));
            fclose($file);
        }
    }
}

/**
 *  Exclui Arquivos Metadados
 */

if (file_exists(PATH_HOME . "entity/cache/" . $entity . ".json"))
    unlink(PATH_HOME . "entity/cache/" . $entity . ".json");

if (file_exists(PATH_HOME . "entity/cache/info/" . $entity . ".json"))
    unlink(PATH_HOME . "entity/cache/info/" . $entity . ".json");

/**
 *  Exclui Banco de Dados
 */
$sql = new SqlCommand();
$sql->exeCommand("DROP TABLE " . PRE . $entity);

$data['data'] = 1;