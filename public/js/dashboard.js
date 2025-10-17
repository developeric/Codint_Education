// public/js/dashboard.js (versión simplificada y funcional)

const API_URL = "http://localhost:3005/api";

document.addEventListener("DOMContentLoaded", function () {
  let userData;
  try {
    userData = JSON.parse(localStorage.getItem("userData"));
  } catch (error) {
    window.location.href = "index.html";
    return;
  }
  if (!userData) {
    window.location.href = "index.html";
    return;
  }

  displayUserInfo(userData);
  setupEventListeners();

  if (userData.role === "student") {
    // Mostrar solo lo esencial para el alumno
    const studentSection = document.getElementById("student-dashboard");
    const tutorSection = document.getElementById("tutor-dashboard");
    if (studentSection) studentSection.style.display = "block";
    if (tutorSection) tutorSection.style.display = "none";

    loadAvailableCoursesForStudent(); // lista de todas las clases + botón Unirse
    loadStudentJoinedClasses(); // clases en las que ya está inscrito
  } else if (userData.role === "tutor") {
    const studentSection = document.getElementById("student-dashboard");
    const tutorSection = document.getElementById("tutor-dashboard");
    if (studentSection) studentSection.style.display = "none";
    if (tutorSection) tutorSection.style.display = "block";

    loadTutorClasses(); // mantengo funcionalidad del tutor
  }
});

// muestra nombre y rol mínimos
function displayUserInfo(userData) {
  const nameEl = document.getElementById("sidebar-user-name");
  const roleEl = document.getElementById("sidebar-user-role");
  if (nameEl) nameEl.textContent = userData.username || "Usuario";
  if (roleEl)
    roleEl.textContent = userData.role === "student" ? "Estudiante" : "Tutor";
  const avatar = document.getElementById("sidebar-user-avatar");
  if (avatar)
    avatar.textContent = (userData.username || "U").charAt(0).toUpperCase();
}

function setupEventListeners() {
  const logoutBtn = document.getElementById("logout-button");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("userData");
      window.location.href = "index.html";
    });
  }

  // actualizar joined classes si el estudiante se une desde otra página
  window.addEventListener("student-joined-class", () => {
    loadStudentJoinedClasses();
    // si está viendo lista de disponibles, recargarla también
    loadAvailableCoursesForStudent();
  });
}

/* ---------- FUNCIONALIDAD ALUMNO: clases disponibles y unirse ---------- */

// lista todas las clases disponibles para el alumno (GET /api/cursos)
async function loadAvailableCoursesForStudent() {
  const container = document.getElementById("student-available-classes");
  if (!container) return;
  container.innerHTML = "Cargando clases disponibles...";
  try {
    const res = await fetch(`${API_URL}/cursos`, { credentials: "include" });
    if (!res.ok) throw new Error("Error cargando clases");
    const json = await res.json();
    const courses = json.data || [];
    renderAvailableCourses(courses, container);
  } catch (err) {
    console.error("loadAvailableCoursesForStudent:", err);
    container.innerHTML = "No se pudieron cargar las clases.";
  }
}

function renderAvailableCourses(courses, container) {
  if (!container) return;
  if (!courses.length) {
    container.innerHTML = "<p>No hay clases disponibles.</p>";
    return;
  }
  container.innerHTML = courses
    .map(
      (c) => `
    <div class="course-item" data-id="${
      c._id
    }" style="padding:8px;border-bottom:1px solid #ddd;">
      <strong>${escapeHtml(c.title)}</strong> <small>(${escapeHtml(
        c.subject
      )})</small>
      <div style="margin-top:6px;">
        <button class="btn-join-course" data-id="${c._id}">Unirse</button>
        <a href="clase.html?id=${c._id}" class="btn-view">Ver</a>
      </div>
    </div>
  `
    )
    .join("");

  container.querySelectorAll(".btn-join-course").forEach((btn) =>
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
        // notificar y recargar listas relevantes
        window.dispatchEvent(
          new CustomEvent("student-joined-class", { detail: { courseId: id } })
        );
      } catch (err) {
        console.error("join error:", err);
        alert("Error al unirse a la clase");
      }
    })
  );
}

// muestra las clases en las que el alumno está inscrito (GET /api/cursos/inscritas)
async function loadStudentJoinedClasses() {
  const container = document.getElementById("student-joined-classes");
  if (!container) return;
  container.innerHTML = "Cargando tus clases...";
  try {
    const res = await fetch(`${API_URL}/cursos/inscritas`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al cargar inscritas");
    const json = await res.json();
    const classes = json.data || [];
    if (!classes.length) {
      container.innerHTML = "<p>No estás inscrito en ninguna clase.</p>";
      return;
    }
    container.innerHTML = classes
      .map(
        (c) => `
      <div style="padding:8px;border-bottom:1px solid #eee;">
        <strong>${escapeHtml(c.title)}</strong> <small>(${escapeHtml(
          c.subject
        )})</small>
        <div><a href="clase.html?id=${c._id}">Ir a la clase</a></div>
      </div>
    `
      )
      .join("");
  } catch (err) {
    console.error("loadStudentJoinedClasses:", err);
    container.innerHTML = "Error al cargar tus clases.";
  }
}

/* ---------- FUNCIONALIDAD TUTOR (mantener) ---------- */

async function loadTutorClasses() {
  try {
    const res = await fetch(`${API_URL}/cursos/me`, { credentials: "include" });
    if (!res.ok) throw new Error("No se pudieron cargar tus clases");
    const result = await res.json();
    const classes = result.data || [];
    // reusar renderizador ya existente (simple)
    const list = document.getElementById("tutor-classes-list");
    if (!list) return;
    if (classes.length === 0) {
      list.innerHTML = "<p>No tienes clases creadas aún.</p>";
      return;
    }
    list.innerHTML = classes
      .map(
        (c) => `
      <div data-id="${c._id}" style="padding:8px;border-bottom:1px solid #ddd;">
        <strong>${escapeHtml(c.title)}</strong> <small>(${escapeHtml(
          c.subject
        )})</small>
        <div style="margin-top:6px;">
          <button class="btn-edit-class" data-id="${c._id}">Editar</button>
          <button class="btn-delete-class" data-id="${c._id}">Eliminar</button>
        </div>
      </div>
    `
      )
      .join("");
    // listeners mínimos
    list.querySelectorAll(".btn-delete-class").forEach((btn) =>
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.dataset.id;
        if (!confirm("Eliminar clase?")) return;
        try {
          const res = await fetch(`${API_URL}/cursos/${id}`, {
            method: "DELETE",
            credentials: "include",
          });
          if (!res.ok) throw new Error("Error eliminando");
          loadTutorClasses();
        } catch (err) {
          console.error(err);
          alert("Error al eliminar");
        }
      })
    );
    // edición simple (podés mantener tu inline editor actual)
  } catch (err) {
    console.error("loadTutorClasses:", err);
  }
}

/* utilidad */
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
