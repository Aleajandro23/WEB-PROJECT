import { auth, db, storage } from './profile-info.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-storage.js";

const projectsContainer = document.getElementById("projects-container");
const createPortfolioDiv = document.getElementById("create-portfolio");
const addArtworkDiv = document.getElementById("add-artwork");
const tabButtons = document.querySelectorAll(".tab-button");
const contO = document.querySelector(".cont-o");

// Cambiar la pestaña activa
const toggleActiveTab = (button) => 
    tabButtons.forEach(btn => btn.classList.toggle('active', btn === button));

tabButtons.forEach(button => 
    button.addEventListener('click', () => toggleActiveTab(button)));

// Mostrar u ocultar secciones
const toggleVisibility = (showProjects, showCreate, showAdd) => {
    projectsContainer.style.display = showProjects ? "grid" : "none";
    createPortfolioDiv.style.display = showCreate ? "block" : "none";
    addArtworkDiv.style.display = showAdd ? "block" : "none";
};

// Cargar portafolio del usuario
const loadPortfolio = async () => {
    const user = auth.currentUser;
    if (!user) return console.error("Usuario no autenticado.");

    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const portfolios = userDoc.exists() ? userDoc.data().portfolios || [] : [];

        // Limpiar contenedores
        projectsContainer.innerHTML = '';
        contO.innerHTML = '';

        // Mostrar nombre del último portafolio
        portfolios.length > 0 
            ? contO.appendChild(
                Object.assign(document.createElement('div'), {
                    className: 'portfolio-name',
                    textContent: portfolios.at(-1).name
                })
            )
            : null;

        // Renderizar proyectos dinámicamente
        portfolios.forEach(portfolio => 
            (portfolio.artworks || []).forEach(({ name, photo }) => 
                projectsContainer.appendChild(
                    Object.assign(document.createElement('div'), {
                        className: 'project-box',
                        innerHTML: `
                            <h4 class="artwork-title">${name}</h4>
                            <div class="artwork-image-container">
                                <img src="${photo}" alt="${name}" class="artwork-image">
                            </div>`
                    })
                )
            )
        );

        // Botón para añadir obra
        projectsContainer.appendChild(
            Object.assign(document.createElement('div'), {
                className: 'project-box add-project-box',
                innerHTML: '<i class="fas fa-plus"></i>',
                onclick: () => toggleVisibility(false, false, true)
            })
        );

        // Mostrar/ocultar secciones
        toggleVisibility(portfolios.length > 0, portfolios.length === 0, false);
    } catch (error) {
        console.error("Error al cargar el portafolio: ", error);
        toggleVisibility(false, true, false);
    }
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
        portfolios.some(p => p.name.toLowerCase() === portfolioName.toLowerCase())
            ? alert("Ya existe un portafolio con este nombre.")
            : (await setDoc(userDocRef, {
                portfolios: [...portfolios, { name: portfolioName, artworks: [] }]
            }, { merge: true }),
            alert("Portafolio creado con éxito."),
            loadPortfolio());
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

        // Agregar obra al último portafolio
        const lastPortfolio = portfolios.at(-1);
        if (!lastPortfolio) return alert("Primero debe crear un portafolio.");

        lastPortfolio.artworks = [...(lastPortfolio.artworks || []), {
            name: artworkName, photo: photoUrl, place: artworkPlace, creationDate: artworkDate
        }];

        await setDoc(userDocRef, { portfolios }, { merge: true });
        alert("Obra añadida exitosamente.");
        loadPortfolio();
    } catch (error) {
        console.error("Error al añadir la obra:", error);
        alert("Hubo un error al añadir la obra.");
    }
};

// Eventos
document.getElementById("create-portfolio-btn").addEventListener("click", createPortfolio);
document.getElementById("add-artwork-btn").addEventListener("click", addArtwork);
auth.onAuthStateChanged(user => user ? loadPortfolio() : toggleVisibility(false, true, false));
