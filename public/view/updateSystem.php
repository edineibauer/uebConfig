<?php
unlink(PATH_HOME . "_config/updates/version.txt");
new \Config\UpdateSystem();
?>
<script>
    location.href = "<?=HOME?>";
</script>
