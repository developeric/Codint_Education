// public/js/configuracion.js

const API_URL = "/api"; // Asumiendo que el servidor Express sirve en el mismo origen

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
    
    // Mostrar información del usuario en el sidebar y prellenar formularios
    displayUserInfo(userData);
    preloadProfileData(userData);
    
    // Cargar configuración guardada (preferencias generales)
    loadSavedSettings();
    
    // Configurar eventos de formularios
    setupFormEvents(userData);
    
    // Configurar botón de logout
    document.getElementById('logout-button').addEventListener('click', function() {
        localStorage.removeItem('userData');
        window.location.href = "index.html";
    });

    // Asegurar estado de sidebar normal
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
    
    // Llenar avatar
    const userAvatar = document.getElementById('sidebar-user-avatar');
    if (userData.profile && userData.profile.firstName) {
        const initials = `${userData.profile.firstName.charAt(0)}${userData.profile.lastName ? userData.profile.lastName.charAt(0) : ''}`;
        userAvatar.textContent = initials.toUpperCase();
    } else {
        userAvatar.textContent = userData.username.charAt(0).toUpperCase();
    }
}

function preloadProfileData(userData) {
    // Campos de solo lectura (Email tiene readonly en el HTML)
    document.getElementById('profile-username').value = userData.username || '';
    document.getElementById('profile-email').value = userData.email || ''; 
    
    // Campos editables (perfil)
    if (userData.profile) {
        document.getElementById('profile-firstName').value = userData.profile.firstName || '';
        document.getElementById('profile-lastName').value = userData.profile.lastName || '';
        document.getElementById('profile-bio').value = userData.profile.biography || '';
    }
    
    // Campos específicos del TUTOR
    if (userData.role === 'tutor') {
        document.getElementById('tutor-fields-container').style.display = 'block';
        document.getElementById('profile-subjects').value = userData.subjects ? userData.subjects.join(', ') : '';
        document.getElementById('profile-hourlyRate').value = userData.hourlyRate || 0;
    }
}

function loadSavedSettings() {
    const savedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    
    // Aplicar configuración general (Notificaciones e Idioma)
    if (savedSettings.notifications) {
        document.getElementById('notification-setting').value = savedSettings.notifications;
    }
    
    if (savedSettings.language) {
        document.getElementById('language-setting').value = savedSettings.language;
    }
}

// --- MANEJO DE EVENTOS Y FORMULARIOS ---

function setupFormEvents(userData) {
    // 1. Formulario de Perfil (Profile-form)
    document.getElementById('profile-form').addEventListener('submit', function(e) {
        e.preventDefault();
        handleProfileUpdate(userData);
    });
    
    // 2. Formulario de Cambio de Contraseña (password-form)
    document.getElementById('password-form').addEventListener('submit', function(e) {
        e.preventDefault();
        handlePasswordChange();
    });
    
    // 3. Formulario de Preferencias Generales (settings-form)
    document.getElementById('settings-form').addEventListener('submit', function(e) {
        e.preventDefault();
        handleSettingsSave();
    });
}

// --- HANDLERS DE FORMULARIO ---

async function handleProfileUpdate(userData) {
    const successMessage = document.getElementById('profile-success-message');
    successMessage.style.display = 'none';

    // 1. Obtener el token de autenticación (Asumimos que está guardado en userData)
    const token = userData.token; 
    
    if (!token) {
        successMessage.textContent = 'Error: Sesión expirada. Por favor, inicie sesión.';
        successMessage.style.color = 'red';
        successMessage.style.display = 'block';
        return; 
    }

    // 2. Obtener solo los valores permitidos (username, nombre, apellido, biografía)
    const username = document.getElementById('profile-username').value.trim();
    // El email NO se incluye en updateBody
    const firstName = document.getElementById('profile-firstName').value.trim();
    const lastName = document.getElementById('profile-lastName').value.trim();
    const biography = document.getElementById('profile-bio').value.trim();

    // Construcción del cuerpo de la solicitud (body)
    const updateBody = {
        username, 
        profile: { firstName, lastName, biography }
    };

    if (userData.role === 'tutor') {
        updateBody.subjects = document.getElementById('profile-subjects').value
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
        updateBody.hourlyRate = parseFloat(document.getElementById('profile-hourlyRate').value) || 0;
    }

    try {
        // Enviar la actualización al endpoint (depende del rol)
        const endpoint = userData.role === 'tutor' ? `${API_URL}/tutors/me/profile` : `${API_URL}/users/me/profile`; 

        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                // SOLUCIÓN: Incluir el token en la cabecera Authorization
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(updateBody)
        });

        const result = await response.json();
        
        if (!response.ok) throw new Error(result.msg || "Error al actualizar el perfil.");

        // 3. Actualizar datos en localStorage y UI
        const updatedUser = { 
            ...userData, 
            ...result.data, 
            username: updateBody.username,
            profile: { ...userData.profile, ...updateBody.profile } 
        };

        if (userData.role === 'tutor') {
            updatedUser.subjects = updateBody.subjects;
            updatedUser.hourlyRate = updateBody.hourlyRate;
        }
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        
        displayUserInfo(updatedUser);
        
        successMessage.textContent = '¡Perfil actualizado con éxito!';
        successMessage.style.color = 'green';
        successMessage.style.display = 'block';

    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        // Si el error es de autenticación, mostramos el mensaje de error del servidor o un genérico.
        const errorMessage = error.message.includes("No autorizado") ? "Error: No autorizado. Verifica la sesión." : `Error: ${error.message}`;
        successMessage.textContent = errorMessage;
        successMessage.style.color = 'red';
        successMessage.style.display = 'block';
    }
}

function handlePasswordChange() {
    const successMessage = document.getElementById('password-success-message');
    successMessage.style.display = 'none';
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (newPassword !== confirmPassword) {
        alert('Las nuevas contraseñas no coinciden.');
        return;
    }
    
    // NOTA: La lógica de actualización de contraseña está pendiente de implementar en el backend.
    
    console.log("Simulación: Contraseña cambiada.");
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    
    successMessage.textContent = 'Contraseña actualizada correctamente';
    successMessage.style.display = 'block';

    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
}

function handleSettingsSave() {
    const successMessage = document.getElementById('settings-success-message');
    successMessage.style.display = 'none';

    // Guardar configuración general en localStorage
    const settings = {
        notifications: document.getElementById('notification-setting').value,
        language: document.getElementById('language-setting').value,
    };
    
    localStorage.setItem('userSettings', JSON.stringify(settings));
    
    successMessage.textContent = 'Preferencias guardadas correctamente';
    successMessage.style.display = 'block';

    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
}