// propiedades.js - Lógica para la página de propiedades

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

// Variables del modal
let currentProperty = null;
let currentImageIndex = 0;
let showingForm = false;

// Elementos del modal
const modal = document.getElementById('propertyModal');
const closeModal = document.querySelector('.close-modal');
const modalInfo = document.getElementById('modalInfo');
const carouselImages = document.getElementById('carouselImages');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Cerrar modal
if (closeModal) {
    closeModal.onclick = () => {
        modal.style.display = 'none';
        showingForm = false;
    };
}
window.onclick = (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        showingForm = false;
    }
};

// Funciones del carrusel
function showImage(index) {
    const imgs = carouselImages.querySelectorAll('img');
    imgs.forEach((img, i) => {
        img.classList.toggle('active', i === index);
    });
}

function nextImage() {
    if (!currentProperty) return;
    const total = currentProperty.images.length;
    currentImageIndex = (currentImageIndex + 1) % total;
    showImage(currentImageIndex);
}

function prevImage() {
    if (!currentProperty) return;
    const total = currentProperty.images.length;
    currentImageIndex = (currentImageIndex - 1 + total) % total;
    showImage(currentImageIndex);
}

if (prevBtn) prevBtn.onclick = prevImage;
if (nextBtn) nextBtn.onclick = nextImage;

// Renderizar detalles de la propiedad (modo normal)
function renderDetails(property) {
    showingForm = false;
    const priceDisplay = property.operation === 'alquiler'
        ? `$${property.price.toLocaleString()} / mes`
        : `$${property.price.toLocaleString()}`;

    modalInfo.innerHTML = `
        <h2>${property.title}</h2>
        <div class="price">${priceDisplay}</div>
        <div class="location"><i class="fa-solid fa-location-dot"></i> ${property.location}</div>
        <div class="features">
            <span><i class="fa-solid fa-bed"></i> ${property.rooms || 0} Hab</span>
            <span><i class="fa-solid fa-bath"></i> ${property.baths || 0} Baños</span>
            <span><i class="fa-solid fa-ruler-combined"></i> ${property.area || 0} m²</span>
        </div>
        <div class="detail-text"><strong>Descripción:</strong><br>${property.description || 'Sin descripción disponible.'}</div>
        <div class="detail-text"><strong>Agencia:</strong> ${property.agency_name || 'Inmobiliaria asociada'}</div>
        <button id="messageBtn" class="btn-message"><i class="fa-regular fa-comment"></i> Enviar mensaje a la inmobiliaria</button>
    `;

    const messageBtn = document.getElementById('messageBtn');
    if (messageBtn) {
        messageBtn.addEventListener('click', () => renderMessageForm(property));
    }
}

// Renderizar formulario de mensaje
function renderMessageForm(property) {
    if (showingForm) return;
    showingForm = true;

    modalInfo.innerHTML = `
        <h2>Contactar a ${property.agency_name || 'la inmobiliaria'}</h2>
        <div class="detail-text">Propiedad: <strong>${property.title}</strong></div>
        <form id="messageForm" class="message-form">
            <input type="text" id="clientName" placeholder="Tu nombre" required>
            <input type="email" id="clientEmail" placeholder="Tu correo electrónico" required>
            <textarea id="messageText" rows="4" placeholder="Escribe tu mensaje aquí..." required></textarea>
            <button type="submit" class="btn-message">Enviar mensaje</button>
            <div id="formFeedback" class="form-feedback"></div>
        </form>
        <button id="backToDetails" class="btn-message" style="background:#6c757d;">Volver a detalles</button>
    `;

    const backBtn = document.getElementById('backToDetails');
    if (backBtn) {
        backBtn.addEventListener('click', () => renderDetails(property));
    }

    const form = document.getElementById('messageForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const client_name = document.getElementById('clientName').value.trim();
            const client_email = document.getElementById('clientEmail').value.trim();
            const message = document.getElementById('messageText').value.trim();
            const feedback = document.getElementById('formFeedback');

            if (!client_name || !client_email || !message) {
                feedback.textContent = 'Todos los campos son obligatorios.';
                feedback.style.color = '#e63946';
                return;
            }

            try {
                const res = await fetch('/api/send-message', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        property_id: property.id,
                        client_name,
                        client_email,
                        message
                    })
                });
                const data = await res.json();
                if (res.ok) {
                    feedback.textContent = '✅ Mensaje enviado. La inmobiliaria te contactará pronto.';
                    feedback.style.color = '#2a9d8f';
                    setTimeout(() => modal.style.display = 'none', 2000);
                } else {
                    feedback.textContent = '❌ Error: ' + data.error;
                    feedback.style.color = '#e63946';
                }
            } catch (err) {
                feedback.textContent = 'Error de conexión';
                feedback.style.color = '#e63946';
            }
        });
    }
}

