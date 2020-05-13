<?php

$setor = !empty($_SESSION['userlogin']) ? $_SESSION['userlogin']['setor'] : "0";

/**
 * Obtém os templates utilizados nas views que este usuário tem acesso
 * @param string $path
 * @param string $setor
 * @param array $list
 * @return array
 */
function getTemplatesView(string $path, string $setor, array $list)
{
    if(file_exists($path)) {
        foreach (\Helpers\Helper::listFolder($path) as $param) {
            $p = json_decode(file_get_contents($path . "/" . $param), !0);

            if(!empty($p['templates']) && is_array($p['templates'])) {

                $permissionToView = $setor === "" || ((empty($p['setor']) || in_array($setor, $p['setor'])) && (empty($p['!setor']) || !in_array($setor, $p["!setor"])));

                /**
                 * Se tiver permissão para acessar a view e
                 * Se este template ainda não foi adicionado na lista
                 * Então adiciona o template a lista de templates do usuário
                 */
                if ($permissionToView) {
                    foreach ($p['templates'] as $template) {
                        if (!in_array($template, array_keys($list)))
                            $list[$template] = Config\Config::getTemplateContent($template);
                    }
                }
            }
        }
    }

    return $list;
}


/**
 * Public Setor
 */
$list = getTemplatesView(PATH_HOME. "public/param/" . $setor, "", []);

/**
 * Public
 */
$list = getTemplatesView(PATH_HOME. "public/param", $setor, $list);

/**
 * Overload in Public
 */
if(file_exists(PATH_HOME. "public/overload")) {
    foreach (\Helpers\Helper::listFolder(PATH_HOME. "public/overload") as $libOverload) {
        $list = getTemplatesView(PATH_HOME. "public/overload/" . $libOverload . "/param/" . $setor, "", []);
        $list = getTemplatesView(PATH_HOME. "public/overload/" . $libOverload . "/param", $setor, []);
    }
}

/**
 * Overload in Libs
 */
foreach (\Helpers\Helper::listFolder(PATH_HOME . VENDOR) as $lib) {
    if (file_exists(PATH_HOME . VENDOR . $lib . "/public/overload")) {
        foreach (\Helpers\Helper::listFolder(PATH_HOME . VENDOR . $lib . "/public/overload") as $libOverload) {
            $list = getTemplatesView(PATH_HOME . VENDOR . $lib . "/public/overload/" . $libOverload . "/param/" . $setor, "", []);
            $list = getTemplatesView(PATH_HOME . VENDOR . $lib . "/public/overload/" . $libOverload . "/param", $setor, []);
        }
    }
}

/**
 * Libs Setor
 */
foreach (\Helpers\Helper::listFolder(PATH_HOME . VENDOR) as $lib)
    $list = getTemplatesView(PATH_HOME . VENDOR . $lib . "/public/param/" . $setor, "", $list);

/**
 * Libs
 */
foreach (\Helpers\Helper::listFolder(PATH_HOME . VENDOR) as $lib)
    $list = getTemplatesView(PATH_HOME . VENDOR . $lib . "/public/param", $setor, $list);

$data['data'] = $list;