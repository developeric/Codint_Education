// public/tutor/js/estudiantes.js
const API_URL = "http://localhost:3005/api";

document.addEventListener('DOMContentLoaded', () => {
    // Verificar si el usuario está logueado y es tutor
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData || userData.role !== 'tutor') {
        // Si no es tutor, redirigir al login
        window.location.href = '../index.html';
        return;
    }

    // Cargar nombre del tutor en la barra superior
    document.getElementById('tutor-name').textContent = `Tutor ${userData.username}`;

    // Cargar la lista de estudiantes
    loadStudents();

    // Configurar la barra de búsqueda
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        filterStudents(e.target.value);
    });
});

// Función para cargar los estudiantes desde el backend
async function loadStudents() {
    const container = document.getElementById('students-grid-container');
    container.innerHTML = '<p>Cargando estudiantes...</p>';

    try {
        const response = await fetch(`${API_URL}/tutors/students`, {
            credentials: 'include' // Importante para enviar cookies
        });

        if (!response.ok) {
            throw new Error('No se pudo obtener la lista de estudiantes.');
        }

        const result = await response.json();
        displayStudents(result.data);

    } catch (error) {
        container.innerHTML = `<p style="color: red;">${error.message}</p>`;
    }
}

// Función para mostrar los estudiantes en la interfaz
function displayStudents(students) {
    const container = document.getElementById('students-grid-container');
    container.innerHTML = ''; // Limpiar el contenedor

    if (students.length === 0) {
        container.innerHTML = '<p>No tienes estudiantes asignados.</p>';
        return;
    }

    students.forEach(student => {
        const studentCard = document.createElement('div');
        studentCard.className = 'student-card';
        // Añadimos un data-attribute para facilitar la búsqueda
        studentCard.dataset.name = `${student.profile.firstName} ${student.profile.lastName}`.toLowerCase();

        // Creamos el avatar con las iniciales
        const initials = (student.profile.firstName.charAt(0) + student.profile.lastName.charAt(0)).toUpperCase();

        studentCard.innerHTML = `
            <div class="student-header">
                <div class="student-avatar">${initials}</div>
                <div class="student-name">
                    <h3>${student.profile.firstName} ${student.profile.lastName}</h3>
                    <p>@${student.username}</p>
                </div>
            </div>
            <div class="student-details">
                <div class="detail-item">
                    <i class="fas fa-book-open"></i>
                    <span><strong>Materia Actual:</strong> Cálculo Integral</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-bullseye"></i>
                    <span><strong>Tema Específico:</strong> Integrales Definidas</span>
                </div>
            </div>
            <div class="student-actions">
                <button class="btn-primary"><i class="fas fa-chart-line"></i> Ver Progreso</button>
                <button class="btn-secondary"><i class="fas fa-comment"></i> Enviar Mensaje</button>
            </div>
        `;
        container.appendChild(studentCard);
    });
}

// Función para filtrar estudiantes en tiempo real
function filterStudents(searchTerm) {
    const term = searchTerm.toLowerCase();
    const allStudents = document.querySelectorAll('.student-card');

    allStudents.forEach(card => {
        const studentName = card.dataset.name;
        if (studentName.includes(term)) {
            card.style.display = 'flex'; // Mostrar tarjeta
        } else {
            card.style.display = 'none'; // Ocultar tarjeta
        }
    });
}