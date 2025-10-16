// public/js/mensajes.js

document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos del usuario desde localStorage
    let userData;
    try {
        userData = JSON.parse(localStorage.getItem('userData'));
    } catch (error) {
        window.location.href = "index.html";
        return;
    }
    
    if (!userData) {
        window.location.href = "index.html";
        return;
    }
    
    // Mostrar información del usuario en el sidebar
    displayUserInfo(userData);
    
    // Cargar contactos y mensajes
    loadContacts();
    
    // Configurar eventos de búsqueda
    setupSearchContacts();
    
    // Configurar botón de logout
    document.getElementById('logout-button').addEventListener('click', function() {
        localStorage.removeItem('userData');
        window.location.href = "index.html";
    });

    // Colapsar sidebar al entrar (Lógica de animación)
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    sidebar.classList.add('collapsed');
    mainContent.classList.add('expanded');
});

function displayUserInfo(userData) {
    // Mostrar nombre de usuario y rol en el sidebar
    document.getElementById('sidebar-user-name').textContent = userData.username || 'Usuario';
    document.getElementById('sidebar-user-role').textContent = userData.role === 'student' ? 'Estudiante' : 'Tutor';
    
    // Mostrar iniciales en el avatar
    const userAvatar = document.getElementById('sidebar-user-avatar');
    if (userData.profile && userData.profile.firstName) {
        const initials = `${userData.profile.firstName.charAt(0)}${userData.profile.lastName ? userData.profile.lastName.charAt(0) : ''}`;
        userAvatar.textContent = initials.toUpperCase();
    } else {
        userAvatar.textContent = userData.username.charAt(0).toUpperCase();
    }
}

function loadContacts() {
    // Cargar contactos guardados desde localStorage o usar contactos de ejemplo
    let contacts = JSON.parse(localStorage.getItem('userContacts') || '[]');
    
    // Si no hay contactos guardados, usar contactos de ejemplo
    if (contacts.length === 0) {
        contacts = [
            {
                id: 1,
                name: 'María González',
                role: 'Tutor',
                lastMessage: 'Hola, ¿cómo vas con el ejercicio de programación?',
                time: '10:30',
                unread: 2,
                avatar: 'MG'
            },
            {
                id: 2,
                name: 'Carlos Rodríguez',
                role: 'Tutor',
                lastMessage: 'La clase de mañana será a las 4pm',
                time: 'Ayer',
                unread: 0,
                avatar: 'CR'
            },
            {
                id: 3,
                name: 'Ana Martínez',
                role: 'Tutor',
                lastMessage: 'Te envié los materiales para la próxima clase',
                time: 'Lun',
                unread: 1,
                avatar: 'AM'
            },
            {
                id: 4,
                name: 'Soporte Técnico',
                role: 'Sistema',
                lastMessage: 'Tu solicitud ha sido recibida',
                time: '23/05',
                unread: 0,
                avatar: 'ST'
            }
        ];
        
        // Guardar contactos de ejemplo en localStorage
        localStorage.setItem('userContacts', JSON.stringify(contacts));
    }
    
    // Mostrar contactos en la interfaz
    displayContacts(contacts);
}

function displayContacts(contacts) {
    const contactsContainer = document.getElementById('contacts-container');
    contactsContainer.innerHTML = '';
    
    if (contacts.length === 0) {
        contactsContainer.innerHTML = '<div class="empty-state"><p>No hay contactos disponibles.</p></div>';
        return;
    }
    
    contacts.forEach(contact => {
        const contactItem = document.createElement('div');
        contactItem.className = 'contact-item';
        contactItem.dataset.id = contact.id;
        
        contactItem.innerHTML = `
            <div class="contact-avatar">${contact.avatar}</div>
            <div class="contact-info">
                <div class="contact-name">
                    <span>${contact.name}</span>
                    <span class="time">${contact.time}</span>
                </div>
                <div class="contact-preview">${contact.lastMessage}</div>
            </div>
            ${contact.unread > 0 ? `<div class="unread-badge">${contact.unread}</div>` : ''}
        `;
        
        contactItem.addEventListener('click', function() {
            // Marcar como activo
            document.querySelectorAll('.contact-item').forEach(item => {
                item.classList.remove('active');
            });
            contactItem.classList.add('active');
            
            // Cargar conversación
            loadConversation(contact);
            
            // Marcar como leído
            if (contact.unread > 0) {
                contact.unread = 0;
                const unreadBadge = contactItem.querySelector('.unread-badge');
                if (unreadBadge) {
                    unreadBadge.remove();
                }
                
                // Actualizar en localStorage
                const contacts = JSON.parse(localStorage.getItem('userContacts') || '[]');
                const updatedContacts = contacts.map(c => {
                    if (c.id === contact.id) {
                        c.unread = 0;
                    }
                    return c;
                });
                localStorage.setItem('userContacts', JSON.stringify(updatedContacts));
            }
        });
        
        contactsContainer.appendChild(contactItem);
    });
}

