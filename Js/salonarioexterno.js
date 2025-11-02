document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DEL DOM ---
    const relojEl = document.getElementById('reloj');
    const semestreInput = document.getElementById('semestre');
    const fechaInput = document.getElementById('fecha'); // Se mantiene para el filtro de semestre

    // --- LÓGICA DEL RELOJ ---
    function actualizarReloj() {
        if (relojEl) {
            const ahora = new Date();
            relojEl.textContent = ahora.toLocaleTimeString('es-UY', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: false 
            });
        }
    }
    setInterval(actualizarReloj, 1000);
    actualizarReloj();
    
    // --- LÓGICA DE FILTROS ---
    function restringirFechaPorSemestre() {
        if (!fechaInput || !semestreInput) return;
        const anioActual = new Date(fechaInput.value || new Date()).getFullYear();
        const semestre = semestreInput.value;
        if (semestre === '1') {
            fechaInput.min = `${anioActual}-03-01`;
            fechaInput.max = `${anioActual}-07-31`;
        } else if (semestre === '2') {
            fechaInput.min = `${anioActual}-08-01`;
            fechaInput.max = `${anioActual}-12-20`;
        } else {
            fechaInput.min = '';
            fechaInput.max = '';
        }
    }
    if (semestreInput) {
        semestreInput.addEventListener('change', restringirFechaPorSemestre);
        restringirFechaPorSemestre();
    }

    // --- LÓGICA DE DESCARGA PDF ---
    const downloadBtn = document.getElementById('downloadPdfBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            
            if (typeof window.jspdf === 'undefined' || typeof html2canvas === 'undefined') {
                console.error("Librerías jsPDF o html2canvas no están cargadas.");
                alert("Error: No se puede generar el PDF. Faltan librerías.");
                return;
            }

            const { jsPDF } = window.jspdf;
            const printableArea = document.getElementById('printable-area');
            if (!printableArea) return;

            downloadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            downloadBtn.disabled = true;

            html2canvas(printableArea, { scale: 2, useCORS: true, backgroundColor: '#0a192f' })
            .then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
                const pdfWidth = pdf.internal.pageSize.getWidth();
                
                const margin = 10;
                const usableWidth = pdfWidth - (margin * 2);
                const ratio = usableWidth / canvas.width;
                const finalImgWidth = canvas.width * ratio;
                const finalImgHeight = canvas.height * ratio;
                const x = margin;
                const y = margin + 10;

                pdf.setFontSize(16);
                pdf.text("Horario Semanal - CERP del Litoral", pdfWidth / 2, margin, { align: 'center' });
                pdf.setFontSize(10);
                
                // Se usa la variable 'fechaLunesSemana' definida en el PHP
                const fechaParaTitulo = (typeof fechaLunesSemana !== 'undefined' && fechaLunesSemana) 
                                        ? fechaLunesSemana 
                                        : (fechaInput ? fechaInput.value : 'N/A');
                
                pdf.text(`Semana del: ${fechaParaTitulo}`, pdfWidth / 2, margin + 5, { align: 'center' });
                
                pdf.addImage(imgData, 'PNG', x, y, finalImgWidth, finalImgHeight);
                pdf.save(`horario_semanal_${fechaParaTitulo}.pdf`);

                downloadBtn.innerHTML = '<i class="fa-solid fa-download"></i>';
                downloadBtn.disabled = false;
            }).catch(err => {
                console.error("Error al generar PDF:", err);
                alert("Hubo un error al generar el PDF.");
                downloadBtn.innerHTML = '<i class="fa-solid fa-download"></i>';
                downloadBtn.disabled = false;
            });
        });
    }

    // --- LÓGICA DE SCROLL AUTOMÁTICO (VISTA DIARIA) ---
    if (typeof activeView !== 'undefined' && activeView === 'diario') {
        const scrollContainer = document.querySelector(".scroll-container");
        const tabla = document.getElementById("tablaAulas");

        if (!scrollContainer || !tabla) {
            console.error("No se encontraron los elementos para la vista diaria.");
            return;
        }
        
        let autoScrollInterval;
        let userInteracted = false;

        function scrollToCurrentHour() {
            if (typeof horasDB === 'undefined' || horasDB.length === 0 || fechaMostrada !== fechaHoy) return;
            
            const now = new Date();
            const currentTime = now.getHours() + (now.getMinutes() / 60);
            
            let closestIndex = -1;
            let smallestDiff = Infinity;

            horasDB.forEach((h, index) => {
                const hourTime = parseInt(h.split(':')[0]) + (parseInt(h.split(':')[1]) / 60);
                const diff = Math.abs(currentTime - hourTime);
                if (diff < smallestDiff) {
                    smallestDiff = diff;
                    closestIndex = index;
                }
            });

            if (closestIndex > -1) {
                const headerCells = tabla.querySelector("thead tr").cells;
                const targetCell = headerCells[closestIndex + 1];

                if (targetCell) {
                    tabla.querySelectorAll('.hora-actual').forEach(c => c.classList.remove('hora-actual'));
                    const filas = tabla.rows;
                    for (let i = 0; i < filas.length; i++) {
                        const celdaActual = filas[i].cells[closestIndex + 1];
                        if (celdaActual) celdaActual.classList.add("hora-actual");
                    }
                    
                    startAutoScrollHorizontal(targetCell.offsetLeft - scrollContainer.offsetLeft);
                }
            }
        }
        
        function startAutoScrollHorizontal(targetPosition) {
            if (userInteracted) return;
            
            clearInterval(autoScrollInterval);
            autoScrollInterval = setInterval(() => {
                const currentPosition = scrollContainer.scrollLeft;
                const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
                
                if (userInteracted || currentPosition >= targetPosition || currentPosition >= maxScroll - 1) {
                    clearInterval(autoScrollInterval);
                    if (!userInteracted) {
                        scrollContainer.scrollTo({ left: targetPosition, behavior: 'smooth' }); 
                    }
                } else {
                    scrollContainer.scrollLeft += 2;
                }
            }, 30);
        }

        function stopAutoScroll() {
            if (!userInteracted) {
                userInteracted = true;
                clearInterval(autoScrollInterval);
            }
        }

        setTimeout(scrollToCurrentHour, 1500); 

        scrollContainer.addEventListener('wheel', stopAutoScroll, { passive: true, once: true });
        scrollContainer.addEventListener('touchstart', stopAutoScroll, { passive: true, once: true });
        scrollContainer.addEventListener('mousedown', stopAutoScroll, { once: true });
    }
});