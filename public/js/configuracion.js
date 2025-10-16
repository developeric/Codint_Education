// public/js/configuracion.js

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
    
    // Cargar configuración guardada
    loadSavedSettings();
    
    // Configurar eventos de formularios
    setupFormEvents();
    
    // Configurar botón de logout
    document.getElementById('logout-button').addEventListener('click', function() {
        localStorage.removeItem('userData');
        window.location.href = "index.html";
    });

    // Descolapsar sidebar al entrar
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
    
    // Prellenar datos del perfil si existen
    if (userData.profile) {
        document.getElementById('profile-name').value = `${userData.profile.firstName || ''} ${userData.profile.lastName || ''}`.trim();
        document.getElementById('profile-bio').value = userData.profile.biography || '';
    }
    document.getElementById('profile-email').value = userData.email || '';
}

function loadSavedSettings() {
    // Cargar configuración guardada desde localStorage
    const savedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    
    // Aplicar configuración si existe
    if (savedSettings.notifications) {
        document.getElementById('notification-setting').value = savedSettings.notifications;
    }
    
    if (savedSettings.language) {
        document.getElementById('language-setting').value = savedSettings.language;
    }
    
    if (savedSettings.privacyProfile !== undefined) {
        document.getElementById('privacy-profile').checked = savedSettings.privacyProfile;
    }
    
    if (savedSettings.privacyStatus !== undefined) {
        document.getElementById('privacy-status').checked = savedSettings.privacyStatus;
    }
}

function setupFormEvents() {
    // Formulario de configuración
    document.getElementById('settings-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Guardar configuración en localStorage
        const settings = {
            notifications: document.getElementById('notification-setting').value,
            language: document.getElementById('language-setting').value,
            privacyProfile: document.getElementById('privacy-profile').checked,
            privacyStatus: document.getElementById('privacy-status').checked
        };
        
        localStorage.setItem('userSettings', JSON.stringify(settings));
        
        // Mostrar mensaje de éxito
        const successMessage = document.getElementById('settings-success-message');
        successMessage.style.display = 'block';
        
        // Ocultar mensaje después de 3 segundos
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 3000);
    });
    
    // Formulario de cambio de contraseña
    document.getElementById('password-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Validar que las contraseñas coincidan
        if (newPassword !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }
        
        // Aquí iría la lógica para cambiar la contraseña en el servidor
        
        // Limpiar campos
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
        
        // Mostrar mensaje de éxito
        const successMessage = document.getElementById('password-success-message');
        successMessage.style.display = 'block';
        
        // Ocultar mensaje después de 3 segundos
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 3000);
    });
    
    // Formulario de perfil
    document.getElementById('profile-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obtener datos actuales del usuario
        const userData = JSON.parse(localStorage.getItem('userData'));
        
        // Actualizar datos del perfil
        const fullName = document.getElementById('profile-name').value.split(' ');
        const firstName = fullName[0] || '';
        const lastName = fullName.slice(1).join(' ') || '';
        
        // Actualizar perfil en userData
        if (!userData.profile) userData.profile = {};
        userData.profile.firstName = firstName;
        userData.profile.lastName = lastName;
        userData.profile.biography = document.getElementById('profile-bio').value; // Usar 'biography'
        
        // Guardar datos actualizados
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Actualizar información mostrada
        displayUserInfo(userData);
        
        // Mostrar mensaje de éxito
        const successMessage = document.getElementById('profile-success-message');
        successMessage.style.display = 'block';
        
        // Ocultar mensaje después de 3 segundos
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 3000);
    });
}