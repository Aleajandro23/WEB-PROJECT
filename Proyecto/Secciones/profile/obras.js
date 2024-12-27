import { auth, db, storage } from '/Proyecto/Secciones/Auth/persistencia.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-storage.js";

const projectsContainer = document.getElementById("projects-container");
const addArtworkDiv = document.getElementById("add-artwork");
const tabButtons = document.querySelectorAll(".tab-button");

// Toggle tab visibility and content
const toggleTab = (activeTab) => {
    // Hide all tab contents
    projectsContainer.innerHTML = '';
    addArtworkDiv.style.display = 'none';

    // Remove active class from all buttons
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    activeTab.classList.add('active');

    // Handle different tabs
    switch(activeTab.dataset.tab) {
        case 'obras':
            loadArtworks();
            break;
        case 'servicios':
            projectsContainer.innerHTML = '<p>Servicios content coming soon...</p>';
            break;
        case 'me-encanta':
            projectsContainer.innerHTML = '<p>Me Encanta content coming soon...</p>';
            break;
    }
};

// Add event listeners to tab buttons
tabButtons.forEach(button => 
    button.addEventListener('click', () => toggleTab(button))
);

// Cargar obras del usuario
const loadArtworks = async () => {
    const user = auth.currentUser;
    if (!user) return console.error("Usuario no autenticado.");

    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const artworks = userDoc.exists() ? userDoc.data().artworks || [] : [];

        // Limpiar contenedor
        projectsContainer.innerHTML = '';

        // Grid de obras
        const artworksGrid = document.createElement('div');
        artworksGrid.setAttribute('id', 'artworks-grid');
        artworksGrid.classList.add('projects');

        // Renderizar obras
        artworks.forEach((artwork, index) => {
            const projectBox = document.createElement('div');
            projectBox.setAttribute('id', `artwork-box-${index}`);
            projectBox.classList.add('project-box');
            projectBox.innerHTML = `
                <h4 id="artwork-title-${index}" class="artwork-title">${artwork.name}</h4>
                <div id="artwork-image-container-${index}" class="artwork-image-container">
                    <!-- Usar artwork.photos[0] para mostrar solo la primera foto -->
                    <img src="${artwork.photos && artwork.photos.length > 0 ? artwork.photos[0] : ''}" alt="${artwork.name}" class="artwork-image">
                </div>
                
                <div id="artwork-details-${index}" class="artwork-details">
                    <p id="artwork-category-display-${index}">Categoría: ${artwork.category}</p>
                    <p id="artwork-place-display-${index}">Lugar: ${artwork.place}</p>
                    <p id="artwork-date-display-${index}">Fecha: ${artwork.creationDate}</p>
                    <p id="artwork-dimensions-display-${index}">Dimensiones: ${artwork.dimensions || 'No especificado'}</p>
                    <p id="artwork-material-display-${index}">Materiales: ${artwork.material || 'No especificado'}</p>
                    <div id="artwork-description-display-${index}" class="artwork-description">
                        ${artwork.description || 'Sin descripción'}
                    </div>
                </div>
            `;
            artworksGrid.appendChild(projectBox);
        });
        

        // Botón para añadir obra
        const addArtworkBox = document.createElement('div');
        addArtworkBox.setAttribute('id', 'add-artwork-box');
        addArtworkBox.classList.add('project-box', 'add-project-box');
        addArtworkBox.innerHTML = `<img src="Assets/icons/añadirobras.svg" alt="Añadir Obras" />`;
        addArtworkBox.onclick = () => toggleVisibility(false, true);
        artworksGrid.appendChild(addArtworkBox);

        projectsContainer.appendChild(artworksGrid);
        projectsContainer.style.display = "block";

    } catch (error) {
        console.error("Error al cargar las obras: ", error);
        toggleVisibility(false, true);
    }
};

// Mostrar u ocultar secciones
const toggleVisibility = (showProjects, showAdd) => {
    projectsContainer.style.display = showProjects ? "block" : "none";
    addArtworkDiv.style.display = showAdd ? "block" : "none";
};

