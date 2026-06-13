// session.js - Control de sesión y perfil en sidebar
async function checkSession() {
    try {
        const response = await fetch('/api/session');
        const user = await response.json();

        const loginPrompt = document.getElementById('loginPrompt');
        const userProfile = document.getElementById('userProfile');

        if (user.loggedIn) {
            if (loginPrompt) loginPrompt.style.display = 'none';
            if (userProfile) {
                userProfile.style.display = 'flex';
                const userNameSpan = document.getElementById('userName');
                const userRoleSpan = document.getElementById('userRole');
                if (userNameSpan) userNameSpan.innerText = user.username;
                if (userRoleSpan) userRoleSpan.innerText = user.role === 'admin' ? 'Administrador' : 'Agencia';

                const logoutBtn = document.getElementById('logoutBtn');
                if (logoutBtn) {
                    logoutBtn.onclick = async () => {
                        await fetch('/api/logout');
                        window.location.href = '/';
                    };
                }
            }
        } else {
            if (loginPrompt) loginPrompt.style.display = 'flex';
            if (userProfile) userProfile.style.display = 'none';
        }
    } catch (error) {
        console.error('Error al verificar sesión:', error);
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', checkSession);