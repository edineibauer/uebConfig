<?php

$domain = ($_SERVER['SERVER_NAME'] === "localhost" ? explode('/', $_SERVER['REQUEST_URI'])[1] : $_SERVER['SERVER_NAME']);
$table = explode(".", $domain)[0];
$pre = substr(str_replace(array('a', 'e', 'i', 'o', 'u'), '', $table), 0, 3) . "_";

$localhost = ($_SERVER['SERVER_NAME'] === "localhost" ? true : false);
$porta = $_SERVER['SERVER_PORT'];
$dominio = ($localhost ? (in_array($porta, ["80", "8080"]) ? explode('/', $_SERVER['REQUEST_URI'])[1] : $porta) : explode('.', $_SERVER['SERVER_NAME'])[0]);
$pathhome = $_SERVER['DOCUMENT_ROOT'] . "/" . (!empty($dominio) && $_SERVER['HTTP_HOST'] == 'localhost' ? $dominio . "/" : "");
$dir = $pathhome . "vendor/ueb/";
$directory = array();
if (file_exists($dir)) {
    $i = 0;
    foreach (scandir($dir) as $b):
        if ($b !== "." && $b !== ".." && $i < 500):
            $directory[] = $b;
            $i++;
        endif;
    endforeach;
}

$options = "";
foreach ($directory as $item) {
    if(file_exists($dir . $item . "/public/_config/config.json"))
        $options .= (empty($options) ? "<select name='base' style='display: block;width: auto;float: right;'><option value=''>Nenhum</option>" : "") . "<option value='" . $dir . $item . "'>" . ucfirst(str_replace(["-", "_"], "", $item)) . "</option>";
}
if(!empty($options))
    $options .= "</select>";

?>
<link rel="stylesheet" href="public/include/config.css" />
<div class="row">
    <form method="post" action="" enctype="multipart/form-data" class="container">
        <?php if (!empty($options)) { ?>
            <div class="card" style="padding: 20px 10px; display: flex;">
                <div class="input-field col s12 m6" style="margin: 0;">
                    <h5 style="font-weight: lighter">Template de Sistema Base</h5>
                </div>
                <div class="input-field col s12 m6" style="text-align: right;text-align: right; margin: 0.1em 0;">
                    <?=$options?>
                </div>
            </div>
        <?php } ?>
        <div class="card" style="background: #FFF; padding:30px; margin-top:20px; border-radius: 5px">
            <br>
            <h4>Informações do Projeto</h4>
            <div class="input-field col s12 m6">
                <input id="sitename" name="sitename" type="text" class="validate">
                <label for="sitename">Nome do Projeto</label>
            </div>
            <div class="input-field col s12 m6">
                <input id="sitedesc" name="sitedesc" type="text" class="validate">
                <label for="sitedesc">Projeto Descrição</label>
            </div>

            <div class="file-field input-field col s12 m6">
                <div class="btn">
                    <span>Logo</span>
                    <input type="file" name="logo" accept=".jpeg, .jpg, .png">
                </div>
                <div class="file-path-wrapper">
                    <input class="file-path validate" type="text">
                </div>
            </div>

            <div class="file-field input-field col s12 m6">
                <div class="btn">
                    <span>Favicon</span>
                    <input type="file" name="favicon" accept=".jpeg, .jpg, .png">
                </div>
                <div class="file-path-wrapper">
                    <input class="file-path validate" type="text">
                </div>
            </div>

            <div class="row clearfix">
                <br>
                <div class="switch col s6 m4">
                    <label>
                        HTTP
                        <input type="checkbox" name="protocol">
                        <span class="lever"></span>
                        HTTPS
                    </label>
                </div>
                <div class="switch col s6 m4">
                    <label>
                        sem WWW
                        <input type="checkbox" name="www">
                        <span class="lever"></span>
                        com WWW
                    </label>
                </div>
            </div>

            <div class="row clearfix">
                <br>
                <h4>Conexão ao Banco</h4>

                <div class="input-field col s12 m6">
                    <input id="user" name="user" type="text" class="validate" value="root">
                    <label for="user">Usuário</label>
                </div>
                <div class="input-field col s12 m6">
                    <input id="pass" name="pass" type="text" class="validate">
                    <label for="pass">Senha</label>
                </div>

                <div class="input-field col s12 m6">
                    <input id="database" name="database" type="text" class="validate" value="<?=$table?>">
                    <label for="database">Nome do Banco</label>
                </div>

                <div class="input-field col s12 m6">
                    <input id="host" name="host" value="localhost" type="text" class="validate">
                    <label for="host">Host</label>
                </div>

                <div class="input-field col s12 m6">
                    <input id="pre" name="pre" type="text" class="validate" value="<?=$pre?>">
                    <label for="pre">Prefixo das Tabelas</label>
                </div>
            </div>

            <button type="submit" class="waves-effect waves-light btn">Criar Projeto</button>

        </div>
    </form>
</div>

<script src="public/include/jquery.js"></script>
<script src="public/include/config.js"></script>
<script src="public/include/materialize.min.js"></script>