// Añadir una obra
const addArtwork = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Usuario no autenticado.");

    const formFields = {
        name: document.getElementById("artwork-name").value.trim(),
        photos: document.getElementById("artwork-photo").files,  // Ahora es una colección de archivos
        place: document.getElementById("artwork-place").value.trim(),
        creationDate: document.getElementById("artwork-date").value,
        category: document.getElementById("artwork-category").value,
        description: document.getElementById("artwork-description").value.trim(),
        dimensions: document.getElementById("artwork-dimensions").value.trim(),
        material: document.getElementById("artwork-material").value.trim()
    };

    // Validar campos requeridos
    if (!formFields.name || formFields.photos.length === 0 || !formFields.place || !formFields.creationDate || !formFields.category) {
        return alert("Por favor, complete todos los campos obligatorios.");
    }

    try {
        // Subir todas las imágenes seleccionadas
        const photoUrls = [];
        for (const file of formFields.photos) {
            const fileRef = ref(storage, `artworks/${user.uid}/${file.name}`);
            const snapshot = await uploadBytes(fileRef, file);
            const photoUrl = await getDownloadURL(snapshot.ref);
            photoUrls.push(photoUrl);
        }

        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        const artworks = userDoc.exists() ? userDoc.data().artworks || [] : [];

        // Agregar nueva obra con todos los campos
        artworks.push({
            name: formFields.name,
            photos: photoUrls,  // Usar un array de URLs de fotos
            place: formFields.place,
            creationDate: formFields.creationDate,
            category: formFields.category,
            description: formFields.description,
            dimensions: formFields.dimensions,
            material: formFields.material
        });

        await setDoc(userDocRef, { artworks }, { merge: true });
        alert("Obra añadida exitosamente.");
        
        // Limpiar formulario
        document.getElementById("artwork-name").value = "";
        document.getElementById("artwork-photo").value = "";
        document.getElementById("artwork-place").value = "";
        document.getElementById("artwork-date").value = "";
        document.getElementById("artwork-category").selectedIndex = 0;
        document.getElementById("artwork-description").value = "";
        document.getElementById("artwork-dimensions").value = "";
        document.getElementById("artwork-material").value = "";
        
        // Recargar obras y cambiar a la pestaña de Obras
        document.querySelector('.tab-button[data-tab="obras"]').click();
    } catch (error) {
        console.error("Error al añadir la obra:", error);
        alert("Hubo un error al añadir la obra.");
    }
};

// Eventos
document.getElementById("add-artwork-btn").addEventListener("click", addArtwork);

// Inicialización
auth.onAuthStateChanged(user => {
    if (user) {
        document.querySelector('.tab-button[data-tab="obras"]').click();
    } else {
        toggleVisibility(false, true);
    }
});

// Asegúrate de que la función 'obtenerObrasDeUsuarios' esté definida en este archivo o importada correctamente

document.addEventListener("DOMContentLoaded", async () => {
    // Llamamos a la función que obtiene las obras de los usuarios
    const obras = await obtenerObrasDeUsuarios();

    // Seleccionamos el contenedor donde se mostrarán las obras
    const obrasGrid = document.getElementById("obras-grid");

    // Verificamos si hay obras disponibles
    if (obras.length === 0) {
        obrasGrid.innerHTML = "<p>No hay obras disponibles.</p>";
        return;
    }

    // Recorremos las obras y las mostramos
    obras.forEach(obra => {
        const obraElement = document.createElement('div');
        obraElement.classList.add('bg-white', 'rounded-lg', 'shadow-md', 'overflow-hidden', 'hover:shadow-xl', 'transition-shadow');
        
        // Creamos el HTML para cada obra
        obraElement.innerHTML = `
            <div class="relative">
                <div class="aspect-w-4 aspect-h-3">
                    <img src="${obra.imagen}" alt="${obra.nombre}" class="object-cover w-full h-64">
                </div>
                <div class="absolute top-4 right-4">
                    <button class="bg-white p-2 rounded-full shadow-md hover:bg-gray-100">
                        <i class="fas fa-heart text-gray-400 hover:text-red-500"></i>
                    </button>
                </div>
            </div>
            <div class="p-4">
                <h3 class="text-xl font-semibold mb-2">${obra.nombre}</h3>
                <div class="flex items-center space-x-2 mb-2">
                    <img src="${obra.autor.avatar}" alt="Autor" class="w-8 h-8 rounded-full">
                    <span class="text-sm text-gray-600">${obra.autor.nombre}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">${obra.categoria}</span>
                    <span class="text-sm text-gray-500">${obra.ubicacion}</span>
                </div>
            </div>
        `;

        // Agregamos la obra al contenedor
        obrasGrid.appendChild(obraElement);
    });
});