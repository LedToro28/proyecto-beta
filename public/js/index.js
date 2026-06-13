// index.js - Lógica para la página de inicio

// Menú hamburguesa
const hamburger = document.getElementById('hamburgerBtn');
const sidebar = document.getElementById('sidebar');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

// Cerrar sidebar al hacer clic en un enlace (mejor experiencia en móvil)
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });
});

// Cargar propiedades destacadas desde la API
async function loadProperties() {
    const container = document.getElementById('properties-grid');
    if (!container) return;

    try {
        const response = await fetch('/api/properties');
        if (!response.ok) throw new Error('Error al cargar propiedades');
        const properties = await response.json();

        if (properties.length === 0) {
            container.innerHTML = '<div class="no-results">No hay propiedades disponibles en este momento.</div>';
            return;
        }

        // Mostrar solo las primeras 6 propiedades como destacadas
        const destacadas = properties.slice(0, 6);
        container.innerHTML = destacadas.map(property => {
            const tagClass = property.operation === 'alquiler' ? 'rent' : 'sale';
            const tagText = property.operation === 'alquiler' ? 'Alquiler' : 'VENTA';
            const priceDisplay = property.operation === 'alquiler'
                ? `$${property.price.toLocaleString()} / mes`
                : `$${property.price.toLocaleString()}`;
            const portada = property.images && property.images.length > 0
                ? property.images[0]
                : 'https://via.placeholder.com/300x200?text=Sin+imagen';

            return `
                <div class="card" data-id="${property.id}">
                    <div class="card-image">
                        <img src="${portada}" alt="${property.title}">
                        <span class="tag ${tagClass}">${tagText}</span>
                    </div>
                    <div class="card-content">
                        <h3>${priceDisplay}</h3>
                        <p class="title">${property.title}</p>
                        <p class="location"><i class="fa-solid fa-location-dot"></i> ${property.location}</p>
                        <div class="card-features">
                            <span><i class="fa-solid fa-bed"></i> ${property.rooms || 0} Hab</span>
                            <span><i class="fa-solid fa-bath"></i> ${property.baths || 0} Baños</span>
                            <span><i class="fa-solid fa-ruler-combined"></i> ${property.area || 0} m²</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Redirigir al hacer clic en una tarjeta (a la página de propiedades con modal)
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                window.location.href = `/propiedades?id=${id}`;
            });
        });
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<div class="error">❌ Error al cargar las propiedades. Intenta más tarde.</div>';
    }
}

// Cargar propiedades al iniciar
loadProperties();