// public/js/script.js

const API_URL = "http://localhost:3005/api";

function openTab(evt, tabName) {
  document
    .querySelectorAll(".tab-content")
    .forEach((tab) => (tab.style.display = "none"));
  document
    .querySelectorAll(".tab-link")
    .forEach((link) => link.classList.remove("active"));
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.classList.add("active");
}

function toggleTutorFields() {
  const role = document.querySelector(
    'input[name="register-role"]:checked'
  ).value;
  document.getElementById("tutor-fields").style.display =
    role === "tutor" ? "block" : "none";
}

// --- Lógica de Login (Corregida) ---
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
      // Guardar datos del usuario en localStorage para usarlos en dashboard
      localStorage.setItem('userData', JSON.stringify(data.data));
      window.location.href = "dashboard.html";
    } else {
      const firstError = data.errors
        ? Object.values(data.errors)[0].msg
        : data.msg;
      errorMessage.textContent = firstError || "Credenciales incorrectas.";
    }
  } catch (error) {
    errorMessage.textContent = "Error de conexión con el servidor.";
  }
});

// --- Lógica de Registro (Corregida) ---
document
  .getElementById("register-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorMessage = document.getElementById("error-message");
    errorMessage.textContent = "";

    // Construimos el cuerpo de la solicitud manualmente
    const body = {
      username: document.getElementById("register-username").value,
      email: document.getElementById("register-email").value,
      password: document.getElementById("register-password").value,
      role: document.querySelector('input[name="register-role"]:checked').value,
      profile: {
        firstName: document.getElementById("register-firstName").value,
        lastName: document.getElementById("register-lastName").value,
      },
    };

    if (body.role === "tutor") {
      body.subjects = document
        .getElementById("register-subjects")
        .value.split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const hourlyRate = document.getElementById("register-hourlyRate").value;
      if (hourlyRate) {
        body.hourlyRate = parseFloat(hourlyRate);
      }
    }

    try {
      console.log("Enviando datos de registro:", body);
      const response = await fetch(`${API_URL}/register/${body.role}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include" // Importante para manejar cookies
      });
      
      console.log("Respuesta del servidor:", response);
      const data = await response.json();
      console.log("Datos recibidos:", data);
      
      if (response.ok) {
        // Guardar datos del usuario en localStorage para usarlos en dashboard
        localStorage.setItem('userData', JSON.stringify(data.data));
        window.location.href = "dashboard.html";
      } else {
        const firstError = data.errors
          ? Object.values(data.errors)[0].msg
          : data.msg;
        errorMessage.textContent = firstError || "Error en el registro.";
      }
    } catch (error) {
      errorMessage.textContent = "Error de conexión con el servidor.";
    }
  });