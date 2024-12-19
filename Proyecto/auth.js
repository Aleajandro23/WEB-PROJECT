// Importar funciones desde persistencia.js (asegúrate que persistencia.js ya inicializa Firebase y exporta requireAuth)
import { requireAuth, onAuthChange } from '/Proyecto/Secciones/Auth/persistencia.js';

// Referencias al DOM
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const userPhoto = document.getElementById("user-photo");

// Función para actualizar la interfaz según el estado de autenticación
const updateUI = (user) => {
    if (user) {
        // Usuario autenticado: mostrar foto y ocultar botones
        userPhoto.src = user.photoURL || "./default-profile.png"; // Ruta a imagen por defecto
        userPhoto.classList.remove("hidden");
        loginBtn.classList.add("hidden");
        signupBtn.classList.add("hidden");
    } else {
        // No autenticado: ocultar foto y mostrar botones
        userPhoto.classList.add("hidden");
        loginBtn.classList.remove("hidden");
        signupBtn.classList.remove("hidden");
    }
};

// Escuchar cambios en el estado de autenticación
onAuthChange(updateUI);

// Intentar verificar si el usuario está autenticado al cargar la página
(async () => {
    try {
        const user = await requireAuth();
        updateUI(user);
    } catch {
        updateUI(null);
    }
})();
