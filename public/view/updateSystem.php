<?php

if ($link->getVariaveis()[0] === "uebster") {
    if (file_exists(PATH_HOME . "_config/updates/version.txt"))
        unlink(PATH_HOME . "_config/updates/version.txt");

    new \Config\UpdateSystem();
    ?>
    <script>
        location.href = "<?=HOME?>";
    </script>
    <?php
}
