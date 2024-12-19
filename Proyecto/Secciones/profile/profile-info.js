import { 
  db, 
  storage, 
  requireAuth 
} from '/Proyecto/Secciones/Auth/persistencia.js';
import { 
  doc, 
  getDoc, 
  setDoc 
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";

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

// Cargar el perfil del usuario
const loadUserProfile = async (userId) => {
  try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
          const userData = userDoc.data();

          // Actualiza los campos del perfil con los datos del usuario
          domElements.fullNameInput.value = userData.name || '';
          domElements.experienceAreaInput.value = userData.profession || '';
          domElements.artistDescriptionInput.value = userData.description || '';
          domElements.instagramInput.value = userData.socialLinks?.instagram || '';
          domElements.linkedinInput.value = userData.socialLinks?.linkedin || '';
          domElements.facebookInput.value = userData.socialLinks?.facebook || '';
          domElements.profileAvatar.style.backgroundImage = userData.avatar
              ? `url(${userData.avatar})`
              : 'url(/default-avatar.png)';

          // Cargar experiencia previa
          domElements.experienceContainer.innerHTML = ''; // Limpia las experiencias previas
          userData.experience?.forEach((experience) => {
              const experienceItem = document.createElement('div');
              experienceItem.classList.add('experience-item');
              experienceItem.innerHTML = `
                  <input type="text" class="experience-input" value="${experience}" placeholder="Ejemplo: Diseñador Gráfico - 2 años en MediaLab">
              `;
              domElements.experienceContainer.appendChild(experienceItem);
          });
      } else {
          console.warn("No se encontró el perfil del usuario.");
      }
  } catch (error) {
      console.error("Error al cargar el perfil:", error);
  }
};

// Subir avatar al almacenamiento
const uploadAvatarFile = async (file) => {
  if (!currentUser) return null;

  try {
      const filename = `${currentUser.uid}_${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `avatars/${filename}`);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
  } catch (error) {
      console.error("Error al subir la foto de perfil:", error);
      alert("Error al subir la foto de perfil.");
      return null;
  }
};

// Guardar perfil
const saveProfile = async () => {
  if (!currentUser) return;

  try {
      const userDocRef = doc(db, 'users', currentUser.uid);

      let avatarUrl = currentProfilePhotoUrl;
      if (domElements.profilePhotoInput.files.length > 0) {
          const uploadedAvatarUrl = await uploadAvatarFile(domElements.profilePhotoInput.files[0]);
          avatarUrl = uploadedAvatarUrl || avatarUrl;
      }

      const experienceInputs = Array.from(
          document.querySelectorAll('.experience-input')
      ).map(input => input.value.trim()).filter(Boolean);

      const profileData = {
          name: domElements.fullNameInput.value.trim(),
          profession: domElements.experienceAreaInput.value.trim(),
          description: domElements.artistDescriptionInput.value.trim(),
          location: [0, 0],
          socialLinks: {
              facebook: domElements.facebookInput.value.trim() || "https://www.facebook.com/",
              instagram: domElements.instagramInput.value.trim() || "https://www.instagram.com/",
              linkedin: domElements.linkedinInput.value.trim() || "https://linkedin.com/"
          },
          experience: experienceInputs,
          avatar: avatarUrl
      };

      await setDoc(userDocRef, profileData, { merge: true });
      currentProfilePhotoUrl = avatarUrl;
      domElements.profileAvatar.style.backgroundImage = `url(${avatarUrl})`;

      alert("Perfil guardado exitosamente.");
  } catch (error) {
      console.error("Error al guardar el perfil:", error);
      alert("Error al guardar el perfil.");
  }
};

// Configurar listeners de eventos
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

// Inicializar la página con autenticación
const initializePage = async () => {
  try {
      const user = await requireAuth();
      if (user) {
          currentUser = user;
          await loadUserProfile(user.uid);
      }
  } catch (error) {
      console.error("Error de autenticación:", error);
      window.location.href = '/Proyecto/Secciones/Auth/login.html';
  }
};

// Inicializar la página al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  initializePage();
  setupEventListeners();
});
