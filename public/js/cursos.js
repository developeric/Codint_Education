// public/js/cursos.js

const API_URL = "http://localhost:3005/api";

document.addEventListener("DOMContentLoaded", function () {
  // Cargar datos del usuario desde localStorage
  let userData;
  try {
    userData = JSON.parse(localStorage.getItem("userData"));
  } catch (error) {
    console.error("Error parseando userData:", error);
    window.location.href = "index.html";
    return;
  }

  if (!userData) {
    window.location.href = "index.html";
    return;
  }

  // Mostrar info del sidebar
  displayUserInfo(userData);

  // Mostrar secciones según rol
  if (userData.role === "tutor") {
    document.getElementById("tutor-classes-section").style.display = "block";
    document.getElementById("student-courses-section").style.display = "none";
    // Cargar funciones de tutor
    loadTutorClasses();
    setupTutorClassForm();
  } else {
    document.getElementById("student-courses-section").style.display = "block";
    document.getElementById("tutor-classes-section").style.display = "none";
    // Cargar lista para estudiantes (si existe)
    loadCourses();
  }

  // Logout
  document
    .getElementById("logout-button")
    .addEventListener("click", function () {
      localStorage.removeItem("userData");
      window.location.href = "index.html";
    });
});

// Muestra la información básica del usuario en el sidebar
function displayUserInfo(userData) {
  document.getElementById("sidebar-user-name").textContent =
    userData.username || "Usuario";
  document.getElementById("sidebar-user-role").textContent =
    userData.role === "tutor" ? "Tutor" : "Estudiante";
  const avatar = document.getElementById("sidebar-user-avatar");
  avatar.textContent = userData.username
    ? userData.username.charAt(0).toUpperCase()
    : "U";
}

// --- Funciones para estudiantes (si aplica) ---
// Modificar displayCourses para usar datos desde API y mostrar botón Unirse si aplica
async function loadCourses() {
  // Si es estudiante, pedir todas las clases y las inscritas para marcar el estado
  try {
    const [allRes, joinedRes] = await Promise.all([
      fetch(`${API_URL}/cursos`, { credentials: "include" }),
      fetch(`${API_URL}/cursos/inscritas`, { credentials: "include" }),
    ]);

    if (!allRes.ok) throw new Error("Error cargando clases");
    const allData = await allRes.json();
    const allCourses = allData.data || [];

    let joinedIds = [];
    if (joinedRes.ok) {
      const joinedData = await joinedRes.json();
      joinedIds = (joinedData.data || []).map((c) => c._id);
    }

    // transformar para usar la UI existente (añadir propiedad 'joined')
    const coursesForDisplay = allCourses.map((c) => ({
      ...c,
      joined: joinedIds.includes(c._id),
    }));
    displayCourses(coursesForDisplay);
  } catch (err) {
    console.error("loadCourses error:", err);
    // fallback a localStorage si lo prefieres (mantén tu comportamiento previo)
    // ...existing fallback...
  }
}

// Actualiza displayCourses para mostrar botón Unirse cuando user es student
function displayCourses(courses) {
  const courseContainer = document.getElementById("course-container");
  courseContainer.innerHTML = "";

  if (courses.length === 0) {
    courseContainer.innerHTML =
      '<p class="text-center">No se encontraron cursos.</p>';
    return;
  }

  courses.forEach((course) => {
    const courseCard = document.createElement("div");
    courseCard.className = "course-card";
    courseCard.dataset.status = course.status || "not-started";

    const isJoined = !!course.joined;

    courseCard.innerHTML = `
            <div class="course-image" style="background-image: url('${
              course.image || "https://via.placeholder.com/300x160"
            }')"></div>
            <div class="course-content">
                <h3 class="course-title">${escapeHtml(course.title)}</h3>
                <div class="course-info">
                    <span><i class="fas fa-user-tie"></i> ${escapeHtml(
                      course.tutor?.username || course.tutor || "Tutor"
                    )}</span>
                    <span><i class="fas fa-clock"></i> ${escapeHtml(
                      course.duration || ""
                    )}</span>
                </div>
                <div class="course-actions">
                    ${
                      isJoined
                        ? '<button class="btn btn-outline btn-go-to-class" data-id="' +
                          course._id +
                          '">Ir a la clase</button>'
                        : '<button class="btn btn-primary btn-join-class" data-id="' +
                          course._id +
                          '">Unirse</button>'
                    }
                    <a href="#" class="btn btn-outline">Detalles</a>
                </div>
            </div>
        `;

    courseContainer.appendChild(courseCard);
  });

  // listeners para Unirse
  document.querySelectorAll(".btn-join-class").forEach((btn) =>
    btn.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;
      try {
        const res = await fetch(`${API_URL}/cursos/${id}/join`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.msg || "Error al unirse");
        }
        // actualizar vista: recargar la lista
        await loadCourses();
        // opcional: actualizar dashboard (si abierta) — emitimos evento
        window.dispatchEvent(
          new CustomEvent("student-joined-class", { detail: { courseId: id } })
        );
      } catch (err) {
        console.error("join error:", err);
        alert("Error al unirse a la clase");
      }
    })
  );

  // ir a clase (si ya inscrito) - puedes redirigir a la página de la clase si existe
  document.querySelectorAll(".btn-go-to-class").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id;
      // ejemplo: redirigir a /clase.html?id=...
      window.location.href = `clase.html?id=${id}`;
    })
  );
}

// ...existing code (mantén todo lo que ya tienes) ...

// Utilidad para escapar HTML (prevenir inyección)
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