function loadConversation(contact) {
    // Cargar mensajes guardados desde localStorage o usar mensajes de ejemplo
    let conversations = JSON.parse(localStorage.getItem('userConversations') || '{}');
    let messages = conversations[contact.id] || [];
    
    // Si no hay mensajes guardados, usar mensajes de ejemplo
    if (messages.length === 0) {
        messages = [
            {
                id: 1,
                sender: 'contact',
                content: `Hola, soy ${contact.name}. ¿En qué puedo ayudarte hoy?`,
                time: '10:00'
            },
            {
                id: 2,
                sender: 'user',
                content: 'Hola, tengo algunas dudas sobre el curso.',
                time: '10:05'
            },
            {
                id: 3,
                sender: 'contact',
                content: 'Claro, dime qué dudas tienes y te ayudaré a resolverlas.',
                time: '10:10'
            },
            {
                id: 4,
                sender: 'user',
                content: '¿Cuándo es la próxima clase?',
                time: '10:15'
            },
            {
                id: 5,
                sender: 'contact',
                content: 'La próxima clase está programada para mañana a las 4:00 PM. ¿Podrás asistir?',
                time: '10:20'
            }
        ];
        
        // Guardar mensajes de ejemplo en localStorage
        conversations[contact.id] = messages;
        localStorage.setItem('userConversations', JSON.stringify(conversations));
    }
    
    // Mostrar conversación en la interfaz
    displayConversation(contact, messages);
}

function displayConversation(contact, messages) {
    const chatArea = document.getElementById('chat-area');
    
    // Crear estructura de chat
    chatArea.innerHTML = `
        <div class="chat-header">
            <div class="contact-avatar">${contact.avatar}</div>
            <div class="contact-info">
                <h3>${contact.name}</h3>
                <p>${contact.role}</p>
            </div>
            <div class="actions">
                <button title="Videollamada"><i class="fas fa-video"></i></button>
                <button title="Llamada"><i class="fas fa-phone"></i></button>
                <button title="Más opciones"><i class="fas fa-ellipsis-v"></i></button>
            </div>
        </div>
        <div class="chat-messages" id="chat-messages"></div>
        <div class="chat-input">
            <input type="text" placeholder="Escribe un mensaje..." id="message-input">
            <button id="send-button"><i class="fas fa-paper-plane"></i></button>
        </div>
    `;
    
    // Mostrar mensajes
    const chatMessages = document.getElementById('chat-messages');
    messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.sender === 'user' ? 'sent' : 'received'}`;
        
        messageElement.innerHTML = `
            <div class="message-content">${message.content}</div>
            <div class="message-time">${message.time}</div>
        `;
        
        chatMessages.appendChild(messageElement);
    });
    
    // Scroll al final de los mensajes
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Configurar envío de mensajes
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    
    function sendMessage() {
        const content = messageInput.value.trim();
        if (content) {
            // Crear nuevo mensaje
            const newMessage = {
                id: Date.now(),
                sender: 'user',
                content: content,
                time: getCurrentTime()
            };
            
            // Añadir mensaje a la interfaz
            const messageElement = document.createElement('div');
            messageElement.className = 'message sent';
            
            messageElement.innerHTML = `
                <div class="message-content">${newMessage.content}</div>
                <div class="message-time">${newMessage.time}</div>
            `;
            
            chatMessages.appendChild(messageElement);
            
            // Limpiar input
            messageInput.value = '';
            
            // Scroll al final de los mensajes
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Guardar mensaje en localStorage
            let conversations = JSON.parse(localStorage.getItem('userConversations') || '{}');
            if (!conversations[contact.id]) {
                conversations[contact.id] = [];
            }
            conversations[contact.id].push(newMessage);
            localStorage.setItem('userConversations', JSON.stringify(conversations));
            
            // Actualizar último mensaje en contactos
            updateLastMessage(contact.id, content);
            
            // Simular respuesta después de 1 segundo
            setTimeout(() => {
                simulateResponse(contact);
            }, 1000);
        }
    }
    
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

function updateLastMessage(contactId, message) {
    const contacts = JSON.parse(localStorage.getItem('userContacts') || '[]');
    const updatedContacts = contacts.map(contact => {
        if (contact.id === contactId) {
            contact.lastMessage = message;
            contact.time = getCurrentTime();
        }
        return contact;
    });
    localStorage.setItem('userContacts', JSON.stringify(updatedContacts));
    
    // Actualizar en la interfaz
    const contactItem = document.querySelector(`.contact-item[data-id="${contactId}"]`);
    if (contactItem) {
        const preview = contactItem.querySelector('.contact-preview');
        const time = contactItem.querySelector('.time');
        if (preview) preview.textContent = message;
        if (time) time.textContent = getCurrentTime();
    }
}

function simulateResponse(contact) {
    const responses = [
        "Entendido, te responderé en breve.",
        "Gracias por tu mensaje.",
        "¿Necesitas algo más?",
        "Estoy revisando tu consulta.",
        `Hola, soy ${contact.name}. ¿En qué puedo ayudarte?`
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const newMessage = {
        id: Date.now(),
        sender: 'contact',
        content: randomResponse,
        time: getCurrentTime()
    };
    
    // Añadir mensaje a la interfaz
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message received';
        
        messageElement.innerHTML = `
            <div class="message-content">${newMessage.content}</div>
            <div class="message-time">${newMessage.time}</div>
        `;
        
        chatMessages.appendChild(messageElement);
        
        // Scroll al final de los mensajes
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Guardar mensaje en localStorage
        let conversations = JSON.parse(localStorage.getItem('userConversations') || '{}');
        if (!conversations[contact.id]) {
            conversations[contact.id] = [];
        }
        conversations[contact.id].push(newMessage);
        localStorage.setItem('userConversations', JSON.stringify(conversations));
        
        // Actualizar último mensaje en contactos
        updateLastMessage(contact.id, randomResponse);
    }
}

function setupSearchContacts() {
    const searchInput = document.getElementById('contact-search');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = searchInput.value.toLowerCase();
        const contacts = JSON.parse(localStorage.getItem('userContacts') || '[]');
        
        const filteredContacts = contacts.filter(contact => {
            return contact.name.toLowerCase().includes(searchTerm) || 
                   contact.lastMessage.toLowerCase().includes(searchTerm);
        });
        
        displayContacts(filteredContacts);
    });
}