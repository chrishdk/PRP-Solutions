// Función para obtener el valor de la cookie por su nombre
function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        let [key, value] = cookie.trim().split('=');
        if (key === name) return decodeURIComponent(value);
    }
    return null;
}
// 3. Helper para realizar peticiones con autorización
async function fetchWithAuth(url, options = {}) {
    const token = getCookie('accessToken');
    if (!token) throw new Error('Token no disponible. Inicie sesión nuevamente.');

    const isFormData = options.body instanceof FormData;

    const headers = {
        'Authorization': `Bearer ${token}`,
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...options.headers,
    };

    return fetch(url, { ...options, headers });
}

// 7. Función para enviar reportes
document.getElementById('submitReportButton').addEventListener('click', async () => {
    const title = document.getElementById('reportTitle').value;
    const description = document.getElementById('reportDescription').value;
    const typeId = document.getElementById('reportTypeId').value;
    const images = document.getElementById('reportImages').files;

    // Verificar que no se envíen más de 3 imágenes
    if (images.length > 3) {
        alert('Solo se permiten hasta 3 imágenes.');
        return;
    }

    const formData = new FormData();

    // Agregar las imágenes al FormData usando la clave 'files'
    for (let i = 0; i < images.length; i++) {
        formData.append('files', images[i]); // Cambia 'images' a 'files'
    }

    // Agregar los demás campos al FormData
    formData.append('title', title);
    formData.append('description', description);
    formData.append('typeId', typeId);

    try {
        // Realizar la petición para enviar el reporte
        const response = await fetchWithAuth('http://127.0.0.1:3000/api/v1/tickets', {
            method: 'POST',
            body: formData, // Solo necesitas esto
            // No establecer 'Content-Type', ya que se manejará automáticamente
        });

        // Verificar si la respuesta fue exitosa
        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(`Error al generar el reporte: ${JSON.stringify(errorResponse)}`);
        }

        // Notificar al usuario que el reporte se generó exitosamente
        alert('Reporte generado exitosamente!');

        // Cerrar el modal y resetear el formulario
        // const modal = bootstrap.Modal.getInstance(document.getElementById('reportModal'));
        $('#reportModal').modal('hide');
        document.getElementById('reportForm').reset();
        await listTickets();
    } catch (error) {
        console.error('Error al generar el reporte:', error);
        alert('Hubo un problema al generar el reporte: ' + error.message);
    }
});

// 5. Función para cargar los tipos de reportes
async function loadReportTypes() {
    try {
        const response = await fetchWithAuth('http://127.0.0.1:3000/api/v1/tickets/types');

        // Verificar si la respuesta es exitosa
        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(`Código: ${response.status}, Mensaje: ${JSON.stringify(errorResponse)}`);
        }

        // Procesar la respuesta JSON
        const result = await response.json();

        // Mostrar el resultado en consola
        console.log('Tipos de reportes:', result);

        // Asumir que result es un array de tipos de reportes
        const types = result; // Ajusta esto si la estructura de tu respuesta es diferente

        const typeSelect = document.getElementById('reportTypeId');
        typeSelect.innerHTML = '<option value="">Seleccione un tipo</option>'; // Limpiar opciones previas

        types.forEach(type => {
            const option = document.createElement('option');
            option.value = type.id; // Usar 'id'
            option.textContent = type.type; // Usar 'type'
            typeSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar los tipos de reportes:', error);
        alert('Hubo un problema al cargar los tipos de reportes: ' + error.message);
    }
}

// Llama a la función para cargar los tipos al cargar el formulario
document.addEventListener('DOMContentLoaded', loadReportTypes);

// 2. Inicialización de la tabla al cargar la página
window.addEventListener('load', async () => {
    await listTickets();
});


// Función para listar los tickets filtrados por usuario
async function listTickets() {
    try {
        // Obtener el id del usuario autenticado desde la cookie 'idUser'
        const userId = getCookie('idUser'); // Leer el ID de la cookie 'idUser'

        // Verificar si el id del usuario está disponible
        if (!userId) {
            console.error('No se encontró el ID del usuario');
            alert('No se pudo verificar el usuario.');
            return;
        }

        // Realizar la solicitud a la API para obtener los tickets
        const response = await fetchWithAuth('http://127.0.0.1:3000/api/v1/tickets');
        const result = await response.json();
        const tickets = result.data;

        // Filtrar los tickets para solo mostrar los del usuario autenticado
        const userTickets = tickets.filter(ticket => ticket.userId === userId);

        // Ordenar los tickets del más nuevo al más antiguo
        userTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Construir el contenido HTML para mostrar los tickets
        let content = '';
        userTickets.forEach((ticket, index) => {
            content += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${ticket.title}</td>
                    <td>${ticket.description}</td>
                    <td>${ticket.userId}</td>
                    <td>${ticket.priority}</td>
                    <td>${ticket.status}</td>
                    <td>
                        <button class="btn btn-info btn-sm" onclick="openTicketModal('${ticket.id}')">
                            Ver Detalle
                        </button>
                    </td>
                </tr>`;
        });

        // Insertar el contenido en la tabla
        document.getElementById('tableBody_tickets').innerHTML = content;

    } catch (error) {
        console.error('Error al listar los tickets:', error);
        alert('Hubo un problema al cargar los tickets.');
    }
}