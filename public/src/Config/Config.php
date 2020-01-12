<?php

namespace Config;

use Helpers\Helper;

class Config
{

    /**
     * @return array
     */
    public static function getViewPermissoes(): array
    {
        return json_decode(file_get_contents(PATH_HOME . "_config/route.json"), true);
    }

    /**
     * Gera arquivo de configurações
     * @param array $dados
     */
    public static function createConfig(array $dados = [])
    {
        $path = defined("PATH_HOME") ? PATH_HOME : "../../../";
        if (empty($dados))
            $dados = json_decode(file_get_contents($path . "_config/config.json"), true);
        else
            self::writeFile("_config/config.json", json_encode($dados));

        $conf = "<?php\n";
        foreach ($dados as $dado => $value) {
            $value = (is_bool($value) ? ($value ? 'true' : 'false') : "'{$value}'");
            $conf .= "define('" . strtoupper(trim($dado)) . "', {$value});\n";
        }

        //atualiza versão do Service Worker
        if(file_exists(PATH_HOME . "service-worker.js")) {
            $serviceWorker = file_get_contents(PATH_HOME . "service-worker.js");
            $version = (float)explode("'", explode("const VERSION = '", $serviceWorker)[1])[0];
            $serviceWorker = str_replace("const VERSION = '{$version}'", "const VERSION = '{$dados['version']}'", $serviceWorker);
            self::writeFile("service-worker.js", $serviceWorker);
        }

        $conf .= "\nrequire_once PATH_HOME . '" . explode('/', $dados['vendor'])[0] . "/autoload.php';\nnew Route\Sessao();";

        self::writeFile("_config/config.php", $conf);
    }

    /**
     * @param string $vendor
     * @param string $domain
     * @param string $www
     * @param string $protocol
     */
    public static function createHtaccess(string $vendor = "", string $domain = "", string $www = "", string $protocol = "")
    {
        if (!empty($vendor) || defined("DOMINIO")) {
            if (empty($vendor)) {
                $vendor = VENDOR;
                $domain = DOMINIO;
                $www = WWW;
                $protocol = SSL;
                $path = PATH_HOME . VENDOR . "config/";
            } else {
                $path = "";
            }

            $vendor = str_replace('/', '\\/', $vendor);
            $rewriteDomain = file_exists(PATH_HOME . "_config/permissoes.json") ? "" : "RewriteRule ^{$vendor}{$domain}\/public\/(.*)$ public/$1 [L]";
            $dados = "RewriteCond %{HTTP_HOST} ^" . ($www ? "{$domain}\nRewriteRule ^ http" . ($protocol ? "s" : "") . "://www.{$domain}%{REQUEST_URI}" : "www.(.*) [NC]\nRewriteRule ^(.*) http" . ($protocol ? "s" : "") . "://%1/$1") . " [L,R=301]";
            self::writeFile(".htaccess", str_replace(['{$dados}', '{$rewriteDomain}'], [$dados, $rewriteDomain], file_get_contents("{$path}public/installTemplates/htaccess.txt")));
        }
    }

    /**
     * @param string $url
     * @param string $content
     */
    public static function writeFile(string $url, string $content)
    {
        try {
            if (defined("PATH_HOME") && !preg_match("/^" . preg_quote(PATH_HOME, '/') . "/i", $url))
                $url = PATH_HOME . (preg_match("/^\//i", $url) ? substr($url, 1) : $url);
            elseif (!defined("PATH_HOME"))
                $url = "../../../" . $url;

            $fp = fopen($url, "w+");
            if($fp) {
                fwrite($fp, $content);
                fclose($fp);
            }

        } catch (Exception $e) {

        }
    }

    /**
     * Cria Diretório
     * @param string $dir
     * @return string
     */
    public static function createDir(string $dir)
    {
        $path = defined("PATH_HOME") ? PATH_HOME : "../../../";
        if (!file_exists("{$path}{$dir}"))
            mkdir("{$path}{$dir}", 0777);

        return "{$path}{$dir}";
    }

    /**
     * @return array
     */
    public static function getPermission(): array
    {
        $file = [];
        if(file_exists(PATH_HOME . "_config/permissoes.json")) {
            $file = json_decode(file_get_contents(PATH_HOME . "_config/permissoes.json"), true);

            //convert true string para true boolean
            if(is_array($file)) {
                foreach ($file as $setor => $datum) {
                    if (!empty($datum)) {
                        foreach ($datum as $entity => $dados) {
                            if (!empty($dados)) {
                                foreach ($dados as $action => $value)
                                    $file[$setor][$entity][$action] = $value === "true";
                            }
                        }
                    }
                }
            } else {
                $file = [];
            }
        }

        return $file;
    }

