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

// Verificar el estado del usuario autenticado
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Si el usuario está logueado
    userPhoto.src = user.photoURL || "default-profile.png"; // Asigna la URL de la foto del usuario, con un valor por defecto
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

