<!DOCTYPE html>
<html lang="pt-br">
<head>
    {include 'head.tpl'}
</head>
<body>
<div id="app">

    <div id="core-header" class="theme">
        {include 'header.tpl'}
    </div>

    <aside id="core-sidebar" class="core-class-container">
        {include 'aside.tpl'}
    </aside>

    {include 'loading.tpl'}

    <section id="core-content" class="core-class-container">
        <div v-html="content" ></div>
    </section>
</div>
{include 'analytics.tpl'}

</body>
</html>