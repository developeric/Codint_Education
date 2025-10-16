// public/js/principal.js

const API_URL = "http://localhost:3005/api";

// --- INICIALIZACIÓN DE LA PÁGINA ---
document.addEventListener("DOMContentLoaded", () => {
  // Al cargar la página, verificamos quién es el usuario
  initializeDashboard();
});

async function initializeDashboard() {
  try {
    // Pedimos al backend el perfil del usuario autenticado
    const response = await fetch(`${API_URL}/users/me`, {
      credentials: "include",
    });

    if (!response.ok) {
      // Si el token no es válido o no existe, redirigimos al login
      window.location.href = "index.html";
      return;
    }

    const result = await response.json();
    const user = result.data;

    // Mostramos el panel correcto según el rol del usuario
    showDashboard(user.role, user);
  } catch (error) {
    console.error("Error de inicialización:", error);
    window.location.href = "index.html"; // Redirigir si hay error
  }
}

function showDashboard(userRole, userData) {
  document.getElementById(
    "welcome-message"
  ).textContent = `Bienvenido, ${userData.profile.firstName}`;

  if (userRole === "student") {
    document.getElementById("student-dashboard").style.display = "block";
    fetchAndDisplayTutors();
  } else if (userRole === "tutor") {
    document.getElementById("tutor-dashboard").style.display = "block";
    loadTutorProfile(userData);
  }
}

// --- FUNCIONALIDADES (movidas desde script.js) ---

// (Aquí van las funciones: fetchAndDisplayTutors, showTutorDetails, closeTutorModal, loadTutorProfile, el listener del formulario de tutor y el listener del botón de logout)
// ... Pega aquí TODO el contenido de las funciones que estaban en el script.js anterior, desde "async function fetchAndDisplayTutors..." hasta el final del listener de "logout-button".
// Te dejo una versión completa para que la copies directamente:

async function fetchAndDisplayTutors() {
  const tutorListContainer = document.getElementById("tutor-list");
  tutorListContainer.innerHTML = "<p>Cargando tutores...</p>";
  try {
    const response = await fetch(`${API_URL}/tutors`, {
      credentials: "include",
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.msg);
    if (!result.data || result.data.length === 0) {
      tutorListContainer.innerHTML = "<p>No hay tutores disponibles.</p>";
      return;
    }
    tutorListContainer.innerHTML = "";
    result.data.forEach((tutor) => {
      const tutorCard = document.createElement("div");
      tutorCard.className = "tutor-card";
      tutorCard.onclick = () => showTutorDetails(tutor._id);
      tutorCard.innerHTML = `<h4>${tutor.profile.firstName} ${
        tutor.profile.lastName
      }</h4><p>Tarifa: <strong>$${
        tutor.hourlyRate || 0
      }/hora</strong></p><div class="tutor-subjects">${tutor.subjects
        .map((s) => `<span class="subject-tag">${s}</span>`)
        .join("")}</div>`;
      tutorListContainer.appendChild(tutorCard);
    });
  } catch (error) {
    tutorListContainer.innerHTML = `<p class="error-message">${
      error.message || "Error de conexión."
    }</p>`;
  }
}

async function showTutorDetails(tutorId) {
  const modal = document.getElementById("tutor-modal");
  const modalBody = document.getElementById("modal-body");
  modalBody.innerHTML = "<p>Cargando perfil...</p>";
  modal.style.display = "flex";
  try {
    const response = await fetch(`${API_URL}/tutors/${tutorId}`, {
      credentials: "include",
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.msg);
    const tutor = result.data;
    modalBody.innerHTML = `<h3>${tutor.profile.firstName} ${
      tutor.profile.lastName
    }</h3><p><strong>Biografía:</strong> ${
      tutor.profile.biography || "No especificada."
    }</p><p><strong>Tarifa:</strong> $${
      tutor.hourlyRate
    }/hora</p><p><strong>Materias:</strong></p><div class="tutor-subjects">${tutor.subjects
      .map((s) => `<span class="subject-tag">${s}</span>`)
      .join("")}</div>`;
  } catch (error) {
    modalBody.innerHTML = `<p class="error-message">${error.message}</p>`;
  }
}

function closeTutorModal() {
  document.getElementById("tutor-modal").style.display = "none";
}

function loadTutorProfile(tutor) {
  document.getElementById("edit-biography").value =
    tutor.profile.biography || "";
  document.getElementById("edit-subjects").value = tutor.subjects.join(", ");
  document.getElementById("edit-hourlyRate").value = tutor.hourlyRate;
}

document
  .getElementById("edit-tutor-profile-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const successMessage = document.getElementById("tutor-success-message");
    const errorMessage = document.getElementById("error-message") || {
      textContent: "",
    }; // Fallback
    successMessage.textContent = "";
    errorMessage.textContent = "";

    const profile = {
      biography: document.getElementById("edit-biography").value,
    };
    const subjects = document
      .getElementById("edit-subjects")
      .value.split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const hourlyRate = document.getElementById("edit-hourlyRate").value;

    try {
      const response = await fetch(`${API_URL}/tutors/me/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ profile, subjects, hourlyRate }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.msg);
      successMessage.textContent = "¡Perfil actualizado con éxito!";
    } catch (error) {
      errorMessage.textContent = error.message;
    }
  });

document.getElementById("logout-button").addEventListener("click", async () => {
  try {
    await fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "index.html"; // Redirigir al login al cerrar sesión
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
});
