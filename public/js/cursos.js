// public/js/cursos.js

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
    
    // Cargar cursos
    loadCourses();
    
    // Configurar eventos de búsqueda y filtrado
    setupSearchAndFilter();
    
    // Configurar botón de logout
    document.getElementById('logout-button').addEventListener('click', function() {
        localStorage.removeItem('userData');
        window.location.href = "index.html";
    });

    // Descolapsar sidebar al entrar (asegura el estado normal)
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    sidebar.classList.remove('collapsed');
    mainContent.classList.remove('expanded');
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

function loadCourses() {
    // Cargar cursos guardados desde localStorage o usar cursos de ejemplo
    let courses = JSON.parse(localStorage.getItem('userCourses') || '[]');
    
    // Si no hay cursos guardados, usar cursos de ejemplo
    if (courses.length === 0) {
        courses = [
            {
                id: 1,
                title: 'Introducción a la Programación',
                tutor: 'María González',
                duration: '8 semanas',
                progress: 75,
                image: 'https://via.placeholder.com/300x160/4361ee/ffffff?text=Programación',
                status: 'in-progress'
            },
            {
                id: 2,
                title: 'Matemáticas Avanzadas',
                tutor: 'Carlos Rodríguez',
                duration: '12 semanas',
                progress: 100,
                image: 'https://via.placeholder.com/300x160/3a0ca3/ffffff?text=Matemáticas',
                status: 'completed'
            },
            {
                id: 3,
                title: 'Física Cuántica',
                tutor: 'Ana Martínez',
                duration: '10 semanas',
                progress: 0,
                image: 'https://via.placeholder.com/300x160/4cc9f0/ffffff?text=Física',
                status: 'not-started'
            },
            {
                id: 4,
                title: 'Desarrollo Web Frontend',
                tutor: 'Pedro Sánchez',
                duration: '6 semanas',
                progress: 30,
                image: 'https://via.placeholder.com/300x160/f72585/ffffff?text=Web+Frontend',
                status: 'in-progress'
            }
        ];
        
        // Guardar cursos de ejemplo en localStorage
        localStorage.setItem('userCourses', JSON.stringify(courses));
    }
    
    // Mostrar cursos en la interfaz
    displayCourses(courses);
}

function displayCourses(courses) {
    const courseContainer = document.getElementById('course-container');
    courseContainer.innerHTML = '';
    
    if (courses.length === 0) {
        courseContainer.innerHTML = '<p class="text-center">No se encontraron cursos.</p>';
        return;
    }
    
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
                    <span><i class="fas fa-clock"></i> ${course.duration}</span>
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
                    <a href="#" class="btn btn-primary">Continuar</a>
                    <a href="#" class="btn btn-outline">Detalles</a>
                </div>
            </div>
        `;
        
        courseContainer.appendChild(courseCard);
    });
}

function getStatusText(status) {
    switch(status) {
        case 'in-progress': return 'En progreso';
        case 'completed': return 'Completado';
        case 'not-started': return 'No iniciado';
        default: return 'Desconocido';
    }
}

function setupSearchAndFilter() {
    const searchInput = document.getElementById('course-search');
    const filterSelect = document.getElementById('course-filter');
    
    // Función para filtrar cursos
    function filterCourses() {
        const searchTerm = searchInput.value.toLowerCase();
        const filterValue = filterSelect.value;
        
        const courses = JSON.parse(localStorage.getItem('userCourses') || '[]');
        
        const filteredCourses = courses.filter(course => {
            const matchesSearch = course.title.toLowerCase().includes(searchTerm) || 
                                 course.tutor.toLowerCase().includes(searchTerm);
            
            const matchesFilter = filterValue === 'all' || course.status === filterValue;
            
            return matchesSearch && matchesFilter;
        });
        
        displayCourses(filteredCourses);
    }
    
    // Configurar eventos
    searchInput.addEventListener('input', filterCourses);
    filterSelect.addEventListener('change', filterCourses);
}