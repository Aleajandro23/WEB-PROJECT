import { auth, db, storage } from '/Proyecto/Secciones/Auth/persistencia.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-storage.js";

class ProfileManager {
  constructor() {
    this.modal = document.getElementById('profile-form-modal');
    this.form = document.getElementById('profile-form');
    this.currentUser = null;
    this.init();
  }

  init() {
    auth.onAuthStateChanged(user => {
      if (user) {
        this.currentUser = user;
        this.loadProfile();
      } else {
        window.location.href = '/login.html';
      }
    });

    this.setupEventListeners();
  }

  async loadProfile() {
    try {
      const userDoc = await getDoc(doc(db, 'users', this.currentUser.uid));
      if (userDoc.exists()) {
        this.displayUserData(userDoc.data());
      } else {
        this.showProfileForm();
      }
    } catch (error) {
      console.error('Error al cargar el perfil:', error);
      alert('Error al cargar el perfil');
    }
  }

  displayUserData({ profileImage, name, title, location, projectType, availability, socialLinks, experience, bio, memberSince }) {
    // Actualizar los elementos existentes
    document.getElementById('profile-image').src = profileImage || this.currentUser.photoURL || '';
    document.getElementById('profile-name').textContent = name || this.currentUser.displayName || '';
    document.getElementById('profile-title').textContent = title || '';
    document.getElementById('profile-location').textContent = location || '';
    document.getElementById('project-type').textContent = projectType || '';
    document.getElementById('project-availability').textContent = `Disponibilidad: ${availability || ''}`;
    document.getElementById('bio-text').textContent = bio || '';

    // Actualizar redes sociales
    const socialLinksContainer = document.getElementById('social-links');
    socialLinksContainer.innerHTML = '<h3 class="section-title">Redes Sociales</h3>';
    socialLinks && Object.entries(socialLinks).forEach(([network, url]) => {
      if (url) {
        socialLinksContainer.insertAdjacentHTML(
          'beforeend',
          `<a href="${url}" class="social-link">
            <i class="fab fa-${network}"></i> ${network.charAt(0).toUpperCase() + network.slice(1)}
          </a>`
        );
      }
    });

    // Actualizar experiencia laboral
    const workExperienceContainer = document.getElementById('work-experience');
    workExperienceContainer.innerHTML = '<h3 class="section-title">Experiencia de Trabajo</h3>';
    experience?.forEach(({ jobTitle, companyName }) => {
      workExperienceContainer.insertAdjacentHTML(
        'beforeend',
        `<div class="experience-item">
          <div class="job-title">${jobTitle}</div>
          <div class="company-name">${companyName}</div>
        </div>`
      );
    });

    // Actualizar fecha de membresía
    const memberDate = new Date(memberSince || Date.now());
    document.getElementById('member-since').textContent = `Miembro desde ${memberDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })}`;
  }

  showProfileForm() {
    // Pre-llenar el formulario si hay datos existentes
    if (this.currentUser) {
      getDoc(doc(db, 'users', this.currentUser.uid)).then(userDoc => {
        if (userDoc.exists()) {
          const data = userDoc.data();
          document.getElementById('form-name').value = data.name || this.currentUser.displayName || '';
          document.getElementById('form-title').value = data.title || '';
          document.getElementById('form-location').value = data.location || '';
          document.getElementById('form-project-type').value = data.projectType || '';
          document.getElementById('form-availability').value = data.availability || '';
          document.getElementById('form-bio').value = data.bio || '';
          
          // Pre-llenar redes sociales
          Object.entries(data.socialLinks || {}).forEach(([network, url]) => {
            document.getElementById(`form-${network}`).value = url;
          });

          // Pre-llenar experiencia
          const container = document.getElementById('form-experience-container');
          container.innerHTML = '';
          data.experience?.forEach(({ jobTitle, companyName }) => {
            container.insertAdjacentHTML(
              'beforeend',
              `<div class="experience-item">
                <input type="text" class="job-title-input" value="${jobTitle}" placeholder="Título del puesto">
                <input type="text" class="company-name-input" value="${companyName}" placeholder="Nombre de la empresa">
                <button type="button" class="remove-experience">×</button>
              </div>`
            );
          });
          
          // Configurar eventos para los botones de eliminar experiencia
          container.querySelectorAll('.remove-experience').forEach(button => {
            button.onclick = () => button.closest('.experience-item').remove();
          });
        }
      });
    }

    this.modal.style.display = 'block';
  }

  async handleFormSubmit(event) {
    event.preventDefault();

    try {
      const formData = { 
        ...this.getFormData(), 
        memberSince: this.currentUser?.memberSince || new Date().toISOString() 
      };

      const imageFile = document.getElementById('form-profile-image').files[0];
      if (imageFile) {
        formData.profileImage = await this.uploadProfileImage(imageFile);
      }

      await setDoc(doc(db, 'users', this.currentUser.uid), formData);
      this.modal.style.display = 'none';
      this.loadProfile();
    } catch (error) {
      console.error('Error al guardar el perfil:', error);
      alert('Error al guardar los datos');
    }
  }

  getFormData() {
    const experience = Array.from(document.querySelectorAll('.experience-item'))
      .map(item => ({
        jobTitle: item.querySelector('.job-title-input').value,
        companyName: item.querySelector('.company-name-input').value
      }))
      .filter(({ jobTitle, companyName }) => jobTitle && companyName);

    return {
      name: document.getElementById('form-name').value,
      title: document.getElementById('form-title').value,
      location: document.getElementById('form-location').value,
      projectType: document.getElementById('form-project-type').value,
      availability: document.getElementById('form-availability').value,
      socialLinks: ['linkedin', 'instagram', 'twitter'].reduce((links, network) => {
        const url = document.getElementById(`form-${network}`).value;
        return url ? { ...links, [network]: url } : links;
      }, {}),
      experience,
      bio: document.getElementById('form-bio').value
    };
  }

  async uploadProfileImage(file) {
    const storageRef = ref(storage, `profiles/profile_${this.currentUser.uid}_${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }

  setupEventListeners() {
    // Botón de editar perfil
    document.getElementById('edit-profile-btn')?.addEventListener('click', () => this.showProfileForm());
    
    // Botones del modal
    document.querySelector('.close')?.addEventListener('click', () => this.modal.style.display = 'none');
    window.addEventListener('click', ({ target }) => {
      if (target === this.modal) {
        this.modal.style.display = 'none';
      }
    });

    // Botón de agregar experiencia
    document.getElementById('add-experience-btn')?.addEventListener('click', () => {
      const container = document.getElementById('form-experience-container');
      container.insertAdjacentHTML(
        'beforeend',
        `<div class="experience-item">
          <input type="text" class="job-title-input" placeholder="Título del puesto">
          <input type="text" class="company-name-input" placeholder="Nombre de la empresa">
          <button type="button" class="remove-experience">×</button>
        </div>`
      );
      container.lastElementChild.querySelector('.remove-experience')
        .addEventListener('click', () => container.lastElementChild.remove());
    });

    // Submit del formulario
    this.form?.addEventListener('submit', e => this.handleFormSubmit(e));
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => new ProfileManager());