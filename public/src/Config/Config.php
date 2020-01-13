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
        if (file_exists(PATH_HOME . "service-worker.js")) {
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
            if ($fp) {
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
        if (file_exists(PATH_HOME . "_config/permissoes.json")) {
            $file = json_decode(file_get_contents(PATH_HOME . "_config/permissoes.json"), true);

            //convert true string para true boolean
            if (is_array($file)) {
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
        if (file_exists(PATH_HOME . "_config/updates/update.txt"))
            $update = file_get_contents(PATH_HOME . "_config/updates/update.txt");
        $update += 1;

        Helper::createFolderIfNoExist(PATH_HOME . "_config/updates");
        $f = fopen(PATH_HOME . "_config/updates/update.txt", "w+");
        fwrite($f, $update);
        fclose($f);
    }

    /**
     * Cria/Atualiza os caches de Vendor
     * Caso seja informado uma biblioteca em específico para ser atualizada apenas
     */
    public static function createLibsDirectory()
    {
        $libs = PATH_HOME . explode("/", VENDOR)[0];

        //delete libs
        Helper::recurseDelete($libs);
        Helper::createFolderIfNoExist($libs);
        Helper::recurseCopy(PATH_HOME . "vendor", $libs);

        /*
        //para cada lib overload other lib
        foreach (Helper::listFolder(PATH_HOME . VENDOR) as $pathOverload) {
            if (file_exists(PATH_HOME . VENDOR . $pathOverload . "/overload")) {
                foreach (Helper::listFolder(PATH_HOME . VENDOR . $pathOverload . "/overload") as $libOverloaded) {
                    if (is_dir(PATH_HOME . VENDOR . $pathOverload . "/overload/" . $libOverloaded) && file_exists(PATH_HOME . VENDOR . $libOverloaded))
                        Helper::recurseCopy(PATH_HOME . VENDOR . $pathOverload . "/overload/" . $libOverloaded, PATH_HOME . VENDOR . $libOverloaded . "/public");
                }
            }
        }

        //public (projeto atual) overload libs
        foreach (Helper::listFolder(PATH_HOME . "public/overload") as $libOverloaded) {
            if (is_dir(PATH_HOME . "public/overload/" . $libOverloaded) && file_exists(PATH_HOME . VENDOR . $libOverloaded))
                Helper::recurseCopy(PATH_HOME . "public/overload/" . $libOverloaded, PATH_HOME . VENDOR . $libOverloaded . "/public");
        }
        */
    }

    /**
     * Cria os Assets de View da página
     *
     * @param string|null $view
     * @param array|null $param
     * @param string|null $lib
     */
    public static function createViewAssets(string $view = null, array $param = null, string $lib = null)
    {
        Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic");
        Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic/view");
        $setor = !empty($_SESSION['userlogin']) ? $_SESSION['userlogin']['setor'] : "0";

        if (empty($view)) {
            foreach (Config::getViewPermissoes() as $lib) {

                $path = PATH_HOME . VENDOR . $lib . "/public/";

                if (file_exists($path . "view")) {
                    foreach (Helper::listFolder($path . "view") as $viewLib) {

                        if (preg_match('/.(html|php)$/i', $viewLib)) {
                            $view = str_replace(['.php', '.html'], '', $viewLib);
                            $param = self::getViewParam($view, $lib, $setor);

                            self::createPageJs($view, $param['js'], $lib, $setor);
                            self::createPageCss($view, $param['css'], $lib, $setor);
                        }
                    }
                }
            }
        } else {
            if (!empty($lib)) {

                /**
                 * Considera que param possui a lista de CSS e JS correta. (com overload aplicado)
                 */
                $param = (!empty($param) && isset($param['js']) && isset($param['css']) ? $param : ['js' => [], 'css' => []]);

                self::createPageJs($view, $param['js'], $lib, $setor);
                self::createPageCss($view, $param['css'], $lib, $setor);
            }
        }
    }

    /**
     * Obtém os parametros da view
     *
     * @param string $view
     * @param string $lib
     * @param string $setor
     * @return array|false|string
     */
    public static function getViewParam(string $view, string $lib, string $setor)
    {
        $base = [
            "version" => VERSION,
            "meta" => "",
            "css" => [],
            "js" => [],
            "font" => "",
            "descricao" => "",
            "data" => 0,
            "front" => [],
            "isAdmin" => !empty($_SESSION['userlogin']['setor']) && $_SESSION['userlogin']['setor'] === "admin",
            "header" => !0,
            "navbar" => !0,
            "setor" => "",
            "!setor" => "",
            "redirect" => "403",
            "analytics" => defined("ANALYTICS") ? ANALYTICS : "",
            "vendor" => VENDOR
        ];

        /**
         * Verifica overload para o assets
         */
        $findParamView = !1;
        $param = [];
        if ($lib !== DOMINIO) {
            if (file_exists(PATH_HOME . "public/overload/{$lib}/param/{$setor}/{$view}.json")) {
                $param = json_decode(@file_get_contents(PATH_HOME . "public/overload/{$lib}/param/{$setor}/{$view}.json"), !0);
                $findParamView = !0;
            } elseif (file_exists(PATH_HOME . "public/overload/{$lib}/param/{$view}.json")) {
                $param = json_decode(@file_get_contents(PATH_HOME . "public/overload/{$lib}/param/{$view}.json"), !0);
                $findParamView = !0;
            }
        }

        /**
         * Verifica overload in VENDOR se não encontrou overload in public
         */
        if (!$findParamView) {
            foreach (Helper::listFolder(PATH_HOME . VENDOR) as $libs) {
                if (file_exists(PATH_HOME . VENDOR . $libs . "/public/overload/{$lib}/param/{$setor}/{$view}.json")) {
                    $param = json_decode(@file_get_contents(PATH_HOME . VENDOR . $libs . "/public/overload/{$lib}/param/{$setor}/{$view}.json"), !0);
                    $findParamView = !0;
                } elseif (file_exists(PATH_HOME . VENDOR . $libs . "/public/overload/{$lib}/param/{$view}.json")) {
                    $param = json_decode(@file_get_contents(PATH_HOME . VENDOR . $libs . "/public/overload/{$lib}/param/{$view}.json"), !0);
                    $findParamView = !0;
                }
            }
        }

        /**
         * Por fim, se não tiver overload, carrega o view assets padrão da lib
         */
        if (!$findParamView) {
            $pathFile = ($lib === DOMINIO ? "public/" : PATH_HOME . VENDOR . $lib . "/public/");
            if (file_exists($pathFile . "param/{$setor}/{$view}.json"))
                $param = json_decode(@file_get_contents($pathFile . "param/{$setor}/{$view}.json"), !0);
            elseif (file_exists($pathFile . "param/{$view}.json"))
                $param = json_decode(@file_get_contents($pathFile . "param/{$view}.json"), !0);
        }

        return array_merge($base, $param);
    }

    /**
     * Cria o Core JS e CSS do setor de acesso
     *
     * @param array $param
     */
    public static function createCore(array $param)
    {
        $param = $param ?? (file_exists(PATH_HOME . "_config/param.json") ? json_decode(file_get_contents(PATH_HOME . "_config/param.json"), !0) : ['js' => [], 'css' => []]);
        $setor = (!empty($_SESSION['userlogin']) ? $_SESSION['userlogin']['setor'] : "0");

        Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic");
        Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic/core");
        Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic/core/" . $setor);

        //copia theme padrão para pasta do site
        if (!file_exists(PATH_HOME . "public/assets/theme.min.css") && file_exists(PATH_HOME . VENDOR . "config/public/assets/theme.min.css"))
            copy(PATH_HOME . VENDOR . "config/public/assets/theme.min.css", PATH_HOME . "public/assets/theme.min.css");

        if (!empty($param['js']))
            self::createCoreJs($param['js'], $setor);

        if (!empty($param['css']))
            self::createCoreCss($param['css'], $setor);
    }

    /**
     * @param array $jsList
     * @param string $setor
     */
    private static function createCoreJs(array $jsList, string $setor)
    {
        $minifier = new \MatthiasMullie\Minify\JS("");

        if (is_array($jsList) && !empty($jsList)) {

            foreach ($jsList as $i => $js) {
                if (file_exists(PATH_HOME . "public/assets/" . $setor . "/{$js}.js")) {
                    $minifier->add(PATH_HOME . "public/assets/" . $setor . "/{$js}.js");
                    break;
                } elseif (file_exists(PATH_HOME . "public/assets/{$js}.js")) {
                    $minifier->add(PATH_HOME . "public/assets/{$js}.js");
                    break;
                } else {
                    foreach (Helper::listFolder(PATH_HOME . VENDOR) as $libs) {
                        if (file_exists(PATH_HOME . VENDOR . $libs . "/public/assets/" . $setor . "/{$js}.js")) {
                            $minifier->add(PATH_HOME . VENDOR . $libs . "/public/assets/" . $setor . "/{$js}.js");
                            break;
                        } elseif (file_exists(PATH_HOME . VENDOR . $libs . "/public/assets/{$js}.js")) {
                            $minifier->add(PATH_HOME . VENDOR . $libs . "/public/assets/{$js}.js");
                            break;
                        }
                    }
                }
            }

        } elseif (is_string($jsList)) {
            $js = $jsList;
            if (file_exists(PATH_HOME . "public/assets/" . $setor . "/{$js}.js")) {
                $minifier->add(PATH_HOME . "public/assets/" . $setor . "/{$js}.js");

            } elseif (file_exists(PATH_HOME . "public/assets/{$js}.js")) {
                $minifier->add(PATH_HOME . "public/assets/{$js}.js");

            } else {
                foreach (Helper::listFolder(PATH_HOME . VENDOR) as $libs) {
                    if (file_exists(PATH_HOME . VENDOR . $libs . "/public/assets/" . $setor . "/{$js}.js")) {
                        $minifier->add(PATH_HOME . VENDOR . $libs . "/public/assets/" . $setor . "/{$js}.js");
                        break;
                    } elseif (file_exists(PATH_HOME . VENDOR . $libs . "/public/assets/{$js}.js")) {
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
     * @param string $setor
     */
    private static function createCoreCss(array $cssList, string $setor)
    {
        $minifier = new \MatthiasMullie\Minify\CSS(PATH_HOME . "public/assets/theme.min.css");

        if (is_array($cssList) && !empty($cssList)) {
            foreach ($cssList as $i => $css) {
                if (file_exists(PATH_HOME . "public/assets/" . $setor . "/{$css}.css")) {
                    $minifier->add(PATH_HOME . "public/assets/" . $setor . "/{$css}.css");
                    break;
                } elseif (file_exists(PATH_HOME . "public/assets/{$css}.css")) {
                    $minifier->add(PATH_HOME . "public/assets/{$css}.css");
                    break;
                } else {
                    foreach (Helper::listFolder(PATH_HOME . VENDOR) as $libs) {
                        if (file_exists(PATH_HOME . VENDOR . $libs . "/public/assets/" . $setor . "/{$css}.css")) {
                            $minifier->add(PATH_HOME . VENDOR . $libs . "/public/assets/" . $setor . "/{$css}.css");
                            break;
                        } elseif (file_exists(PATH_HOME . VENDOR . $libs . "/public/assets/{$css}.css")) {
                            $minifier->add(PATH_HOME . VENDOR . $libs . "/public/assets/{$css}.css");
                            break;
                        }
                    }
                }
            }
        } elseif (is_string($cssList)) {
            $css = $cssList;
            if (file_exists(PATH_HOME . "public/assets/" . $setor . "/{$css}.css")) {
                $minifier->add(PATH_HOME . "public/assets/" . $setor . "/{$css}.css");

            } elseif (file_exists(PATH_HOME . "public/assets/{$css}.css")) {
                $minifier->add(PATH_HOME . "public/assets/{$css}.css");

            } else {
                foreach (Helper::listFolder(PATH_HOME . VENDOR) as $libs) {
                    if (file_exists(PATH_HOME . VENDOR . $libs . "/public/assets/" . $setor . "/{$css}.css")) {
                        $minifier->add(PATH_HOME . VENDOR . $libs . "/public/assets/" . $setor . "/{$css}.css");
                        break;
                    } elseif (file_exists(PATH_HOME . VENDOR . $libs . "/public/assets/{$css}.css")) {
                        $minifier->add(PATH_HOME . VENDOR . $libs . "/public/assets/{$css}.css");
                        break;
                    }
                }
            }
        }

        $minifier->minify(PATH_HOME . "assetsPublic/core/" . $setor . "/core.min.css");
        self::setCssPrefixAndVariables("assetsPublic/core/" . $setor . "/core.min.css");

    }

    /**
     * @param string $pathCss
     * @param string|null $view
     */
    private static function setCssPrefixAndVariables(string $pathCss, string $view = null)
    {
        //troca variáveis CSS pelos valores
        $config = json_decode(file_get_contents(PATH_HOME . "_config/config.json"), !0);
        $dirTheme = (file_exists(PATH_HOME . "public/assets/theme.min.css") ? PATH_HOME . "public/assets/theme.min.css" : PATH_HOME . VENDOR . "config/public/assets/theme.min.css");
        $themeFile = file_get_contents($dirTheme);
        $theme = explode("}", explode(".theme{", $themeFile)[1])[0];
        $themeColor = explode("}", explode(".theme-text-aux{", $themeFile)[1])[0];
        $theme = explode("!important", explode("background-color:", $theme)[1])[0];
        $themeColor = explode("!important", explode("color:", $themeColor)[1])[0];

        $arrayReplace = ["../" => "", '{$home}' => HOME, '{$vendor}' => VENDOR, '{$version}' => $config['version'], '{$favicon}' => $config['favicon'], '{$logo}' => $config['logo'], '{$theme}' => $theme, '{$theme-aux}' => $themeColor, '{$publico}' => PUBLICO,
            '{{home}}' => HOME, '{{vendor}}' => VENDOR, '{{version}}' => $config['version'], '{{favicon}}' => $config['favicon'], '{{logo}}' => $config['logo'], '{{theme}}' => $theme, '{{theme-aux}}' => $themeColor, '{{publico}}' => PUBLICO];

        $file = file_get_contents(PATH_HOME . $pathCss);
        $file = str_replace(array_keys($arrayReplace), array_values($arrayReplace), $file);

        if($view)
            $file = self::setPrefixToCssDefinition($file, ".r-" . $view);

        //Salva CSS novamente
        $f = fopen(PATH_HOME . $pathCss, "w");
        fwrite($f, $file);
        fclose($f);
    }

    /**
     * Cria View Assets JS
     *
     * @param string $view
     * @param array $listaJs
     * @param string $lib
     * @param string $setor
     */
    private static function createPageJs(string $view, array $listaJs, string $lib, string $setor)
    {
        $pathFile = ($lib === DOMINIO ? "public/" : VENDOR . $lib . "/public/");
        $minifier = new \MatthiasMullie\Minify\JS("");

        if (!empty($listaJs)) {
            if (is_string($listaJs)) {
                $minifier->add(self::getAssetsContent($listaJs, $pathFile, 'js', $lib, $setor));
            } elseif (is_array($listaJs)) {
                foreach ($listaJs as $j)
                    $minifier->add(self::getAssetsContent($j, $pathFile, 'js', $lib, $setor));
            }
        }

        /**
         * Verifica overload para o assets
         */
        $findAssetView = !1;
        if ($lib !== DOMINIO) {
            if (file_exists(PATH_HOME . "public/overload/{$lib}/assets/{$setor}/{$view}.js")) {
                $minifier->add(file_get_contents(PATH_HOME . "public/overload/{$lib}/assets/{$setor}/{$view}.js"));
                $findAssetView = !0;
            } elseif (file_exists(PATH_HOME . "public/overload/{$lib}/assets/{$view}.js")) {
                $minifier->add(file_get_contents(PATH_HOME . "public/overload/{$lib}/assets/{$view}.js"));
                $findAssetView = !0;
            }
        }

        /**
         * Verifica overload in VENDOR se não encontrou overload in public
         */
        if (!$findAssetView) {
            foreach (Helper::listFolder(PATH_HOME . VENDOR) as $libs) {
                if (file_exists(PATH_HOME . VENDOR . $libs . "/public/overload/{$lib}/assets/{$setor}/{$view}.js")) {
                    $minifier->add(file_get_contents(PATH_HOME . VENDOR . $libs . "/public/overload/{$lib}/assets/{$setor}/{$view}.js"));
                    $findAssetView = !0;
                } elseif (file_exists(PATH_HOME . VENDOR . $libs . "/public/overload/{$lib}/assets/{$view}.js")) {
                    $minifier->add(file_get_contents(PATH_HOME . VENDOR . $libs . "/public/overload/{$lib}/assets/{$view}.js"));
                    $findAssetView = !0;
                }
            }
        }

        /**
         * Por fim, se não tiver overload, carrega o view assets padrão da lib
         */
        if (!$findAssetView) {
            if (file_exists(PATH_HOME . $pathFile . "assets/{$setor}/{$view}.js"))
                $minifier->add(file_get_contents(PATH_HOME . $pathFile . "assets/{$setor}/{$view}.js"));
            elseif (file_exists(PATH_HOME . $pathFile . "assets/{$view}.js"))
                $minifier->add(file_get_contents(PATH_HOME . $pathFile . "assets/{$view}.js"));
        }

        //Salva o Assets JS da view
        $minifier->minify(PATH_HOME . "assetsPublic/view/{$view}.min.js");
    }

    /**
     * Cria View Assets CSS
     *
     * @param string $view
     * @param array $listaCss
     * @param string $lib
     * @param string $setor
     */
    private static function createPageCss(string $view, array $listaCss, string $lib, string $setor)
    {
        $pathFile = ($lib === DOMINIO ? "public/" : VENDOR . $lib . "/public/");
        $minifier = new \MatthiasMullie\Minify\CSS("");

        if (!empty($listaCss)) {
            if (is_string($listaCss)) {
                $minifier->add(self::getAssetsContent($listaCss, $pathFile, 'css', $lib, $setor));
            } elseif (is_array($listaCss)) {
                foreach ($listaCss as $css)
                    $minifier->add(self::getAssetsContent($css, $pathFile, 'css', $lib, $setor));
            }
        }

        /**
         * Verifica overload para o assets
         */
        $findAssetView = !1;
        if ($lib !== DOMINIO) {
            if (file_exists(PATH_HOME . "public/overload/{$lib}/assets/{$setor}/{$view}.css")) {
                $minifier->add(file_get_contents(PATH_HOME . "public/overload/{$lib}/assets/{$setor}/{$view}.css"));
                $findAssetView = !0;
            } elseif (file_exists(PATH_HOME . "public/overload/{$lib}/assets/{$view}.css")) {
                $minifier->add(file_get_contents(PATH_HOME . "public/overload/{$lib}/assets/{$view}.css"));
                $findAssetView = !0;
            }
        }

        /**
         * Verifica overload in VENDOR se não encontrou overload in public
         */
        if (!$findAssetView) {
            foreach (Helper::listFolder(PATH_HOME . VENDOR) as $libs) {
                if (file_exists(PATH_HOME . VENDOR . $libs . "/public/overload/{$lib}/assets/{$setor}/{$view}.css")) {
                    $minifier->add(file_get_contents(PATH_HOME . VENDOR . $libs . "/public/overload/{$lib}/assets/{$setor}/{$view}.css"));
                    $findAssetView = !0;
                } elseif (file_exists(PATH_HOME . VENDOR . $libs . "/public/overload/{$lib}/assets/{$view}.css")) {
                    $minifier->add(file_get_contents(PATH_HOME . VENDOR . $libs . "/public/overload/{$lib}/assets/{$view}.css"));
                    $findAssetView = !0;
                }
            }
        }

        /**
         * Por fim, se não tiver overload, carrega o view assets padrão da lib
         */
        if (!$findAssetView) {
            if (file_exists(PATH_HOME . $pathFile . "assets/{$setor}/{$view}.css"))
                $minifier->add(file_get_contents(PATH_HOME . $pathFile . "assets/{$setor}/{$view}.css"));
            elseif (file_exists(PATH_HOME . $pathFile . "assets/{$view}.css"))
                $minifier->add(file_get_contents(PATH_HOME . $pathFile . "assets/{$view}.css"));
        }

        //Salva CSS assets da view
        $minifier->minify(PATH_HOME . "assetsPublic/view/{$view}.min.css");

        self::setCssPrefixAndVariables("assetsPublic/view/{$view}.min.css", $view);
    }

    /**
     * Procura o Asset e retorna o conteúdo
     *
     * @param string $asset
     * @param string $pathFile
     * @param string $extension
     * @param string $lib
     * @param string $setor
     * @return false|string
     */
    private static function getAssetsContent(string $asset, string $pathFile, string $extension, string $lib, string $setor)
    {
        if (DOMINIO !== $lib && file_exists(PATH_HOME . "public/overload/" . $setor . "/" . $lib . "/assets/" . $asset . ".{$extension}")) {
            return @file_get_contents(PATH_HOME . "public/overload/" . $setor . "/" . $lib . "/assets/" . $asset . ".{$extension}");

        } elseif (DOMINIO !== $lib && file_exists(PATH_HOME . "public/overload/" . $lib . "/assets/" . $asset . ".{$extension}")) {
            return @file_get_contents(PATH_HOME . "public/overload/" . $lib . "/assets/" . $asset . ".{$extension}");

        } elseif (file_exists(PATH_HOME . $pathFile . "assets/" . $setor . "/" . $asset . ".{$extension}")) {
            return @file_get_contents(PATH_HOME . $pathFile . "assets/" . $setor . "/" . $asset . ".{$extension}");

        } elseif (file_exists(PATH_HOME . $pathFile . "assets/" . $asset . ".{$extension}")) {
            return @file_get_contents(PATH_HOME . $pathFile . "assets/" . $asset . ".{$extension}");

        } elseif (file_exists(PATH_HOME . "public/assets/" . $setor . "/" . $asset . ".{$extension}")) {
            return @file_get_contents(PATH_HOME . "public/assets/" . $setor . "/" . $asset . ".{$extension}");

        } elseif (file_exists(PATH_HOME . "public/assets/" . $asset . ".{$extension}")) {
            return @file_get_contents(PATH_HOME . "public/assets/" . $asset . ".{$extension}");

        }

        return "";
    }

    /**
     * Seta prefixo em todas as definições CSS do arquivo CSS passado
     *
     * @param string $css
     * @param string $prefix
     * @return string|string[]|null
     */
    private static function setPrefixToCssDefinition(string $css, string $prefix)
    {
        # Wipe all block comments
        $css = preg_replace('!/\*.*?\*/!s', '', $css);

        $parts = explode('}', $css);
        $keyframeStarted = false;
        $mediaQueryStarted = false;

        foreach ($parts as &$part) {
            $part = trim($part); # Wht not trim immediately .. ?
            if (empty($part)) {
                $keyframeStarted = false;
                continue;
            } else # This else is also required
            {
                $partDetails = explode('{', $part);

                if (strpos($part, 'keyframes') !== false) {
                    $keyframeStarted = true;
                    continue;
                }

                if ($keyframeStarted) {
                    continue;
                }

                if (substr_count($part, "{") == 2) {
                    $mediaQuery = $partDetails[0] . "{";
                    $partDetails[0] = $partDetails[1];
                    $mediaQueryStarted = true;
                }

                $subParts = explode(',', $partDetails[0]);
                foreach ($subParts as &$subPart) {
                    if (trim($subPart) === "@font-face") continue;
                    else $subPart = $prefix . (preg_match('/^(html|body)/i', $subPart) ? str_replace(['html ', 'body ', 'html', 'body'], [" ", " ", "", ""], $subPart) : ' ' . trim($subPart));
                }

                if (substr_count($part, "{") == 2) {
                    $part = $mediaQuery . "\n" . implode(', ', $subParts) . "{" . $partDetails[2];
                } elseif (empty($part[0]) && $mediaQueryStarted) {
                    $mediaQueryStarted = false;
                    $part = implode(', ', $subParts) . "{" . $partDetails[2] . "}\n"; //finish media query
                } else {
                    if (isset($partDetails[1])) {   # Sometimes, without this check,
                        # there is an error-notice, we don't need that..
                        $part = implode(', ', $subParts) . "{" . $partDetails[1];
                    }
                }

                unset($partDetails, $mediaQuery, $subParts); # Kill those three ..
            }
            unset($part); # Kill this one as well
        }

        # Finish with the whole new prefixed string/file in one line
        return (preg_replace('/\s+/', ' ', implode("} ", $parts)));
    }
}