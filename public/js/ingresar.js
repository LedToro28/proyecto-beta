// ingresar.js - Lógica para la página de inicio de sesión

// Menú hamburguesa
const hamburger = document.getElementById('hamburgerBtn');
const sidebar = document.getElementById('sidebar');
if (hamburger) {
    hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

// Cerrar sidebar al hacer clic en enlace
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });
});

// Formulario de login
const loginForm = document.getElementById('loginForm');
const errorDiv = document.getElementById('loginError');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        errorDiv.textContent = '';
        errorDiv.style.color = '#e53e3e';
        
        if (!username || !password) {
            errorDiv.textContent = 'Por favor, completa todos los campos.';
            return;
        }
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Redirigir según el rol
                if (data.role === 'admin') {
                    window.location.href = '/dashboard/admin';
                } else if (data.role === 'agency') {
                    window.location.href = '/dashboard/agency';
                } else {
                    window.location.href = '/';
                }
            } else {
                errorDiv.textContent = data.error || 'Credenciales inválidas. Intenta nuevamente.';
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            errorDiv.textContent = 'Error de conexión con el servidor. Intenta más tarde.';
        }
    });
}