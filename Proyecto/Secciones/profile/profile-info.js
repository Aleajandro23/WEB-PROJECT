import { auth, db, storage } from '/Proyecto/Secciones/Auth/persistencia.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-storage.js";

// Utilidades puras
const safeGetElement = id => document.getElementById(id);
const safeGetValue = id => safeGetElement(id)?.value || '';
const safeTrim = str => str?.trim() || '';
const safeQuerySelector = (element, selector) => element?.querySelector(selector);
const safeQuerySelectorAll = (element, selector) => Array.from(element?.querySelectorAll(selector) || []);

// Funciones puras para manipulación de datos
const createSocialLinks = networks => 
  networks.reduce((acc, network) => {
    const url = safeTrim(safeGetValue(`form-${network}`));
    return url ? { ...acc, [network]: url } : acc;
  }, {});

const createExperienceItem = item => {
  const titleInput = safeQuerySelector(item, '.job-title-input');
  const companyInput = safeQuerySelector(item, '.company-name-input');
  return titleInput && companyInput ? {
    jobTitle: safeTrim(titleInput.value),
    companyName: safeTrim(companyInput.value)
  } : null;
};

const getFormExperience = () => 
  safeQuerySelectorAll(document, '.experience-item')
    .map(createExperienceItem)
    .filter(exp => exp?.jobTitle && exp?.companyName);

const createFormData = currentUser => ({
  name: safeTrim(safeGetValue('form-name')),
  title: safeTrim(safeGetValue('form-title')),
  location: safeTrim(safeGetValue('form-location')),
  projectType: safeTrim(safeGetValue('form-project-type')),
  availability: safeTrim(safeGetValue('form-availability')),
  bio: safeTrim(safeGetValue('form-bio')),
  socialLinks: createSocialLinks(['linkedin', 'instagram', 'twitter']),
  experience: getFormExperience(),
  memberSince: currentUser?.memberSince || new Date().toISOString()
});

// Funciones para manipular el DOM
const createExperienceHTML = ({ jobTitle = '', companyName = '' } = {}) => `
  <div class="experience-item">
    <input type="text" class="job-title-input" value="${jobTitle}" placeholder="Título del puesto">
    <input type="text" class="company-name-input" value="${companyName}" placeholder="Nombre de la empresa">
    <button type="button" class="remove-experience">×</button>
  </div>
`;

const createSocialLinkHTML = (network, url) => `
  <a href="${url}" class="social-link">
    <i class="fab fa-${network}"></i> ${network.charAt(0).toUpperCase() + network.slice(1)}
  </a>
`;

// Manejadores de eventos puros
const handleModalClose = modal => () => modal.style.display = 'none';

const handleWindowClick = modal => ({ target }) => 
  target === modal && (modal.style.display = 'none');

const handleAddExperience = () => {
  const container = safeGetElement('form-experience-container');
  container && (container.insertAdjacentHTML('beforeend', createExperienceHTML()));
};

const handleRemoveExperience = element => () => element.remove();

