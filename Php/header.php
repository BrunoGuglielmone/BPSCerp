<?php
// Header común de la aplicación
?>
<header class="header-docentes">
    <div class="logo-container">
        <img src="../imagenes/logo_cerp_3d.png" alt="Logo Institución" style="height: 70px;">
    </div>
    <div class="reloj-container">
        <span id="reloj"></span>
    </div>
    <span class="titulo-admin">Administrador</span>
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
