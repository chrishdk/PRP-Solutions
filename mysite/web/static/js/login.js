document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita la recarga de la página

    const email = document.querySelector('input[name="email"]').value;
    const password = document.querySelector('input[name="password"]').value;
    const errorMessage = document.getElementById('errorMessage');

    const apiUrl = 'http://127.0.0.1:3000/api/v1/auth/sign-in'; // URL API

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ email, password }), // Enviar los datos como JSON
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error de autenticación.');
        }

        const data = await response.json();
        const { accessToken, refreshToken } = data.token; // Accediendo correctamente al token
        const roles = data.user.roles || []; // Asegúrate de que sea un arreglo
        const { username } = data.user; // Asegúrate de que sea el nombre correcto
        const { id } = data.user;

        // Guardar el token, el rol y el nombre del usuario en cookies
        document.cookie = `accessToken=${accessToken}; path=/; max-age=7200`; // Sin Secure si no usas HTTPS
        document.cookie = `refreshToken=${refreshToken}; path=/; max-age=7200`;
        document.cookie = `userRole=${roles.join(',')}; path=/; max-age=7200`;
        document.cookie = `userName=${username}; path=/; max-age=7200`; // Guardar el nombre del usuario
        document.cookie = `idUser=${id}; path=/; max-age=7200`; 

        // Esconder mensaje de error si todo fue exitoso
        errorMessage.style.display = 'none';

        // Redirigir según los roles del usuario
        if (roles.includes('admin')) {
            window.location.href = '/dashboard'; // Página para administradores
        } else if (roles.includes('user')) {
            window.location.href = '/user'; // Página para usuarios normales
        } else {
            window.location.href = '/login2'; // Cambia esto según tu estructura
        }
    } catch (error) {
        console.error('Error:', error);
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block';
    }
});
