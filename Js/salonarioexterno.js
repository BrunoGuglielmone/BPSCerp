document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DEL DOM ---
    const relojEl = document.getElementById('reloj');
    const fechaInput = document.getElementById('fecha');
    const semestreInput = document.getElementById('semestre');

    // --- LÓGICA DEL RELOJ ---
    function actualizarReloj() {
        if (relojEl) {
            const ahora = new Date();
            const horas = String(ahora.getHours()).padStart(2, '0');
            const minutos = String(ahora.getMinutes()).padStart(2, '0');
            const segundos = String(ahora.getSeconds()).padStart(2, '0');
            relojEl.textContent = `${horas}:${minutos}:${segundos}`;
        }
    }

    // --- LÓGICA DE FILTROS ---
    function restringirFechaPorSemestre() {
        if (!fechaInput || !semestreInput) return;
        
        const anioActual = new Date(fechaInput.value || new Date()).getFullYear();
        const semestre = semestreInput.value;

        if (semestre === '1') {
            fechaInput.min = `${anioActual}-03-01`;
            fechaInput.max = `${anioActual}-07-27`;
        } else if (semestre === '2') {
            fechaInput.min = `${anioActual}-07-28`;
            fechaInput.max = `${anioActual}-12-31`;
        } else {
            fechaInput.min = '';
            fechaInput.max = '';
        }
    }

    // --- INICIALIZACIÓN GENERAL ---
    setInterval(actualizarReloj, 1000);
    actualizarReloj();
    
    restringirFechaPorSemestre();
    if (semestreInput) {
        semestreInput.addEventListener('change', restringirFechaPorSemestre);
    }


    // --- LÓGICA ESPECÍFICA PARA LA VISTA DIARIA ---
    // La variable 'activeView' viene del script PHP inyectado en el HTML
    if (typeof activeView !== 'undefined' && activeView === 'diario') {
        
        const scrollContainer = document.querySelector(".scroll-container");
        const tabla = document.getElementById("tablaAulas");

        if (!scrollContainer || !tabla) {
            console.error("No se encontraron los elementos necesarios para el script de vista diaria.");
            return;
        }
        
        let autoScrollInterval;

        function scrollToCurrentHour() {
            if (typeof horasDB === 'undefined' || horasDB.length === 0 || fechaMostrada !== fechaHoy) return;
            
            const currentHour = new Date().getHours();
            const index = horasDB.findIndex(h => parseInt(h) === currentHour);

            if (index > -1) {
                const headerCells = tabla.querySelector("thead tr").cells;
                const targetCell = headerCells[index + 1];

                if (targetCell) {
                    // Desplazamiento
                    scrollContainer.scrollTo({
                        left: targetCell.offsetLeft - scrollContainer.offsetLeft,
                        behavior: 'smooth'
                    });
                    
                    // Resaltado
                    tabla.querySelectorAll('.hora-actual').forEach(c => c.classList.remove('hora-actual'));
                    const filas = tabla.rows;
                    for (let i = 0; i < filas.length; i++) {
                        const celdaActual = filas[i].cells[index + 1];
                        if (celdaActual) celdaActual.classList.add("hora-actual");
                    }
                }
            }
        }
        
        function startAutoScrollHorizontal() {
            clearInterval(autoScrollInterval);
            autoScrollInterval = setInterval(() => {
                const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
                if (scrollContainer.scrollLeft >= maxScroll - 1) {
                    clearInterval(autoScrollInterval);
                } else {
                    scrollContainer.scrollLeft += 1;
                }
            }, 50);
        }

        function stopAutoScroll() {
            clearInterval(autoScrollInterval);
        }

        // Inicialización del Scroll
        scrollToCurrentHour();
        setTimeout(startAutoScrollHorizontal, 3000);

        scrollContainer.addEventListener('wheel', stopAutoScroll, { passive: true });
        scrollContainer.addEventListener('touchstart', stopAutoScroll, { passive: true });
    }
});