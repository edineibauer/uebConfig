<?php

use Config\Config;
use Entity\Dicionario;
use Helpers\Check;
use Helpers\Helper;
use \EntityUi\SaveEntity;

$entity = str_replace('-', '_', Check::name(strip_tags(trim(filter_input(INPUT_POST, "entidade", FILTER_DEFAULT)))));
$icone = strip_tags(trim(filter_input(INPUT_POST, "icone", FILTER_DEFAULT)));
$autoridade = strip_tags(trim(filter_input(INPUT_POST, "autoridade", FILTER_VALIDATE_INT)));
$autoridade = $autoridade > 0 ? (int)$autoridade : null;
$tipo = (int)strip_tags(trim(filter_input(INPUT_POST, "tipo", FILTER_VALIDATE_INT)));
$campos = strip_tags(trim(filter_input(INPUT_POST, "campos", FILTER_DEFAULT)));
$entityOld = strip_tags(trim(filter_input(INPUT_POST, "entidadeOld", FILTER_DEFAULT)));
$autoridadeOld = strip_tags(trim(filter_input(INPUT_POST, "autoridadeOld", FILTER_VALIDATE_INT)));
$tipoOld = strip_tags(trim(filter_input(INPUT_POST, "tipoOld", FILTER_VALIDATE_INT)));

