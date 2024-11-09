// Función para obtener el valor de una cookie
function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        let [key, value] = cookie.trim().split('=');
        if (key === name) return decodeURIComponent(value);
    }
    return null;
}

function updateNavbar() {
    const userName = getCookie('userName');
    const userRole = getCookie('userRole');

    const userElement = document.getElementById('userNameDisplay'); // Elemento donde se mostrará el nombre del usuario
    const logoutButton = document.getElementById('logoutButton'); // Botón de logout

    if (userName) {
        // Eliminar cualquier parte extra del nombre (por ejemplo, " employed")
        const cleanUserName = userName.split(' ')[0]; // Solo toma la primera palabra (antes del espacio)

        // Mostrar solo el nombre limpio
        if (userElement) {
            userElement.textContent = cleanUserName;
        }

        // Mostrar el botón de logout
        if (logoutButton) {
            logoutButton.style.display = 'block';
        }
    } else {
        // Si no hay usuario autenticado, no mostrar el botón de logout
        if (logoutButton) {
            logoutButton.style.display = 'none';
        }
    }
}

// Agregar eventos al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    updateNavbar(); // Actualiza el navbar al cargar la página
});

// Función de logout
document.getElementById('logoutButton').addEventListener('click', logout);

// Configura el tiempo de espera en milisegundos (por ejemplo, 10 minutos)
const TIMEOUT_DURATION = 10 * 60 * 1000; // 10 minutos

// Establece un temporizador que cerrará la sesión después del tiempo especificado
let logoutTimer = setTimeout(logout, TIMEOUT_DURATION);

// Función de logout
function logout() {
    // Borrar las cookies del token y el rol
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'userName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    // Redirigir al usuario a la página de inicio de sesión
    window.location.href = '/login2';
}

// Escucha el evento de actividad del usuario para reiniciar el temporizador
function resetLogoutTimer() {
    clearTimeout(logoutTimer); 
    logoutTimer = setTimeout(logout, TIMEOUT_DURATION); 
}

// Escuchar eventos de actividad
window.addEventListener('mousemove', resetLogoutTimer);
window.addEventListener('keypress', resetLogoutTimer);
window.addEventListener('click', resetLogoutTimer);