// Abrir modal con la propiedad seleccionada
function openModal(property) {
    currentProperty = property;
    currentImageIndex = 0;

    // Construir carrusel
    carouselImages.innerHTML = '';
    if (property.images && property.images.length) {
        property.images.forEach((url, idx) => {
            const img = document.createElement('img');
            img.src = url;
            img.alt = property.title;
            if (idx === 0) img.classList.add('active');
            carouselImages.appendChild(img);
        });
    } else {
        // Fallback: mostrar imagen por defecto
        const img = document.createElement('img');
        img.src = property.portada || 'https://via.placeholder.com/800x500?text=Sin+imagen';
        img.alt = property.title;
        img.classList.add('active');
        carouselImages.appendChild(img);
    }

    renderDetails(property);
    modal.style.display = 'block';
}

// Cargar propiedades desde la API y renderizar tarjetas
async function loadProperties() {
    const container = document.getElementById('properties-grid');
    if (!container) return;

    try {
        const response = await fetch('/api/properties');
        if (!response.ok) throw new Error('Error al cargar propiedades');
        const properties = await response.json();

        if (properties.length === 0) {
            container.innerHTML = '<div class="no-results">No hay propiedades disponibles.</div>';
            return;
        }

        // Renderizar tarjetas
        container.innerHTML = properties.map(prop => {
            const tagClass = prop.operation === 'alquiler' ? 'rent' : 'sale';
            const tagText = prop.operation === 'alquiler' ? 'Alquiler' : 'VENTA';
            const priceDisplay = prop.operation === 'alquiler'
                ? `$${prop.price.toLocaleString()} / mes`
                : `$${prop.price.toLocaleString()}`;
            const portada = prop.images && prop.images.length > 0
                ? prop.images[0]
                : 'https://via.placeholder.com/300x200?text=Sin+imagen';

            return `
                <div class="card" data-id="${prop.id}">
                    <div class="card-image">
                        <img src="${portada}" alt="${prop.title}">
                        <span class="tag ${tagClass}">${tagText}</span>
                    </div>
                    <div class="card-content">
                        <h3>${priceDisplay}</h3>
                        <p class="title">${prop.title}</p>
                        <p class="location"><i class="fa-solid fa-location-dot"></i> ${prop.location}</p>
                        <div class="card-features">
                            <span><i class="fa-solid fa-bed"></i> ${prop.rooms || 0} Hab</span>
                            <span><i class="fa-solid fa-bath"></i> ${prop.baths || 0} Baños</span>
                            <span><i class="fa-solid fa-ruler-combined"></i> ${prop.area || 0} m²</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Agregar evento click a cada tarjeta
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', () => {
                const id = parseInt(card.dataset.id);
                const property = properties.find(p => p.id === id);
                if (property) openModal(property);
            });
        });
    } catch (error) {
        console.error(error);
        container.innerHTML = '<div class="error">❌ Error al cargar las propiedades. Intenta más tarde.</div>';
    }
}

// Si hay un parámetro ?id= en la URL, abrir esa propiedad directamente
function checkUrlParam() {
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');
    if (idParam) {
        fetch('/api/properties')
            .then(res => res.json())
            .then(properties => {
                const property = properties.find(p => p.id == idParam);
                if (property) openModal(property);
            })
            .catch(console.error);
    }
}

// Inicializar
loadProperties();
checkUrlParam();