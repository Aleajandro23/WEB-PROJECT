import { auth, db, storage } from './profile-info.js';
import { doc, getDoc, setDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-storage.js";

// DOM Elements
const projectsContainer = document.getElementById("projects-container");
const createPortfolioDiv = document.getElementById("create-portfolio");
const addArtworkDiv = document.getElementById("add-artwork");
const tabButtons = document.querySelectorAll(".tab-button");

// Tab functionality
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    });
});

// Load portfolio
async function loadPortfolio() {
    const user = auth.currentUser;
    if (!user) {
        console.error("Usuario no autenticado.");
        return;
    }

    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        // Check if portfolios exist
        if (userDoc.exists() && userDoc.data().portfolios && userDoc.data().portfolios.length > 0) {
            const portfolios = userDoc.data().portfolios;
            
            // Clear existing projects
            projectsContainer.innerHTML = "";
            
            // Render all artworks from all portfolios
            portfolios.forEach(portfolio => {
                if (portfolio.artworks && portfolio.artworks.length > 0) {
                    portfolio.artworks.forEach(artwork => { // Verificar la URL de la imagen
                        const artworkDiv = document.createElement("div");
                        artworkDiv.className = "project-box";
                        artworkDiv.innerHTML = `
                            
                                <h4 class="artwork-title">${artwork.name}</h4>
                                <div class="artwork-image-container">
                                    <img src="${artwork.photo}" alt="${artwork.name}" class="artwork-image"/>
                                </div>
                         
                        `;
                        projectsContainer.appendChild(artworkDiv);
                    });
                    
                }
            });
            
            // Show projects, hide create portfolio
            projectsContainer.style.display = "grid";
            createPortfolioDiv.style.display = "none";
            addArtworkDiv.style.display = "block";
        } else {
            // No portfolios exist
            showCreatePortfolio();
        }
    } catch (error) {
        console.error("Error al cargar el portafolio: ", error);
        showCreatePortfolio();
    }
}

// Show create portfolio form
function showCreatePortfolio() {
    projectsContainer.style.display = "none";
    createPortfolioDiv.style.display = "block";
    addArtworkDiv.style.display = "none";
}

// Create new portfolio
document.getElementById("create-portfolio-btn").addEventListener("click", async () => {
    const portfolioName = document.getElementById("portfolio-name").value.trim();
    const user = auth.currentUser;

    if (portfolioName && user) {
        try {
            const userDocRef = doc(db, "users", user.uid);
            
            // Get current user document
            const userDoc = await getDoc(userDocRef);
            const currentPortfolios = userDoc.exists() ? userDoc.data().portfolios || [] : [];

            // Check if portfolio name already exists
            if (currentPortfolios.some(p => p.name === portfolioName)) {
                alert("Ya existe un portafolio con este nombre");
                return;
            }

            // Add new portfolio
            currentPortfolios.push({
                name: portfolioName,
                artworks: []
            });

            // Update Firestore
            await setDoc(userDocRef, {
                portfolios: currentPortfolios
            }, { merge: true });

            alert("Portafolio creado con éxito");
            
            // Show artwork addition form
            projectsContainer.style.display = "none";
            createPortfolioDiv.style.display = "none";
            addArtworkDiv.style.display = "block";

        } catch (error) {
            console.error("Error al crear el portafolio: ", error);
            alert("Hubo un error al crear el portafolio");
        }
    } else {
        alert("Por favor, ingrese el nombre del portafolio");
    }
});

// Add artwork
document.getElementById("add-artwork-btn").addEventListener("click", async () => {
    const artworkName = document.getElementById("artwork-name").value.trim();
    const artworkPhoto = document.getElementById("artwork-photo").files[0];
    const artworkPlace = document.getElementById("artwork-place").value.trim();
    const artworkYear = document.getElementById("artwork-year").value;
    const artworkDate = document.getElementById("artwork-date").value;

    const user = auth.currentUser;

    if (artworkName && artworkPhoto && artworkPlace && artworkYear && artworkDate && user) {
        try {
            // Upload photo to storage
            const storageRef = ref(storage, `portfolios/${user.uid}/${artworkPhoto.name}`);
            const snapshot = await uploadBytes(storageRef, artworkPhoto);
            const photoUrl = await getDownloadURL(snapshot.ref);

            // Get user document
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            const portfolios = userDoc.data().portfolios || [];

            // Find the last created portfolio (most recently added)
            const lastPortfolio = portfolios[portfolios.length - 1];

            if (!lastPortfolio) {
                alert("Primero debe crear un portafolio");
                return;
            }

            // Add artwork to the last portfolio
            lastPortfolio.artworks = lastPortfolio.artworks || [];
            lastPortfolio.artworks.push({
                name: artworkName,
                photo: photoUrl,
                place: artworkPlace,
                year: artworkYear,
                creationDate: artworkDate
            });

            // Update Firestore
            await setDoc(userDocRef, { portfolios }, { merge: true });

            alert("Obra añadida exitosamente");
            
            // Reload portfolio
            loadPortfolio();

        } catch (error) {
            console.error("Error al añadir la obra: ", error);
            alert("Hubo un error al añadir la obra");
        }
    } else {
        alert("Por favor, complete todos los campos de la obra");
    }
});

// Initialize portfolio on auth state change
auth.onAuthStateChanged((user) => {
    if (user) {
        loadPortfolio();
    } else {
        showCreatePortfolio();
    }
});