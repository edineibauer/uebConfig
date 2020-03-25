<?php

namespace Config;

use Helpers\Helper;

class Menu
{
    private $file;
    private $menu;

    public function __construct(string $file = "menu")
    {
        $this->file = $file;
        $this->menu = [];
        $this->start();
    }

    /**
     * @return array
     */
    public function getMenu(): array
    {
        return $this->menu;
    }

    /**
     * @param string $dir
     * @param string $setor
     */
    private function checkMenuExist(string $dir, string $setor)
    {
        /**
         * Verifica se existe um menu
         */
        if (file_exists(PATH_HOME . "{$dir}/menu/{$setor}/menu.php")) {
            ob_start();
            require_once PATH_HOME . "{$dir}/menu/{$setor}/menu.php";
            $this->menu = ob_get_contents();
            ob_end_clean();

        } elseif (file_exists(PATH_HOME . "{$dir}/menu/menu.php")) {
            ob_start();
            require_once PATH_HOME . "{$dir}/menu/menu.php";
            $this->menu = ob_get_contents();
            ob_end_clean();

        } else {
            if (file_exists(PATH_HOME . "{$dir}/menu/{$setor}/{$this->file}.json")) {
                $this->addMenuJson(PATH_HOME . "{$dir}/menu/{$setor}/{$this->file}.json");
            } elseif (file_exists(PATH_HOME . "{$dir}/menu/{$this->file}.json")) {
                $this->addMenuJson(PATH_HOME . "{$dir}/menu/{$this->file}.json");
            }
        }
    }

    private function start()
    {
        $setor = !empty($_SESSION['userlogin']) ? $_SESSION['userlogin']['setor'] : "0";

        $this->checkMenuExist("public", $setor);

        if(empty($this->menu)) {
            foreach (Helper::listFolder(PATH_HOME . VENDOR) as $lib) {
                $this->checkMenuExist(VENDOR . "/{$lib}/public", $setor);

                if (!empty($this->menu))
                    break;
            }
        }
    }

    /**
     * Mostra Menu
     * @param string $incMenu
     */
    private function addMenuJson(string $incMenu)
    {
        $incMenu = json_decode(file_get_contents($incMenu), !0);

        if (!empty($incMenu)) {
            foreach ($incMenu as $i => $menu) {
                $mount = [
                    "funcao" => null,
                    "href" => null,
                    "attr" => "",
                    "class" => "",
                    "style" => "",
                    "html" => "",
                    "li" => [
                        "attr" => "",
                        "class" => "",
                        "style" => ""
                    ],
                    "indice" => $i
                ];

                //action / function
                if (!empty($menu['onclick']))
                    $mount['funcao'] = $menu['onclick'];
                elseif (!empty($menu['click']))
                    $mount['funcao'] = $menu['click'];
                elseif (!empty($menu['function']))
                    $mount['funcao'] = $menu['function'];
                elseif (!empty($menu['funcao']))
                    $mount['funcao'] = $menu['funcao'];

                if (!empty($menu['href']))
                    $mount['href'] = $menu['href'];
                elseif (!empty($menu['link']))
                    $mount['href'] = $menu['link'];
                elseif (!empty($menu['a']))
                    $mount['href'] = $menu['a'];
                elseif (!empty($menu['url']))
                    $mount['href'] = $menu['url'];

                //ATRIBUTOS DA LI
                if (!empty($menu['li']['class'])) {
                    if (is_array($menu['li']['class'])) {
                        $mount['li']['class'] = implode(' ', $menu['li']['class']);
                    } elseif (is_string($menu['li']['class'])) {
                        $mount['li']['class'] = $menu['li']['class'];
                    }
                }

                if (!empty($menu['li']['style'])) {
                    if (is_array($menu['li']['style'])) {
                        if (is_object($menu['li']['style'][0])) {
                            foreach ($menu['li']['style'] as $style => $value)
                                $mount['li']['style'] .= "{$style}: {$value};";

                        } elseif (is_string($menu['li']['style'][0])) {
                            $mount['li']['style'] = implode(';', $menu['li']['style']);
                        }

                    } elseif (is_object($menu['li']['style'])) {
                        foreach ($menu['li']['style'] as $style => $value)
                            $mount['li']['style'] .= "{$style}: {$value};";
                    } elseif (is_string($menu['li']['style'])) {
                        $mount['li']['style'] = $menu['li']['style'];
                    }
                }

                if (!empty($menu['li']['attr'])) {
                    if (is_array($menu['li']['attr'])) {
                        if (is_object($menu['li']['attr'][0])) {
                            foreach ($menu['li']['attr'] as $attr => $value)
                                $mount['li']['attr'] .= "{$attr}='{$value}' ";

                        } elseif (is_string($menu['li']['attr'][0])) {
                            $mount['li']['attr'] = implode(' ', $menu['li']['attr']);
                        }
                    } elseif (is_object($menu['li']['attr'])) {
                        foreach ($menu['li']['attr'] as $attr => $value)
                            $mount['li']['attr'] .= "{$attr}='{$value}' ";
                    } elseif (is_string($menu['li']['attr'])) {
                        $mount['li']['attr'] = $menu['li']['attr'];
                    }
                }

                //ATTRIBUTOS DO ALVO
                if (!empty($menu['class'])) {
                    if (is_array($menu['class'])) {
                        $mount['class'] = implode(' ', $menu['class']);
                    } elseif (is_string($menu['class'])) {
                        $mount['class'] = $menu['class'];
                    }
                }

                if (!empty($menu['style'])) {
                    if (is_array($menu['style'])) {
                        if (is_object($menu['style'][0])) {
                            foreach ($menu['style'] as $style => $value)
                                $mount['style'] .= "{$style}: {$value};";

                        } elseif (is_string($menu['style'][0])) {
                            $mount['style'] = implode(';', $menu['style']);
                        }

                    } elseif (is_object($menu['style'])) {
                        foreach ($menu['style'] as $style => $value)
                            $mount['style'] .= "{$style}: {$value};";
                    } elseif (is_string($menu['style'])) {
                        $mount['style'] = $menu['style'];
                    }
                }

                if (!empty($menu['attr'])) {
                    if (is_array($menu['attr'])) {
                        if (is_object($menu['attr'][0])) {
                            foreach ($menu['attr'] as $attr => $value)
                                $mount['attr'] .= "{$attr}='{$value}' ";

                        } elseif (is_string($menu['attr'][0])) {
                            $mount['attr'] = implode(' ', $menu['attr']);
                        }
                    } elseif (is_object($menu['attr'])) {
                        foreach ($menu['attr'] as $attr => $value)
                            $mount['attr'] .= "{$attr}='{$value}' ";
                    } elseif (is_string($menu['attr'])) {
                        $mount['attr'] = $menu['attr'];
                    }
                }

                if (!empty($menu['html']))
                    $mount['html'] = $menu['html'];
                elseif (!empty($menu['text']))
                    $mount['html'] = $menu['text'];
                elseif (!empty($menu['title']))
                    $mount['html'] = $menu['title'];

                if (empty($menu['html']) && !empty($menu['icon']))
                    $mount['html'] = (preg_match('/^</i', $menu['icon']) ? $menu['icon'] : "<i class='material-icons'>{$menu['icon']}</i>") . $mount['html'];

                if (!empty($menu['indice']))
                    $mount['indice'] = $menu['indice'];
                elseif (!empty($menu['index']))
                    $mount['indice'] = $menu['index'];


                $this->menu[] = $mount;
            }
        }
    }
}