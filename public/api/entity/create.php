<?php

use Helpers\Check;
use Helpers\Helper;
use \EntityUi\SaveEntity;

$entity = str_replace('-', '_', Check::name(strip_tags(trim(filter_input(INPUT_POST, "entidade", FILTER_DEFAULT)))));
$icone = strip_tags(trim(filter_input(INPUT_POST, "icone", FILTER_DEFAULT)));
$autoridade = strip_tags(trim(filter_input(INPUT_POST, "autoridade", FILTER_VALIDATE_INT)));
$tipo = strip_tags(trim(filter_input(INPUT_POST, "tipo", FILTER_VALIDATE_INT)));
$campos = strip_tags(trim(filter_input(INPUT_POST, "campos", FILTER_DEFAULT)));
$entityOld = strip_tags(trim(filter_input(INPUT_POST, "entidadeOld", FILTER_DEFAULT)));
$autoridadeOld = strip_tags(trim(filter_input(INPUT_POST, "autoridadeOld", FILTER_VALIDATE_INT)));
$tipoOld = strip_tags(trim(filter_input(INPUT_POST, "tipoOld", FILTER_VALIDATE_INT)));
//autoridade (1 autor, 2 multitenancy)
//tipo (1 entidade, 2 usuario, 3 grupo)

if (!empty($entity) && !empty($campos) && Check::isJson($campos)) {

    function convertCampos(string $campos)
    {
        $result = [];
        $i = 0;
        $defaults = json_decode(file_get_contents(PATH_HOME . VENDOR . "entity-ui/public/entity/input_type.json"), !0);
        foreach (json_decode($campos, !0) as $item) {
            $convertido = [
                "nome"  => $item["coluna"],
                "column"  => Check::name($item["coluna"]),
                "minimo"  => $item['propriedades']["min"],
                "size"  => $item['propriedades']["max"],
                "unique"  => $item['propriedades']["unico"],
                "default"  => $item['propriedades']["valor_padrao"],
                "update"  => $item['propriedades']["atualizar"],
                "relation"  => $item["entidade_relacional"],
                "allow" => [
                    "regexp"  => $item['propriedades']["expressao_regular"],
                    "options"  => $item['propriedades']["opcoes_de_entrada"]
                ],
                "form" => [
                    "cols"  => $item['propriedades']["largura_do_campo"],
                    "colm"  => $item['propriedades']["tablet"],
                    "coll"  => $item['propriedades']["desktop"],
                    "orientation"  => $item['propriedades']["orientacao_das_opcoes"],
                    "class"  => $item['propriedades']["class"],
                    "style"  => $item['propriedades']["style"],
                    "template"  => $item['propriedades']["template"],
                    "atributos"  => $item['propriedades']["atributos"],
                    "type" => "text"
                ],
                "datagrid" => [
                    "grid_relevant"  => $item['propriedades']["posicionamento"],
                    "grid_class"  => $item['propriedades']["class_listagem"],
                    "grid_style"  => $item['propriedades']["style_listagem"],
                    "grid_template" => $item['propriedades']["template_listagem"],
                ],
                "indice" => $i,
                "id" => $item['id']
            ];
            $tipo = $item['tipo_do_campo'] === "1" ? $item['generico'] : ($item['tipo_do_campo'] === "2" ? $item['semantico'] : ($item['tipo_do_campo'] === "3" ? $item['relacionamento'] : $item['tipo_do_campo']));
            $base = Helper::arrayMerge($defaults['default'], $defaults[$tipo]);
            $result[$item['id']] = Helper::arrayMerge($base, $convertido);
            $i++;
        }

        return $result;
    }

    $save = new SaveEntity($entity, $icone, (int) $tipo, (int) $autoridade, convertCampos($campos));

    /**
     *  Verifica se precisa atualizar nome da entidade
     */
    $entity = str_replace("-", "_", Check::name($entity));
    $entityOld = str_replace("-", "_", Check::name($entityOld));
    if (!empty($entityOld) && $entityOld !== $entity) {

        //Table Rename
        $sql = new \Conn\SqlCommand();
        $sql->exeCommand("RENAME TABLE  `" . PRE . "{$entityOld}` TO  `" . PRE . "{$entity}`");

        //Entity Rename
        rename(PATH_HOME . "entity/cache/{$entityOld}.json", PATH_HOME . "entity/cache/{$entity}.json");
        rename(PATH_HOME . "entity/cache/info/{$entityOld}.json", PATH_HOME . "entity/cache/info/{$entity}.json");

        //Entity change name in others relations
        foreach (Helper::listFolder(PATH_HOME . "entity/cache") as $f) {
            if ($f !== "info" && preg_match('/\.json$/i', $f)) {
                $fEntity = str_replace('.json', '', $f);
                $cc = json_decode(file_get_contents(PATH_HOME . "entity/cache/{$f}"), !0);
                foreach ($cc as $i => $c) {
                    if ($c['relation'] === $entityOld)
                        $cc[$i]['relation'] = $entity;
                }
                $file = fopen(PATH_HOME . "entity/cache/{$f}", "w");
                fwrite($file, json_encode($cc));
                fclose($file);
            }
        }
    }

    $data['data'] = 1;
} else {
    $data['error'] = 'Informações Ausentes';
}