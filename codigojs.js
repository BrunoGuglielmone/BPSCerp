const pisos = {
    "Piso 1": ["S-101", "S-102", "S-103"],
    "Piso 2": ["S-201", "S-202"],
    "Piso 3": ["S-301", "S-302"],
    "Salon Actos": ["Salon de Actas"],
    "Biblioteca": ["Biblioteca"]
};

const horas = ["7:00","7:30", "8:00", "8:30", "9:00", "9:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30", "00:00"];

const ocupaciones = {
    "S-101": {"8:00": "Prof. López - Matemática"},
    "S-102": {"9:00": "Prof. Pérez - Historia"},
    "S-302": {"9:30": "Prof. Gómez - Inglés"},
    "S-201": {"10:00": "Prof. Gómez - Biología"},
    "Salon Actos": {"10:30": "Prof. López - Matemática"},
};

const tabla = document.getElementById("tablaAulas");
const theadRow = tabla.querySelector("thead tr");
const tbody = tabla.querySelector("tbody");

// Agrega las horas al encabezado
horas.forEach(hora => {
    const th = document.createElement("th");
    th.textContent = hora;
    theadRow.appendChild(th);
});

// Crea las filas por piso y aulas
for (const piso in pisos) {
    pisos[piso].forEach(aula => {
        const row = document.createElement("tr");
        const aulaCell = document.createElement("td");
        aulaCell.innerHTML = `<div class="aula-nombre">${aula}</div><div class="aula-piso">${piso}</div>`;
        row.appendChild(aulaCell);

        horas.forEach(hora => {
            const cell = document.createElement("td");
            if (ocupaciones[aula] && ocupaciones[aula][hora]) {
            cell.textContent = ocupaciones[aula][hora];
            cell.classList.add("ocupado");
            }
            row.appendChild(cell);
        });

        tbody.appendChild(row);
    });
}

// Función que desplaza automáticamente a la hora actual
function scrollToCurrentHour() {
    const scrollContainer = document.querySelector(".scroll-container");
    const now = new Date();
    const currentHour = now.getHours();

    // Buscar el índice de la hora actual en la tabla
    const index = horas.findIndex(h => parseInt(h.split(":"[0])) === currentHour);

    if (index > 0) {
        const scrollX = index * 120;
        scrollContainer.scrollTo({
            left: scrollX,
            behavior: 'smooth'
        });

        // Resaltar columna actual
        const filas = tabla.rows;
        for (let i = 0; i < filas.length; i++) {
            const celdas = filas[i].cells;
            if (celdas.length > index + 1) {
                celdas[index + 1].classList.add("hora-actual");
            }
        }
    }
}

// Ejecutar el scroll automático al cargar
scrollToCurrentHour();

// (Opcional) Volver a ejecutar cada hora en punto
setInterval(() => {
    const now = new Date();
    if (now.getMinutes() === 0 && now.getSeconds() < 5) {
        scrollToCurrentHour();
    }
}, 10000); // Verifica cada 10 segundos