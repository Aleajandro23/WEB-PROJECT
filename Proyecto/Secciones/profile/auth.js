import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-storage.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Elementos del DOM
const profilePhotoInput = document.getElementById('profile-photo');
const profileAvatar = document.getElementById('profile-avatar');
const fullNameInput = document.getElementById('full-name');
const experienceAreaInput = document.getElementById('experience-area');
const locationInput = document.getElementById('location');
const hireButton = document.getElementById('hire-button');
const hireName = document.getElementById('hire-name');
const instagramInput = document.getElementById('instagram');
const linkedinInput = document.getElementById('linkedin');
const facebookInput = document.getElementById('facebook');
const experienceContainer = document.getElementById('experience-container');
const addExperienceButton = document.getElementById('add-experience');
const curriculumUploadInput = document.getElementById('curriculum-upload');
const artistDescriptionInput = document.getElementById('artist-description');
const saveProfileButton = document.getElementById('save-profile');
const cancelEditButton = document.getElementById('cancel-edit');

let currentUser = null;

// Verificar estado de autenticación
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    await loadUserProfile(user.uid);
  } else {
    window.location.href = 'login.html'; // Redirigir a login si no hay usuario
  }
});

// Cargar perfil del usuario
// Cargar perfil del usuario
async function loadUserProfile(userId) {
  try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      let avatarUrl = 'default-avatar.png'; // Imagen predeterminada

      if (userDoc.exists()) {
          const userData = userDoc.data();

          // Usar avatar del perfil guardado o el de Google si no está en Firestore
          avatarUrl = userData.avatar || currentUser.photoURL || avatarUrl;

          // Rellenar campos con datos
          fullNameInput.value = userData.name || '';
          experienceAreaInput.value = userData.profession || '';
          locationInput.value = userData.location || '';
          hireName.textContent = userData.name || '';
          instagramInput.value = userData.instagram || '';
          linkedinInput.value = userData.linkedin || '';
          facebookInput.value = userData.facebook || '';
          artistDescriptionInput.value = userData.description || '';

          // Experiencia laboral
          experienceContainer.innerHTML = '';
          (userData.experience || []).forEach(exp => {
              const experienceItem = document.createElement('div');
              experienceItem.classList.add('experience-item');
              experienceItem.innerHTML = `
                  <input type="text" class="experience-input" value="${exp}" readonly>
              `;
              experienceContainer.insertBefore(experienceItem, addExperienceButton);
          });
      } else {
          // Usar valores predeterminados si no existe el documento
          avatarUrl = currentUser.photoURL || avatarUrl;
          fullNameInput.value = currentUser.displayName || '';
      }

      // Establecer el avatar
      profileAvatar.style.backgroundImage = `url(${avatarUrl})`;
  } catch (error) {
      console.error("Error cargando perfil:", error);
  }
}

// Guardar perfil del usuario
saveProfileButton.addEventListener('click', async () => {
  if (!currentUser) return;

  try {
      const userDocRef = doc(db, 'users', currentUser.uid);

      // Preparar datos del perfil
      const profileData = {
          name: fullNameInput.value,
          profession: experienceAreaInput.value,
          location: locationInput.value,
          instagram: instagramInput.value,
          linkedin: linkedinInput.value,
          facebook: facebookInput.value,
          description: artistDescriptionInput.value,
          experience: Array.from(document.querySelectorAll('.experience-input')).map(input => input.value),
      };

      // Manejar subida de avatar
      if (profilePhotoInput.files.length > 0) {
          const file = profilePhotoInput.files[0];
          const storageRef = ref(storage, `avatars/${currentUser.uid}`);

          try {
              const snapshot = await uploadBytes(storageRef, file); // Subir el archivo
              const avatarUrl = await getDownloadURL(snapshot.ref); // Obtener la URL del archivo subido
              profileData.avatar = avatarUrl; // Añadir la URL al perfil
          } catch (uploadError) {
              console.error("Error subiendo avatar:", uploadError);
              alert("Error al subir la foto de perfil. Por favor, inténtalo de nuevo.");
              return; // Detener el guardado si el avatar no se subió
          }
      } else if (!profileData.avatar) {
          // Usar el avatar de Google si no se ha subido uno nuevo
          profileData.avatar = currentUser.photoURL || 'default-avatar.png';
      }

      // Guardar datos del perfil en Firestore
      await setDoc(userDocRef, profileData, { merge: true });

      alert("Perfil guardado exitosamente.");
  } catch (error) {
      console.error("Error guardando perfil:", error);
      alert("Hubo un error al guardar el perfil.");
  }
});



// Cancelar edición
cancelEditButton.addEventListener('click', async () => {
  if (currentUser) {
    await loadUserProfile(currentUser.uid);
  }
});

// Manejar subida de avatar
profilePhotoInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      profileAvatar.style.backgroundImage = `url(${e.target.result})`;
    };
    reader.readAsDataURL(file);
  }
});
let map;
let marker;

// Inicializa el mapa y el marcador
function initMap() {
  const initialPosition = { lat: 40.7128, lng: -74.0060 }; // Coordenadas iniciales (Ej.: Nueva York)

  // Inicializar el mapa
  map = new google.maps.Map(document.getElementById('map'), {
    center: initialPosition,
    zoom: 12,
  });

  // Inicializar el marcador
  marker = new google.maps.Marker({
    position: initialPosition,
    map: map,
    draggable: true, // Permite arrastrar el marcador
  });

  // Actualizar la ubicación al mover el marcador
  marker.addListener('dragend', () => {
    updateLocationInput(marker.getPosition());
  });

  // Actualizar la ubicación al hacer clic en el mapa
  map.addListener('click', (event) => {
    marker.setPosition(event.latLng);
    updateLocationInput(event.latLng);
  });
}

// Actualiza el campo de texto con la dirección seleccionada
function updateLocationInput(position) {
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ location: position }, (results, status) => {
    if (status === 'OK' && results[0]) {
      locationInput.value = results[0].formatted_address; // Actualiza el input con la dirección
    } else {
      console.error('No se pudo obtener la dirección:', status);
    }
  });
}

// Agregar el evento para cargar el mapa
window.addEventListener('load', () => {
  if (typeof initMap === 'function') {
    initMap();
  }
});

// Guardar ubicación al guardar el perfil
saveProfileButton.addEventListener('click', async () => {
  if (!currentUser) return;

  try {
    const userDocRef = doc(db, 'users', currentUser.uid);
    const profileData = {
      location: locationInput.value,
      // Otros datos del perfil...
    };

    // Guardar en Firestore
    await setDoc(userDocRef, profileData, { merge: true });

    alert('Perfil actualizado con la ubicación seleccionada.');
  } catch (error) {
    console.error('Error al guardar la ubicación:', error);
    alert('No se pudo guardar la ubicación.');
  }
});

// Agregar experiencia laboral
addExperienceButton.addEventListener('click', () => {
  const experienceItem = document.createElement('div');
  experienceItem.classList.add('experience-item');
  experienceItem.innerHTML = `
        <input type="text" class="experience-input" placeholder="Ejemplo: Diseñador Gráfico - 2 años en MediaLab">
    `;
  experienceContainer.insertBefore(experienceItem, addExperienceButton);
});
