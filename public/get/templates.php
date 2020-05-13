<?php

/**
 * Obtém os templates utilizados nas views que este usuário tem acesso
 * @param string $path
 * @param string $setor
 * @param array $list
 * @return array
 */
function getTemplatesView(string $path, string $setor, array $list)
{
    if(file_exists($path . "public/param")) {
        foreach (\Helpers\Helper::listFolder($path . "public/param") as $param) {
            $p = json_decode(file_get_contents($path . "public/param/" . $param), !0);

            if(!empty($p['templates']) && is_array($p['templates'])) {

                $permissionToView = (empty($p['setor']) || in_array($setor, $p['setor'])) && (empty($p['!setor']) || !in_array($setor, $p["!setor"]));

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
 * Para cada biblioteca
 * busca as views que tenho acesso e obtém os templates utilizados nessa view
 */
$setor = !empty($_SESSION['userlogin']) ? $_SESSION['userlogin']['setor'] : "0";
$list = getTemplatesView("", $setor, []);
foreach (\Helpers\Helper::listFolder(PATH_HOME . VENDOR) as $lib)
    $list = getTemplatesView(PATH_HOME . VENDOR . $lib . "/", $setor, $list);

$data['data'] = $list;