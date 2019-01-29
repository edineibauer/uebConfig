<?php
if(!empty($link->getVariaveis())) {
    $force = $link->getVariaveis()[0];
    if ($force === "force" && file_exists(PATH_HOME . "_config/updates/version.txt"))
        unlink(PATH_HOME . "_config/updates/version.txt");
}

$up = new \Config\UpdateSystem();
?>
<script>
    setCookie("token", 0, -1);
    setCookie("id", 0, -1);
    setCookie("nome", "", -1);
    setCookie("nome_usuario", "", -1);
    setCookie("email", "", -1);
    setCookie("setor", 0, -1);
    setCookie("nivel", 0, -1);
    setCookie("update", '', -1);
    window.location.href = "<?=HOME?>";
</script>
