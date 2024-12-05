// Importa las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAMyXHT4FgRCm3oLGuMdzeUGcX5m16rq4A",
  authDomain: "nftlatinoxyz-1531b.firebaseapp.com",
  projectId: "nftlatinoxyz-1531b",
  storageBucket: "nftlatinoxyz-1531b.appspot.com",
  messagingSenderId: "498175021440",
  appId: "1:498175021440:web:dd23d59d1b6e2228c63165",
  measurementId: "G-Y2RKNNEM80"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firebase Authentication
const auth = getAuth(app);

// Referencias al DOM
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const userPhoto = document.getElementById("user-photo");
const userName = document.getElementById("user-name");  // Nuevo: Elemento para mostrar el nombre del usuario

// Verificar el estado del usuario autenticado
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Si el usuario está logueado
    userPhoto.src = user.photoURL || "https://www.gstatic.com/images/branding/product/1x/avatar_circle_blue_512dp.png"; // Foto de perfil o predeterminada de Google
    userName.textContent = user.displayName || "Nombre no disponible";  // Nombre del usuario, si está disponible
    userPhoto.classList.remove("hidden"); // Muestra la foto de perfil
    loginBtn.classList.add("hidden"); // Oculta el botón de Login
    signupBtn.classList.add("hidden"); // Oculta el botón de Sign Up
  } else {
    // Si no hay usuario logueado
    userPhoto.classList.add("hidden"); // Oculta la foto de perfil
    loginBtn.classList.remove("hidden"); // Muestra el botón de Login
    signupBtn.classList.remove("hidden"); // Muestra el botón de Sign Up
  }
});

// Redirigir al hacer click en la foto de perfil
userPhoto.addEventListener("click", function() {
    // Redirigir a la página de perfil
    window.location.href = "file:///C:/Users/Abraham/Downloads/WEB-PROJECT-1/Proyecto/Secciones/profile/profile.html";
});
