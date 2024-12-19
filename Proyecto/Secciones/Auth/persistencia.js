import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";

// Configuración de Firebase (verifica el storageBucket si es necesario)
const firebaseConfig = {
    apiKey: "AIzaSyDCWWyeDWQpk42lwAKD_HLv1cPcOWPPe8E",
    authDomain: "medihelp-c3ea0.firebaseapp.com",
    projectId: "medihelp-c3ea0",
    storageBucket: "medihelp-c3ea0.appspot.com", 
    messagingSenderId: "574536680646",
    appId: "1:574536680646:web:4816ceac6d7afe056303c7",
    measurementId: "G-96L8QW7T5G"
};

// Inicialización de Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Configuración de persistencia
const configurePersistence = () =>
    setPersistence(auth, browserLocalPersistence)
        .then(() => console.log("Persistencia configurada correctamente."))
        .catch((error) => console.error("Error configurando la persistencia:", error.message));

// Configuración del proveedor de Google
const googleProvider = new GoogleAuthProvider();

// Función genérica para manejar errores
const handleError = (error, customMessage = "Ocurrió un error.") => {
    console.error(`${customMessage}: `, error.message);
    alert(customMessage);
};

// Inicio de sesión con Google
const loginWithGoogle = () =>
    signInWithPopup(auth, googleProvider)
        .then((result) => {
            console.log("Usuario autenticado con Google:", result.user);
            window.location.href = "/Proyecto/Secciones/profile/profile.html";
        })
        .catch((error) => handleError(error, "Error al iniciar sesión con Google"));

// Registro con Google
const registerWithGoogle = () =>
    signInWithPopup(auth, googleProvider)
        .then((result) => {
            console.log("Usuario registrado con Google:", result.user);
            alert(`¡Cuenta creada exitosamente para: ${result.user.displayName || "Usuario"}!`);
            window.location.href = "/Proyecto/index.html";
        })
        .catch((error) => handleError(error, "Error al registrarse con Google"));

// Inicio de sesión con correo y contraseña
const loginWithEmail = (email, password) =>
    email && password
        ? signInWithEmailAndPassword(auth, email, password)
              .then((userCredential) => {
                  console.log("Usuario autenticado con correo/contraseña:", userCredential.user);
                  window.location.href = "/Proyecto/index.html";
              })
              .catch((error) =>
                  handleError(
                      error,
                      error.code === "auth/wrong-password"
                          ? "Contraseña incorrecta."
                          : error.code === "auth/user-not-found"
                          ? "Usuario no encontrado."
                          : "Error al iniciar sesión."
                  )
              )
        : alert("Por favor, completa todos los campos.");

// Registro con correo y contraseña
const registerWithEmail = (email, password) =>
    email && password
        ? createUserWithEmailAndPassword(auth, email, password)
              .then((userCredential) => {
                  console.log("Usuario registrado exitosamente:", userCredential.user);
                  window.location.href = "/Proyecto/index.html";
              })
              .catch((error) =>
                  handleError(
                      error,
                      error.code === "auth/email-already-in-use"
                          ? "El correo ya está registrado."
                          : error.code === "auth/weak-password"
                          ? "La contraseña es muy débil."
                          : "Error al registrarse."
                  )
              )
        : alert("Por favor, completa todos los campos.");

// Manejo del estado de autenticación
const onAuthChange = (callback) => onAuthStateChanged(auth, callback);

// Verificar estado de autenticación
const checkAuthState = () =>
    new Promise((resolve, reject) =>
        onAuthChange((user) => (user ? resolve(user) : reject(new Error("No hay usuario autenticado"))))
    );

// Redirigir si no hay sesión activa
const requireAuth = async (loginPath = "/Proyecto/index.html") => {
    try {
        return await checkAuthState();
    } catch {
        window.location.href = loginPath;
        return null;
    }
};

// Verificar sesión activa sin redirigir
const hasActiveSession = () => auth.currentUser !== null;

// Asignación de eventos a botones (si existen en el DOM)
const setupEventListeners = () => {
    document.getElementById("google-signin-btn")?.addEventListener("click", (e) => {
        e.preventDefault();
        loginWithGoogle();
    });

    document.getElementById("google-signup-btn")?.addEventListener("click", (e) => {
        e.preventDefault();
        registerWithGoogle();
    });

    document.getElementById("login-btn")?.addEventListener("click", (e) => {
        e.preventDefault(); // Evitar recargar la página
        const email = document.getElementById("login-email")?.value?.trim();
        const password = document.getElementById("login-password")?.value?.trim();

        if (!email || !password) {
            
            return;
        }

        loginWithEmail(email, password);
    });

    document.getElementById("signup-btn")?.addEventListener("click", (e) => {
        e.preventDefault(); // Evitar recargar la página
        const email = document.getElementById("signup-email")?.value?.trim();
        const password = document.getElementById("signup-password")?.value?.trim();

        if (!email || !password) {
            alert("Por favor, completa todos los campos de registro.");
            return;
        }

        registerWithEmail(email, password);
    });
};
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM completamente cargado y parseado.");
    console.log("Login email:", document.getElementById("login-email"));
    console.log("Login password:", document.getElementById("login-password"));
    console.log("Signup email:", document.getElementById("signup-email"));
    console.log("Signup password:", document.getElementById("signup-password"));
});

// Configurar persistencia y eventos al cargar el archivo
configurePersistence();
setupEventListeners();

// Exportar todo lo necesario para usar en otros archivos
export {
    app,
    auth,
    db,
    storage,
    loginWithGoogle,
    registerWithGoogle,
    loginWithEmail,
    registerWithEmail,
    checkAuthState,
    requireAuth,
    hasActiveSession,
    onAuthChange
};
