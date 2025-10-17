// Dashboard del Tutor - Funcionalidades principales
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar fecha actual
    displayCurrentDate();
    
    // Inicializar gráfico de rendimiento
    initPerformanceChart();
    
    // Cargar datos del usuario
    loadUserData();
    
    // Cargar mensajes pendientes
    loadPendingMessages();
    
    // Cargar estudiantes y horarios
    loadStudentsSchedule();
    
    // Inicializar eventos
    initEvents();
});

// Mostrar fecha actual en formato legible
function displayCurrentDate() {
    const currentDateElement = document.getElementById('current-date');
    if (currentDateElement) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const today = new Date();
        currentDateElement.textContent = today.toLocaleDateString('es-ES', options);
    }
}

// Inicializar gráfico de rendimiento de estudiantes
function initPerformanceChart() {
    const ctx = document.getElementById('performance-chart');
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
                datasets: [{
                    label: 'Progreso promedio de estudiantes',
                    data: [65, 70, 75, 72, 78, 82],
                    borderColor: '#4361ee',
                    tension: 0.3,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Progreso de Estudiantes'
                    }
                }
            }
        });
    }
}

// Cargar datos del usuario (tutor)
function loadUserData() {
    // Simulación de carga de datos del usuario desde el servidor
    const userData = {
        name: 'Profesor García',
        subject: 'Matemáticas',
        students: 12,
        scheduledSessions: 8,
        hoursCompleted: 24,
        rating: 4.8
    };
    
    // Actualizar elementos en la interfaz con los datos del usuario
    document.querySelector('.profile span').textContent = userData.name;
    
    // Actualizar estadísticas
    const statElements = document.querySelectorAll('.stat-info h3');
    if (statElements.length >= 4) {
        statElements[0].textContent = userData.students;
        statElements[1].textContent = userData.scheduledSessions;
        statElements[2].textContent = userData.hoursCompleted + 'h';
        statElements[3].textContent = userData.rating;
    }
}

// Cargar mensajes pendientes de estudiantes
function loadPendingMessages() {
    // Simulación de carga de mensajes desde el servidor
    const pendingMessages = [
        {
            id: 1,
            studentName: 'Ana Martínez',
            subject: 'Matemáticas',
            topic: 'Ecuaciones diferenciales',
            message: 'Profesor, tengo dudas sobre el ejercicio 3 de ecuaciones diferenciales.',
            date: '2023-06-15T10:30:00',
            read: false
        },
        {
            id: 2,
            studentName: 'Carlos López',
            subject: 'Matemáticas',
            topic: 'Álgebra lineal',
            message: 'Necesito ayuda con los ejercicios de matrices para el examen del viernes.',
            date: '2023-06-14T15:45:00',
            read: false
        }
    ];
    
    // Mostrar mensajes en la sección de mensajes recientes
    const messagesContainer = document.querySelector('.recent-messages .card-content');
    if (messagesContainer) {
        messagesContainer.innerHTML = '';
        
        if (pendingMessages.length === 0) {
            messagesContainer.innerHTML = '<p class="no-messages">No hay mensajes pendientes</p>';
            return;
        }
        
        pendingMessages.forEach(msg => {
            const messageElement = document.createElement('div');
            messageElement.className = 'message-item' + (msg.read ? '' : ' unread');
            messageElement.dataset.id = msg.id;
            
            const date = new Date(msg.date);
            const formattedDate = date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit'
            });
            
            messageElement.innerHTML = `
                <div class="message-sender">
                    <img src="../public/assets/profile-placeholder.jpg" alt="${msg.studentName}" onerror="this.src='https://via.placeholder.com/40'">
                    <div>
                        <h4>${msg.studentName}</h4>
                        <p><strong>${msg.subject}:</strong> ${msg.topic}</p>
                    </div>
                </div>
                <div class="message-preview">
                    <p>${msg.message.substring(0, 60)}${msg.message.length > 60 ? '...' : ''}</p>
                    <span class="message-date">${formattedDate}</span>
                </div>
            `;
            
            // Agregar evento para abrir el mensaje
            messageElement.addEventListener('click', () => openMessage(msg));
            
            messagesContainer.appendChild(messageElement);
        });
        
        // Actualizar contador de mensajes no leídos
        updateUnreadMessageCount(pendingMessages.filter(msg => !msg.read).length);
    }
}