    /**
     * Cria arquivo de atualização do site
     */
    public static function updateSite()
    {
        $update = "0";
        if(file_exists(PATH_HOME . "_config/updates/update.txt"))
            $update = file_get_contents(PATH_HOME . "_config/updates/update.txt");
        $update += 1;

        Helper::createFolderIfNoExist(PATH_HOME . "_config/updates");
        $f = fopen(PATH_HOME . "_config/updates/update.txt", "w+");
        fwrite($f, $update);
        fclose($f);
    }

    /**
     * Cria o Core JS e CSS do setor de acesso
     */
    public static function createCore() {
        $f = (file_exists(PATH_HOME . "_config/param.json") ? json_decode(file_get_contents(PATH_HOME . "_config/param.json"), !0) : ['js' => [], 'css' => []]);
        $list = implode('/', array_unique(array_merge($f['js'], $f['css'])));
        $data = json_decode(file_get_contents(REPOSITORIO . "app/library/{$list}"), !0);
        $setor = (!empty($_SESSION['userlogin']) ? $_SESSION['userlogin']['setor'] : "0");

        if (empty($data))
            $data = [];

        Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic");
        Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic/core");
        Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic/core/" . $setor);

        if(!empty($f['js']))
            self::createCoreJs($f['js'], $data, $setor);

        if(!empty($f['css']))
            self::createCoreCss($f['css'], $data, $setor);
    }

    /**
     * @param array $jsList
     * @param array $data
     * @param string|null $setor
     */
    private static function createCoreJs(array $jsList, array $data, string $setor)
    {
        $minifier = new Minify\JS("");

        if(is_array($jsList) && !empty($jsList)) {

            foreach ($data as $datum) {
                if (in_array($datum['nome'], $jsList)) {
                    foreach ($datum['arquivos'] as $file) {
                        if ($file['type'] === "text/javascript")
                            $minifier->add($file['content']);
                    }
                }
            }

            foreach ($jsList as $i => $js) {
                if(file_exists(PATH_HOME . "public/assets/" . $setor . "/{$js}.js")) {
                    $minifier->add(PATH_HOME . "public/assets/" . $setor . "/{$js}.js");
                    break;
                } elseif(file_exists(PATH_HOME . "public/assets/{$js}.js")) {
                    $minifier->add(PATH_HOME . "public/assets/{$js}.js");
                    break;
                } else {
                    foreach (Helper::listFolder(PATH_HOME . VENDOR) as $libs) {
                        if(file_exists(PATH_HOME . VENDOR . $libs . "/public/assets/" . $setor . "/{$js}.js")) {
                            $minifier->add(PATH_HOME . VENDOR . $libs . "/public/assets/" . $setor . "/{$js}.js");
                            break;
                        } elseif(file_exists(PATH_HOME . VENDOR . $libs . "/public/assets/{$js}.js")) {
                            $minifier->add(PATH_HOME . VENDOR . $libs . "/public/assets/{$js}.js");
                            break;
                        }
                    }
                }
            }
        } elseif(is_string($jsList)) {
            $js = $jsList;
            if(file_exists(PATH_HOME . "public/assets/" . $setor . "/{$js}.js")) {
                $minifier->add(PATH_HOME . "public/assets/" . $setor . "/{$js}.js");

            } elseif(file_exists(PATH_HOME . "public/assets/{$js}.js")) {
                $minifier->add(PATH_HOME . "public/assets/{$js}.js");

            } else {
                foreach (Helper::listFolder(PATH_HOME . VENDOR) as $libs) {
                    if(file_exists(PATH_HOME . VENDOR . $libs . "/public/assets/" . $setor . "/{$js}.js")) {
                        $minifier->add(PATH_HOME . VENDOR . $libs . "/public/assets/" . $setor . "/{$js}.js");
                        break;
                    } elseif(file_exists(PATH_HOME . VENDOR . $libs . "/public/assets/{$js}.js")) {
                        $minifier->add(PATH_HOME . VENDOR . $libs . "/public/assets/{$js}.js");
                        break;
                    }
                }
            }
        }

        $minifier->minify(PATH_HOME . "assetsPublic/core/" . $setor . "/core.min.js");
    }

