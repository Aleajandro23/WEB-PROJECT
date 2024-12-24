import { auth, db, storage } from '/Proyecto/Secciones/Auth/persistencia.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-storage.js";

const initializeSlideProEditor = () => {
  const DEFAULT_IMAGE_URL = '/path/to/your/default-banner.jpg'; // Reemplaza esta URL con la de tu imagen por defecto

  // Utility functions
  const createEditButton = () => {
    const button = document.createElement('button');
    button.className = 'edit-slide-button';
    button.innerHTML = '<i class="fa-solid fa-pencil"></i> Editar';
    return button;
  };

  const createFileInput = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    input.id = 'slide-pro-input';
    return input;
  };

  const uploadSlideImage = async (file, userId) => {
    const storageRef = ref(storage, `slides/slide_${userId}_${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const updateUserSlideImage = async (userId, imageUrl) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      slideProImage: imageUrl
    });
  };

  const loadExistingSlideImage = async (slideProDiv, userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const imageUrl = userDoc.exists() ? userDoc.data().slideProImage : null;
      slideProDiv.style.backgroundImage = `url('${imageUrl || DEFAULT_IMAGE_URL}')`;
    } catch (error) {
      console.error('Error al cargar la imagen:', error);
      slideProDiv.style.backgroundImage = `url('${DEFAULT_IMAGE_URL}')`;
    }
  };

  const setupSlideProEditor = () => {
    const slideProDiv = document.querySelector('.slide-pro');
    if (!slideProDiv) return;

    // Set initial styles and default image
    slideProDiv.style.cssText = `
    width: 100%;
    height: 23vh;
    background-image: url('${DEFAULT_IMAGE_URL}');
    background-size: cover;
    background-position: center;
    transition: background-image 0.3s ease;
    display: flex;
    justify-content: flex-end;
    align-items: flex-start;
    padding: 10px;
    box-sizing: border-box;
  `;

    // Create and append edit button
    const editButton = createEditButton();
    editButton.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 8px 16px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      transition: background-color 0.3s;
      z-index: 10;
    `;
    slideProDiv.appendChild(editButton);

    // Create and append file input
    const fileInput = createFileInput();
    slideProDiv.appendChild(fileInput);

    // Add hover effect to button
    editButton.addEventListener('mouseenter', () => {
      editButton.style.backgroundColor = '#0056b3';
    });
    editButton.addEventListener('mouseleave', () => {
      editButton.style.backgroundColor = '#007bff';
    });

    // Handle image upload
    const handleImageUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        const loadingIndicator = document.createElement('div');
        loadingIndicator.textContent = 'Subiendo imagen...';
        loadingIndicator.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 10px 20px;
          border-radius: 4px;
          z-index: 20;
        `;
        slideProDiv.appendChild(loadingIndicator);

        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error('Usuario no autenticado');

        const imageUrl = await uploadSlideImage(file, userId);
        await updateUserSlideImage(userId, imageUrl);
        
        slideProDiv.style.backgroundImage = `url('${imageUrl}')`;
        loadingIndicator.remove();
      } catch (error) {
        console.error('Error al subir la imagen:', error);
        alert('Error al subir la imagen. Por favor, intenta de nuevo.');
      }
    };

    // Add event listeners
    editButton.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleImageUpload);

    // Load existing image if available, otherwise keep default
    auth.onAuthStateChanged(user => {
      user && loadExistingSlideImage(slideProDiv, user.uid);
    });
  };

  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', setupSlideProEditor);
};

// Start the initialization
initializeSlideProEditor();