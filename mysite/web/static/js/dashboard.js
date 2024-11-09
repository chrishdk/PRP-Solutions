// 1. Helper para obtener el token desde las cookies
function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        let [key, value] = cookie.trim().split('=');
        if (key === name) return decodeURIComponent(value);
    }
    return null;
}

// 2. Helper para realizar peticiones con autorización
async function fetchWithAuth(url, options = {}) {
    const token = getCookie('accessToken');
    if (!token) throw new Error('Token no disponible. Inicie sesión nuevamente.');

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
    };

    return fetch(url, { ...options, headers });
}

// 3. Función para contar los tickets del mes actual
async function countTicketsThisMonth() {
    try {
        const response = await fetchWithAuth('http://127.0.0.1:3000/api/v1/tickets');
        const result = await response.json();
        const tickets = result.data;

        // Obtener el mes y año actuales
        const currentMonth = new Date().getMonth(); // Mes actual (0-11)
        const currentYear = new Date().getFullYear(); // Año actual (4 dígitos)

        // Filtrar los tickets creados en el mes y año actuales
        const filteredTickets = tickets.filter(ticket => {
            const createdAt = new Date(ticket.createdAt); // Suponiendo que 'createdAt' tiene un formato de fecha válido
            return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear;
        });

        // Contar los tickets filtrados
        const ticketCount = filteredTickets.length;

        // Actualizar el contenido de la tarjeta con el total de tickets de este mes
        document.getElementById('ticketCount').innerHTML = ticketCount;
    } catch (error) {
        console.error('Error al contar los tickets:', error);
        alert('Hubo un problema al contar los tickets.');
    }
}

// 4. Función para contar los tickets con estado "pending"
async function countTicketsPending() {
    try {
        const response = await fetchWithAuth('http://127.0.0.1:3000/api/v1/tickets');
        const result = await response.json();
        const tickets = result.data;

        // Filtrar los tickets con estado "pending"
        const filteredTicketsPending = tickets.filter(ticket => ticket.status.toLowerCase() === 'pending');

        // Contar los tickets filtrados
        const ticketCountPending = filteredTicketsPending.length;

        // Verificar si el elemento existe antes de intentar actualizar el contenido
        const ticketCountElement = document.getElementById('ticketCountPending');
        if (ticketCountElement) {
            ticketCountElement.innerHTML = ticketCountPending;
        } else {
            console.error("Elemento con id 'ticketCountPending' no encontrado.");
        }

    } catch (error) {
        console.error('Error al contar los tickets pendientes:', error);
        alert('Hubo un problema al contar los tickets pendientes.');
    }
}

// 1. Función para contar los tickets con alta prioridad y no resueltos
async function countHighPriorityUnresolvedTickets() {
    try {
        const response = await fetchWithAuth('http://127.0.0.1:3000/api/v1/tickets');
        const result = await response.json();
        const tickets = result.data;

        // Filtrar los tickets con prioridad 'HIGH' y estado distinto de 'resolved'
        const filteredTicketsHighPriorityUnresolved = tickets.filter(ticket => {
            return ticket.priority === 'HIGH' && ticket.status !== 'resolved';
        });

        // Contar los tickets filtrados
        const ticketCountHighPriorityUnresolved = filteredTicketsHighPriorityUnresolved.length;

        // Verificar si el elemento existe antes de intentar actualizar el contenido
        const ticketCountElement = document.getElementById('ticketCountHighPriorityUnresolved');
        if (ticketCountElement) {
            ticketCountElement.innerHTML = ticketCountHighPriorityUnresolved;
        } else {
            console.error("Elemento con id 'ticketCountHighPriorityUnresolved' no encontrado.");
        }

    } catch (error) {
        console.error('Error al contar los tickets de alta prioridad no resueltos:', error);
        alert('Hubo un problema al contar los tickets de alta prioridad no resueltos.');
    }
}

// 1. Función para contar los tickets resueltos en el mes actual
async function countSolvedTicketsThisMonth() {
    try {
        const response = await fetchWithAuth('http://127.0.0.1:3000/api/v1/tickets');
        const result = await response.json();
        const tickets = result.data;

        // Verificar que los tickets se están recibiendo correctamente
        console.log("Tickets recibidos:", tickets);

        // Obtener la fecha actual y el primer y último día del mes actual
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        console.log("Fecha de inicio del mes:", firstDayOfMonth);
        console.log("Fecha de fin del mes:", lastDayOfMonth);

        // Filtrar los tickets que están en el mes actual y con estado 'solved'
        const filteredTicketsSolvedThisMonth = tickets.filter(ticket => {
            const createdAt = new Date(ticket.createdAt);
            console.log("Ticket creado en:", createdAt); // Verificar la fecha de creación de cada ticket
            return ticket.status === 'SOLVED' &&
                   createdAt >= firstDayOfMonth && createdAt <= lastDayOfMonth;
        });

        // Verificar cuántos tickets pasaron el filtro
        console.log("Tickets resueltos en el mes:", filteredTicketsSolvedThisMonth);

        // Contar los tickets filtrados
        const ticketCountSolvedThisMonth = filteredTicketsSolvedThisMonth.length;

        // Verificar si el elemento existe antes de intentar actualizar el contenido
        const ticketCountElement = document.getElementById('ticketCountSolvedThisMonth');
        if (ticketCountElement) {
            ticketCountElement.innerHTML = ticketCountSolvedThisMonth;
        } else {
            console.error("Elemento con id 'ticketCountSolvedThisMonth' no encontrado.");
        }

    } catch (error) {
        console.error('Error al contar los tickets resueltos en el mes:', error);
        alert('Hubo un problema al contar los tickets resueltos en el mes.');
    }
}

