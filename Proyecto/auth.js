// Importar funciones desde persistencia.js
import { requireAuth, onAuthChange } from '/Proyecto/Secciones/Auth/persistencia.js';

/// Función para verificar si hay un usuario autenticado sin redirigir
const optionalAuth = async () => {
  try {
      const user = await checkAuthState();
      console.log("Usuario autenticado:", user);
      return user; // Retorna el usuario si está autenticado
  } catch {
      console.log("No hay usuario autenticado.");
      return null; // Retorna null si no hay usuario
  }
};

// Modificar el Home para que permita acceso sin redirigir
const setupHomePage = async () => {
  const user = await optionalAuth(); // Verificar si hay usuario autenticado
  const loginBtn = document.getElementById("login-btn");
  const signupBtn = document.getElementById("signup-btn");
  const userPhoto = document.getElementById("user-photo");

  if (user) {
      // Usuario autenticado: ocultar botones y mostrar foto de perfil
      userPhoto.src = user.photoURL || "./default-profile.png"; // Foto de perfil
      userPhoto.classList.remove("hidden");
      loginBtn.classList.add("hidden");
      signupBtn.classList.add("hidden");
  } else {
      // Usuario no autenticado: mostrar botones y ocultar foto de perfil
      userPhoto.classList.add("hidden");
      loginBtn.classList.remove("hidden");
      signupBtn.classList.remove("hidden");
  }
};

// Ejecutar configuración del Home al cargar
setupHomePage();
