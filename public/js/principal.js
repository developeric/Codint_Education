const API_URL = "http://localhost:3005/api";

document.addEventListener("DOMContentLoaded", () => {
  initializeTutorDashboard();
});

async function initializeTutorDashboard() {
  try {
    // Verificamos quién es el usuario llamando a la ruta /users/me
    const response = await fetch(`${API_URL}/users/me`, { credentials: "include" });
    if (!response.ok) throw new Error('No autorizado');
    
    const result = await response.json();
    const user = result.data;

    // Si el usuario no es un tutor, lo sacamos de aquí
    if (user.role !== 'tutor') {
        window.location.href = "dashboard.html"; // Lo mandamos al dashboard de estudiante
        return;
    }

    // Si es un tutor, poblamos la página con su información
    document.getElementById("welcome-message").textContent = '¡Bienvenido/a!';
    loadTutorProfile(user);
    
    // Agregamos la funcionalidad de ver solicitudes de estudiantes
    loadStudentRequests();

  } catch (error) {
    console.error("Error de inicialización:", error);
    window.location.href = "index.html"; // Si hay cualquier error, al login
  }
}

// Carga los datos del tutor en el formulario de edición
function loadTutorProfile(tutor) {
  document.getElementById("edit-biography").value = tutor.profile.biography || "";
  document.getElementById("edit-subjects").value = tutor.subjects.join(", ");
  document.getElementById("edit-hourlyRate").value = tutor.hourlyRate || 0;
}

// Event listener para el formulario de actualización del perfil
document.getElementById("edit-tutor-profile-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const successMessage = document.getElementById("tutor-success-message");
    successMessage.textContent = "Guardando...";

    const profile = { biography: document.getElementById("edit-biography").value };
    const subjects = document.getElementById("edit-subjects").value.split(",").map((s) => s.trim()).filter(Boolean);
    const hourlyRate = document.getElementById("edit-hourlyRate").value;

    try {
      // Necesitamos una ruta en el backend para actualizar, ej: /api/tutors/me
      const response = await fetch(`${API_URL}/tutors/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ profile, subjects, hourlyRate }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.msg);
      successMessage.textContent = "¡Perfil actualizado con éxito!";
    } catch (error) {
      successMessage.textContent = `Error: ${error.message}`;
      successMessage.style.color = 'red';
    }
});

// NUEVA FUNCIONALIDAD: Cargar solicitudes de estudiantes
async function loadStudentRequests() {
    const requestsContainer = document.getElementById("student-requests-list");
    if (!requestsContainer) return; // Si el elemento no existe, no hacemos nada

    requestsContainer.innerHTML = "<p>Cargando solicitudes...</p>";
    try {
        // Necesitamos una ruta en el backend para ver las solicitudes, ej: /api/tutorias
        const response = await fetch(`${API_URL}/tutorias`, { credentials: 'include' });
        const result = await response.json();

        if (!response.ok) throw new Error(result.msg);
        
        const pendingRequests = result.data.filter(req => req.status === 'pending');

        if (pendingRequests.length === 0) {
            requestsContainer.innerHTML = "<p>No hay solicitudes de estudiantes pendientes.</p>";
            return;
        }

        requestsContainer.innerHTML = pendingRequests.map(req => `
            <div class="request-card">
                <h4>${req.subject}</h4>
                <p><strong>Estudiante:</strong> ${req.student.profile.firstName}</p>
                <p>${req.description}</p>
                <button class="btn-accept" onclick="acceptRequest('${req._id}')">Aceptar Tutoría</button>
            </div>
        `).join('');
    } catch (error) {
        requestsContainer.innerHTML = `<p class="error-message">${error.message || "Error de conexión."}</p>`;
    }
}

// NUEVA FUNCIONALIDAD: Aceptar una solicitud
async function acceptRequest(tutoriaId) {
    try {
        // Necesitamos una ruta en el backend para aceptar, ej: /api/tutorias/:id/accept
        const response = await fetch(`${API_URL}/tutorias/${tutoriaId}/accept`, {
            method: 'PUT',
            credentials: 'include'
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.msg);
        
        alert('¡Tutoría aceptada! El estudiante será notificado.');
        loadStudentRequests(); // Recargamos la lista
    } catch (error) {
        alert(`Error al aceptar la tutoría: ${error.message}`);
    }
}

// Botón de Logout
document.getElementById("logout-button").addEventListener("click", async () => {
  try {
    await fetch(`${API_URL}/logout`, { method: "POST", credentials: "include" });
    localStorage.removeItem('userData');
    window.location.href = "index.html";
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
});
