<?php
// Header común de la aplicación
$paginaActual = basename($_SERVER['PHP_SELF']);
$ocultarVolver = in_array($paginaActual, ['menuinteractivo.php', 'login.php']);
?>
<header class="header-docentes">
    <div class="logo-container">
        <img src="../imagenes/logo_cerp_3d.png" alt="Logo Institución" style="height: 70px;">
    </div>

    <?php if (!$ocultarVolver): ?>
    <a href="../paginas/menuinteractivo.php" class="menu-button btn-animado">
        <span>Volver</span>
    </a>
    <?php endif; ?>

    <div class="reloj-container">
        <span id="reloj"></span>
    </div>
    <span class="titulo-admin"></span>
</header>

<script>
    // --- Lógica del Reloj ---
    function actualizarReloj() {
        const relojEl = document.getElementById('reloj');
        if (relojEl) {
            const ahora = new Date();
            const horas = String(ahora.getHours()).padStart(2, '0');
            const minutos = String(ahora.getMinutes()).padStart(2, '0');
            const segundos = String(ahora.getSeconds()).padStart(2, '0');
            relojEl.textContent = `${horas}:${minutos}:${segundos}`;
        }
    }
    setInterval(actualizarReloj, 1000);
    actualizarReloj();
</script>


