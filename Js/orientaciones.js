document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DEL DOM ---
    const container = document.getElementById('orientaciones-por-ano-container');
    const filtroNombre = document.getElementById('filtro-nombre');
    const btnCrear = document.getElementById('btn-crear-orientacion');
    const relojEl = document.getElementById('reloj');

    // Modal
    const modal = document.getElementById('modal-orientacion');
    const modalTitulo = document.getElementById('modal-titulo');
    const formOrientacion = document.getElementById('form-orientacion');
    const carreraIdInput = document.getElementById('carrera_id');
    const nombreInput = document.getElementById('nombre');
    const colorInput = document.getElementById('color');
    const anoSelect = document.getElementById('ano');
    const asignaturasContainerModal = document.getElementById('lista-asignaturas-modal');
    const docentesContainerModal = document.getElementById('lista-docentes-modal');
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    const btnEliminar = document.getElementById('btn-eliminar');

    // --- ESTADO DE LA APLICACIÓN ---
    let todasLasOrientaciones = [];
    let todasLasAsignaturas = [];
    let todosLosDocentes = []; 

    // --- LÓGICA PRINCIPAL ---

    const cargarDatos = async () => {
        try {
            const [orientacionesRes, asignaturasRes, docentesRes] = await Promise.all([
                fetch('../api/gestionar_orientaciones.php'),
                fetch('../api/gestionar_asignaturas.php'),
                fetch('../api/gestionar_docentes.php') 
            ]);

            if (!orientacionesRes.ok || !asignaturasRes.ok || !docentesRes.ok) {
                throw new Error('Error al cargar los datos iniciales.');
            }

            todasLasOrientaciones = await orientacionesRes.json();
            todasLasAsignaturas = await asignaturasRes.json();
            todosLosDocentes = await docentesRes.json(); 
            
            renderizarOrientaciones(todasLasOrientaciones);
            renderizarCheckboxesEnModal();

        } catch (error) {
            mostrarNotificacion('Error al conectar con el servidor: ' + error.message, 'error');
        }
    };

    const renderizarOrientaciones = (orientaciones) => {
        container.innerHTML = '';
        if (orientaciones.length === 0) {
            container.innerHTML = '<p>No hay orientaciones para mostrar. ¡Crea una nueva!</p>';
            return;
        }

        // Agrupar orientaciones por año
        const orientacionesPorAno = orientaciones.reduce((acc, curr) => {
            const ano = curr.ano || 1;
            if (!acc[ano]) {
                acc[ano] = [];
            }
            acc[ano].push(curr);
            return acc;
        }, {});

        // Renderizar secciones por año
        Object.keys(orientacionesPorAno).sort().forEach(ano => {
            const section = document.createElement('section');
            section.className = 'ano-section';
            section.dataset.ano = ano;

            const grid = document.createElement('div');
            grid.className = 'orientaciones-grid';
            
            orientacionesPorAno[ano].forEach(orientacion => {
                const card = crearCardOrientacion(orientacion);
                grid.appendChild(card);
            });
            
            section.innerHTML = `<h2 class="ano-header">${ano}º Año</h2>`;
            section.appendChild(grid);
            container.appendChild(section);
        });
    };

    const crearCardOrientacion = (orientacion) => {
        const card = document.createElement('div');
        card.className = 'orientacion-card';
        card.dataset.id = orientacion.id;
        card.dataset.nombre = orientacion.nombre.toLowerCase();

        const textColor = getTextColor(orientacion.color);

        card.innerHTML = `
            <div class="card-header" style="background-color: ${orientacion.color}; color: ${textColor};">
                <span>${orientacion.nombre}</span>
                <button class="edit-btn" title="Editar Orientación"><i class="fas fa-pencil-alt"></i></button>
            </div>
            <div class="card-body">
                <h4>Asignaturas</h4>
                <ul class="asignaturas-list">
                    ${orientacion.asignaturas.length > 0 ? orientacion.asignaturas.map(a => `<li>${a.nombre}</li>`).join('') : '<li>No asignadas</li>'}
                </ul>
                <br>
                <h4>Docentes Asociados</h4>
                <ul class="docentes-list">
                     ${orientacion.docentes.length > 0 ? orientacion.docentes.map(d => `<li>${d.nombre}</li>`).join('') : '<li>No asignados</li>'}
                </ul>
            </div>
        `;
        return card;
    };

    const renderizarCheckboxesEnModal = () => {
        // Renderizar Asignaturas
        asignaturasContainerModal.innerHTML = '';
        todasLasAsignaturas.forEach(asignatura => {
            const item = document.createElement('label');
            item.className = 'checkbox-item';
            item.innerHTML = `<input type="checkbox" name="asignaturas[]" value="${asignatura.id}"> ${asignatura.nombre}`;
            asignaturasContainerModal.appendChild(item);
        });

        // Renderizar Docentes 
        docentesContainerModal.innerHTML = '';
        todosLosDocentes.forEach(docente => {
            const item = document.createElement('label');
            item.className = 'checkbox-item';
            item.innerHTML = `<input type="checkbox" name="docentes[]" value="${docente.id}"> ${docente.apellido}, ${docente.nombre}`;
            docentesContainerModal.appendChild(item);
        });
    };

    // --- MANEJO DEL MODAL ---
    const abrirModalParaCrear = () => {
        formOrientacion.reset();
        carreraIdInput.value = '';
        modalTitulo.textContent = 'Crear Nueva Orientación';
        anoSelect.value = '1';
        colorInput.value = '#4a90e2';
        btnEliminar.style.display = 'none';
        modal.style.display = 'flex';
    };

    const abrirModalParaEditar = (orientacion) => {
        formOrientacion.reset();
        modalTitulo.textContent = `Editar Orientación: ${orientacion.nombre}`;
        
        carreraIdInput.value = orientacion.id;
        nombreInput.value = orientacion.nombre;
        colorInput.value = orientacion.color;
        anoSelect.value = orientacion.ano;

        // Marcar checkboxes de asignaturas
        const asignaturasIds = orientacion.asignaturas.map(a => a.id.toString());
        asignaturasContainerModal.querySelectorAll('input[type="checkbox"]').forEach(chk => {
            chk.checked = asignaturasIds.includes(chk.value);
        });

        // Marcar checkboxes de docentes 
        const docentesIds = orientacion.docentes.map(d => d.id.toString());
        docentesContainerModal.querySelectorAll('input[type="checkbox"]').forEach(chk => {
            chk.checked = docentesIds.includes(chk.value);
        });

        btnEliminar.style.display = 'inline-block';
        modal.style.display = 'flex';
    };

    const cerrarModal = () => {
        modal.style.display = 'none';
    };

    // --- EVENTOS ---
    btnCrear.addEventListener('click', abrirModalParaCrear);
    btnCerrarModal.addEventListener('click', cerrarModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) cerrarModal();
    });

    container.addEventListener('click', (e) => {
        const editButton = e.target.closest('.edit-btn');
        if (editButton) {
            const card = editButton.closest('.orientacion-card');
            const id = card.dataset.id;
            const orientacion = todasLasOrientaciones.find(o => o.id == id);
            if (orientacion) abrirModalParaEditar(orientacion);
        }
    });

    formOrientacion.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(formOrientacion);
        
        try {
            const response = await fetch('../api/gestionar_orientaciones.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                mostrarNotificacion(result.message, 'success');
                cerrarModal();
                cargarDatos();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            mostrarNotificacion(error.message, 'error');
        }
    });

    btnEliminar.addEventListener('click', async () => {
        const id = carreraIdInput.value;
        if (!id || !confirm('¿Estás seguro de que quieres eliminar esta orientación? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            const response = await fetch('../api/gestionar_orientaciones.php', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id })
            });

            const result = await response.json();
            if (result.success) {
                mostrarNotificacion(result.message, 'success');
                cerrarModal();
                cargarDatos();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
             mostrarNotificacion(error.message, 'error');
        }
    });

    filtroNombre.addEventListener('input', () => {
        const textoFiltro = filtroNombre.value.toLowerCase();
        document.querySelectorAll('.orientacion-card').forEach(card => {
            const nombreCard = card.dataset.nombre;
            card.style.display = nombreCard.includes(textoFiltro) ? 'flex' : 'none';
        });
        
        // Ocultar títulos de año si no tienen tarjetas visibles
        document.querySelectorAll('.ano-section').forEach(section => {
             const cardsVisibles = section.querySelector('.orientacion-card[style*="display: flex"]');
             section.style.display = cardsVisibles ? 'block' : 'none';
        });
    });

    // --- FUNCIONES AUXILIARES ---

    const getTextColor = (hex) => {
        const r = parseInt(hex.substr(1, 2), 16);
        const g = parseInt(hex.substr(3, 2), 16);
        const b = parseInt(hex.substr(5, 2), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#0a192f' : '#e6f1ff';
    };
    
    const mostrarNotificacion = (mensaje, tipo = 'success') => {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${tipo}`;
        toast.textContent = mensaje;
        container.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 3000);
    };
    
    const actualizarReloj = () => {
        if (relojEl) {
            const ahora = new Date();
            const horas = String(ahora.getHours()).padStart(2, '0');
            const minutos = String(ahora.getMinutes()).padStart(2, '0');
            relojEl.textContent = `${horas}:${minutos}`;
        }
    };


    // --- INICIALIZACIÓN ---
    cargarDatos();
    setInterval(actualizarReloj, 1000);
    actualizarReloj();
});