// contacto.js - Lógica para la página de contacto

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

// Formulario de contacto
const contactForm = document.getElementById('contactForm');
const feedback = document.getElementById('formFeedback');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();
        
        if (!name || !email || !subject || !message) {
            feedback.textContent = 'Por favor, completa todos los campos obligatorios.';
            feedback.style.color = '#e63946';
            return;
        }
        
        // Simular envío (en un futuro se conectará a backend)
        feedback.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
        feedback.style.color = '#6c5ce7';
        
        setTimeout(() => {
            feedback.innerHTML = '<i class="fa-solid fa-check-circle"></i> ¡Mensaje enviado con éxito! Te contactaremos pronto.';
            feedback.style.color = '#2a9d8f';
            contactForm.reset();
            setTimeout(() => {
                feedback.textContent = '';
            }, 5000);
        }, 1500);
    });
}