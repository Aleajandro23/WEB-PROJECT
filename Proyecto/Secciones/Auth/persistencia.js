import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { getFirestore} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-storage.js";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,

} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";


// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDCWWyeDWQpk42lwAKD_HLv1cPcOWPPe8E",
    authDomain: "medihelp-c3ea0.firebaseapp.com",
    projectId: "medihelp-c3ea0",
    storageBucket: "medihelp-c3ea0.firebasestorage.app",
    messagingSenderId: "574536680646",
    appId: "1:574536680646:web:4816ceac6d7afe056303c7",
    measurementId: "G-96L8QW7T5G"
  };
  
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  export { auth, db, storage };

// Configuración de persistencia
const configurePersistence = async () => {
    try {
        await setPersistence(auth, browserLocalPersistence);
        console.log("Persistencia configurada correctamente.");
        
        // Verificar credenciales guardadas
        const savedCredentials = localStorage.getItem('userCredentials');
        if (savedCredentials) {
            const { email, password } = JSON.parse(savedCredentials);
            await signInWithEmailAndPassword(auth, email, password);
        }
    } catch (error) {
        console.error("Error en persistencia:", error.message);
    }
};


// Configuración del proveedor de Google
const googleProvider = new GoogleAuthProvider();

// Función genérica para manejar errores
const handleError = (error, customMessage = "Ocurrió un error.") => {
    console.error(`${customMessage}: `, error.message);
    alert(customMessage);
};

// Inicio de sesión con Google
const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // Guardar userId para Google Auth
        localStorage.setItem('userId', user.uid);
        
        console.log("Usuario autenticado con Google:", user.uid);
        window.location.href = "/Proyecto/Secciones/profile/profile.html";
    } catch (error) {
        handleError(error, "Error al iniciar sesión con Google");
    }
};

const getCurrentUserId = () => {
    return localStorage.getItem('userId');
};

const logout = () => {
    auth.signOut().then(() => {
        localStorage.removeItem('userCredentials');
        localStorage.removeItem('userId');
        window.location.href = "/Proyecto/login.html";
    }).catch((error) => {
        console.error("Error al cerrar sesión:", error);
    });
};


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
const loginWithEmail = async (email, password) => {
    if (!email || !password) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Guardar credenciales y userId automáticamente
        const credentials = {
            email,
            password,
            userId: user.uid
        };
        localStorage.setItem('userCredentials', JSON.stringify(credentials));
        localStorage.setItem('userId', user.uid);
        
        console.log("Usuario autenticado:", user.uid);
        window.location.href = "/Proyecto/index.html";
    } catch (error) {
        handleError(error);
    }
};

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

// Verificar estado de autenticación
const checkAuthState = () =>
    new Promise((resolve, reject) =>
        onAuthStateChanged(auth, (user) => {
            if (user) {
                resolve(user);
            } else {
                reject(new Error("No hay usuario autenticado"));
            }
        })
    );


// requireAuth que devuelve el usuario autenticado
const requireAuth = async () => {
    const user = checkUserSession(); // Usamos la función que verifica el estado de la sesión
    if (!user) {
        window.location.href = "/Proyecto/login.html";  // Redirige a login si no hay sesión activa
        return null;  // Si no hay usuario, retorna null
    }
    return user;  // Si hay usuario, lo devuelve
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

// Configurar persistencia y eventos al cargar el archivo
configurePersistence();
setupEventListeners();

// Inicializar la sesión cuando se carga la página
onAuthStateChanged(auth, (user) => {
    if (user) {
        localStorage.setItem('userId', user.uid);
        console.log("Usuario autenticado:", user.uid);
    } else {
        console.log("Usuario no autenticado");
    }
});
const checkUserSession = () => {
    const user = localStorage.getItem('user');
    if (user) {
        console.log("Sesión activa", JSON.parse(user));
        return JSON.parse(user);  // Retorna los detalles del usuario
    } else {
        console.log("No hay sesión activa.");
        window.location.href = "/Proyecto/Secciones/Auth/index.html";  // Redirigir a la página de inicio de sesión
        return null;
    }
};


// Exportar todo lo necesario para usar en otros archivos
export {
    app,
    loginWithGoogle,
    registerWithGoogle,
    loginWithEmail,
    registerWithEmail,
    checkAuthState,
    requireAuth,
    hasActiveSession,
    checkUserSession,
    onAuthStateChanged,
    getCurrentUserId,
    logout
};

export async function obtenerObrasDeUsuarios() {
    const db = getFirestore();  // Usar la instancia de Firestore de Firebase
    const usuariosRef = db.collection('users');  // Asegúrate de que 'users' sea la colección correcta
    const querySnapshot = await usuariosRef.get();
    
    let obras = [];

    querySnapshot.forEach(doc => {
        const usuario = doc.data();
        console.log('Usuario:', usuario);  // Verifica la estructura de los datos de usuario

        if (usuario.obras && Array.isArray(usuario.obras)) {
            usuario.obras.forEach(obra => {
                console.log('Obra:', obra);  // Verifica cada obra
                obras.push({
                    nombre: obra.nombre,
                    imagen: obra.imagen,
                    categoria: obra.categoria,
                    ubicacion: obra.ubicacion,
                    autor: {
                        nombre: usuario.nombre,
                        avatar: usuario.avatar
                    }
                });
            });
        }
    });

    console.log('Obras:', obras);  // Verifica el array de obras
    return obras;
}


