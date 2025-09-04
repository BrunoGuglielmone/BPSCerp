// Espera a que todo el contenido del DOM esté cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {

    // --- SELECTORES DE ELEMENTOS ---
    const form = document.getElementById('registro-docente-form');
    const tbody = document.querySelector('#tabla-docentes tbody');
    const searchInput = document.getElementById('busqueda');
    const seleccionarTodosCheckbox = document.getElementById('seleccionar-todos');
    const btnEliminarSeleccionado = document.querySelector('.btn-eliminar-seleccionado');
    const btnEditarSeleccionado = document.querySelector('.btn-editar-seleccionado'); // Botón de editar

    let docentesData = []; // Almacenará los datos de los docentes para búsquedas y ordenamiento

    // --- URL DE LA API ---
    const API_URL = '../api/gestionar_docentes.php';

    /**
     * Carga los docentes desde el backend y los renderiza en la tabla.
     */
    const cargarDocentes = async () => {
        try {
            // Usamos GET por defecto para obtener datos
            const response = await fetch(API_URL); 
            if (!response.ok) {
                throw new Error(`La respuesta de la red no fue correcta. Estatus: ${response.status}`);
            }
            
            docentesData = await response.json();
            renderizarTabla(docentesData);

        } catch (error) {
            console.error('Error al cargar los docentes:', error);
            tbody.innerHTML = `<tr><td colspan="6">Error al cargar los datos. Verifique la consola para más detalles.</td></tr>`;
        }
    };

    /**
     * Renderiza (dibuja) las filas de la tabla con los datos de los docentes.
     * @param {Array} docentes - Un array de objetos de docentes.
     */
    const renderizarTabla = (docentes) => {
        tbody.innerHTML = ''; // Limpiar la tabla antes de dibujar
        if (docentes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6">No se encontraron docentes.</td></tr>`;
            return;
        }

        docentes.forEach(docente => {
            const fila = `
                <tr data-id="${docente.id}">
                    <td><input type="checkbox" class="seleccionar-fila"></td>
                    <td>${docente.nombre} ${docente.apellido}</td>
                    <td>${docente.asignatura}</td>
                    <td>${docente.ano_cursado}º Año</td>
                    <td>C.I: ${docente.cedula || 'N/A'} | Tel: ${docente.telefono || 'N/A'}</td>
                    <td>
                        </td>
                </tr>
            `;
            tbody.innerHTML += fila;
        });
    };

    /**
     * Maneja el envío del formulario para crear o actualizar un docente.
     */
    const handleFormSubmit = async (e) => {
        e.preventDefault(); // Evitar que la página se recargue

        const formData = new FormData(form);
        const url = `${API_URL}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                form.reset(); // Limpiar el formulario
                document.querySelector('.formulario-content').classList.remove('abierto'); // Ocultar formulario
                cargarDocentes(); // Recargar la tabla con los nuevos datos
                alert('Docente guardado con éxito.'); // Mensaje de éxito
            } else {
                console.error('Error al guardar:', result.message);
                alert(`Error al guardar: ${result.message}`); // Mensaje de error
            }
        } catch (error) {
            console.error('Error de red al guardar:', error);
            alert('Ocurrió un error de red. Intente de nuevo.');
        }
    };
    
    /**
     * Elimina los docentes seleccionados.
     */
    const eliminarDocentesSeleccionados = async () => {
        const seleccionados = document.querySelectorAll('.seleccionar-fila:checked');
        const idsParaEliminar = Array.from(seleccionados).map(cb => cb.closest('tr').dataset.id);

        if (idsParaEliminar.length === 0) {
            alert('Por favor, seleccione al menos un docente para eliminar.');
            return;
        }

        if (!confirm(`¿Está seguro de que desea eliminar ${idsParaEliminar.length} docente(s)? Esta acción no se puede deshacer.`)) {
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: idsParaEliminar }) // Enviar los IDs como un array JSON
            });

            const result = await response.json();

            if (result.success) {
                cargarDocentes(); // Recargar la tabla
                alert('Docente(s) eliminado(s) con éxito.');
            } else {
                console.error('Error al eliminar:', result.message);
                alert(`Error al eliminar: ${result.message}`);
            }
        } catch (error) {
            console.error('Error de red al eliminar:', error);
            alert('Ocurrió un error de red al intentar eliminar. Intente de nuevo.');
        }
    };
    
    /**
     * Habilita o deshabilita los botones de acción múltiple (Editar/Eliminar)
     */
    const actualizarEstadoBotones = () => {
        const seleccionados = document.querySelectorAll('.seleccionar-fila:checked').length;
        if (seleccionados > 0) {
            btnEliminarSeleccionado.disabled = false;
            btnEditarSeleccionado.disabled = seleccionados !== 1; // Habilitar solo si hay 1 seleccionado
        } else {
            btnEliminarSeleccionado.disabled = true;
            btnEditarSeleccionado.disabled = true;
        }
    };

    // --- EVENT LISTENERS ---

    // Enviar formulario
    form.addEventListener('submit', handleFormSubmit);
    
    // Botón de eliminar seleccionados
    btnEliminarSeleccionado.addEventListener('click', eliminarDocentesSeleccionados);

    // Búsqueda en tiempo real
    searchInput.addEventListener('input', (e) => {
        const termino = e.target.value.toLowerCase().trim();
        const filtrados = docentesData.filter(d => 
            d.nombre.toLowerCase().includes(termino) ||
            d.apellido.toLowerCase().includes(termino) ||
            d.asignatura.toLowerCase().includes(termino)
        );
        renderizarTabla(filtrados);
    });

    // Checkbox "Seleccionar Todos"
    seleccionarTodosCheckbox.addEventListener('change', (e) => {
        document.querySelectorAll('.seleccionar-fila').forEach(cb => {
            cb.checked = e.target.checked;
        });
        actualizarEstadoBotones();
    });

    // Delegación de eventos para los checkboxes de cada fila
    tbody.addEventListener('change', (e) => {
        if (e.target.classList.contains('seleccionar-fila')) {
            actualizarEstadoBotones();
        }
    });

    // --- INICIALIZACIÓN ---
    cargarDocentes();
});