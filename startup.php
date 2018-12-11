<?php
ob_start();
if (!file_exists('../../../_config')) {
    $dados = filter_input_array(INPUT_POST, FILTER_DEFAULT);
    if ($dados)
        include_once 'public/include/create.php';
    else
        include_once 'public/include/form.php';
}
ob_end_flush();