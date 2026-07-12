// agencia-perfil.js - Perfil público de agencia con modal

// Obtener ID de la URL
const pathParts = window.location.pathname.split('/');
const agencyId = pathParts[pathParts.length - 1];

// Elementos del DOM
const coverImg = document.getElementById('coverImage');
const avatarImg = document.getElementById('avatarImage');
const agencyNameSpan = document.getElementById('agencyName');
const agencyDetailsDiv = document.getElementById('agencyDetails');
const propertiesGrid = document.getElementById('properties-grid');

// Modal global
let currentProperty = null;
let currentImageIndex = 0;
let showingForm = false;
const modal = document.getElementById('propertyModal');
const closeModal = document.querySelector('.close-modal');
const modalInfo = document.getElementById('modalInfo');
const carouselImages = document.getElementById('carouselImages');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Menú hamburguesa
const hamburger = document.getElementById('hamburgerBtn');
const sidebar = document.getElementById('sidebar');
if (hamburger) {
    hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

// Funciones del modal (carrusel)
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
    if (messageBtn) messageBtn.addEventListener('click', () => renderMessageForm(property));
}

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
    if (backBtn) backBtn.addEventListener('click', () => renderDetails(property));
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
                    body: JSON.stringify({ property_id: property.id, client_name, client_email, message })
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

function openModal(property) {
    currentProperty = property;
    currentImageIndex = 0;
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
        const img = document.createElement('img');
        img.src = property.portada || 'https://via.placeholder.com/800x500?text=Sin+imagen';
        img.alt = property.title;
        img.classList.add('active');
        carouselImages.appendChild(img);
    }
    renderDetails(property);
    modal.style.display = 'block';
}

// Cargar datos de la agencia
async function loadAgency() {
    try {
        const res = await fetch(`/api/agencies`);
        const agencies = await res.json();
        const agency = agencies.find(a => a.id == agencyId);
        if (!agency) {
            agencyNameSpan.innerText = 'Agencia no encontrada';
            return;
        }
        agencyNameSpan.innerText = agency.name;
        avatarImg.src = agency.logo || 'https://via.placeholder.com/120?text=Logo';
        coverImg.src = agency.cover || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80';
        agencyDetailsDiv.innerHTML = `
            <p><i class="fa-regular fa-envelope"></i> ${agency.email}</p>
            <p><i class="fa-solid fa-phone"></i> ${agency.phone || 'No especificado'}</p>
            <p><i class="fa-solid fa-location-dot"></i> ${agency.address || 'Sin dirección'}</p>
        `;
    } catch (err) {
        console.error(err);
        agencyNameSpan.innerText = 'Error al cargar agencia';
    }
}

// Cargar propiedades de la agencia y asignar evento click
async function loadProperties() {
    try {
        const res = await fetch(`/api/properties?agency_id=${agencyId}`);
        const properties = await res.json();
        if (!properties.length) {
            propertiesGrid.innerHTML = '<div class="no-results">Esta agencia aún no tiene propiedades publicadas.</div>';
            return;
        }
        propertiesGrid.innerHTML = properties.map(p => {
            const tagClass = p.operation === 'alquiler' ? 'rent' : 'sale';
            const tagText = p.operation === 'alquiler' ? 'Alquiler' : 'VENTA';
            const priceDisplay = p.operation === 'alquiler' ? `$${p.price}/mes` : `$${p.price}`;
            const portada = p.images?.[0] || 'https://via.placeholder.com/300x200?text=Sin+imagen';
            return `
                <div class="card" data-id="${p.id}">
                    <div class="card-image">
                        <img src="${portada}" alt="${p.title}">
                        <span class="tag ${tagClass}">${tagText}</span>
                    </div>
                    <div class="card-content">
                        <h3>${priceDisplay}</h3>
                        <p class="title">${p.title}</p>
                        <p class="location"><i class="fa-solid fa-location-dot"></i> ${p.location}</p>
                        <div class="card-features">
                            <span><i class="fa-solid fa-bed"></i> ${p.rooms || 0} Hab</span>
                            <span><i class="fa-solid fa-bath"></i> ${p.baths || 0} Baños</span>
                            <span><i class="fa-solid fa-ruler-combined"></i> ${p.area || 0} m²</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        // Evento click en cada tarjeta para abrir modal
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', () => {
                const id = parseInt(card.dataset.id);
                const property = properties.find(p => p.id === id);
                if (property) openModal(property);
            });
        });
    } catch (err) {
        console.error(err);
        propertiesGrid.innerHTML = '<div class="error">Error al cargar propiedades</div>';
    }
}

// Inicializar
loadAgency();
loadProperties();