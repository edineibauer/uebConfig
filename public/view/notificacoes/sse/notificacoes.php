<?php

$data['data'] = [];
$up = new \Conn\Update();
$sql = new \Conn\SqlCommand();
$sql->exeCommand("SELECT n.titulo, n.descricao, r.* FROM " . PRE . "notifications_report as r JOIN " . PRE . "notifications as n ON n.id = r.notificacao WHERE n.status = 1");
if($sql->getResult()) {
    foreach ($sql->getResult() as $item) {
        $d = explode(' ', $item['data_de_envio']);
        $dd = explode('-', $d[0]);

        $item['data'] = substr($d[1], 0, 5) . "\n" . $dd[2] . "/" . $dd[1] . "/" . $dd[0];
        $item['imagem'] = !empty($item['imagem']) ? json_decode($item['imagem'], !0)[0]['urls']['thumb'] : HOME . "assetsPublic/img/favicon-256.png";
        $data['data'][] = $item;
        $up->exeUpdate("notifications_report", [], "WHERE id =:id", "id={$item['id']}");
    }
}
