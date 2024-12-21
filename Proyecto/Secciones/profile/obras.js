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
        artworksGrid.classList.add('projects');

        // Renderizar obras
        artworks.forEach(({ name, photo, place, creationDate }) => {
            const projectBox = document.createElement('div');
            projectBox.classList.add('project-box');
            projectBox.innerHTML = `
                <h4 class="artwork-title">${name}</h4>
                <div class="artwork-image-container">
                    <img src="${photo}" alt="${name}" class="artwork-image">
                </div>
                <div class="artwork-details">
                    <p>Lugar: ${place}</p>
                    <p>Fecha: ${creationDate}</p>
                </div>
            `;
            artworksGrid.appendChild(projectBox);
        });

        // Botón para añadir obra
        const addArtworkBox = document.createElement('div');
        addArtworkBox.classList.add('project-box', 'add-project-box');
        addArtworkBox.innerHTML = '<i class="fas fa-plus"></i>';
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
    const [artworkName, artworkPhoto, artworkPlace, artworkDate] = [
        document.getElementById("artwork-name").value.trim(),
        document.getElementById("artwork-photo").files[0],
        document.getElementById("artwork-place").value.trim(),
        document.getElementById("artwork-date").value
    ];
    const user = auth.currentUser;

    if (![artworkName, artworkPhoto, artworkPlace, artworkDate, user].every(Boolean))
        return alert("Por favor, complete todos los campos de la obra.");

    try {
        const photoUrl = await uploadBytes(
            ref(storage, `artworks/${user.uid}/${artworkPhoto.name}`), artworkPhoto
        ).then(snapshot => getDownloadURL(snapshot.ref));

        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        const artworks = userDoc.exists() ? userDoc.data().artworks || [] : [];

        // Agregar nueva obra
        artworks.push({
            name: artworkName,
            photo: photoUrl,
            place: artworkPlace,
            creationDate: artworkDate
        });

        await setDoc(userDocRef, { artworks }, { merge: true });
        alert("Obra añadida exitosamente.");
        
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