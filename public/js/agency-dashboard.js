// agency-dashboard.js - Lógica para el panel de agencia

// Menú hamburguesa
const hamburger = document.getElementById('hamburgerBtn');
const sidebar = document.getElementById('sidebar');
if (hamburger) {
    hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

// Navegación lateral
const navLinks = document.querySelectorAll('.nav-links a');
const sections = {
    properties: document.getElementById('properties-section'),
    'add-property': document.getElementById('add-property-section'),
    messages: document.getElementById('messages-section')
};

function activateSection(sectionId) {
    Object.values(sections).forEach(sec => sec.classList.remove('active'));
    sections[sectionId].classList.add('active');
    navLinks.forEach(link => {
        if (link.dataset.section === sectionId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    if (sectionId === 'properties') loadProperties();
    if (sectionId === 'messages') loadMessages();
}

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        activateSection(section);
        if (sidebar.classList.contains('open')) sidebar.classList.remove('open');
    });
});

// Cerrar sesión
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await fetch('/api/logout');
        window.location.href = '/';
    });
}

// ========== MODAL (Instagram style) ==========
let currentProperty = null;
let currentImageIndex = 0;
let showingForm = false;
const modal = document.getElementById('propertyModal');
const closeModal = document.querySelector('.close-modal');
const modalInfo = document.getElementById('modalInfo');
const carouselImages = document.getElementById('carouselImages');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

if (closeModal) closeModal.onclick = () => {
    modal.style.display = 'none';
    showingForm = false;
};
window.onclick = (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        showingForm = false;
    }
};

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
        <div class="detail-text"><strong>Agencia:</strong> ${property.agency_name || 'Tu inmobiliaria'}</div>
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

// ========== Cargar propiedades de la agencia (con modal) ==========
async function loadProperties() {
    const container = document.getElementById('propertiesList');
    try {
        const res = await fetch('/api/agency/properties');
        const props = await res.json();
        if (!props.length) {
            container.innerHTML = '<div class="property-card">No tienes propiedades registradas. Usa "Agregar Propiedad".</div>';
            return;
        }
        container.innerHTML = props.map(p => {
            const tagClass = p.operation === 'alquiler' ? 'rent' : 'sale';
            const tagText = p.operation === 'alquiler' ? 'Alquiler' : 'VENTA';
            const priceDisplay = p.operation === 'alquiler' ? `$${p.price}/mes` : `$${p.price}`;
            const portada = (p.images && p.images.length) ? p.images[0] : 'https://via.placeholder.com/300x200?text=Sin+imagen';
            return `
                <div class="property-card" data-id="${p.id}">
                    <div class="property-card-image">
                        <img src="${portada}" alt="${p.title}">
                        <span class="tag ${tagClass}">${tagText}</span>
                    </div>
                    <div class="property-card-content">
                        <div class="property-price">${priceDisplay}</div>
                        <div class="property-title">${p.title}</div>
                        <div class="property-location"><i class="fa-solid fa-location-dot"></i> ${p.location}</div>
                        <div class="card-features">
                            <span><i class="fa-solid fa-bed"></i> ${p.rooms || 0} Hab</span>
                            <span><i class="fa-solid fa-bath"></i> ${p.baths || 0} Baños</span>
                            <span><i class="fa-solid fa-ruler-combined"></i> ${p.area || 0} m²</span>
                        </div>
                        <button class="delete-btn" data-id="${p.id}">Eliminar propiedad</button>
                    </div>
                </div>
            `;
        }).join('');
        // Evento click en cada tarjeta para abrir modal
        document.querySelectorAll('.property-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Evitar que el clic en el botón eliminar también abra el modal
                if (e.target.classList.contains('delete-btn')) return;
                const id = parseInt(card.dataset.id);
                const prop = props.find(p => p.id === id);
                if (prop) openModal(prop);
            });
        });
        // Eventos para botones eliminar
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation(); // Evita que se abra el modal
                if (confirm('¿Eliminar esta propiedad?')) {
                    await fetch(`/api/agency/properties/${btn.dataset.id}`, { method: 'DELETE' });
                    loadProperties();
                }
            });
        });
    } catch (e) {
        console.error('Error cargando propiedades:', e);
        container.innerHTML = '<div class="property-card">Error al cargar propiedades</div>';
    }
}

// ========== Cargar perfil de la agencia ==========
async function loadProfile() {
    try {
        const res = await fetch('/api/agency/profile');
        const agency = await res.json();
        document.getElementById('agencyName').innerText = agency.name;
        const avatarUrl = agency.logo || 'https://via.placeholder.com/120?text=Logo';
        document.getElementById('avatarImage').src = avatarUrl;
        if (agency.cover) {
            document.getElementById('coverImage').src = agency.cover;
        }
        document.getElementById('agencyDetails').innerHTML = `
            <p><i class="fa-regular fa-envelope"></i> ${agency.email}</p>
            <p><i class="fa-solid fa-phone"></i> ${agency.phone || 'No especificado'}</p>
            <p><i class="fa-solid fa-location-dot"></i> ${agency.address || 'Sin dirección'}</p>
            <p><i class="fa-regular fa-calendar"></i> Miembro desde ${new Date(agency.created_at).toLocaleDateString()}</p>
        `;
        document.getElementById('userName').innerText = agency.name;
        document.getElementById('userRole').innerText = 'Agencia';
    } catch (e) {
        console.error('Error cargando perfil:', e);
    }
}

// Editar perfil (placeholder)
const editBtn = document.getElementById('editProfileBtn');
if (editBtn) {
    editBtn.addEventListener('click', () => alert('Próximamente: edición de perfil'));
}

// ========== Cargar mensajes ==========
async function loadMessages() {
    const container = document.getElementById('messagesList');
    try {
        const res = await fetch('/api/agency/messages');
        const msgs = await res.json();
        if (!msgs.length) {
            container.innerHTML = '<div class="message-card">No hay mensajes aún.</div>';
            return;
        }
        container.innerHTML = msgs.map(m => `
            <div class="message-card">
                <strong><i class="fa-regular fa-user"></i> ${m.client_name || 'Cliente'}</strong> (${m.client_email})<br>
                <small><i class="fa-regular fa-building"></i> Propiedad: ${m.property_title || 'N/A'}</small><br>
                <p>${m.message}</p>
                <small>${new Date(m.created_at).toLocaleString()}</small>
            </div>
        `).join('');
    } catch (e) {
        console.error('Error cargando mensajes:', e);
        container.innerHTML = '<div class="message-card">Error al cargar mensajes</div>';
    }
}

// ========== Agregar propiedad ==========
const form = document.getElementById('addPropertyForm');
const feedback = document.getElementById('addPropertyFeedback');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        feedback.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Publicando...';
        try {
            const res = await fetch('/api/agency/properties', { method: 'POST', body: formData });
            const data = await res.json();
            if (res.ok) {
                feedback.innerHTML = '✅ Propiedad agregada correctamente';
                feedback.style.color = '#2a9d8f';
                form.reset();
                loadProperties();
                activateSection('properties');
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

// Inicializar
loadProfile();
loadProperties();