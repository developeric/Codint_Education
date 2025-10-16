// public/js/dashboard.js

const API_URL = "http://localhost:3005/api";

document.addEventListener('DOMContentLoaded', function() {
    console.log("Dashboard cargando...");
    
    // Cargar datos del usuario desde localStorage
    let userData;
    try {
        userData = JSON.parse(localStorage.getItem('userData'));
        console.log("Datos del usuario cargados:", userData);
    } catch (error) {
        console.error("Error al parsear datos del usuario:", error);
        window.location.href = "index.html";
        return;
    }
    
    if (!userData) {
        // Si no hay datos de usuario, redirigir al login
        console.log("No hay datos de usuario, redirigiendo...");
        window.location.href = "index.html";
        return;
    }
    
    // Mostrar información del usuario
    displayUserInfo(userData);
    
    // Configurar botones y eventos
    setupEventListeners();
    
    // Inicializar componentes del dashboard
    initializeDashboard();
    
    // Cargar datos específicos según el rol
    if (userData.role === 'student') {
        console.log("Cargando dashboard de estudiante");
        document.getElementById('student-dashboard').style.display = 'block';
        document.getElementById('tutor-dashboard').style.display = 'none';
        loadTutorsList();
        loadStudentStats();
    } else if (userData.role === 'tutor') {
        console.log("Cargando dashboard de tutor");
        document.getElementById('student-dashboard').style.display = 'none';
        document.getElementById('tutor-dashboard').style.display = 'block';
        loadTutorProfile();
        loadTutorStats();
    } else {
        console.error("Rol de usuario no reconocido:", userData.role);
    }
    
    // Generar calendario
    generateCalendar();
    
    // Cargar actividad reciente
    loadRecentActivity();
});

function displayUserInfo(userData) {
    // Mostrar nombre de usuario en la barra lateral
    document.getElementById('sidebar-user-name').textContent = userData.username;
    
    // Mostrar rol en la barra lateral
    document.getElementById('sidebar-user-role').textContent = userData.role === 'student' ? 'Estudiante' : 'Tutor';
    
    // Mostrar inicial en el avatar de la barra lateral
    const sidebarAvatarElement = document.getElementById('sidebar-user-avatar');
    sidebarAvatarElement.textContent = userData.username.charAt(0).toUpperCase();
}

function setupEventListeners() {
    // Botón de cerrar sesión
    document.getElementById('logout-button').addEventListener('click', async () => {
        try {
            await fetch(`${API_URL}/logout`, {
                method: "POST",
                credentials: "include",
            });
            // Limpiar localStorage y redirigir al login
            localStorage.removeItem('userData');
            window.location.href = "index.html";
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    });
    
    // Enlaces del menú lateral
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
                // Remover clase active de todos los enlaces
                document.querySelectorAll('.sidebar-menu a').forEach(item => {
                    item.classList.remove('active');
                });
                // Agregar clase active al enlace clickeado
                this.classList.add('active');
            }
        });
    });
    
    // Formulario de edición de perfil de tutor
    const tutorForm = document.getElementById('edit-tutor-profile-form');
    if (tutorForm) {
        tutorForm.addEventListener('submit', updateTutorProfile);
    }
}

function initializeDashboard() {
    // Inicializar contadores con animación
    animateCounters('courses-count', 0, getRandomNumber(1, 5));
    animateCounters('hours-count', 0, getRandomNumber(10, 50));
    animateCounters('completed-count', 0, getRandomNumber(5, 20));
    animateCounters('points-count', 0, getRandomNumber(100, 500));
}

function animateCounters(elementId, start, end) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    let current = start;
    const increment = Math.max(1, Math.floor((end - start) / 30));
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = current;
    }, 30);
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function loadStudentStats() {
    // Esta función cargaría estadísticas reales del estudiante desde el servidor
    // Por ahora usamos datos de ejemplo
}

function loadTutorStats() {
    // Esta función cargaría estadísticas reales del tutor desde el servidor
    // Por ahora usamos datos de ejemplo
}

