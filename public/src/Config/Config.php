<?php

namespace Config;

use Helpers\Helper;
use Tholu\Packer\Packer;

class Config
{

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
        if (file_exists($path . "service-worker.js")) {
            $serviceWorker = file_get_contents($path . "service-worker.js");
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
        $pathHome = defined("PATH_HOME") ? PATH_HOME : "../../../";
        if (!empty($vendor) || defined("DOMINIO")) {
            if (empty($vendor)) {
                $vendor = VENDOR;
                $domain = DOMINIO;
                $www = WWW;
                $protocol = SSL;
                $path = $pathHome . VENDOR . "config/";
            } else {
                $path = "";
            }

            $vendor = str_replace('/', '\\/', $vendor);
            $rewriteDomain = "RewriteRule ^{$vendor}{$domain}\/public\/(.*)$ public/$1 [L]";
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
     * @param string|null $setor
     * @return array
     */
    public static function getPermission(string $setor = null): array
    {
        $file = [];
        if (file_exists(PATH_HOME . "_config/permissoes.json")) {
            $file = json_decode(file_get_contents(PATH_HOME . "_config/permissoes.json"), !0);

            //convert true string para true boolean
            if (is_array($file)) {
                if(!empty($setor)) {
                    $datum = $file[$setor];
                    $file = [];
                    if (!empty($datum)) {
                        foreach ($datum as $entity => $dados) {
                            if (!empty($dados)) {
                                foreach ($dados as $action => $value)
                                    $file[$entity][$action] = $value === "true";
                            }
                        }
                    }
                } else {
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

        $_COOKIE['update'] = $update;
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
    }

    private static function getTiposUsuarios()
    {
        $lista = ["0", "admin"];
        foreach (Helper::listFolder(PATH_HOME . "entity/cache/info") as $info) {
            $infoData = json_decode(file_get_contents(PATH_HOME . "entity/cache/info/{$info}"), !0);
            if (!empty($infoData['user']) && $infoData['user'] === 1)
                $lista[] = str_replace(".json", "", $info);
        }

        return $lista;
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

        if (empty($view)) {


            /**
             * Cria os assets das views de forma genérica
             */
            $listaViews = ['generico' => []];
            $tiposUsuarios = self::getTiposUsuarios();

            /**
             * GENÉRICO VIEW
             */
            if (file_exists(PATH_HOME . "/public/view")) {
                foreach (Helper::listFolder(PATH_HOME . "/public/view") as $viewLib) {
                    $viewName = str_replace(['.php', '.html'], '', $viewLib);
                    if (preg_match('/.(html|php)$/i', $viewLib) && !in_array($viewName, array_keys($listaViews['generico'])))
                        $listaViews['generico'][$viewName] = DOMINIO;
                }
            }

            /**
             * GENÉRICO VIEW Libs
             */
            foreach (Helper::listFolder(PATH_HOME . VENDOR) as $lib) {
                if (file_exists(PATH_HOME . VENDOR . $lib . "/public/view")) {
                    foreach (Helper::listFolder(PATH_HOME . VENDOR . $lib . "/public/view") as $viewLib) {
                        $viewName = str_replace(['.php', '.html'], '', $viewLib);
                        if (preg_match('/.(html|php)$/i', $viewLib) && !in_array($viewName, array_keys($listaViews['generico'])))
                            $listaViews['generico'][$viewName] = $lib;
                    }
                }
            }

            /**
             * SETOR VIEW
             */
            foreach ($tiposUsuarios as $tiposUsuario) {
                Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic/view/" . $tiposUsuario);
                $listaViews[$tiposUsuario] = [];

                /**
                 * Public
                 */
                if (file_exists(PATH_HOME . "/public/view/" . $tiposUsuario)) {
                    foreach (Helper::listFolder(PATH_HOME . "/public/view/" . $tiposUsuario) as $viewLib) {
                        $viewName = str_replace(['.php', '.html'], '', $viewLib);
                        if (preg_match('/.(html|php)$/i', $viewLib) && !in_array($viewName, array_keys($listaViews[$tiposUsuario])))
                            $listaViews[$tiposUsuario][$viewName] = DOMINIO;
                    }
                }

                /**
                 * Libs
                 */
                foreach (Helper::listFolder(PATH_HOME . VENDOR) as $lib) {
                    if (file_exists(PATH_HOME . VENDOR . $lib . "/public/view/" . $tiposUsuario)) {
                        foreach (Helper::listFolder(PATH_HOME . VENDOR . $lib . "/public/view/" . $tiposUsuario) as $viewLib) {
                            $viewName = str_replace(['.php', '.html'], '', $viewLib);
                            if (preg_match('/.(html|php)$/i', $viewLib) && !in_array($viewName, array_keys($listaViews[$tiposUsuario])))
                                $listaViews[$tiposUsuario][$viewName] = $lib;
                        }
                    }
                }
            }

            foreach ($listaViews as $tipoUser => $listaView) {
                $tipoUser = $tipoUser === 'generico' ? null : $tipoUser;
                foreach ($listaView as $view => $lib) {
                    $param = self::getViewParam($view, $lib, $tipoUser);
                    self::createPageJs($view, $param['js'], $lib, $tipoUser);
                    self::createPageCss($view, $param['css'], $lib, $tipoUser);
                }
            }

            /**
             * in DEV
             */
        } elseif (!empty($lib)) {
            $setor = self::getSetor();
            $param = (!empty($param) && isset($param['js']) && isset($param['css']) ? $param : ['js' => [], 'css' => []]);

            if (file_exists(PATH_HOME . "assetsPublic/view/{$setor}/{$view}.min.js")) {
                self::createPageJs($view, $param['js'], $lib, $setor);
            } elseif (file_exists(PATH_HOME . "assetsPublic/view/{$view}.min.js")) {
                self::createPageJs($view, $param['js'], $lib);
            } elseif(DEV) {
                self::createPageJs($view, $param['js'], $lib);
            }

            if (file_exists(PATH_HOME . "assetsPublic/view/{$setor}/{$view}.min.css")) {
                self::createPageCss($view, $param['css'], $lib, $setor);
            } elseif (file_exists(PATH_HOME . "assetsPublic/view/{$view}.min.css")) {
                self::createPageCss($view, $param['css'], $lib);
            } elseif(DEV) {
                self::createPageCss($view, $param['css'], $lib);
            }
        }
    }

    /**
     * Obtém os parametros da view
     *
     * @param string $view
     * @param string $lib
     * @param string|null $setor
     * @return array
     */
    public static function getViewParam(string $view, string $lib, string $setor = null)
    {
        $base = [
            "version" => VERSION,
            "css" => [],
            "js" => [],
            "meta" => "",
            "font" => "",
            "title" => "",
            "descricao" => "",
            "data" => 0,
            "front" => [],
            "header" => !0,
            "navbar" => !0,
            "setor" => "",
            "!setor" => "",
            "redirect" => "403",
            "vendor" => VENDOR
        ];

        /**
         * Verifica overload para o assets
         */
        $findParamView = !1;
        $param = [];
        if ($lib !== DOMINIO) {
            if ((!empty($setor) || $setor === "0") && file_exists(PATH_HOME . "public/overload/{$lib}/param/{$setor}/{$view}.json")) {
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
                if ((!empty($setor) || $setor === "0") && file_exists(PATH_HOME . VENDOR . $libs . "/public/overload/{$lib}/param/{$setor}/{$view}.json")) {
                    $param = json_decode(@file_get_contents(PATH_HOME . VENDOR . $libs . "/public/overload/{$lib}/param/{$setor}/{$view}.json"), !0);
                    $findParamView = !0;
                } elseif (file_exists(PATH_HOME . VENDOR . $libs . "/public/overload/{$lib}/param/{$view}.json")) {
                    $param = json_decode(@file_get_contents(PATH_HOME . VENDOR . $libs . "/public/overload/{$lib}/param/{$view}.json"), !0);
                    $findParamView = !0;
                }
            }
        }

        /**
         * Por fim, se não tiver overload, carrega o param padrão da lib
         */
        if (!$findParamView) {
            $pathFile = ($lib === DOMINIO ? "public/" : PATH_HOME . VENDOR . $lib . "/public/");
            if ((!empty($setor) || $setor === "0") && file_exists($pathFile . "param/{$setor}/{$view}.json"))
                $param = json_decode(@file_get_contents($pathFile . "param/{$setor}/{$view}.json"), !0);
            elseif (file_exists($pathFile . "param/{$view}.json"))
                $param = json_decode(@file_get_contents($pathFile . "param/{$view}.json"), !0);
        }

        /**
         * Convert js para array caso seja string
         */
        if (!isset($param['js']) || !is_array($param['js']))
            $param['js'] = (!empty($param['js']) && is_string($param['js']) ? [$param['js']] : []);

        /**
         * Convert css para array caso seja string
         */
        if (!isset($param['css']) || !is_array($param['css']))
            $param['css'] = (!empty($param['css']) && is_string($param['css']) ? [$param['css']] : []);

        return array_merge($base, $param);
    }

    /**
     * Obtém o HTML do template
     * @param string $template
     * @return string
     */
    public static function getTemplateContent(string $template)
    {
        $setor = self::getSetor();

        /**
         * Busca template em setor public
         * Busca template em public
         * Busca template nas libs setor
         * Busca tempalte nas libs
         */
        if (file_exists(PATH_HOME . "public/tpl/{$setor}/{$template}.mustache"))
            return file_get_contents(PATH_HOME . "public/tpl/{$setor}/{$template}.mustache");

        if (file_exists(PATH_HOME . "public/tpl/{$template}.mustache"))
            return file_get_contents(PATH_HOME . "public/tpl/{$template}.mustache");

        $libs = Helper::listFolder(PATH_HOME . VENDOR);
        foreach ($libs as $lib) {
            if (file_exists(PATH_HOME . VENDOR . $lib . "/public/tpl/{$setor}/{$template}.mustache"))
                return file_get_contents(PATH_HOME . VENDOR . $lib . "/public/tpl/{$setor}/{$template}.mustache");
        }

        foreach ($libs as $lib) {
            if (file_exists(PATH_HOME . VENDOR . $lib . "/public/tpl/{$template}.mustache"))
                return file_get_contents(PATH_HOME . VENDOR . $lib . "/public/tpl/{$template}.mustache");
        }

        return "";
    }

    /**
     * Obtém json from a file
     * @param string $file
     * @return array
     */
    public static function getJsonFile(string $file): array
    {
        if (file_exists($file))
            return json_decode(file_get_contents($file), !0);

        return [];
    }

    /**
     * Obtém setor do usuário
     * @return string
     */
    public static function getSetor(): string
    {
        return !empty($_SESSION['userlogin']) ? $_SESSION['userlogin']['setor'] : "0";
    }

    public static function includeGoogleLogin()
    {
        include_once PATH_HOME . VENDOR . "login/public/view/inc/googleLogin.php";
    }

    /**
     * Retorna os setores de um sistema (alias to getSetorSystem)
     * @param string|null $sistem
     * @return array
     */
    public static function getSetores(string $sistem = null): array
    {
        return self::getSetorSystem($sistem);
    }

    /**
     * Retorna os setores de um sistema
     * @param string|null $sistem
     * @return array
     */
    public static function getSetorSystem(string $sistem = null): array
    {
        $list = [];
        foreach (Helper::listFolder(PATH_HOME . "entity/cache/info") as $item) {
            if(preg_match("/\.json$/i", $item)) {
                $info = json_decode(file_get_contents(PATH_HOME . "entity/cache/info/{$item}"), !0);
                if(isset($info['user']) && $info['user'] === 1 && empty($sistem))
                    $list[] = str_replace(".json", "", $item);
            }
        }

        return $list;
    }

    /**
     * Verifica se tem permissão de acesso a este param route
     * @param array|string $param
     * @return bool
     */
    public static function paramPermission($param): bool
    {
        $setor = self::getSetor();
        return ((empty($param['setor']) || ((is_string($param['setor']) && $param['setor'] === $setor) || (is_array($param['setor']) && in_array($setor, $param['setor'])))) && (empty($param['!setor']) || ((is_string($param["!setor"]) && $param["!setor"] !== $setor) || (is_array($param["!setor"]) &&!in_array($setor, $param["!setor"])))));
    }

    /**
     * @param string $entity
     * @param array $options
     * @param bool $anyOne
     * @return bool
     */
    public static function haveEntityPermission(string $entity, array $options = [], bool $anyOne = false): bool
    {
        $setor = self::getSetor();
        if($setor === "admin")
            return !0;

        if(empty($options)) {
            $options = ["read", "create", "update", "delete"];
            $anyOne = !0;
        }

        $permissoes = self::getPermission($setor);
        $permissoes = $permissoes[$entity] ?? [];

        if(in_array("read", $options) && (empty($permissoes['read']) || !$permissoes['read']))
            return !1;
        elseif($anyOne && in_array("read", $options) && !empty($permissoes['read']) && $permissoes['read'])
            return !0;

        if(in_array("create", $options) && (empty($permissoes['create']) || !$permissoes['create']))
            return !1;
        elseif($anyOne && in_array("create", $options) && !empty($permissoes['create']) && $permissoes['create'])
            return !0;

        if(in_array("update", $options) && (empty($permissoes['update']) || !$permissoes['update']))
            return !1;
        elseif($anyOne && in_array("update", $options) && !empty($permissoes['update']) && $permissoes['update'])
            return !0;

        if(in_array("delete", $options) && (empty($permissoes['delete']) || !$permissoes['delete']))
            return !1;
        elseif($anyOne && in_array("delete", $options) && !empty($permissoes['delete']) && $permissoes['delete'])
            return !0;

        return !0;
    }

    /**
     * @param string $entity
     * @return bool
     */
    public static function haveEntityPermissionRead(string $entity): bool
    {
        return self::haveEntityPermission($entity, ["read"]);
    }

    /**
     * @param string $entity
     * @return bool
     */
    public static function haveEntityPermissionCreate(string $entity): bool
    {
        return self::haveEntityPermission($entity, ["create"]);
    }

    /**
     * @param string $entity
     * @return bool
     */
    public static function haveEntityPermissionUpdate(string $entity): bool
    {
        return self::haveEntityPermission($entity, ["update"]);
    }

    /**
     * @param string $entity
     * @return bool
     */
    public static function haveEntityPermissionDelete(string $entity): bool
    {
        return self::haveEntityPermission($entity, ["delete"]);
    }

    /**
     * Obtém lista de todos os diretórios para o caminho em public
     * considerando bibliotecas e overloads
     * @param string $dir
     * @return array
     */
    public static function getRoutesTo(string $dir) :array
    {
        $setor = self::getSetor();

        /**
         * Public Setor
         */
        $list = [PATH_HOME . "public/{$dir}/" . $setor . "/"];

        /**
         * Public
         */
        $list[] = PATH_HOME . "public/{$dir}/";

        /**
         * Overload in Public
         */
        if (file_exists(PATH_HOME . "public/overload")) {
            foreach (Helper::listFolder(PATH_HOME . "public/overload") as $libOverload) {
                $list[] = PATH_HOME . "public/overload/" . $libOverload . "/{$dir}/" . $setor . "/";
                $list[] = PATH_HOME . "public/overload/" . $libOverload . "/{$dir}/";
            }
        }

        /**
         * Overload in Libs
         */
        foreach (Helper::listFolder(PATH_HOME . VENDOR) as $lib) {
            if (file_exists(PATH_HOME . VENDOR . $lib . "/public/overload")) {
                foreach (Helper::listFolder(PATH_HOME . VENDOR . $lib . "/public/overload") as $libOverload) {
                    $list[] = PATH_HOME . VENDOR . $lib . "/public/overload/" . $libOverload . "/{$dir}/" . $setor . "/";
                    $list[] = PATH_HOME . VENDOR . $lib . "/public/overload/" . $libOverload . "/{$dir}/";
                }
            }
        }

        /**
         * Libs Setor
         */
        foreach (Helper::listFolder(PATH_HOME . VENDOR) as $lib)
            $list[] = PATH_HOME . VENDOR . $lib . "/public/{$dir}/" . $setor . "/";

        /**
         * Libs
         */
        foreach (Helper::listFolder(PATH_HOME . VENDOR) as $lib)
            $list[] = PATH_HOME . VENDOR . $lib . "/public/{$dir}/";

        return $list;
    }

    /**
     * @param string $dir
     * @param string $extensao
     * @return array
     */
    public static function getRoutesFilesTo(string $dir, string $extensao = "") :array
    {
        $list = [];
        foreach (self::getRoutesTo($dir) as $path)
            $list = self::getFilesRoute($path, $extensao, $list);

        return $list;
    }

    /**
     * Cria o Core JS e CSS do setor de acesso
     */
    public static function createCore()
    {
        //copia theme padrão para pasta do site
        if (!file_exists(PATH_HOME . "public/assets/theme.min.css") && file_exists(PATH_HOME . VENDOR . "config/public/assets/theme.min.css"))
            copy(PATH_HOME . VENDOR . "config/public/assets/theme.min.css", PATH_HOME . "public/assets/theme.min.css");

        Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic");
        Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic/core");

        $param = (file_exists(PATH_HOME . "_config/param.json") ? json_decode(file_get_contents(PATH_HOME . "_config/param.json"), !0) : ['js' => [], 'css' => []]);
        foreach (self::getTiposUsuarios() as $listaUser) {
            Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic/core/" . $listaUser);

            self::createCoreJs($param['js'], $listaUser);
            self::createCoreCss($param['css'], $listaUser);
        }
    }

    /**
     * @param string $path
     * @param string $extensao
     * @param array $list
     * @return array
     */
    private static function getFilesRoute(string $path, string $extensao = "", array $list = []): array
    {
        if (file_exists($path)) {
            foreach (Helper::listFolder($path) as $item) {
                if ($item !== ".htaccess" && !is_dir($path . $item) && ($extensao === "" || pathinfo($item, PATHINFO_EXTENSION) === $extensao) && !in_array($item, array_keys($list)))
                    $list[$item] = $path . $item;
            }
        }

        return $list;
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

        if ($view)
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
     * @param string|null $setor
     */
    private static function createPageJs(string $view, array $listaJs, string $lib, string $setor = null)
    {
        $pathFile = ($lib === DOMINIO ? "public/" : VENDOR . $lib . "/public/");
        $minifier = new \MatthiasMullie\Minify\JS("");

        if (!empty($listaJs)) {
            foreach ($listaJs as $j)
                $minifier->add(self::getAssetsContent($j, $pathFile, 'js', $lib, $setor));
        }

        /**
         * Verifica overload para o assets
         */
        $findAssetView = !1;
        if ($lib !== DOMINIO) {
            if ((!empty($setor) || $setor === "0") && file_exists(PATH_HOME . "public/overload/{$lib}/assets/{$setor}/{$view}.js")) {
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
                if ((!empty($setor) || $setor === "0") && file_exists(PATH_HOME . VENDOR . $libs . "/public/overload/{$lib}/assets/{$setor}/{$view}.js")) {
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
            if ((!empty($setor) || $setor === "0") && file_exists(PATH_HOME . $pathFile . "assets/{$setor}/{$view}.js"))
                $minifier->add(file_get_contents(PATH_HOME . $pathFile . "assets/{$setor}/{$view}.js"));
            elseif (file_exists(PATH_HOME . $pathFile . "assets/{$view}.js"))
                $minifier->add(file_get_contents(PATH_HOME . $pathFile . "assets/{$view}.js"));
        }

        //Salva o Assets JS da view
        if ((!empty($setor) || $setor === "0")) {
            Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic/view/{$setor}");
            $minifier->minify(PATH_HOME . "assetsPublic/view/{$setor}/{$view}.min.js");
        } else {
            $minifier->minify(PATH_HOME . "assetsPublic/view/{$view}.min.js");
        }
    }

    /**
     * Cria View Assets CSS
     *
     * @param string $view
     * @param array $listaCss
     * @param string $lib
     * @param string|null $setor
     */
    private static function createPageCss(string $view, array $listaCss, string $lib, string $setor = null)
    {
        $pathFile = ($lib === DOMINIO ? "public/" : VENDOR . $lib . "/public/");
        $minifier = new \MatthiasMullie\Minify\CSS("");

        if (!empty($listaCss)) {
            foreach ($listaCss as $css)
                $minifier->add(self::getAssetsContent($css, $pathFile, 'css', $lib, $setor));
        }

        /**
         * Verifica overload para o assets
         */
        $findAssetView = !1;
        if ($lib !== DOMINIO) {
            if ((!empty($setor) || $setor === "0") && file_exists(PATH_HOME . "public/overload/{$lib}/assets/{$setor}/{$view}.css")) {
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
                if ((!empty($setor) || $setor === "0") && file_exists(PATH_HOME . VENDOR . $libs . "/public/overload/{$lib}/assets/{$setor}/{$view}.css")) {
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
            if ((!empty($setor) || $setor === "0") && file_exists(PATH_HOME . $pathFile . "assets/{$setor}/{$view}.css"))
                $minifier->add(file_get_contents(PATH_HOME . $pathFile . "assets/{$setor}/{$view}.css"));
            elseif (file_exists(PATH_HOME . $pathFile . "assets/{$view}.css"))
                $minifier->add(file_get_contents(PATH_HOME . $pathFile . "assets/{$view}.css"));
        }

        //Salva CSS assets da view
        if ((!empty($setor) || $setor === "0")) {
            Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic/view/{$setor}");
            $minifier->minify(PATH_HOME . "assetsPublic/view/{$setor}/{$view}.min.css");
            self::setCssPrefixAndVariables("assetsPublic/view/{$setor}/{$view}.min.css", $view);
        } else {
            $minifier->minify(PATH_HOME . "assetsPublic/view/{$view}.min.css");
            self::setCssPrefixAndVariables("assetsPublic/view/{$view}.min.css", $view);
        }
    }

    /**
     * Procura o Asset e retorna o conteúdo
     *
     * @param string $asset
     * @param string $pathFile
     * @param string $extension
     * @param string $lib
     * @param string|null $setor
     * @return false|string
     */
    private static function getAssetsContent(string $asset, string $pathFile, string $extension, string $lib, string $setor = null)
    {
        if(preg_match('/^http/i', $asset)) {
            return @file_get_contents($asset);

        } elseif (DOMINIO !== $lib && (!empty($setor) || $setor === "0") && file_exists(PATH_HOME . "public/overload/" . $setor . "/" . $lib . "/assets/" . $asset . ".{$extension}")) {
            return @file_get_contents(PATH_HOME . "public/overload/" . $setor . "/" . $lib . "/assets/" . $asset . ".{$extension}");

        } elseif (DOMINIO !== $lib && file_exists(PATH_HOME . "public/overload/" . $lib . "/assets/" . $asset . ".{$extension}")) {
            return @file_get_contents(PATH_HOME . "public/overload/" . $lib . "/assets/" . $asset . ".{$extension}");

        } elseif ((!empty($setor) || $setor === "0") && file_exists(PATH_HOME . $pathFile . "assets/" . $setor . "/" . $asset . ".{$extension}")) {
            return @file_get_contents(PATH_HOME . $pathFile . "assets/" . $setor . "/" . $asset . ".{$extension}");

        } elseif (file_exists(PATH_HOME . $pathFile . "assets/" . $asset . ".{$extension}")) {
            return @file_get_contents(PATH_HOME . $pathFile . "assets/" . $asset . ".{$extension}");

        } elseif ((!empty($setor) || $setor === "0") && file_exists(PATH_HOME . "public/assets/" . $setor . "/" . $asset . ".{$extension}")) {
            return @file_get_contents(PATH_HOME . "public/assets/" . $setor . "/" . $asset . ".{$extension}");

        } elseif (file_exists(PATH_HOME . "public/assets/" . $asset . ".{$extension}")) {
            return @file_get_contents(PATH_HOME . "public/assets/" . $asset . ".{$extension}");

        } elseif (file_exists(PATH_HOME . VENDOR . "config/public/assets/" . $asset . ".{$extension}")) {
            return @file_get_contents(PATH_HOME . VENDOR . "config/public/assets/" . $asset . ".{$extension}");
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