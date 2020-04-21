<?php

if ($_SESSION['userlogin']['id'] === "1" ||1===1) {
    if (file_exists(PATH_HOME . "_config/updates/version.txt"))
        unlink(PATH_HOME . "_config/updates/version.txt");

    new \Config\UpdateSystem();
    ?>
    <script>
        location.href = "<?=HOME?>";
    </script>
    <?php
}
