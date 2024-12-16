import { auth, db, storage } from './profile-info.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-storage.js";

const projectsContainer = document.getElementById("projects-container");
const createPortfolioDiv = document.getElementById("create-portfolio");
const addArtworkDiv = document.getElementById("add-artwork");
const tabButtons = document.querySelectorAll(".tab-button");

// Tab functionality
const toggleActiveTab = (button) => tabButtons.forEach(btn => btn.classList.toggle('active', btn === button));
tabButtons.forEach(button => button.addEventListener('click', () => toggleActiveTab(button)));

// Show or hide sections
const toggleVisibility = (showProjects, showCreate, showAdd) => {
    projectsContainer.style.display = showProjects ? "grid" : "none";
    createPortfolioDiv.style.display = showCreate ? "block" : "none";
    addArtworkDiv.style.display = showAdd ? "block" : "none";
};

// Load portfolio
const loadPortfolio = async () => {
    const user = auth.currentUser;
    if (!user) return console.error("Usuario no autenticado.");

    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const portfolios = userDoc.exists() ? userDoc.data().portfolios || [] : [];

        projectsContainer.innerHTML = portfolios.flatMap(portfolio => 
            (portfolio.artworks || []).map(artwork => `
                <div class="project-box">
                    <h4 class="artwork-title">${artwork.name}</h4>
                    <div class="artwork-image-container">
                        <img src="${artwork.photo}" alt="${artwork.name}" class="artwork-image"/>
                    </div>
                </div>
            `)
        ).join("");

        toggleVisibility(portfolios.length > 0, portfolios.length === 0, portfolios.length > 0);
    } catch (error) {
        console.error("Error al cargar el portafolio: ", error);
        toggleVisibility(false, true, false);
    }
};

// Create new portfolio
const createPortfolio = async () => {
    const portfolioName = document.getElementById("portfolio-name").value.trim();
    const user = auth.currentUser;

    if (!portfolioName || !user) return alert("Por favor, ingrese el nombre del portafolio");

    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        const currentPortfolios = userDoc.exists() ? userDoc.data().portfolios || [] : [];

        currentPortfolios.some(p => p.name === portfolioName)
            ? alert("Ya existe un portafolio con este nombre")
            : await setDoc(userDocRef, { portfolios: [...currentPortfolios, { name: portfolioName, artworks: [] }] }, { merge: true })
              .then(() => {
                  alert("Portafolio creado con éxito");
                  toggleVisibility(false, false, true);
              });
    } catch (error) {
        console.error("Error al crear el portafolio: ", error);
        alert("Hubo un error al crear el portafolio");
    }
};

// Add artwork
const addArtwork = async () => {
    const [artworkName, artworkPhoto, artworkPlace,artworkDate] = [
        document.getElementById("artwork-name").value.trim(),
        document.getElementById("artwork-photo").files[0],
        document.getElementById("artwork-place").value.trim(),
        document.getElementById("artwork-date").value
    ];
    const user = auth.currentUser;

    if (![artworkName, artworkPhoto, artworkPlace, artworkDate, user].every(Boolean))
        return alert("Por favor, complete todos los campos de la obra");

    try {
        const photoUrl = await uploadBytes(ref(storage, `portfolios/${user.uid}/${artworkPhoto.name}`), artworkPhoto)
            .then(snapshot => getDownloadURL(snapshot.ref));

        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        const portfolios = userDoc.data().portfolios || [];

        const lastPortfolio = portfolios[portfolios.length - 1];
        if (!lastPortfolio) return alert("Primero debe crear un portafolio");

        lastPortfolio.artworks = [...(lastPortfolio.artworks || []), {
            name: artworkName, photo: photoUrl, place: artworkPlace, creationDate: artworkDate
        }];

        await setDoc(userDocRef, { portfolios }, { merge: true });
        alert("Obra añadida exitosamente");
        loadPortfolio();
    } catch (error) {
        console.error("Error al añadir la obra: ", error);
        alert("Hubo un error al añadir la obra");
    }
};

// Event listeners
document.getElementById("create-portfolio-btn").addEventListener("click", createPortfolio);
document.getElementById("add-artwork-btn").addEventListener("click", addArtwork);
auth.onAuthStateChanged(user => user ? loadPortfolio() : toggleVisibility(false, true, false));