// Actualizar contador de mensajes no leídos
function updateUnreadMessageCount(count) {
    const badge = document.querySelector('.notifications .badge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'block' : 'none';
    }
}

// Abrir mensaje y mostrar diálogo para responder
function openMessage(message) {
    // Crear modal para mostrar el mensaje completo y responder
    const modal = document.createElement('div');
    modal.className = 'message-modal';
    
    modal.innerHTML = `
        <div class="message-modal-content">
            <div class="message-modal-header">
                <h3>Mensaje de ${message.studentName}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="message-modal-body">
                <div class="message-details">
                    <p><strong>Estudiante:</strong> ${message.studentName}</p>
                    <p><strong>Asignatura:</strong> ${message.subject}</p>
                    <p><strong>Tema:</strong> ${message.topic}</p>
                    <p><strong>Fecha:</strong> ${new Date(message.date).toLocaleString('es-ES')}</p>
                </div>
                <div class="message-content">
                    <p>${message.message}</p>
                </div>
                <div class="message-reply">
                    <h4>Tu respuesta:</h4>
                    <textarea placeholder="Escribe tu respuesta aquí..."></textarea>
                    <button class="send-reply">Enviar respuesta</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Marcar mensaje como leído
    markMessageAsRead(message.id);
    
    // Eventos del modal
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('.send-reply').addEventListener('click', () => {
        const replyText = modal.querySelector('textarea').value.trim();
        if (replyText) {
            sendReply(message.id, replyText);
            document.body.removeChild(modal);
        }
    });
}

// Marcar mensaje como leído
function markMessageAsRead(messageId) {
    // Simulación de actualización en el servidor
    console.log(`Mensaje ${messageId} marcado como leído`);
    
    // Actualizar UI
    const messageElement = document.querySelector(`.message-item[data-id="${messageId}"]`);
    if (messageElement) {
        messageElement.classList.remove('unread');
    }
    
    // Actualizar contador de mensajes no leídos
    const unreadCount = document.querySelectorAll('.message-item.unread').length;
    updateUnreadMessageCount(unreadCount);
}

// Enviar respuesta a un mensaje
function sendReply(messageId, replyText) {
    // Simulación de envío al servidor
    console.log(`Respuesta al mensaje ${messageId} enviada: ${replyText}`);
    
    // Mostrar notificación de éxito
    showNotification('Respuesta enviada con éxito');
}

// Cargar estudiantes y sus horarios
function loadStudentsSchedule() {
    // Simulación de carga de datos de estudiantes desde el servidor
    const studentsData = [
        {
            id: 1,
            name: 'Ana Martínez',
            subject: 'Matemáticas',
            topic: 'Ecuaciones diferenciales',
            schedule: 'Lunes y Miércoles, 15:00 - 16:30',
            progress: 75
        },
        {
            id: 2,
            name: 'Carlos López',
            subject: 'Matemáticas',
            topic: 'Álgebra lineal',
            schedule: 'Martes y Jueves, 17:00 - 18:30',
            progress: 60
        }
    ];
    
    // Mostrar estudiantes en la sección de estudiantes
    const studentsContainer = document.querySelector('.student-progress .card-content');
    if (studentsContainer) {
        studentsContainer.innerHTML = '';
        
        if (studentsData.length === 0) {
            studentsContainer.innerHTML = '<p class="no-students">No hay estudiantes asignados</p>';
            return;
        }
        
        studentsData.forEach(student => {
            const studentElement = document.createElement('div');
            studentElement.className = 'student-item';
            
            studentElement.innerHTML = `
                <div class="student-info">
                    <img src="../public/assets/profile-placeholder.jpg" alt="${student.name}" onerror="this.src='https://via.placeholder.com/40'">
                    <div>
                        <h4>${student.name}</h4>
                        <p><strong>${student.subject}:</strong> ${student.topic}</p>
                        <p class="schedule"><i class="fas fa-clock"></i> ${student.schedule}</p>
                    </div>
                </div>
                <div class="student-progress-bar">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${student.progress}%"></div>
                    </div>
                    <span>${student.progress}%</span>
                </div>
            `;
            
            studentsContainer.appendChild(studentElement);
        });
    }
}

// Mostrar notificación
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Eliminar notificación después de 3 segundos
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}