if (!empty($entity) && !empty($campos) && Check::isJson($campos)) {

    /**
     * @param $val
     * @return bool
     */
    function checkBool($val): bool
    {
        return $val === "1" || $val === 1 || $val === "true" || $val === true;
    }

    /**
     * @param $val
     * @return string
     */
    function checkString($val): string
    {
        return (empty($val) || $val === false || $val === "false" || !is_string($val) ? "" : $val);
    }

    /**
     * @param $val
     * @return int|string
     */
    function checkInt($val)
    {
        return (!is_numeric($val) ? "" : (int)$val);
    }

    /**
     * @param $val
     * @return array
     */
    function checkArray($val): array
    {
        return (is_array($val) ? $val : []);
    }

    /**
     * @param string $dir
     * @param array $data
     */
    function createEntityJson(string $dir, array $data)
    {
        $fp = fopen(PATH_HOME . "entity/" . $dir . ".json", "w");
        fwrite($fp, json_encode($data));
        fclose($fp);
    }

    /**
     * @param array $metadados
     * @param string|null $icon
     * @param int|null $autor
     * @param int|null $user
     * @return array
     */
    function generateInfo(array $metadados, string $icon = null, int $autor = null, int $user = null): array
    {
        $data = [
            "icon" => $icon, "autor" => $autor, "user" => $user,
            "required" => null, "unique" => null, "update" => null,
            "identifier" => (count($metadados) + 1), "title" => null, "link" => null, "status" => null, "date" => null, "datetime" => null, "valor" => null, "email" => null, "password" => null, "tel" => null, "cpf" => null, "cnpj" => null, "cep" => null, "time" => null, "week" => null, "month" => null, "year" => null,
            "publisher" => "", "owner" => null, "ownerPublisher" => null, "extend" => null, "extend_add" => null, "extend_mult" => null, "list" => null, "list_mult" => null, "folder" => null, "extend_folder" => null
        ];

        foreach ($metadados as $i => $dados) {
            if ($dados['unique'] === "true" || $dados['unique'] === true || $dados['unique'] == 1)
                $data['unique'][] = $i;

            if (in_array($dados['key'], ["extend", "extend_add", "extend_mult", "list", "list_mult", "folder", "extend_folder"]))
                $data[$dados['key']][] = $i;

            if (in_array($dados['format'], ["title", "link", "status", "date", "datetime", "valor", "email", "password", "tel", "cpf", "cnpj", "cep", "time", "week", "month", "year"]))
                $data[$dados['format']] = $i;

            if ($dados['key'] === "publisher")
                $data["publisher"] = $i;

            if ($dados['default'] === false || $dados['default'] === "false")
                $data['required'][] = $i;

            if ($dados['update'] === "true" || $dados['update'] === true || $dados['update'] == 1)
                $data["update"][] = $i;

            if ($dados['relation'] === "usuarios" && $dados['format'] === "extend")
                $data = checkOwnerList($data, $metadados, $dados['column']);
        }

        return $data;
    }

    /**
     * @param array $data
     * @param array $metadados
     * @param string $column
     * @return array
     */
    function checkOwnerList(array $data, array $metadados, string $column)
    {
        foreach ($metadados as $i => $metadado) {
            if ($metadado['relation'] !== "usuarios") {
                if (in_array($metadado['format'], ["extend", "extend_add", "extend_mult"])) {
                    $data['owner'][] = ["entity" => $metadado['relation'], "column" => $metadado['column'], "userColumn" => $column];
                } elseif (in_array($metadado['format'], ["list", "list_mult"])) {
                    $data['ownerPublisher'][] = ["entity" => $metadado['relation'], "column" => $metadado['column'], "userColumn" => $column];
                }
            }
        }

        return $data;
    }

    function getOptionsSource($sources)
    {
        $result = [];
        foreach ($sources as $source) {
            foreach ($source as $item) {
                if ($item !== "1")
                    $result[] = ["valor" => $item, "representacao" => $item];
            }
        }

        return $result;
    }

    /**
     * @param array $item
     * @param array $propriedades
     * @return array
     */
    function getConvertedCampos(array $item, array $propriedades, array $base, int $indice): array
    {
        $regras = [];
        if (!empty($item['regras_de_campo'])) {
            foreach ($item['regras_de_campo'] as $rule) {
                $itemR = $item;
                unset($itemR['regras_de_campo']);
                $additional = [
                    "campo" => $rule['campo'],
                    "valor" => $rule['valor'],
                    "rule" => "="
                ];
                $ruleCampo = getConvertedCampos($itemR, $rule['propriedades'], $base, 0);
                $regras[] = Helper::arrayMerge($ruleCampo, $additional);
            }
        }

        $fields = [
            "nome" => $item["coluna"] ?? "",
            "column" => str_replace('-', '_', Check::name($item["coluna"] ?? "")),
            "minimo" => checkInt($propriedades["min"] ?? ""),
            "size" => checkInt($propriedades["max"] ?? ""),
            "unique" => checkBool($propriedades["unico"] ?? !1),
            "default" => ($item['tipo_do_campo'] === "information" ? checkString($propriedades["html"] ?? "") : (checkBool($propriedades["unico"] ?? !1) ? false : checkString($propriedades["valor_padrao"] ?? ""))),
            "update" => checkBool($propriedades["atualizar"] ?? !1),
            "relation" => str_replace('-', '_', Check::name(checkString($item["entidade_relacional"] ?? ""))),
            "allow" => [
                "regexp" => checkString($propriedades["expressao_regular"] ?? ""),
                "options" => ($item['tipo_do_campo'] === "1" && $item['generico'] === "source_list" ? getOptionsSource($propriedades['formatos_de_entrada'] ?? []) : checkArray($propriedades["opcoes_de_entrada"] ?? []))
            ],
            "form" => [
                "display" => checkBool($propriedades["formulario"] ?? !1),
                "cols" => checkInt($propriedades["largura_do_campo"] ?? ""),
                "colm" => checkInt($propriedades["tablet"] ?? ""),
                "coll" => checkInt($propriedades["desktop"] ?? ""),
                "orientation" => checkInt($propriedades["orientacao_das_opcoes"] ?? ""),
                "class" => checkString($propriedades["class"] ?? ""),
                "style" => checkString($propriedades["style"] ?? ""),
                "template" => checkString($propriedades["template"] ?? ""),
                "atributos" => checkString($propriedades["atributos"] ?? "")
            ],
            "datagrid" => (checkBool($item["listagem"] ?? !1) ? [
                "grid_relevant" => checkInt($item["posicionamento"] ?? ""),
                "grid_class" => checkString($item["class_listagem"] ?? ""),
                "grid_style" => checkString($item["style_listagem"] ?? ""),
                "grid_template" => checkString($item["template_listagem"] ?? ""),
            ] : false),
            "indice" => $indice,
            "id" => $item['id'],
            "rules" => $regras
        ];

        return Helper::arrayMerge($base, $fields);
    }

    /**
     * @param string $campos
     * @param array $users
     * @return array
     */
    function convertCampos(string $campos, array $users)
    {
        $result = [];
        $i = 0;
        $default = json_decode(file_get_contents(PATH_HOME . VENDOR . "entity-ui/public/input_type/default.json"), !0)['default'];
        $campos = json_decode($campos, !0);

        foreach ($users as $user)
            $result[$user] = [];

        foreach ($campos as $item) {
            $tipo = $item['tipo_do_campo'] === "1" ? $item['generico'] : ($item['tipo_do_campo'] === "2" ? $item['semantico'] : ($item['tipo_do_campo'] === "3" ? $item['relacionamento'] : $item['tipo_do_campo']));
            if(file_exists(PATH_HOME . VENDOR . "entity-ui/public/input_type/{$tipo}.json"))
                $base = Helper::arrayMerge($default, json_decode(file_get_contents(PATH_HOME . VENDOR . "entity-ui/public/input_type/{$tipo}.json"), !0)[$tipo]);
            else
                $base = $default;

            $result['cache'][$item['id']] = getConvertedCampos($item, $item['propriedades'], $base, $i);

            if (!empty($item['regras_de_usuario'])) {
                foreach ($item['regras_de_usuario'] as $regra) {
                    $regraUser = str_replace('-', '_', Check::name($regra['tipo_de_usuario']));
                    if (isset($result[$regraUser]))
                        $result[$regraUser][$item['id']] = getConvertedCampos($item, $regra['propriedades'], $base, $i);
                }
            }

            foreach ($users as $user) {
                if (!isset($result[$user][$item['id']]))
                    $result[$user][$item['id']] = $result['cache'][$item['id']];
            }

            $i++;
        }

        return $result;
    }

    /**
     * Verifica se é uma atualização ou criação
     */
    $isCreate = !file_exists(PATH_HOME . "entity/cache/{$entity}.json");

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

    $metadados = convertCampos($campos, $users);

    /**
     *  Cria entidade básica cache, info e banco de dados
     */
    $save = new SaveEntity($entity, $icone, (int)$tipo, (int)$autoridade, $metadados['cache']);

    /**
     *  Se for Usuário, copia entidades cache para sua própria pasta
     */
    if ($tipo === 1 && $entity !== "cache" && $entity !== "general" && !file_exists(PATH_HOME . "entity/{$entity}")) {
        Helper::createFolderIfNoExist(PATH_HOME . "entity/{$entity}");
        Helper::createFolderIfNoExist(PATH_HOME . "entity/{$entity}/info");
        foreach (Helper::listFolder(PATH_HOME . "entity/cache") as $cache) {
            if (!file_exists(PATH_HOME . "entity/{$entity}/{$cache}") && $cache !== "info" && preg_match("/\.json$/i", $cache)) {
                copy(PATH_HOME . "entity/cache/{$cache}", PATH_HOME . "entity/{$entity}/{$cache}");
                if (file_exists(PATH_HOME . "entity/cache/info/{$cache}"))
                    copy(PATH_HOME . "entity/cache/info/{$cache}", PATH_HOME . "entity/{$entity}/info/{$cache}");
            }
        }
    }

    /**
     *  Cria metadados da entidade para cada usuário do sistema
     */
    foreach ($metadados as $user => $metadado) {
        if ($user !== "cache") {
            Helper::createFolderIfNoExist(PATH_HOME . "entity/{$user}");
            Helper::createFolderIfNoExist(PATH_HOME . "entity/{$user}/info");
            createEntityJson("{$user}/{$entity}", $metadado);
            createEntityJson("{$user}/info/{$entity}", generateInfo($metadado, $icone, $autoridade, $tipo));
        }
    }

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

    /**
     * Se for uma nova entidade, dê permissão de menu ao ADM
     */
    if($isCreate) {
        $p = json_decode(file_get_contents(PATH_HOME . "_config/permissoes.json"), !0);
        $p['admin'][$entity]['menu'] = "true";
        Config::writeFile(PATH_HOME . "_config/permissoes.json", json_encode($p));
    }

    /**
     * Informa ao sistema que houve atualização
     */
    Config::updateSite();

    $data['data'] = 1;
} else {
    $data['error'] = 'Informações Ausentes';
}