// public/js/metodos_estudio.js

// Tiempos por defecto en segundos
const STUDY_TIME = 25 * 60; // 25 minutos
const BREAK_TIME = 5 * 60;  // 5 minutos

let timer;
let timeLeft = STUDY_TIME;
let isStudying = true;
let isPaused = true;

let timerDisplay;
let timerStatus;
let startButton;
let pauseButton;
let resetButton;
let logoutButton;
let toggleFullscreenBtn;
let motivationalQuoteElement; // 🚨 NUEVA REFERENCIA: Para el mensaje

// --- FUNCIÓN: Inicializa las referencias del DOM ---
function initializeDOMReferences() {
    timerDisplay = document.getElementById('timer-display');
    timerStatus = document.getElementById('timer-status');
    startButton = document.getElementById('start-button');
    pauseButton = document.getElementById('pause-button');
    resetButton = document.getElementById('reset-button');
    logoutButton = document.getElementById('logout-button');
    toggleFullscreenBtn = document.getElementById('toggle-fullscreen-btn'); 
    
    // 🚨 NUEVA LÍNEA: Referencia para el elemento donde irá la frase
    motivationalQuoteElement = document.getElementById('motivational-quote'); 
}

document.addEventListener('DOMContentLoaded', function() {
    initializeDOMReferences();
    
    if (!startButton) return; 

    initializePage();
    updateDisplay();
    setupPomodoroListeners(); 
    setupFullscreenListener(); 
    
    // 🚨 NUEVA LLAMADA: Cargar y mostrar la frase motivacional
    displayRandomMotivationalQuote(); 

    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    sidebar.classList.remove('collapsed');
    mainContent.classList.remove('expanded');
});

// --- LÓGICA DE LA FRASE MOTIVACIONAL ---
const MOTIVATIONAL_QUOTES = [
    "La disciplina tarde o temprano vencerá a la inteligencia. ¡Concéntrate ahora!",
    "Cada Pomodoro completado es un paso más cerca de tu meta. ¡Tú puedes!",
    "No te rindas. El comienzo es siempre lo más difícil. ¡Dale con todo!",
    "El secreto para salir adelante es empezar. ¡Tu futuro te espera!",
    "La mejor forma de predecir el futuro es creándolo. ¡Crea el tuyo ahora!",
    "Haz de cada descanso una recompensa merecida. ¡Estudia con intención!",
    "El éxito no es la clave de la felicidad. La felicidad es la clave del éxito.",
    "El esfuerzo de hoy es la recompensa de mañana. ¡Sé constante!",
    "Transforma tu esfuerzo en resultados. ¡Estos 25 minutos son tuyos!",
    "Empieza donde estás. Usa lo que tienes. Haz lo que puedes. ¡A por ello!",
];

function displayRandomMotivationalQuote() {
    if (motivationalQuoteElement && MOTIVATIONAL_QUOTES.length > 0) {
        // Genera un índice aleatorio entre 0 y la longitud del array - 1
        const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
        
        // Muestra la frase seleccionada
        motivationalQuoteElement.textContent = MOTIVATIONAL_QUOTES[randomIndex];
    }
}

// ... (El resto de las funciones: initializePage, displayUserInfo, updateDisplay, etc., van después)

// --- LÓGICA DE INICIALIZACIÓN DE PÁGINA ---

function initializePage() {
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
    
    displayUserInfo(userData);

    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            fetch('/api/logout', { method: "POST", credentials: "include" })
                .finally(() => {
                    localStorage.removeItem('userData');
                    window.location.href = "index.html";
                });
        });
    }
}

function displayUserInfo(userData) {
    document.getElementById('sidebar-user-name').textContent = userData.username || 'Usuario';
    document.getElementById('sidebar-user-role').textContent = userData.role === 'student' ? 'Estudiante' : 'Tutor';
    
    const userAvatar = document.getElementById('sidebar-user-avatar');
    if (userData.profile && userData.profile.firstName) {
        const initials = `${userData.profile.firstName.charAt(0)}${userData.profile.lastName ? userData.profile.lastName.charAt(0) : ''}`;
        userAvatar.textContent = initials.toUpperCase();
    } else {
        userAvatar.textContent = userData.username.charAt(0).toUpperCase();
    }
}

// --- LÓGICA DEL POMODORO ---

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    if (timerDisplay) {
        timerDisplay.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
        timerDisplay.classList.toggle('studying', isStudying);
        timerDisplay.classList.toggle('breaking', !isStudying);
    }
    
    if (timerStatus) {
        timerStatus.textContent = isStudying ? "Tiempo de Estudio" : "Tiempo de Descanso";
    }
}

function toggleTimer() {
    if (isPaused) {
        isPaused = false;
        if (startButton) startButton.disabled = true;
        if (pauseButton) pauseButton.disabled = false;
        
        timeLeft--;
        updateDisplay();
        
        timer = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(timer);
                isStudying = !isStudying;
                timeLeft = isStudying ? STUDY_TIME : BREAK_TIME;
                
                alert(isStudying ? "¡Es hora de volver a estudiar!" : "¡Descanso terminado! ¡A estudiar!");
                
                toggleTimer(); 
            } else {
                timeLeft--;
                updateDisplay();
            }
        }, 1000);
        
    } else {
        clearInterval(timer);
        isPaused = true;
        if (startButton) startButton.disabled = false;
        if (pauseButton) pauseButton.disabled = true;
    }
}

function resetTimer() {
    clearInterval(timer);
    isStudying = true;
    isPaused = true;
    timeLeft = STUDY_TIME;
    updateDisplay();
    
    if (startButton) startButton.disabled = false;
    if (pauseButton) pauseButton.disabled = true;
}

function setupPomodoroListeners() {
    if (startButton) startButton.addEventListener('click', toggleTimer);
    if (pauseButton) pauseButton.addEventListener('click', toggleTimer);
    if (resetButton) resetButton.addEventListener('click', resetTimer);
}

// --- LÓGICA DE PANTALLA COMPLETA ---
function setupFullscreenListener() {
    if (toggleFullscreenBtn) {
        toggleFullscreenBtn.addEventListener('click', function() {
            const body = document.body;
            const isFullscreen = body.classList.toggle('fullscreen-mode');
            
            const icon = toggleFullscreenBtn.querySelector('i');
            if (isFullscreen) {
                icon.className = 'fas fa-compress-alt'; 
            } else {
                icon.className = 'fas fa-expand-alt';
            }
        });
    }
}