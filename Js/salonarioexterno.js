document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DEL DOM ---
    const scrollContainer = document.querySelector(".scroll-container");
    const tabla = document.getElementById("tablaAulas");
    const relojEl = document.getElementById('reloj');
    const fechaInput = document.getElementById('fecha');
    const semestreInput = document.getElementById('semestre');

    if (!scrollContainer || !tabla) {
        console.error("No se encontraron los elementos necesarios para el script.");
        return;
    }
    setInterval(actualizarReloj, 1000);
    actualizarReloj();
    
    let autoScrollInterval;

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

    // --- LÓGICA DE DESPLAZAMIENTO Y RESALTADO ---
    function scrollToCurrentHour() {
        // Solo ejecutar si la fecha mostrada es hoy
        if (typeof horasDB === 'undefined' || horasDB.length === 0 || fechaMostrada !== fechaHoy) return;
        
        const currentHour = new Date().getHours();
        const index = horasDB.findIndex(h => parseInt(h) === currentHour);

        function scrollToCurrentHour() {
            if (typeof horasDB === 'undefined' || horasDB.length === 0 || fechaMostrada !== fechaHoy) return;
            
            const now = new Date();
            const currentTime = now.getHours() + (now.getMinutes() / 60);
            
            let closestIndex = -1;
            let smallestDiff = Infinity;

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
    
    // ---  DESPLAZAMIENTO HORIZONTAL ---
    function startAutoScrollHorizontal() {
        clearInterval(autoScrollInterval);
        autoScrollInterval = setInterval(() => {
            const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
            // Si el scroll llega al final, detener el intervalo.
            if (scrollContainer.scrollLeft >= maxScroll - 1) {
                clearInterval(autoScrollInterval);
            } else {
                scrollContainer.scrollLeft += 1; // Ajusta este valor para cambiar la velocidad
            }
        }, 50); // Velocidad del scroll
    }

    function stopAutoScroll() {
        clearInterval(autoScrollInterval);
    }

    // --- INICIALIZACIÓN ---
    // Reloj
    setInterval(actualizarReloj, 1000);
    actualizarReloj();
    
    // Filtros
    restringirFechaPorSemestre(); // Aplicar restricción al cargar la página
    if (semestreInput) {
        semestreInput.addEventListener('change', restringirFechaPorSemestre);
    }

    // Scroll
    scrollToCurrentHour();
    setTimeout(startAutoScrollHorizontal, 3000); // Iniciar scroll después de 3 segundos

    // Detener scroll con la interacción del usuario
    scrollContainer.addEventListener('wheel', stopAutoScroll, { passive: true });
    scrollContainer.addEventListener('touchstart', stopAutoScroll, { passive: true });
});