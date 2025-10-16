// public/js/script.js

// La URL de tu backend
const API_URL = "http://localhost:3005/api";

// --- FUNCIONES DE RENDERIZADO ---

function showDashboard(userRole) {
  document.getElementById("auth-container").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  document.getElementById(
    "welcome-message"
  ).textContent = `Bienvenido, ${userRole}`;

  if (userRole === "student") {
    document.getElementById("student-dashboard").style.display = "block";
    document.getElementById("tutor-dashboard").style.display = "none";
    fetchAndDisplayTutors();
  } else if (userRole === "tutor") {
    document.getElementById("student-dashboard").style.display = "none";
    document.getElementById("tutor-dashboard").style.display = "block";
    // Aquí podrías cargar datos específicos para el tutor en el futuro
  }
}

// En public/js/script.js

async function fetchAndDisplayTutors() {
  const tutorListContainer = document.getElementById("tutor-list");
  tutorListContainer.innerHTML = "<p>Cargando tutores...</p>";

  try {
    // 👇 LA CORRECCIÓN CLAVE ESTÁ AQUÍ 👇
    const response = await fetch(`${API_URL}/tutors`, {
      method: "GET", // Aunque es el default, ser explícito ayuda
      credentials: "include", // 👈 Esto le dice al navegador que envíe las cookies
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      // El mensaje de error ahora será "No autorizado: No hay token"
      tutorListContainer.innerHTML = `<p class="error-message">${
        result.msg || "No se pudieron cargar los tutores."
      }</p>`;
      return;
    }

    if (!result.data || result.data.length === 0) {
      tutorListContainer.innerHTML =
        "<p>No hay tutores disponibles en este momento.</p>";
      return;
    }

    tutorListContainer.innerHTML = ""; // Limpiar el contenedor
    result.data.forEach((tutor) => {
      const tutorCard = document.createElement("div");
      tutorCard.className = "tutor-card";
      tutorCard.innerHTML = `
        <h4>${tutor.profile.firstName} ${tutor.profile.lastName}</h4>
        <p>Tarifa: <strong>$${tutor.hourlyRate || 0}/hora</strong></p>
        <div class="tutor-subjects">
          ${tutor.subjects
            .map((subject) => `<span class="subject-tag">${subject}</span>`)
            .join("")}
        </div>
      `;
      tutorListContainer.appendChild(tutorCard);
    });
  } catch (error) {
    tutorListContainer.innerHTML =
      '<p class="error-message">Error de conexión al buscar tutores.</p>';
  }
}

// --- LÓGICA DE AUTENTICACIÓN ---

function openTab(evt, tabName) {
  const tabContents = document.getElementsByClassName("tab-content");
  for (let i = 0; i < tabContents.length; i++) {
    tabContents[i].style.display = "none";
  }
  const tabLinks = document.getElementsByClassName("tab-link");
  for (let i = 0; i < tabLinks.length; i++) {
    tabLinks[i].className = tabLinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

function toggleTutorFields() {
  const role = document.querySelector(
    'input[name="register-role"]:checked'
  ).value;
  const tutorFields = document.getElementById("tutor-fields");
  tutorFields.style.display = role === "tutor" ? "block" : "none";
}

// --- Lógica de Login ---
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;
  const role = document.querySelector('input[name="login-role"]:checked').value;
  const errorMessage = document.getElementById("error-message");
  errorMessage.textContent = "";

  try {
    const response = await fetch(`${API_URL}/login/${role}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (response.ok) {
      showDashboard(role);
    } else {
      // ✨ MEJORA CLAVE: Muestra el error específico de la validación
      const firstError = data.errors
        ? Object.values(data.errors)[0].msg
        : data.msg;
      errorMessage.textContent = firstError || "Credenciales incorrectas.";
    }
  } catch (error) {
    errorMessage.textContent = "Error de conexión con el servidor.";
  }
});

// --- Lógica de Registro ---
document
  .getElementById("register-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("register-username").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const firstName = document.getElementById("register-firstName").value;
    const lastName = document.getElementById("register-lastName").value;
    const role = document.querySelector(
      'input[name="register-role"]:checked'
    ).value;
    const errorMessage = document.getElementById("error-message");
    errorMessage.textContent = "";

    const body = {
      username,
      email,
      password,
      profile: { firstName, lastName },
      role,
    };

    if (role === "tutor") {
      // ✨ LÓGICA CLAVE: Limpiamos los datos antes de enviar
      // 1. Separa por comas, quita espacios y filtra cualquier valor vacío.
      const subjects = document
        .getElementById("register-subjects")
        .value.split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const hourlyRate = document.getElementById("register-hourlyRate").value;

      body.subjects = subjects;
      // 2. Solo incluye la tarifa si se ha introducido un valor.
      if (hourlyRate) {
        body.hourlyRate = hourlyRate;
      }
    }

    try {
      const response = await fetch(`${API_URL}/register/${role}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (response.ok) {
        showDashboard(role);
      } else {
        // ✨ MEJORA CLAVE: Muestra el error específico de la validación
        const firstError = data.errors
          ? Object.values(data.errors)[0].msg
          : data.msg;
        errorMessage.textContent = firstError || "Error al registrarse.";
      }
    } catch (error) {
      errorMessage.textContent = "Error de conexión con el servidor.";
    }
  });

// --- Lógica de Logout ---
document.getElementById("logout-button").addEventListener("click", async () => {
  try {
    await fetch(`${API_URL}/logout`, { method: "POST" });
    window.location.reload();
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
});
