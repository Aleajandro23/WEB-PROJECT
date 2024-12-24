import { auth, db, storage } from '/Proyecto/Secciones/Auth/persistencia.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-storage.js";

// Pure utility functions with pipeline operators
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);
const safeGet = fn => x => x ? fn(x) : null;
const safeGetElement = safeGet(id => document.getElementById(id));
const safeGetValue = pipe(safeGetElement, el => el?.value?.trim() || '');
const safeQuerySelector = selector => safeGet(el => el.querySelector(selector));
const safeQuerySelectorAll = selector => el => Array.from(el?.querySelectorAll(selector) || []);

// Data transformation functions
const createSocialLinks = networks => 
  networks.reduce((acc, network) => {
    const url = safeGetValue(`form-${network}`);
    return url ? { ...acc, [network]: url } : acc;
  }, {});

const createExperienceItem = pipe(
  item => ({
    title: safeQuerySelector('.job-title-input')(item)?.value?.trim(),
    company: safeQuerySelector('.company-name-input')(item)?.value?.trim()
  }),
  ({ title, company }) => title && company ? { jobTitle: title, companyName: company } : null
);

const getFormExperience = pipe(
  () => document,
  safeQuerySelectorAll('.experience-item'),
  items => items.map(createExperienceItem).filter(Boolean)
);

const createFormData = currentUser => ({
  name: safeGetValue('form-name'),
  title: safeGetValue('form-title'),
  location: safeGetValue('form-location'),
  phone: safeGetValue('form-phone'),
  availability: safeGetValue('form-availability'),
  bio: safeGetValue('form-bio'),
  socialLinks: createSocialLinks(['linkedin', 'instagram', 'twitter']),
  experience: getFormExperience(),
  memberSince: currentUser?.memberSince || new Date().toISOString()
});

// Pure template functions
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

// Event handlers as pure functions
const handleModalClose = modal => () => modal.style.display = 'none';
const handleWindowClick = modal => ({ target }) => 
  target === modal && (modal.style.display = 'none');

const handleAddExperience = container => () => 
  container?.insertAdjacentHTML('beforeend', createExperienceHTML());

const handleRemoveExperience = element => () => element.remove();

// Firebase interactions as pure functions
const uploadProfileImage = async (file, userId) => {
  const storageRef = ref(storage, `profiles/profile_${userId}_${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

const displayUserData = (userData, currentUser) => {
  const updateElement = (id, value) => 
    safeGetElement(id) && (safeGetElement(id).textContent = value);

  const updateImage = (id, src) =>
    safeGetElement(id) && (safeGetElement(id).src = src);

  updateImage('profile-image', userData.profileImage || currentUser?.photoURL || '');
  updateElement('profile-name', userData.name || currentUser?.displayName || '');
  updateElement('profile-title', userData.title || '');
  updateElement('profile-location', userData.location || '');
  updateElement('project-type', 'Contacto');
  updateElement('project-availability', userData.availability || '');
  updateElement('bio-text', userData.bio || '');

  const whatsappButton = safeGetElement('whatsapp-button');
  userData.phone && whatsappButton?.addEventListener('click', () => 
    window.open(`https://wa.me/${userData.phone.replace(/\D/g, '')}`, '_blank'));

  const updateContainer = (id, content) => {
    const container = safeGetElement(id);
    container && (container.innerHTML = content);
  };

  // Update social links
  updateContainer('social-links',
    '<h3 class="section-title">Redes Sociales</h3>' +
    Object.entries(userData.socialLinks || {})
      .filter(([, url]) => url)
      .map(([network, url]) => createSocialLinkHTML(network, url))
      .join('')
  );

  // Update experience
  updateContainer('work-experience',
    '<h3 class="section-title">Experiencia de Trabajo</h3>' +
    (userData.experience || [])
      .map(exp => `
        <div class="experience-item">
          <div class="job-title">${exp.jobTitle}</div>
          <div class="company-name">${exp.companyName}</div>
        </div>
      `)
      .join('')
  );

  // Update member since
  const memberDate = new Date(userData.memberSince || Date.now());
  updateElement('member-since', 
    `Miembro desde ${memberDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })}`
  );
};

const initializeProfileManager = () => {
  const state = {
    modal: safeGetElement('profile-form-modal'),
    form: safeGetElement('profile-form'),
    currentUser: null
  };

  const loadProfile = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', state.currentUser.uid));
      userDoc.exists() 
        ? displayUserData(userDoc.data(), state.currentUser)
        : showProfileForm();
    } catch (error) {
      console.error('Error al cargar el perfil:', error);
      alert('Error al cargar el perfil');
    }
  };

  const showProfileForm = async () => {
    if (!state.currentUser) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', state.currentUser.uid));
      const data = userDoc.exists() ? userDoc.data() : {};
      
      ['name', 'title', 'location', 'phone', 'availability', 'bio']
        .forEach(field => safeGetElement(`form-${field}`).value = data[field] || '');

      Object.entries(data.socialLinks || {})
        .forEach(([network, url]) => safeGetElement(`form-${network}`).value = url || '');

      const container = safeGetElement('form-experience-container');
      container && (container.innerHTML = 
        (data.experience || []).map(createExperienceHTML).join(''));
    } catch (error) {
      console.error('Error al cargar datos del formulario:', error);
    }

    state.modal.style.display = 'block';
  };

  const handleFormSubmit = async event => {
    event.preventDefault();
    try {
      const userDoc = await getDoc(doc(db, 'users', state.currentUser.uid));
      const currentData = userDoc.exists() ? userDoc.data() : {};
      const formData = createFormData(state.currentUser);
      
      const updatedData = {
        ...currentData,
        ...formData,
        ...(safeGetElement('form-profile-image')?.files[0] && {
          profileImage: await uploadProfileImage(
            safeGetElement('form-profile-image').files[0],
            state.currentUser.uid
          )
        })
      };

      await setDoc(doc(db, 'users', state.currentUser.uid), updatedData);
      state.modal.style.display = 'none';
      await loadProfile();
    } catch (error) {
      console.error('Error al guardar el perfil:', error);
      alert(error.message || 'Error al guardar los datos');
    }
  };

  const setupEventListeners = () => {
    safeGetElement('edit-profile-btn')?.addEventListener('click', showProfileForm);
    safeGetElement('add-experience-btn')?.addEventListener('click', 
      handleAddExperience(safeGetElement('form-experience-container')));
    state.form?.addEventListener('submit', handleFormSubmit);
    document.querySelector('.close')?.addEventListener('click', handleModalClose(state.modal));
    window.addEventListener('click', handleWindowClick(state.modal));

    const setupRemoveExperienceListeners = () => {
      safeQuerySelectorAll('.remove-experience')(document)
        .forEach(button => button.addEventListener('click', 
          handleRemoveExperience(button.closest('.experience-item'))));
    };

    const experienceContainer = safeGetElement('form-experience-container');
    experienceContainer && new MutationObserver(setupRemoveExperienceListeners)
      .observe(experienceContainer, { childList: true });
  };

  auth.onAuthStateChanged(user => {
    state.currentUser = user;
    user ? loadProfile() : (window.location.href = '/login.html');
  });

  setupEventListeners();
};

document.addEventListener('DOMContentLoaded', initializeProfileManager);

// Tab buttons
document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab-button')
      .forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
  });
});