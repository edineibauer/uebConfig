{if $analytics != ""}
    <script async src="https://www.googletagmanager.com/gtag/js?id={$analytics}"></script>
    <script>
        {literal}
        window.dataLayer = window.dataLayer || [];

        function gtag() {
            dataLayer.push(arguments);
        }

        gtag('js', new Date());
        {/literal}
        gtag('config', '{$analytics}');
    </script>
{/if}