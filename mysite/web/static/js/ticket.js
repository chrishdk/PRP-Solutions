// 1. Helper para obtener el token desde las cookies
function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        let [key, value] = cookie.trim().split('=');
        if (key === name) return decodeURIComponent(value);
    }
    return null;
}

// 2. Inicialización de la tabla al cargar la página
window.addEventListener('load', async () => {
    await listTickets();
});

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

// Función para listar los tickets filtrados por usuario
async function listTickets() {

        // Realizar la solicitud a la API para obtener los tickets
        const response = await fetchWithAuth('http://127.0.0.1:3000/api/v1/tickets');
        const result = await response.json();
        const tickets = result.data;

        // Filtrar los tickets para solo mostrar los del usuario autenticado
        const openTickets = tickets.filter(tickets => tickets.status !== 'SOLVED');
        const openTickets2 = openTickets.filter(tickets => tickets.status !== 'REJECTED');

        // Ordenar los tickets del más nuevo al más antiguo
        openTickets2.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Construir el contenido HTML para mostrar los tickets
        let content = '';
        openTickets2.forEach((ticket, index) => {
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
        console.log(response)

    }

// 5. Función para mostrar los detalles de un ticket en el modal
const openTicketModal = async (ticketId) => {
    try {
        const response = await fetchWithAuth(`http://127.0.0.1:3000/api/v1/tickets/id/${ticketId}`);

        if (!response.ok) {
            throw new Error('No se pudo obtener el detalle del ticket.');
        }

        const ticket = await response.json();

        const imageButtons = ticket.images.map((img, index) => `
            <button class="btn btn-secondary" onclick="showImage('${img}')">
                Mostrar Imagen ${index + 1}
            </button>
        `).join('');

        const modalContent = `
            <p class="d-flex justify-content-between align-items-center">
                <span><strong>ID:</strong> ${ticket.id}</span>
                <button class="btn btn-success btn-sm" onclick="openResolveReportModal('${ticket.id}')">
                    Resolver
                </button>
            </p>
            <p><strong>Título:</strong> ${ticket.title}</p>
            <p><strong>Descripción:</strong> ${ticket.description}</p>
            <p>
                <strong>Prioridad:</strong> 
                <span id="ticketPriority">${ticket.priority}</span>
                <button class="btn btn-warning btn-sm" id="enableEditButton" onclick="enableEditPriority()">Modificar</button>
                <select id="prioritySelect" style="display:none;">
                    <option value="LOW">Baja</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                </select>
                <button class="btn btn-primary btn-sm" id="updatePriorityButton" style="display:none;">Actualizar Prioridad</button>
            </p>
            <p>
                <strong>Estado:</strong> 
                <span id="ticketStatus">${ticket.status}</span>
                <button class="btn btn-warning btn-sm" id="enableEditStatusButton" onclick="enableEditStatus()">Modificar</button>
                <select id="statusSelect" style="display:none;">
                    <option value="PENDING">Pendiente</option>
                    <option value="IN_PROGRESS">En Progreso</option>
                    <option value="SOLVED">Resuelto</option>
                </select>
                <button class="btn btn-primary btn-sm" id="updateStatusButton" style="display:none;">Actualizar Estado</button>
            </p>
            <p><strong>Creado en:</strong> ${new Date(ticket.createdAt).toLocaleString()}</p>
            <p><strong>Última actualización:</strong> ${new Date(ticket.updatedAt).toLocaleString()}</p>
            <p><strong>Imágenes:</strong></p>
            <div class="button-container">
                ${imageButtons}
            </div>
            <div id="imageDisplay" class="my-2"></div>
        `;

        document.getElementById('modalTicketContent').innerHTML = modalContent;

        // Agregar eventos a los botones de actualización
        document.getElementById('updatePriorityButton').onclick = async () => {
            const newPriority = document.getElementById('prioritySelect').value;
            await updateTicketPriority(ticketId, newPriority);
        };

        document.getElementById('updateStatusButton').onclick = async () => {
            const newStatus = document.getElementById('statusSelect').value;
            await updateTicketStatus(ticketId, newStatus);
        };

        const modal = new bootstrap.Modal(document.getElementById('ticketModal'));
        modal.show();
    } catch (error) {
        console.error('Error al cargar los detalles del ticket:', error);
        document.getElementById('modalTicketContent').innerHTML = '<p>Error al cargar los detalles del ticket.</p>';
    }
};

// Función para habilitar el edit de prioridad
function enableEditPriority() {
    document.getElementById('prioritySelect').style.display = 'inline-block';
    document.getElementById('updatePriorityButton').style.display = 'inline-block';
    document.getElementById('enableEditButton').style.display = 'none';
}

// Función para actualizar la prioridad
async function updateTicketPriority(ticketId, newPriority) {
    try {
        const response = await fetchWithAuth(`http://127.0.0.1:3000/api/v1/tickets/update-priority/${ticketId}/${newPriority}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(`Error al actualizar la prioridad: ${JSON.stringify(errorResponse)}`);
        }

        alert('Prioridad actualizada exitosamente!');
        document.getElementById('ticketPriority').textContent = newPriority;

        // Restablecer la interfaz
        document.getElementById('prioritySelect').style.display = 'none';
        document.getElementById('updatePriorityButton').style.display = 'none';
        document.getElementById('enableEditButton').style.display = 'inline-block';

        listTickets();
    } catch (error) {
        console.error('Error al actualizar la prioridad:', error);
        alert('Hubo un problema al actualizar la prioridad: ' + error.message);
    }
}

// Función para habilitar el edit de estado
function enableEditStatus() {
    document.getElementById('statusSelect').style.display = 'inline-block';
    document.getElementById('updateStatusButton').style.display = 'inline-block';
    document.getElementById('enableEditStatusButton').style.display = 'none';
}

// Función para actualizar el estado
async function updateTicketStatus(ticketId, newStatus) {
    try {
        const response = await fetchWithAuth(`http://127.0.0.1:3000/api/v1/tickets/update-status/${ticketId}/${newStatus}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(`Error al actualizar el estado: ${JSON.stringify(errorResponse)}`);
        }

        alert('Estado actualizado exitosamente!');
        document.getElementById('ticketStatus').textContent = newStatus;

        // Restablecer la interfaz
        document.getElementById('statusSelect').style.display = 'none';
        document.getElementById('updateStatusButton').style.display = 'none';
        document.getElementById('enableEditStatusButton').style.display = 'inline-block';
        listTickets();
    } catch (error) {
        console.error('Error al actualizar el estado:', error);
        alert('Hubo un problema al actualizar el estado: ' + error.message);
    }
}

// 6. Función para mostrar la imagen a partir de su ID
async function showImage(imageId) {
    try {
        const response = await fetchWithAuth(`http://127.0.0.1:3000/api/v1/tickets/img/${imageId}`);

        if (!response.ok) {
            throw new Error('No se pudo cargar la imagen.');
        }

        const imageData = await response.blob();
        const imageUrl = URL.createObjectURL(imageData);

        const imageDisplay = document.getElementById('imageDisplay');
        imageDisplay.innerHTML = `
            <img src="${imageUrl}" width="300" alt="Imagen del ticket" />
        `;
    } catch (error) {
        console.error('Error al cargar la imagen:', error);
        const imageDisplay = document.getElementById('imageDisplay');
        imageDisplay.innerHTML = '<p>Error al cargar la imagen.</p>';
    }
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

// Función para abrir el modal de resolver reporte
function openResolveReportModal(ticketId) {
    const confirmButton = document.getElementById('confirmResolveButton');
    confirmButton.onclick = async () => {
        try {
            const response = await fetchWithAuth(`http://127.0.0.1:3000/api/v1/tickets/update-status/${ticketId}/SOLVED`, {
                method: 'PATCH',
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                throw new Error(`Error al resolver el reporte: ${JSON.stringify(errorResponse)}`);
            }

            // Notificar al usuario que el reporte fue resuelto
            alert('Reporte resuelto exitosamente!');

            // Cerrar el modal
            $('#resolveReportModal').modal('hide');

            // Actualizar la lista de tickets
            await listTickets();
        } catch (error) {
            console.error('Error al resolver el reporte:', error);
            alert('Hubo un problema al resolver el reporte: ' + error.message);
        }
    };

    // Mostrar el modal
    $('#resolveReportModal').modal('show');
}
