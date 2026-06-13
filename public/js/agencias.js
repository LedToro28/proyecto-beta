// agencias.js - Lógica para la página de agencias

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

// Cargar agencias desde la API
async function loadAgencies() {
    const container = document.getElementById('agencies-grid');
    if (!container) return;

    try {
        const response = await fetch('/api/agencies');
        if (!response.ok) throw new Error('Error al cargar agencias');
        const agencies = await response.json();
        renderAgencies(agencies);
    } catch (error) {
        console.error('Error al cargar agencias:', error);
        container.innerHTML = '<div class="error">❌ Error al cargar las agencias. Intenta más tarde.</div>';
    }
}

function renderAgencies(agencies) {
    const container = document.getElementById('agencies-grid');
    if (!agencies.length) {
        container.innerHTML = '<div class="no-results">No hay agencias registradas aún.</div>';
        return;
    }
    container.innerHTML = agencies.map(agency => {
        const logoUrl = agency.logo || 'https://via.placeholder.com/100?text=Logo';
        return `
            <div class="agency-card" data-id="${agency.id}">
                <div class="agency-image">
                    <img src="${logoUrl}" alt="${agency.name}" class="agency-logo">
                </div>
                <div class="card-content">
                    <h3>${agency.name}</h3>
                    <div class="agency-info">
                        <p><i class="fa-solid fa-envelope"></i> ${agency.email}</p>
                        <p><i class="fa-solid fa-phone"></i> ${agency.phone || 'No especificado'}</p>
                        <p><i class="fa-solid fa-location-dot"></i> ${agency.address || 'Sin dirección'}</p>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    // Redirigir al perfil público al hacer clic en la tarjeta
    document.querySelectorAll('.agency-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            window.location.href = `/agencia/${id}`;
        });
    });
}

// Inicializar
loadAgencies();