async function loadTutorsList() {
    const tutorListElement = document.getElementById('tutor-list');
    
    try {
        const response = await fetch(`${API_URL}/tutors`, {
            credentials: "include"
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar la lista de tutores');
        }
        
        const data = await response.json();
        
        if (data.tutors && data.tutors.length > 0) {
            tutorListElement.innerHTML = data.tutors.map(tutor => `
                <div class="tutor-card">
                    <div class="tutor-header">
                        <div class="tutor-avatar">${tutor.username.charAt(0).toUpperCase()}</div>
                        <div class="tutor-name">${tutor.username}</div>
                        <div class="tutor-subjects">${tutor.subjects?.join(', ') || 'No especificadas'}</div>
                    </div>
                    <div class="tutor-body">
                        <div class="tutor-bio">${tutor.profile?.biography || 'Sin biografía'}</div>
                        <div class="tutor-rate">$${tutor.hourlyRate || '25'}/hora</div>
                        <div class="tutor-action">
                            <button class="btn btn-primary">Contactar</button>
                            <button class="btn btn-outline">Ver Perfil</button>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            tutorListElement.innerHTML = '<p>No hay tutores disponibles en este momento.</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        tutorListElement.innerHTML = '<p>Error al cargar los tutores. Intenta de nuevo más tarde.</p>';
    }
}

async function loadTutorProfile() {
    try {
        const response = await fetch(`${API_URL}/tutors/me`, {
            credentials: "include"
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar el perfil');
        }
        
        const data = await response.json();
        const tutor = data.tutor;
        
        // Rellenar el formulario con los datos del tutor
        document.getElementById('edit-biography').value = tutor.profile?.biography || '';
        document.getElementById('edit-subjects').value = tutor.subjects?.join(', ') || '';
        document.getElementById('edit-hourlyRate').value = tutor.hourlyRate || '';
        
    } catch (error) {
        console.error('Error:', error);
    }
}

async function updateTutorProfile(e) {
    e.preventDefault();
    const successMessage = document.getElementById('tutor-success-message');
    successMessage.textContent = '';
    
    const profile = {
        biography: document.getElementById('edit-biography').value
    };
    
    const subjects = document.getElementById('edit-subjects').value
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
        
    const hourlyRate = document.getElementById('edit-hourlyRate').value;
    
    try {
        const response = await fetch(`${API_URL}/tutors/me/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ profile, subjects, hourlyRate })
        });
        
        if (!response.ok) {
            throw new Error('Error al actualizar el perfil');
        }
        
        successMessage.textContent = '¡Perfil actualizado con éxito!';
    } catch (error) {
        console.error('Error:', error);
        successMessage.textContent = 'Error al actualizar el perfil. Intenta de nuevo.';
        successMessage.style.color = 'red';
    }
}

function generateCalendar() {
    const calendarBody = document.getElementById('calendar-body');
    if (!calendarBody) return;
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Obtener el primer día del mes
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    // Ajustar para que la semana comience en lunes (0 = lunes, 6 = domingo)
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    
    // Obtener el número de días en el mes actual
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    let date = 1;
    let calendarHTML = '';
    
    // Crear las filas del calendario
    for (let i = 0; i < 6; i++) {
        // Crear una fila
        let row = '<tr>';
        
        // Crear las celdas de la fila
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < adjustedFirstDay) {
                // Celdas vacías antes del primer día del mes
                row += '<td></td>';
            } else if (date > daysInMonth) {
                // Celdas vacías después del último día del mes
                row += '<td></td>';
            } else {
                // Verificar si es el día actual
                const isToday = date === today.getDate();
                // Verificar si hay un evento (simulado)
                const hasEvent = Math.random() > 0.8;
                
                // Agregar clases según las condiciones
                let classes = [];
                if (isToday) classes.push('today');
                if (hasEvent) classes.push('has-event');
                
                row += `<td class="${classes.join(' ')}">${date}</td>`;
                date++;
            }
        }
        
        row += '</tr>';
        calendarHTML += row;
        
        // Si ya hemos mostrado todos los días del mes, salimos del bucle
        if (date > daysInMonth) {
            break;
        }
    }
    
    calendarBody.innerHTML = calendarHTML;
}

function loadRecentActivity() {
    const recentActivityElement = document.getElementById('recent-activity');
    if (!recentActivityElement) return;
    
    // Actividades de ejemplo
    const activities = [
        { text: 'Has completado la lección de Álgebra', time: '2 horas atrás' },
        { text: 'Nueva tarea asignada: Ecuaciones Diferenciales', time: '5 horas atrás' },
        { text: 'Has recibido una calificación: 95/100', time: '1 día atrás' }
    ];
    
    if (activities.length > 0) {
        recentActivityElement.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <p>${activity.text}</p>
                <small>${activity.time}</small>
            </div>
        `).join('<hr style="margin: 10px 0; opacity: 0.1;">');
    }
}