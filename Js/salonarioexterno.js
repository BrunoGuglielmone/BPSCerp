document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURACIÓN DE LA PAGINACIÓN ---
    const SALONES_POR_PAGINA = 10; // <-- Ajusta cuántos salones se ven a la vez
    const TIEMPO_POR_PAGINA_MS = 20000; // <-- 20 segundos por página

    // --- ELEMENTOS DEL DOM ---
    const scrollContainer = document.querySelector(".scroll-container");
    const tabla = document.getElementById("tablaAulas");
    const tbody = tabla ? tabla.querySelector("tbody") : null;
    
    if (!scrollContainer || !tabla || !tbody) {
        console.error("No se encontraron los elementos necesarios para el script.");
        return;
    }
    
    const todasLasFilas = Array.from(tbody.querySelectorAll("tr"));
    const totalPaginas = Math.ceil(todasLasFilas.length / SALONES_POR_PAGINA);
    let paginaActual = 1;
    let autoScrollInterval;

    /**
     * Muestra una "página" específica de salones.
     * Oculta todas las filas y luego muestra solo las del grupo actual.
     * @param {number} num - El número de página a mostrar.
     */
    function mostrarPagina(num) {
        if (todasLasFilas.length === 0) return;

        const inicio = (num - 1) * SALONES_POR_PAGINA;
        const fin = inicio + SALONES_POR_PAGINA;
        
        // Ocultamos todas las filas primero para la animación de fade-out
        todasLasFilas.forEach(fila => fila.classList.add('oculto'));

        // Esperamos que termine la animación de salida para cambiar el contenido
        setTimeout(() => {
            todasLasFilas.forEach((fila, index) => {
                // Cambiamos la propiedad 'display'
                fila.style.display = 'none';

                if (index >= inicio && index < fin) {
                    fila.style.display = ''; // Restaura a 'table-row'
                    // Quitamos la clase 'oculto' para la animación de fade-in
                    // Usamos un pequeño delay para asegurar que el navegador aplique el cambio
                    setTimeout(() => fila.classList.remove('oculto'), 20);
                }
            });
        }, 500); // Debe coincidir con la duración de la transición en CSS
    }
    
    /**
     * Inicia la rotación automática entre páginas de salones.
     */
    function iniciarRotacionPaginas() {
        // Si todo cabe en una página, no necesitamos rotar.
        if (totalPaginas <= 1) return; 

        setInterval(() => {
            paginaActual++;
            if (paginaActual > totalPaginas) {
                paginaActual = 1; // Vuelve a la primera página
            }
            mostrarPagina(paginaActual);
        }, TIEMPO_POR_PAGINA_MS);
    }

    /**
     * Desplaza la vista a la columna de la hora actual.
     */
    function scrollToCurrentHour() {
        if (typeof horasDB === 'undefined' || horasDB.length === 0) return;
        
        const now = new Date();
        const currentHour = now.getHours();
        const index = horasDB.findIndex(h => parseInt(h) === currentHour);

        if (index > -1) {
            const headerCells = tabla.querySelector("thead tr").cells;
            const targetCell = headerCells[index + 1];

            if (targetCell) {
                scrollContainer.scrollLeft = targetCell.offsetLeft - scrollContainer.offsetLeft;
                
                // Resaltar columna actual
                tabla.querySelectorAll('.hora-actual').forEach(c => c.classList.remove('hora-actual'));
                const filas = tabla.rows;
                for (let i = 0; i < filas.length; i++) {
                    const celdaActual = filas[i].cells[index + 1];
                    if (celdaActual) celdaActual.classList.add("hora-actual");
                }
            }
        }
    }

    /**
     * Inicia el desplazamiento horizontal automático y continuo.
     */
    function startAutoScrollHorizontal() {
        clearInterval(autoScrollInterval);
        autoScrollInterval = setInterval(() => {
            const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
            // Si el scroll llega al final (con un margen de 1px), vuelve al principio.
            if (scrollContainer.scrollLeft >= maxScroll -1) {
                scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                scrollContainer.scrollLeft += 1;
            }
        }, 50); // Velocidad del scroll horizontal
    }

    /**
     * Detiene el desplazamiento horizontal si el usuario interactúa.
     */
    function stopAutoScroll() {
        clearInterval(autoScrollInterval);
    }

    // --- INICIALIZACIÓN ---
    scrollToCurrentHour();
    mostrarPagina(1); // Muestra la primera página de salones
    
    // Inicia los procesos automáticos después de un breve momento
    setTimeout(() => {
        startAutoScrollHorizontal();
        iniciarRotacionPaginas();
    }, 3000); // 3 segundos de espera antes de empezar a moverse

    // Detiene el scroll si el usuario interactúa
    scrollContainer.addEventListener('wheel', stopAutoScroll, { passive: true });
    scrollContainer.addEventListener('touchstart', stopAutoScroll, { passive: true });
});
