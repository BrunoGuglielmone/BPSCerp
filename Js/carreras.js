document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '../api/gestionar_carreras.php';
    const form = document.getElementById('registro-carrera-form');
    const tbody = document.querySelector('#tabla-carreras tbody');
    const filtroInput = document.querySelector('.filtro-input');
    const seleccionarTodosCheckbox = document.getElementById('seleccionar-todos');
    const btnEliminarSeleccionado = document.querySelector('.btn-eliminar-seleccionado');
    const btnEditarSeleccionado = document.querySelector('.btn-editar-seleccionado');
    const hiddenId = document.getElementById('carrera_id');
    let dataCache = [];

    const notificar = (msg) => alert(msg);

    const cargarDatos = async () => {
        try {
            const response = await fetch(API_URL);
            dataCache = await response.json();
            renderizarTabla(dataCache);
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="3">Error al cargar datos.</td></tr>`;
        }
    };

    const renderizarTabla = (datos) => {
        tbody.innerHTML = '';
        if (datos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3">No se encontraron carreras.</td></tr>`;
            return;
        }
        datos.forEach(item => {
            const fila = `
                <tr data-id="${item.id}">
                    <td><input type="checkbox" class="seleccionar-fila"></td>
                    <td>${item.nombre}</td>
                    <td class="acciones-celda">
                        <button class="btn-accion-fila btn-editar" title="Editar"><i class="fa-solid fa-pencil"></i></button>
                        <button class="btn-accion-fila btn-eliminar" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>`;
            tbody.innerHTML += fila;
        });
    };

    const aplicarFiltros = () => {
        const termino = filtroInput.value.toLowerCase().trim();
        const filtrados = dataCache.filter(item => item.nombre.toLowerCase().includes(termino));
        renderizarTabla(filtrados);
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const response = await fetch(API_URL, { method: 'POST', body: new FormData(form) });
        const result = await response.json();
        notificar(result.message);
        if (result.success) {
            form.reset();
            hiddenId.value = '';
            cargarDatos();
        }
    });
    
    tbody.addEventListener('click', e => {
        const fila = e.target.closest('tr');
        if (!fila) return;
        const id = fila.dataset.id;
        if (e.target.closest('.btn-editar')) {
            const item = dataCache.find(d => d.id == id);
            hiddenId.value = item.id;
            form.querySelector('#nombre').value = item.nombre;
            if (!document.querySelector('.formulario-content').classList.contains('abierto')) {
                document.querySelector('.toggle-form-btn').click();
            }
        }
        if (e.target.closest('.btn-eliminar')) {
            eliminar([id]);
        }
    });
    
    const eliminar = async (ids) => {
        if (!confirm(`¿Eliminar ${ids.length} carrera(s)?`)) return;
        const response = await fetch(API_URL, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids })
        });
        const result = await response.json();
        notificar(result.message);
        if (result.success) cargarDatos();
    };

    const actualizarBotones = () => {
        const seleccionados = tbody.querySelectorAll('.seleccionar-fila:checked').length;
        btnEliminarSeleccionado.disabled = seleccionados === 0;
        btnEditarSeleccionado.disabled = seleccionados !== 1;
    };
    
    btnEliminarSeleccionado.addEventListener('click', () => {
        const ids = Array.from(tbody.querySelectorAll('.seleccionar-fila:checked')).map(cb => cb.closest('tr').dataset.id);
        eliminar(ids);
    });

    btnEditarSeleccionado.addEventListener('click', () => {
        const id = tbody.querySelector('.seleccionar-fila:checked').closest('tr').dataset.id;
        tbody.querySelector(`tr[data-id='${id}'] .btn-editar`).click();
    });

    filtroInput.addEventListener('input', aplicarFiltros);
    tbody.addEventListener('change', e => { if (e.target.matches('.seleccionar-fila')) actualizarBotones(); });
    seleccionarTodosCheckbox.addEventListener('change', e => {
        tbody.querySelectorAll('.seleccionar-fila').forEach(cb => cb.checked = e.target.checked);
        actualizarBotones();
    });

    cargarDatos();
});