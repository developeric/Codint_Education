// public/js/dashboard.js

const API_URL = "http://localhost:3005/api";

document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos del usuario desde localStorage
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    if (!userData) {
        // Si no hay datos de usuario, redirigir al login
        window.location.href = "index.html";
        return;
    }
    
    // Mostrar información del usuario
    displayUserInfo(userData);
    
    // Configurar botones y eventos
    setupEventListeners();
    
    // Cargar datos específicos según el rol
    if (userData.role === 'student') {
        document.getElementById('student-dashboard').style.display = 'block';
        loadTutorsList();
    } else if (userData.role === 'tutor') {
        document.getElementById('tutor-dashboard').style.display = 'block';
        loadTutorProfile();
    }
});

function displayUserInfo(userData) {
    // Mostrar nombre de usuario
    document.getElementById('user-name').textContent = userData.username;
    
    // Mostrar inicial en el avatar
    const avatarElement = document.getElementById('user-avatar');
    avatarElement.textContent = userData.username.charAt(0).toUpperCase();
    
    // Mostrar rol con clase CSS adecuada
    const roleElement = document.getElementById('user-role');
    roleElement.textContent = userData.role === 'student' ? 'Estudiante' : 'Tutor';
    roleElement.className = `role-badge role-${userData.role}`;
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
    
    // Botón para ir a la página principal
    document.getElementById('go-to-principal').addEventListener('click', () => {
        window.location.href = "principal.html";
    });
    
    // Formulario de edición de perfil de tutor
    const tutorForm = document.getElementById('edit-tutor-profile-form');
    if (tutorForm) {
        tutorForm.addEventListener('submit', updateTutorProfile);
    }
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
                    <h4>${tutor.username}</h4>
                    <p>${tutor.profile?.biography || 'Sin biografía'}</p>
                    <p><strong>Materias:</strong> ${tutor.subjects?.join(', ') || 'No especificadas'}</p>
                    <p><strong>Tarifa:</strong> $${tutor.hourlyRate || 'No especificada'}/hora</p>
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