import { db, requireAuth } from '/Proyecto/Secciones/Auth/persistencia.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

// Referencia del DOM
const artworksContainer = document.getElementById("artworks-container");

// Función para cargar y mostrar obras
const loadArtworks = async () => {
    const user = await requireAuth(); // Verificar si el usuario está autenticado
    if (!user) {
        console.error("Usuario no autenticado.");
        artworksContainer.innerHTML = "<p>Por favor, inicia sesión para ver tus obras.</p>";
        return;
    }

    try {
        // Obtener el documento del usuario desde Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        // Validar si el documento existe y tiene datos
        if (!userDoc.exists()) {
            console.warn("No se encontraron datos para este usuario.");
            artworksContainer.innerHTML = "<p>No se encontraron obras registradas.</p>";
            return;
        }

        const artworks = userDoc.data()?.artworks || []; // Obtener las obras

        // Verificar si hay obras para mostrar
        if (artworks.length === 0) {
            artworksContainer.innerHTML = "<p>No se encontraron obras registradas.</p>";
            return;
        }

        // Renderizar las obras
        let artworksHtml = artworks.map(({ name, photo, place, creationDate }) => `
            <div class="artwork-box">
                <h4 class="artwork-title">${name}</h4>
                <img src="${photo}" alt="${name}" class="artwork-image">
                <p class="artwork-place">Lugar: ${place || "Desconocido"}</p>
                <p class="artwork-date">Fecha: ${creationDate || "No especificada"}</p>
            </div>
        `).join("");

        // Insertar las obras en el contenedor
        artworksContainer.innerHTML = artworksHtml;
    } catch (error) {
        console.error("Error al cargar las obras:", error);
        artworksContainer.innerHTML = "<p>Hubo un error al cargar las obras. Por favor, inténtalo nuevamente.</p>";
    }
};

// Inicializar la página al cargar
document.addEventListener("DOMContentLoaded", async () => {
    const user = await requireAuth();
    if (user) {
        loadArtworks(); // Cargar las obras si el usuario está autenticado
    } else {
        artworksContainer.innerHTML = "<p>Por favor, inicia sesión para ver tus obras.</p>";
    }
});
