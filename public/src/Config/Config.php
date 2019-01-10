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
        $rotas = json_decode(file_get_contents(PATH_HOME . "_config/route.json"), true);

        /* Por hora, não cria cache de conteúdo do painel administrativo */
        /*if(!empty($_SESSION['userlogin']) && $_SESSION['userlogin']['setor'] > 0) {
            $rotas[] = "dashboard";

            if($_SESSION['userlogin']['setor'] == 1){
                $rotas[] = "dev-ui";
                $rotas[] = "entity-ui";
            }
        }*/

        return $rotas;
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

        $conf .= "\nrequire_once PATH_HOME . 'vendor/autoload.php';\nnew Route\Sessao();";

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

            $dados = "RewriteCond %{HTTP_HOST} ^" . ($www ? "{$domain}\nRewriteRule ^ http" . ($protocol ? "s" : "") . "://www.{$domain}%{REQUEST_URI}" : "www.(.*) [NC]\nRewriteRule ^(.*) http" . ($protocol ? "s" : "") . "://%1/$1") . " [L,R=301]";
            self::writeFile(".htaccess", str_replace(['{$dados}', '{$dominio}', '{$vendor}'], [$dados, $domain, $vendor], file_get_contents("{$path}public/installTemplates/htaccess.txt")));
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
            fwrite($fp, $content);
            fclose($fp);

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
     * Retorna lista com entidades que não devem ser exibidas na dashboard por setor
     * @return array
     */
    public static function getMenuNotAllowAll(): array
    {
        $setor = empty($_SESSION['userlogin']['setor']) ? 0 : $_SESSION['userlogin']['setor'];
        $path = "public/dash/-menu.json";
        $pathSession = "public/dash/{$setor}/-menu.json";
        $file = [];

        //public base
        if (file_exists(PATH_HOME . $path))
            $file = self::addNotShow(PATH_HOME . $path, $file);

        //public session
        if (file_exists(PATH_HOME . $pathSession))
            $file = self::addNotShow(PATH_HOME . $pathSession, $file);

        //para cada biblioteca
        foreach (Helper::listFolder(PATH_HOME . VENDOR) as $lib) {
            $base = PATH_HOME . VENDOR . "{$lib}/";

            //lib base
            if (file_exists($base . $path))
                $file = self::addNotShow($base . $path, $file, $base);

            //lib session
            if (file_exists($base . $pathSession))
                $file = self::addNotShow($base . $pathSession, $file, $base);
        }

        return $file;
    }

    /**
     * Retorna entidades que não devem ser exibidas na dashboard deste setor
     * @return array
     */
    public static function getMenuNotAllow(): array
    {
        $setor = empty($_SESSION['userlogin']['setor']) ? 0 : $_SESSION['userlogin']['setor'];
        return self::getMenuNotAllowAll()[$setor] ?? [];
    }

    /**
     * @param string $dir
     * @param array $file
     * @param string|null $dirPermission
     * @return array
     */
    private static function addNotShow(string $dir, array $file, string $dirPermission = null): array
    {
        $m = json_decode(file_get_contents($dir), true);
        if (!empty($m)) {
            if (is_string($m)) {
                for ($e = 0; $e < 21; $e++) {
                    //Adiciona entidade ao setor
                    if ((!isset($file[$e]) || !in_array($m, $file[$e])) && (empty($dirPermission) || file_exists($dirPermission . "public/entity/cache/{$m}.json")))
                        $file[$e][] = $m;
                }
            } elseif (is_array($m)) {
                foreach ($m as $setor => $entity) {
                    if ($setor === "*") {
                        for ($e = 0; $e < 21; $e++) {
                            //Adiciona entidade ao setor
                            if(is_array($entity)) {
                                foreach ($entity as $entit) {
                                    if ((empty($dirPermission) || file_exists($dirPermission . "public/entity/cache/{$entit}.json")) && (!isset($file[$setor]) || !in_array($entit, $file)))
                                        $file[$setor][] = $entit;
                                }
                            } elseif(is_string($entity)) {
                                if ((!isset($file[$e]) || !in_array($entity, $file[$e])) && (empty($dirPermission) || file_exists($dirPermission . "public/entity/cache/{$entity}.json")))
                                    $file[$e][] = $entity;
                            }
                        }
                    } elseif (is_array($entity)) {
                        foreach ($entity as $e) {
                            if ((empty($dirPermission) || file_exists($dirPermission . "public/entity/cache/{$e}.json")) && (!isset($file[$setor]) || !in_array($e, $file)))
                                $file[$setor][] = $e;
                        }
                    }
                }
            }
        }

        return $file;
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
            foreach ($file as $setor => $datum) {
                foreach ($datum as $entity => $dados) {
                    foreach ($dados as $action => $value)
                        $file[$setor][$entity][$action] = $value === "true";
                }
            }
        }

        return $file;
    }

    /**
     * Retorna a lista de entidades bloqueadas por setor
     * @return array
     */
    public static function getEntityNotAllow(): array
    {
        $file = [];
        if (file_exists(PATH_HOME . "public/entity/-entity.json"))
            $file = json_decode(file_get_contents(PATH_HOME . "public/entity/-entity.json"), true);

        foreach (Helper::listFolder(PATH_HOME . VENDOR) as $lib) {
            if (file_exists(PATH_HOME . VENDOR . "{$lib}/public/entity/-entity.json")) {
                $json = json_decode(file_get_contents(PATH_HOME . VENDOR . "{$lib}/public/entity/-entity.json"), true);
                foreach ($json as $setor => $info) {
                    foreach ($info as $entity) {
                        if (file_exists(PATH_HOME . VENDOR . "{$lib}/public/entity/cache/{$entity}.json")) {
                            if ($setor === "*") {
                                for ($e = 0; $e < 20; $e++) {
                                    //Adiciona entidade ao setor
                                    if (!isset($file[$e]) || !in_array($entity, $file[$e]))
                                        $file[$e][] = $entity;
                                }
                            } else {
                                //Adiciona entidade ao setor
                                if (!in_array($entity, $file[$setor]))
                                    $file[$setor][] = $entity;
                            }
                        }
                    }
                }
            }
        }

        return $file;
    }
}