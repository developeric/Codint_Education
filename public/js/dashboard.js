// public/js/dashboard.js

const API_URL = "http://localhost:3005/api";

document.addEventListener("DOMContentLoaded", function () {
  console.log("Dashboard cargando...");

  let userData;
  try {
    userData = JSON.parse(localStorage.getItem("userData"));
    console.log("Datos del usuario cargados:", userData);
  } catch (error) {
    console.error("Error al parsear datos del usuario:", error);
    window.location.href = "index.html";
    return;
  }

  if (!userData) {
    console.log("No hay datos de usuario, redirigiendo...");
    window.location.href = "index.html";
    return;
  }

  displayUserInfo(userData);
  setupEventListeners();
  initializeDashboard(); // Llama a la función que usa los minutos guardados

  if (userData.role === "student") {
    console.log("Cargando dashboard de estudiante");
    document.getElementById("student-dashboard").style.display = "block";
    document.getElementById("tutor-dashboard").style.display = "none";
    loadTutorsList();
    loadStudentStats();
  } else if (userData.role === "tutor") {
    console.log("Cargando dashboard de tutor");
    document.getElementById("student-dashboard").style.display = "none";
    document.getElementById("tutor-dashboard").style.display = "block";
    loadTutorProfile();
    loadTutorStats();
  } else {
    console.error("Rol de usuario no reconocido:", userData.role);
  }

  loadRecentActivity();
});

function displayUserInfo(userData) {
  document.getElementById("sidebar-user-name").textContent = userData.username;
  document.getElementById("sidebar-user-role").textContent =
    userData.role === "student" ? "Estudiante" : "Tutor";
  const sidebarAvatarElement = document.getElementById("sidebar-user-avatar");
  sidebarAvatarElement.textContent = userData.username.charAt(0).toUpperCase();
}

function setupEventListeners() {
  document
    .getElementById("logout-button")
    .addEventListener("click", async () => {
      localStorage.removeItem("userData");
      window.location.href = "index.html";
    });

  const mainContent = document.querySelector(".main-content");
  if (mainContent) {
    mainContent.addEventListener("click", function (e) {
      if (e.target.classList.contains("contact-tutor-btn")) {
        const button = e.target;
        const tutorInfo = {
          id: button.dataset.tutorId,
          name: button.dataset.tutorName,
          role: button.dataset.tutorRole,
          avatar: button.dataset.tutorAvatar,
        };
        localStorage.setItem("start_chat_with", JSON.stringify(tutorInfo));
        window.location.href = "mensajes.html";
      }
    });
  }

  const tutorForm = document.getElementById("edit-tutor-profile-form");
  if (tutorForm) {
    tutorForm.addEventListener("submit", updateTutorProfile);
  }
}

function initializeDashboard() {
  animateCounters("courses-count", 0, getRandomNumber(1, 5));
  
  // 🚨 CAMBIO CLAVE: Leer los minutos de estudio guardados
  const totalMinutes = parseInt(localStorage.getItem('totalStudyMinutes') || '0');
  
  // Usamos el total de minutos guardado para el contador de "Horas/Minutos de Estudio"
  animateCounters("hours-count", 0, totalMinutes); 
  
  animateCounters("completed-count", 0, getRandomNumber(5, 20));
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

function loadStudentStats() {}
function loadTutorStats() {}

async function loadTutorsList() {
  const tutorListElement = document.getElementById("tutor-list");
  if (!tutorListElement) return;

  try {
    const response = await fetch(`${API_URL}/tutors`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Error al cargar la lista de tutores");
    }

    const result = await response.json();
    const tutors = result.data;

    if (tutors && tutors.length > 0) {
      tutorListElement.innerHTML = tutors
        .map((tutor) => {
          const tutorName = `${tutor.profile.firstName} ${tutor.profile.lastName}`;
          const avatar = `${tutor.profile.firstName.charAt(0)}${
            tutor.profile.lastName ? tutor.profile.lastName.charAt(0) : ""
          }`.toUpperCase();

          return `
                <div class="tutor-card">
                    <div class="tutor-header">
                        <div class="tutor-avatar">${avatar}</div>
                        <div class="tutor-name">${tutorName}</div>
                        <div class="tutor-subjects">${
                          tutor.subjects?.join(", ") || "No especificadas"
                        }</div>
                    </div>
                    <div class="tutor-body">
                        <div class="tutor-bio">${
                          tutor.profile?.biography || "Sin biografía"
                        }</div>
                        <div class="tutor-rate">$${
                          tutor.hourlyRate || "0"
                        }/hora</div>
                        <div class="tutor-action">
                            <button class="btn btn-primary contact-tutor-btn" 
                                    data-tutor-id="${tutor._id}" 
                                    data-tutor-name="${tutorName}"
                                    data-tutor-avatar="${avatar}"
                                    data-tutor-role="Tutor">Contactar</button>
                            <button class="btn btn-outline">Ver Perfil</button>
                        </div>
                    </div>
                </div>
            `;
        })
        .join("");
    } else {
      tutorListElement.innerHTML =
        "<p>No hay tutores disponibles en este momento.</p>";
    }
  } catch (error) {
    console.error("Error:", error);
    tutorListElement.innerHTML =
      "<p>Error al cargar los tutores. Intenta de nuevo más tarde.</p>";
  }
}

async function loadTutorProfile() {
  // ... (sin cambios)
}

async function updateTutorProfile(e) {
  // ... (sin cambios)
}

function loadRecentActivity() {
  const recentActivityElement = document.getElementById("recent-activity");
  if (!recentActivityElement) return;

  const activities = [
    { text: "Has completado la lección de Álgebra", time: "2 horas atrás" },
    {
      text: "Nueva tarea asignada: Ecuaciones Diferenciales",
      time: "5 horas atrás",
    },
    { text: "Has recibido una calificación: 95/100", time: "1 día atrás" },
  ];

  if (activities.length > 0) {
    recentActivityElement.innerHTML = activities
      .map(
        (activity) => `
            <div class="activity-item">
                <p>${activity.text}</p>
                <small>${activity.time}</small>
            </div>
        `
      )
      .join('<hr style="margin: 10px 0; opacity: 0.1;">');
  }
}