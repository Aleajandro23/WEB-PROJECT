import { auth, db, storage } from '/Proyecto/Secciones/Auth/persistencia.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-storage.js";

const projectsContainer = document.getElementById("projects-container");
const createPortfolioDiv = document.getElementById("create-portfolio");
const addArtworkDiv = document.getElementById("add-artwork");
const tabButtons = document.querySelectorAll(".tab-button");

// Toggle tab visibility and content
const toggleTab = (activeTab) => {
    // Hide all tab contents
    projectsContainer.innerHTML = '';
    createPortfolioDiv.style.display = 'none';
    addArtworkDiv.style.display = 'none';

    // Remove active class from all buttons
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    activeTab.classList.add('active');

    // Handle different tabs
    switch(activeTab.dataset.tab) {
        case 'obras':
            loadPortfolio();
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

// Cargar portafolio del usuario
const loadPortfolio = async () => {
    const user = auth.currentUser;
    if (!user) return console.error("Usuario no autenticado.");

    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const portfolios = userDoc.exists() ? userDoc.data().portfolios || [] : [];

        // Limpiar contenedores
        projectsContainer.innerHTML = '';

        // Renderizar cada portafolio como un grid separado
        portfolios.forEach((portfolio, portfolioIndex) => {
            // Crear contenedor para cada portafolio
            const portfolioContainer = document.createElement('div');
            portfolioContainer.classList.add('portfolio-container');
            
            // Nombre del portafolio
            const portfolioName = document.createElement('h2');
            portfolioName.classList.add('portfolio-name');
            portfolioName.textContent = portfolio.name;
            portfolioContainer.appendChild(portfolioName);

            // Grid de obras para este portafolio
            const portfolioGrid = document.createElement('div');
            portfolioGrid.classList.add('projects');

            // Renderizar obras del portafolio
            (portfolio.artworks || []).forEach(({ name, photo }) => {
                const projectBox = document.createElement('div');
                projectBox.classList.add('project-box');
                projectBox.innerHTML = `
                    <h4 class="artwork-title">${name}</h4>
                    <div class="artwork-image-container">
                        <img src="${photo}" alt="${name}" class="artwork-image">
                    </div>
                `;
                portfolioGrid.appendChild(projectBox);
            });

            // Botón para añadir obra a este portafolio específico
            const addArtworkBox = document.createElement('div');
            addArtworkBox.classList.add('project-box', 'add-project-box');
            addArtworkBox.innerHTML = '<i class="fas fa-plus"></i>';
            addArtworkBox.onclick = () => {
                // Establecer el índice del portafolio actual para la próxima obra
                window.currentPortfolioIndex = portfolioIndex;
                toggleVisibility(false, false, true);
            };
            portfolioGrid.appendChild(addArtworkBox);

            portfolioContainer.appendChild(portfolioGrid);
            projectsContainer.appendChild(portfolioContainer);
        });

        // Botón para crear nuevo portafolio
        const addPortfolioBox = document.createElement('div');
        addPortfolioBox.classList.add('project-box', 'add-project-box');
        addPortfolioBox.innerHTML = '<i class="fas fa-plus"></i>';
        addPortfolioBox.onclick = () => toggleVisibility(false, true, false);
        projectsContainer.appendChild(addPortfolioBox);

        // Mostrar/ocultar secciones
        projectsContainer.style.display = portfolios.length > 0 ? "grid" : "none";
        createPortfolioDiv.style.display = portfolios.length === 0 ? "block" : "none";
    } catch (error) {
        console.error("Error al cargar el portafolio: ", error);
        toggleVisibility(false, true, false);
    }
};

// Mostrar u ocultar secciones
const toggleVisibility = (showProjects, showCreate, showAdd) => {
    projectsContainer.style.display = showProjects ? "grid" : "none";
    createPortfolioDiv.style.display = showCreate ? "block" : "none";
    addArtworkDiv.style.display = showAdd ? "block" : "none";
};

// Crear un nuevo portafolio
const createPortfolio = async () => {
    const portfolioName = document.getElementById("portfolio-name").value.trim();
    const user = auth.currentUser;

    if (!portfolioName || !user) return alert("Por favor, ingrese el nombre del portafolio y asegúrese de estar autenticado.");

    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        const portfolios = userDoc.exists() ? userDoc.data().portfolios || [] : [];

        // Verificar duplicados
        if (portfolios.some(p => p.name.toLowerCase() === portfolioName.toLowerCase())) {
            alert("Ya existe un portafolio con este nombre.");
            return;
        }

        // Agregar nuevo portafolio
        portfolios.push({ name: portfolioName, artworks: [] });
        
        await setDoc(userDocRef, { portfolios }, { merge: true });
        alert("Portafolio creado con éxito.");
        
        // Recargar portafolio y cambiar a la pestaña de Obras
        document.querySelector('.tab-button[data-tab="obras"]').click();
    } catch (error) {
        console.error("Error al crear el portafolio:", error);
        alert("Hubo un error al crear el portafolio. Por favor, intente nuevamente.");
    }
};

// Añadir una obra al portafolio
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
            ref(storage, `portfolios/${user.uid}/${artworkPhoto.name}`), artworkPhoto
        ).then(snapshot => getDownloadURL(snapshot.ref));

        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        const portfolios = userDoc.data().portfolios || [];

        // Obtener el portafolio actual (usando el índice guardado globalmente)
        const currentPortfolioIndex = window.currentPortfolioIndex ?? (portfolios.length - 1);
        const currentPortfolio = portfolios[currentPortfolioIndex];

        if (!currentPortfolio) return alert("Primero debe crear un portafolio.");

        // Agregar obra al portafolio actual
        currentPortfolio.artworks = [...(currentPortfolio.artworks || []), {
            name: artworkName, photo: photoUrl, place: artworkPlace, creationDate: artworkDate
        }];

        await setDoc(userDocRef, { portfolios }, { merge: true });
        alert("Obra añadida exitosamente.");
        
        // Recargar portafolio y cambiar a la pestaña de Obras
        document.querySelector('.tab-button[data-tab="obras"]').click();
    } catch (error) {
        console.error("Error al añadir la obra:", error);
        alert("Hubo un error al añadir la obra.");
    }
};

// Eventos
document.getElementById("create-portfolio-btn").addEventListener("click", createPortfolio);
document.getElementById("add-artwork-btn").addEventListener("click", addArtwork);

// Suponiendo que tienes el método getCurrentUserId que devuelve el ID del usuario actual
auth.onAuthStateChanged(user => {
    if (user) {
        const userId = getCurrentUserId(); // Obtiene el ID del usuario actual
        load(userId); // Llama a la función load pasando el ID del usuario
        createPortfolio(userId); // Llama a la función createPortfolio pasando el ID del usuario
        document.querySelector('.tab-button[data-tab="obras"]').click(); // Hace clic en la pestaña de obras
    } else {
        toggleVisibility(false, true, false); // Si no hay usuario autenticado, oculta elementos
    }
});
