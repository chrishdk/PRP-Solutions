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