// 1. Función para contar los tickets por mes en el año
async function countTicketsByMonth() {
    try {
        const response = await fetchWithAuth('http://127.0.0.1:3000/api/v1/tickets');
        const result = await response.json();
        const tickets = result.data;

        // Crear un array para contar los tickets por mes (12 meses en el año)
        const ticketsByMonth = Array(12).fill(0);

        // Iterar sobre los tickets y contar cuántos corresponden a cada mes
        tickets.forEach(ticket => {
            const createdAt = new Date(ticket.createdAt);
            const month = createdAt.getMonth();  // Obtener el mes (0-11)
            
            // Contar los tickets para el mes correspondiente
            if (createdAt.getFullYear() === new Date().getFullYear()) {
                ticketsByMonth[month]++;
            }
        });

        // Ahora generamos el gráfico
        generateTicketsChart(ticketsByMonth);
    } catch (error) {
        console.error('Error al contar los tickets por mes:', error);
        alert('Hubo un problema al contar los tickets por mes.');
    }
}

// 2. Función para generar el gráfico con los datos de tickets
function generateTicketsChart(ticketsByMonth) {
    const ctx = document.getElementById('myAreaChart').getContext('2d');

    // Configuración del gráfico
    const myAreaChart = new Chart(ctx, {
        type: 'line',  // Tipo de gráfico (área)
        data: {
            labels: [ // Meses del año
                'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ],
            datasets: [{
                label: 'Tickets Ingresados',
                data: ticketsByMonth, // Datos de tickets por mes
                backgroundColor: 'rgba(75, 192, 192, 0.2)', // Color de fondo del área
                borderColor: 'rgba(75, 192, 192, 1)', // Color del borde del gráfico
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}


// 1. Función para contar los tickets resueltos y no resueltos sin importar la fecha
async function countTicketsResolvedAndUnresolved() {
    try {
        const response = await fetchWithAuth('http://127.0.0.1:3000/api/v1/tickets');
        const result = await response.json();
        const tickets = result.data;

        // Contadores para los tickets resueltos y no resueltos
        let resolvedCount = 0;
        let unresolvedCount = 0;

        // Contar los tickets resueltos y no resueltos sin filtrar por fecha
        tickets.forEach(ticket => {
            const status = ticket.status.toLowerCase();  // Estado del ticket
            if (status === 'solved') {
                resolvedCount++;
            } else {
                unresolvedCount++;
            }
        });

        // Llamar a la función para generar el gráfico con los datos contados
        generatePieChart(resolvedCount, unresolvedCount);
    } catch (error) {
        console.error('Error al contar los tickets:', error);
        alert('Hubo un problema al contar los tickets.');
    }
}

// 2. Función para generar el gráfico de pastel
function generatePieChart(resolvedCount, unresolvedCount) {
    const ctx = document.getElementById('myPieChart').getContext('2d');

    // Datos para el gráfico de pastel
    const data = {
        labels: ['Resueltos', 'No Resueltos'],
        datasets: [{
            data: [resolvedCount, unresolvedCount],  // Datos de las categorías
            backgroundColor: ['#28a745', '#dc3545'],  // Colores para cada categoría
            hoverBackgroundColor: ['#218838', '#c82333'],
        }]
    };

    // Configuración del gráfico de pastel (Pie Chart)
    const myPieChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.label + ': ' + tooltipItem.raw;
                        }
                    }
                }
            }
        }
    });
}

async function loadLastTickets() {
    try {
        const response = await fetchWithAuth('http://127.0.0.1:3000/api/v1/tickets');
        const result = await response.json();
        const tickets = result.data;

        // Ordenar los tickets por la fecha de creación (de más reciente a más antiguo)
        const sortedTickets = tickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Obtener los últimos 5 tickets
        const last5Tickets = sortedTickets.slice(0, 5);  // Seleccionamos solo los 5 primeros tickets

        // Crear el contenido de la tabla
        let content = '';
        last5Tickets.forEach((ticket, index) => {
            content += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${ticket.title}</td>
                    <td>${ticket.status}</td>
                    <td>${ticket.priority}</td>
                    <td>${new Date(ticket.createdAt).toLocaleDateString()}</td>
                </tr>
            `;
        });

        // Inyectar el contenido en el tbody de la tabla
        document.getElementById('tableBody_lastTickets').innerHTML = content;
    } catch (error) {
        console.error('Error al cargar los últimos tickets:', error);
        alert('Hubo un problema al cargar los últimos tickets.');
    }
}




// 4. Llamar a countTicketsThisMonth al cargar la página
window.addEventListener('load', async () => {
    await countTicketsThisMonth();
    await countTicketsPending();
    await countHighPriorityUnresolvedTickets();
    await countSolvedTicketsThisMonth();
    await loadLastTickets();
});

// 3. Llamar a la función para contar los tickets y generar el gráfico
document.addEventListener('DOMContentLoaded', () => {
    countTicketsByMonth();  // Contar los tickets por mes y generar el gráfico
    countTicketsResolvedAndUnresolved();  
});

