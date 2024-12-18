import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-storage.js";

// Firebase Configuration
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

const db = getFirestore(app);
const storage = getStorage(app);
export { auth, db, storage };
// DOM Elements
const domElements = {
  profilePhotoInput: document.getElementById('profile-photo'),
  profileAvatar: document.getElementById('profile-avatar'),
  fullNameInput: document.getElementById('full-name'),
  experienceAreaInput: document.getElementById('experience-area'),
  instagramInput: document.getElementById('instagram'),
  linkedinInput: document.getElementById('linkedin'),
  facebookInput: document.getElementById('facebook'),
  experienceContainer: document.getElementById('experience-container'),
  addExperienceButton: document.getElementById('add-experience'),
  artistDescriptionInput: document.getElementById('artist-description'),
  saveProfileButton: document.getElementById('save-profile'),
  cancelEditButton: document.getElementById('cancel-edit'),
  hireName: document.getElementById('hire-name')
};

let currentUser = null;
let currentProfilePhotoUrl = null;

const auth = getAuth();

onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("Usuario autenticado:", user.email);
    currentUser = user; // Asigna el usuario actual
    await loadUserProfile(user.uid); // Carga el perfil del usuario
  } else {
    console.log("No hay usuario autenticado. Redirigiendo al login...");
    window.location.href = "/Proyecto/login.html"; // Redirige al login
  }
});





// Load User Profile
const loadUserProfile = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.log('No se encontró el perfil del usuario');
      return;
    }

    const userData = userDoc.data();

    // Actualizar Avatar
    if (userData.avatar) {
      domElements.profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
    }

    // Mostrar información en los campos
    domElements.fullNameInput.value = userData.name || '';
    domElements.experienceAreaInput.value = userData.profession || '';
    domElements.instagramInput.value = userData.socialLinks?.instagram || '';
    domElements.linkedinInput.value = userData.socialLinks?.linkedin || '';
    domElements.facebookInput.value = userData.socialLinks?.facebook || '';
    domElements.artistDescriptionInput.value = userData.description || '';
    domElements.hireName.textContent = userData.name || '';

    // Mostrar experiencia
    domElements.experienceContainer.innerHTML = '';
    if (userData.experience && userData.experience.length > 0) {
      userData.experience.forEach(exp => {
        const experienceItem = document.createElement('div');
        experienceItem.classList.add('experience-item');
        experienceItem.innerHTML = `
          <p class="experience-text">${exp}</p>
        `;
        domElements.experienceContainer.appendChild(experienceItem);
      });
    } else {
      domElements.experienceContainer.innerHTML = '<p>No hay experiencia registrada</p>';
    }

    // Deshabilitar todos los campos de entrada
    Object.values(domElements).forEach(element => {
      if (element && element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.disabled = true;
      }
    });

  } catch (error) {
    console.error("Error al cargar el perfil:", error);
  }
};
// Upload Avatar to Storage
const uploadAvatarFile = async (file) => {
  if (!currentUser) return null;

  try {
    // Generar un nombre de archivo único
    const filename = `${currentUser.uid}_${Date.now()}_${file.name}`;
    
    // Referencia a la carpeta avatars en Firebase Storage
    const storageRef = ref(storage, `avatars/${filename}`);
    
    // Subir el archivo
    const snapshot = await uploadBytes(storageRef, file);
    
    // Obtener la URL de descarga
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error("Avatar upload error:", error);
    alert("Error uploading profile photo.");
    return null;
  }
};

// Save Profile
const saveProfile = async () => {
  if (!currentUser) return;

  try {
    const userDocRef = doc(db, 'users', currentUser.uid);
    
    // Handle avatar upload
    let avatarUrl = currentProfilePhotoUrl;
    if (domElements.profilePhotoInput.files.length > 0) {
      const uploadedAvatarUrl = await uploadAvatarFile(domElements.profilePhotoInput.files[0]);
      if (uploadedAvatarUrl) {
        avatarUrl = uploadedAvatarUrl;
      }
    }

    // Get experience inputs, filter out empty ones
    const experienceInputs = Array.from(
      document.querySelectorAll('.experience-input')
    )
    .map(input => input.value.trim())
    .filter(Boolean);

    // Prepare structured profile data
    const profileData = {
      name: domElements.fullNameInput.value.trim(),
      profession: domElements.experienceAreaInput.value.trim(),
      description: domElements.artistDescriptionInput.value.trim(),
      location: [0, 0], // Placeholder coordinates
      socialLinks: {
        facebook: domElements.facebookInput.value.trim() || "https://www.facebook.com/",
        instagram: domElements.instagramInput.value.trim() || "https://www.instagram.com/",
        linkedin: domElements.linkedinInput.value.trim() || "https://linkedin.com/"
      },
      experience: experienceInputs,
      avatar: avatarUrl // Usar la URL del avatar
    };

    await setDoc(userDocRef, profileData, { merge: true });
    
    // Update the current profile photo URL
    currentProfilePhotoUrl = avatarUrl;
    
    // Update avatar display
    domElements.profileAvatar.style.backgroundImage = `url(${avatarUrl})`;
    
    alert("Profile saved successfully.");
  } catch (error) {
    console.error("Profile saving error:", error);
    alert("Error saving profile.");
  }
};

// Event Listeners
const setupEventListeners = () => {
  domElements.saveProfileButton.addEventListener('click', saveProfile);
  
  domElements.cancelEditButton.addEventListener('click', () => {
    currentUser && loadUserProfile(currentUser.uid);
  });

  domElements.profilePhotoInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        domElements.profileAvatar.style.backgroundImage = `url(${e.target.result})`;
      };
      reader.readAsDataURL(file);
    }
  });

  domElements.addExperienceButton.addEventListener('click', () => {
    const experienceItem = document.createElement('div');
    experienceItem.classList.add('experience-item');
    experienceItem.innerHTML = `
      <input type="text" class="experience-input" placeholder="Ejemplo: Diseñador Gráfico - 2 años en MediaLab">
    `;
    domElements.experienceContainer.insertBefore(experienceItem, domElements.addExperienceButton);
  });
};

setupEventListeners();