// Función principal del Profile Manager
const initializeProfileManager = () => {
  const state = {
    modal: safeGetElement('profile-form-modal'),
    form: safeGetElement('profile-form'),
    currentUser: null
  };

  // Funciones asíncronas para interactuar con Firebase
  const uploadProfileImage = async (file, userId) => {
    const storageRef = ref(storage, `profiles/profile_${userId}_${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const displayUserData = userData => {
    const {
      profileImage, name, title, location, projectType,
      availability, socialLinks, experience, memberSince
    } = userData;

    // Actualizar elementos básicos
    safeGetElement('profile-image').src = profileImage || state.currentUser?.photoURL || '';
    safeGetElement('profile-name').textContent = name || state.currentUser?.displayName || '';
    safeGetElement('profile-title').textContent = title || '';
    safeGetElement('profile-location').textContent = location || '';
    safeGetElement('project-type').textContent = projectType || '';
    safeGetElement('project-availability').textContent = `Disponibilidad: ${availability || ''}`;
    safeGetElement('bio-text').textContent = userData.bio || '';

    // Actualizar redes sociales
    const socialLinksContainer = safeGetElement('social-links');
    socialLinksContainer && (socialLinksContainer.innerHTML = 
      '<h3 class="section-title">Redes Sociales</h3>' +
      Object.entries(socialLinks || {})
        .filter(([, url]) => url)
        .map(([network, url]) => createSocialLinkHTML(network, url))
        .join('')
    );

    // Actualizar experiencia
    const workExperienceContainer = safeGetElement('work-experience');
    workExperienceContainer && (workExperienceContainer.innerHTML = 
      '<h3 class="section-title">Experiencia de Trabajo</h3>' +
      (experience || []).map(exp => `
        <div class="experience-item">
          <div class="job-title">${exp.jobTitle}</div>
          <div class="company-name">${exp.companyName}</div>
        </div>
      `).join('')
    );

    // Actualizar fecha de membresía
    const memberDate = new Date(memberSince || Date.now());
    safeGetElement('member-since').textContent = `Miembro desde ${
      memberDate.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    }`;
  };

  const loadProfile = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', state.currentUser.uid));
      userDoc.exists() ? displayUserData(userDoc.data()) : showProfileForm();
    } catch (error) {
      console.error('Error al cargar el perfil:', error);
      alert('Error al cargar el perfil');
    }
  };

  const showProfileForm = async () => {
    if (!state.currentUser) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', state.currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        // Pre-llenar formulario
        ['name', 'title', 'location', 'project-type', 'availability', 'bio'].forEach(field => 
          safeGetElement(`form-${field}`).value = data[field] || ''
        );

        // Pre-llenar redes sociales
        Object.entries(data.socialLinks || {}).forEach(([network, url]) => 
          safeGetElement(`form-${network}`).value = url || ''
        );

        // Pre-llenar experiencia
        const container = safeGetElement('form-experience-container');
        container && (container.innerHTML = 
          (data.experience || []).map(createExperienceHTML).join('')
        );
      }
    } catch (error) {
      console.error('Error al cargar datos del formulario:', error);
    }

    state.modal.style.display = 'block';
  };

  const handleFormSubmit = async event => {
    event.preventDefault();
    
    try {
      const formData = createFormData(state.currentUser);
      
      const imageFile = safeGetElement('form-profile-image')?.files[0];
      imageFile && (formData.profileImage = 
        await uploadProfileImage(imageFile, state.currentUser.uid));

      await setDoc(doc(db, 'users', state.currentUser.uid), formData);
      state.modal.style.display = 'none';
      await loadProfile();
    } catch (error) {
      console.error('Error al guardar el perfil:', error);
      alert(error.message || 'Error al guardar los datos');
    }
  };

  // Inicialización y configuración de eventos
  const setupEventListeners = () => {
    safeGetElement('edit-profile-btn')?.addEventListener('click', showProfileForm);
    safeGetElement('add-experience-btn')?.addEventListener('click', handleAddExperience);
    state.form?.addEventListener('submit', handleFormSubmit);
    document.querySelector('.close')?.addEventListener('click', handleModalClose(state.modal));
    window.addEventListener('click', handleWindowClick(state.modal));

    // Configurar eventos para remover experiencia
    const setupRemoveExperienceListeners = () => {
      safeQuerySelectorAll(document, '.remove-experience').forEach(button => 
        button.addEventListener('click', handleRemoveExperience(button.closest('.experience-item')))
      );
    };

    // Observador de mutaciones para mantener los listeners de experiencia actualizados
    const observer = new MutationObserver(setupRemoveExperienceListeners);
    const experienceContainer = safeGetElement('form-experience-container');
    experienceContainer && observer.observe(experienceContainer, { childList: true });
  };

  // Inicializar autenticación
  auth.onAuthStateChanged(user => {
    state.currentUser = user;
    user ? loadProfile() : (window.location.href = '/login.html');
  });

  setupEventListeners();
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeProfileManager);