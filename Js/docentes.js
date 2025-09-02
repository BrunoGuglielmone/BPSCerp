// Espera a que todo el contenido del DOM esté cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {

    // --- SELECTORES DE ELEMENTOS ---
    const form = document.getElementById('registro-docente-form');
    const tbody = document.querySelector('#tabla-docentes tbody');
    const searchInput = document.getElementById('busqueda');
    const sortLinks = document.querySelectorAll('#tabla-docentes thead a');
    const seleccionarTodosCheckbox = document.getElementById('seleccionar-todos');
    const btnEliminarSeleccionado = document.querySelector('.btn-eliminar-seleccionado');

    let docentesData = []; // Almacenará los datos de los docentes para búsquedas y ordenamiento

    // --- FUNCIONES ---

    /**
     * Carga los docentes desde el backend y los renderiza en la tabla.
     */
    const cargarDocentes = async () => {
        try {
            const response = await fetch('../php/docentes.php');
            if (!response.ok) throw new Error('La respuesta de la red no fue correcta.');
            
            docentesData = await response.json();
            renderizarTabla(docentesData);
        } catch (error) {
            console.error('Error al cargar los docentes:', error);
            tbody.innerHTML = `<tr><td colspan="6">Error al cargar los datos. Por favor, intente de nuevo.</td></tr>`;
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
                    <td><button class="btn-accion-fila btn-editar"><i class="fa-solid fa-pen-to-square"></i></button></td>
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
        const id = formData.get('docente_id');
        const url = `../php/gestionar_docente.php?accion=${id ? 'actualizar' : 'crear'}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (result.success) {
                form.reset();
                document.getElementById('docente_id').value = ''; // Limpiar ID oculto
                cargarDocentes(); // Recargar la tabla
                // Opcional: mostrar un mensaje de éxito
            } else {
                console.error('Error al guardar:', result.message);
                // Opcional: mostrar un mensaje de error al usuario
            }
        } catch (error) {
            console.error('Error de red al guardar:', error);
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

        if (!confirm(`¿Está seguro de que desea eliminar ${idsParaEliminar.length} docente(s)?`)) {
            return;
        }

        try {
            const response = await fetch('../php/gestionar_docente.php?accion=eliminar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: idsParaEliminar })
            });
            const result = await response.json();

            if (result.success) {
                cargarDocentes(); // Recargar la tabla
            } else {
                console.error('Error al eliminar:', result.message);
            }
        } catch (error) {
            console.error('Error de red al eliminar:', error);
        }
    };


    // --- EVENT LISTENERS ---

    // Enviar formulario
    form.addEventListener('submit', handleFormSubmit);
    
    // Botón de eliminar seleccionados
    btnEliminarSeleccionado.addEventListener('click', eliminarDocentesSeleccionados);

    // Búsqueda en tiempo real
    searchInput.addEventListener('input', (e) => {
        const termino = e.target.value.toLowerCase();
        const filtrados = docentesData.filter(d => 
            d.nombre.toLowerCase().includes(termino) ||
            d.apellido.toLowerCase().includes(termino) ||
            d.asignatura.toLowerCase().includes(termino)
        );
        renderizarTabla(filtrados);
    });

    // --- INICIALIZACIÓN ---
    cargarDocentes();
});
