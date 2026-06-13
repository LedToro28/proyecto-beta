// admin-dashboard.js - Lógica para el panel de administrador

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

// Control de secciones
const sections = {
    agencies: document.getElementById('agencies-section'),
    register: document.getElementById('register-section')
};

function activateSection(sectionId) {
    Object.values(sections).forEach(sec => sec.classList.remove('active'));
    sections[sectionId].classList.add('active');
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.dataset.section === sectionId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        activateSection(section);
        if (section === 'agencies') loadAgencies();
    });
});

// Cargar estadísticas
async function loadStats() {
    try {
        const res = await fetch('/api/admin/stats');
        const stats = await res.json();
        document.getElementById('statAgencies').innerText = stats.total_agencies;
        document.getElementById('statProperties').innerText = stats.total_properties;
        document.getElementById('statUsers').innerText = stats.total_agency_users;
    } catch (e) {
        console.error('Error cargando estadísticas:', e);
    }
}

// Cargar lista de agencias (con tarjetas modernas)
async function loadAgencies() {
    const container = document.getElementById('agenciesList');
    try {
        const res = await fetch('/api/admin/agencies');
        const agencies = await res.json();
        if (!agencies.length) {
            container.innerHTML = '<p class="empty">No hay agencias registradas.</p>';
            return;
        }
        container.innerHTML = agencies.map(a => {
            const logoUrl = a.logo || 'https://via.placeholder.com/80?text=Logo';
            return `
                <div class="agency-card">
                    <div class="agency-card-image">
                        <img src="${logoUrl}" alt="${a.name}" class="agency-logo">
                    </div>
                    <div class="agency-card-content">
                        <div class="agency-name">
                            ${a.name}
                            <span class="agency-stats">${a.user_count} usuario${a.user_count !== 1 ? 's' : ''}</span>
                        </div>
                        <div class="agency-details">
                            <p><i class="fa-regular fa-envelope"></i> ${a.email}</p>
                            <p><i class="fa-solid fa-phone"></i> ${a.phone || 'No especificado'}</p>
                            <p><i class="fa-solid fa-location-dot"></i> ${a.address || 'Sin dirección'}</p>
                        </div>
                        <button class="btn-delete" data-id="${a.id}">Eliminar agencia</button>
                    </div>
                </div>
            `;
        }).join('');
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('¿Eliminar esta agencia? Se perderán todas sus propiedades y mensajes.')) {
                    await fetch(`/api/admin/agencies/${btn.dataset.id}`, { method: 'DELETE' });
                    loadAgencies();
                    loadStats();
                }
            });
        });
    } catch (e) {
        console.error('Error cargando agencias:', e);
        container.innerHTML = '<p class="error">Error al cargar agencias</p>';
    }
}

// Previsualización de logo y portada
const logoInput = document.getElementById('logoInput');
const coverInput = document.getElementById('coverInput');
const logoPreview = document.getElementById('logoPreview');
const coverPreview = document.getElementById('coverPreview');

if (logoInput) {
    logoInput.addEventListener('change', function(e) {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = ev => logoPreview.innerHTML = `<img src="${ev.target.result}" style="max-width:100px; border-radius:50%;">`;
            reader.readAsDataURL(this.files[0]);
        } else logoPreview.innerHTML = '';
    });
}
if (coverInput) {
    coverInput.addEventListener('change', function(e) {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = ev => coverPreview.innerHTML = `<img src="${ev.target.result}" style="max-width:100%; border-radius:16px;">`;
            reader.readAsDataURL(this.files[0]);
        } else coverPreview.innerHTML = '';
    });
}

// Registrar nueva agencia con contraseña manual
const form = document.getElementById('registerAgencyForm');
const feedback = document.getElementById('registerFeedback');

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        // Validaciones frontend
        const password = document.querySelector('input[name="password"]').value;
        const confirm = document.querySelector('input[name="confirm_password"]').value;
        if (password !== confirm) {
            feedback.innerHTML = '❌ Las contraseñas no coinciden';
            feedback.style.color = '#e53e3e';
            return;
        }
        if (password.length < 6) {
            feedback.innerHTML = '❌ La contraseña debe tener al menos 6 caracteres';
            feedback.style.color = '#e53e3e';
            return;
        }
        const formData = new FormData(form);
        feedback.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registrando...';
        try {
            const res = await fetch('/api/admin/agencies', { method: 'POST', body: formData });
            const data = await res.json();
            if (res.ok) {
                feedback.innerHTML = `✅ ${data.message}`;
                feedback.style.color = '#2a9d8f';
                form.reset();
                logoPreview.innerHTML = '';
                coverPreview.innerHTML = '';
                loadAgencies();
                loadStats();
                activateSection('agencies');
            } else {
                feedback.innerHTML = `❌ Error: ${data.error}`;
                feedback.style.color = '#e53e3e';
            }
        } catch (err) {
            feedback.innerHTML = '❌ Error de conexión';
            feedback.style.color = '#e53e3e';
        }
    });
}

// Cerrar sesión
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await fetch('/api/logout');
        window.location.href = '/';
    });
}

// Inicializar
loadStats();
loadAgencies();