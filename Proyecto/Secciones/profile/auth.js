// Importaciones necesarias
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

// Configurar Firebase Authentication y Firestore
const auth = getAuth();
const db = getFirestore();

// Referencias a los elementos HTML
const signupBtn = document.getElementById("signup-btn");
const loginBtn = document.getElementById("login-btn");
const userPhoto = document.getElementById("user-photo");

// Escucha cambios en el estado de autenticación
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Ocultar botones de autenticación
    signupBtn.style.display = "none";
    loginBtn.style.display = "none";

    // Mostrar la foto de perfil
    userPhoto.classList.remove("hidden");

    try {
      // Obtener documento del usuario en Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().profileImage) {
        // Si existe el campo profileImage, usar esa URL
        userPhoto.src = userDoc.data().profileImage;
      } else if (user.photoURL) {
        // Si no existe profileImage, usar la foto de Google
        userPhoto.src = user.photoURL;
      } else {
        // Foto predeterminada en caso de que ninguna esté disponible
        userPhoto.src = "ruta/a/imagen-predeterminada.png";
      }
    } catch (error) {
      console.error("Error obteniendo datos del usuario:", error);
      userPhoto.src = "ruta/a/imagen-predeterminada.png"; // Fallback
    }
  } else {
    // Mostrar botones de autenticación
    signupBtn.style.display = "block";
    loginBtn.style.display = "block";

    // Ocultar la foto de perfil
    userPhoto.classList.add("hidden");
  }
});
