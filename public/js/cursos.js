// public/js/cursos.js

const API_URL = "/api";

document.addEventListener('DOMContentLoaded', function() {
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
    
    displayUserInfo(userData);
    
    // Cargar solo los cursos asociados a contactos con los que ya se ha interactuado
    loadActiveCourses(); 
    
    setupSearchAndFilter();
    
    document.getElementById('logout-button').addEventListener('click', function() {
        fetch('/api/logout', { method: "POST", credentials: "include" })
            .finally(() => {
                localStorage.removeItem('userData');
                window.location.href = "index.html";
            });
    });

    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    sidebar.classList.remove('collapsed');
    mainContent.classList.remove('expanded');
});

// --- FUNCIONES DE UTILIDAD ---

function displayUserInfo(userData) {
    const roleText = userData.role === 'student' ? 'Estudiante' : (userData.role === 'tutor' ? 'Tutor' : 'Admin');
    
    document.getElementById('sidebar-user-name').textContent = userData.username || 'Usuario';
    document.getElementById('sidebar-user-role').textContent = roleText;
    
    const userAvatar = document.getElementById('sidebar-user-avatar');
    if (userData.profile && userData.profile.firstName) {
        const initials = `${userData.profile.firstName.charAt(0)}${userData.profile.lastName ? userData.profile.lastName.charAt(0) : ''}`;
        userAvatar.textContent = initials.toUpperCase();
    } else {
        userAvatar.textContent = userData.username.charAt(0).toUpperCase();
    }
}

function getStatusText(status) {
    switch(status) {
        case 'in-progress': return 'Clase Activa';
        case 'completed': return 'Clase Finalizada';
        case 'not-started': return 'Pendiente de inicio';
        default: return 'Desconocido';
    }
}

// --- LÓGICA DE CARGA Y FILTRADO ---

async function loadActiveCourses() {
    const courseContainer = document.getElementById('course-container');
    courseContainer.innerHTML = '<p class="text-center">Cargando tus clases...</p>';

    // 1. OBTENER CONTACTOS REALES DESDE LOCALSTORAGE
    const activeContacts = getActiveContactsFromStorage(); 
    
    if (activeContacts.length === 0) {
        courseContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <h3 style="color: #4361ee;">¡Parece que no tienes clases activas!</h3>
                <p style="color: #6c757d;">
                    Visita el <a href="dashboard.html" style="color: #4cc9f0; font-weight: bold;">Dashboard</a> para encontrar y contactar nuevos tutores.
                </p>
            </div>
        `;
        return;
    }

    // 2. Mapear los contactos reales a la estructura de la tarjeta de clase
    const activeCourses = activeContacts.map(contact => ({
        id: contact.id,
        title: `Clase con ${contact.name}`, 
        tutor: contact.name,
        progress: contact.progress || Math.floor(Math.random() * 80) + 20, 
        status: 'in-progress',
        image: contact.image || 'https://via.placeholder.com/300x160/4361ee/ffffff?text=Clase+Activa', 
        tutorId: contact.tutorId 
    }));

    displayCourses(activeCourses);
}

// FUNCIÓN CLAVE: Lee los contactos del chat
function getActiveContactsFromStorage() {
    const storedContacts = localStorage.getItem('userContacts');
    if (!storedContacts) return [];
    
    try {
        const contacts = JSON.parse(storedContacts);
        // Filtramos solo los que son tutores o usuarios reales (no de 'Sistema')
        return contacts.filter(c => c.role !== 'Sistema'); 
    } catch (e) {
        console.error("Error al parsear contactos del localStorage:", e);
        return [];
    }
}

function displayCourses(courses) {
    const courseContainer = document.getElementById('course-container');
    courseContainer.innerHTML = '';
    
    courses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        courseCard.dataset.status = course.status;
        
        courseCard.innerHTML = `
            <div class="course-image" style="background-image: url('${course.image}')"></div>
            <div class="course-content">
                <h3 class="course-title">${course.title}</h3>
                <div class="course-info">
                    <span><i class="fas fa-user-tie"></i> ${course.tutor}</span>
                </div>
                <div class="course-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${course.progress}%"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                        <small>${getStatusText(course.status)}</small>
                        <small>${course.progress}% completado</small>
                    </div>
                </div>
                <div class="course-actions">
                    <a href="mensajes.html?contact=${encodeURIComponent(course.tutor)}" class="btn btn-primary">
                       <i class="fas fa-comment"></i> Continuar Chat
                    </a>
                </div>
            </div>
        `;
        
        courseContainer.appendChild(courseCard);
    });
}

function setupSearchAndFilter() {
    const searchInput = document.getElementById('course-search');
    const filterSelect = document.getElementById('course-filter');
    
    function filterCourses() {
        const searchTerm = searchInput.value.toLowerCase();
        const filterValue = filterSelect.value;
        
        const contacts = getActiveContactsFromStorage();

        const courses = contacts.map(contact => ({
            id: contact.id,
            title: `Clase con ${contact.name}`,
            tutor: contact.name,
            progress: contact.progress || 50, 
            status: 'in-progress', 
            image: contact.image || 'https://via.placeholder.com/300x160/4361ee/ffffff?text=Clase+Activa',
        }));
        
        const filteredCourses = courses.filter(course => {
            const matchesSearch = course.title.toLowerCase().includes(searchTerm) || 
                                 course.tutor.toLowerCase().includes(searchTerm);
            
            const matchesFilter = filterValue === 'all' || course.status === filterValue;
            
            return matchesSearch && matchesFilter;
        });
        
        displayCourses(filteredCourses);
    }
    
    searchInput.addEventListener('input', filterCourses);
    filterSelect.addEventListener('change', filterCourses);
}