    /**
     * @param array $cssList
     * @param array $data
     * @param string|null $setor
     */
    private static function createCoreCss(array $cssList, array $data, string $setor)
    {
        $config = json_decode(file_get_contents(PATH_HOME . "_config/config.json"), !0);

        $dirTheme = (file_exists(PATH_HOME . "public/assets/theme.min.css") ? PATH_HOME . "public/assets/theme.min.css" : PATH_HOME . VENDOR . "config/public/assets/theme.min.css");
        $themeFile = file_get_contents($dirTheme);
        $theme = explode("}", explode(".theme{", $themeFile)[1])[0];
        $themeColor = explode("}", explode(".theme-text-aux{", $themeFile)[1])[0];
        $theme = explode("!important", explode("background-color:", $theme)[1])[0];
        $themeColor = explode("!important", explode("color:", $themeColor)[1])[0];

        $minifier = new Minify\CSS("");
        $arrayReplace = ['{$home}' => HOME, '{$vendor}' => VENDOR, '{$version}' => $config['version'], '{$favicon}' => $config['favicon'], '{$logo}' => $config['logo'], '{$theme}' => $theme, '{$theme-aux}' => $themeColor, '{$publico}' => PUBLICO,
            '{{home}}' => HOME, '{{vendor}}' => VENDOR, '{{version}}' => $config['version'], '{{favicon}}' => $config['favicon'], '{{logo}}' => $config['logo'], '{{theme}}' => $theme, '{{theme-aux}}' => $themeColor, '{{publico}}' => PUBLICO];

        foreach ($cssList as $item) {
            $datum = array_values(array_filter(array_map(function ($d) use ($item) {
                return $d['nome'] === $item ? $d : [];
            }, $data)));

            if (!empty($datum[0]) && !empty($datum[0]['arquivos'])) {
                foreach ($datum[0]['arquivos'] as $file) {
                    if ($file['type'] === "text/css")
                        $minifier->add(str_replace(array_keys($arrayReplace), array_values($arrayReplace), $file['content']));
                }
            }
        }

        //copia theme padrão para pasta do site
        if (!file_exists(PATH_HOME . "public/assets/theme.min.css") && file_exists(PATH_HOME . VENDOR . "config/public/assets/theme.min.css"))
            copy(PATH_HOME . VENDOR . "config/public/assets/theme.min.css", PATH_HOME . "public/assets/theme.min.css");

        $minifier->add(PATH_HOME . "public/assets/theme.min.css");

        if(is_array($cssList) && !empty($cssList)) {
            foreach ($cssList as $i => $css) {
                if(file_exists(PATH_HOME . "public/assets/" . $setor . "/{$css}.css")) {
                    $minifier->add(PATH_HOME . "public/assets/" . $setor . "/{$css}.css");
                    break;
                } elseif(file_exists(PATH_HOME . "public/assets/{$css}.css")) {
                    $minifier->add(PATH_HOME . "public/assets/{$css}.css");
                    break;
                } else {
                    foreach (Helper::listFolder(PATH_HOME . VENDOR) as $libs) {
                        if(file_exists(PATH_HOME . VENDOR . $libs . "/public/assets/" . $setor . "/{$css}.css")) {
                            $minifier->add(PATH_HOME . VENDOR . $libs . "/public/assets/" . $setor . "/{$css}.css");
                            break;
                        } elseif(file_exists(PATH_HOME . VENDOR . $libs . "/public/assets/{$css}.css")) {
                            $minifier->add(PATH_HOME . VENDOR . $libs . "/public/assets/{$css}.css");
                            break;
                        }
                    }
                }
            }
        } elseif(is_string($cssList)) {
            $css = $cssList;
            if(file_exists(PATH_HOME . "public/assets/" . $setor . "/{$css}.css")) {
                $minifier->add(PATH_HOME . "public/assets/" . $setor . "/{$css}.css");

            } elseif(file_exists(PATH_HOME . "public/assets/{$css}.css")) {
                $minifier->add(PATH_HOME . "public/assets/{$css}.css");

            } else {
                foreach (Helper::listFolder(PATH_HOME . VENDOR) as $libs) {
                    if(file_exists(PATH_HOME . VENDOR . $libs . "/public/assets/" . $setor . "/{$css}.css")) {
                        $minifier->add(PATH_HOME . VENDOR . $libs . "/public/assets/" . $setor . "/{$css}.css");
                        break;
                    } elseif(file_exists(PATH_HOME . VENDOR . $libs . "/public/assets/{$css}.css")) {
                        $minifier->add(PATH_HOME . VENDOR . $libs . "/public/assets/{$css}.css");
                        break;
                    }
                }
            }
        }

        $minifier->minify(PATH_HOME . "assetsPublic/core/" . $setor . "/core.min.css");
    }
}