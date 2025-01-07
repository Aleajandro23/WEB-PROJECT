import { auth, db } from '/Proyecto/Secciones/Auth/persistencia.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

let allArtworks = []; // Variable global para almacenar todas las obras

// Cargar todas las obras y categorías desde Firebase
const loadArtworksFromDB = async () => {
    const artworksContainer = document.getElementById('artworks-container');
    const categoryFilter = document.getElementById('category-filter');

    try {
        const usersCollection = collection(db, "users");
        const userDocs = await getDocs(usersCollection);

        allArtworks = []; // Reiniciar la lista global de obras
        const categories = new Set(); // Almacenar categorías únicas

        userDocs.forEach(doc => {
            const userData = doc.data();
            const artworks = userData.artworks || [];

            // Añadir información del usuario a cada obra
            artworks.forEach(artwork => {
                allArtworks.push({
                    ...artwork,
                    userPhoto: userData.profileImage || userData.photoURL, // Usar la foto de perfil del usuario
                    userName: userData.name || userData.displayName // Usar el nombre del usuario
                });
                if (artwork.category) {
                    categories.add(artwork.category);
                }
            });
        });

        // Actualizar el filtro de categorías
        categoryFilter.innerHTML = `<option value="all">Todas las categorías</option>`;
        categories.forEach(category => {
            categoryFilter.innerHTML += `<option value="${category}">${category}</option>`;
        });

        // Verificar si hay un filtro de categoría desde la URL
        const urlParams = new URLSearchParams(window.location.search);
        const initialCategory = urlParams.get('category');

        if (initialCategory && Array.from(categories).includes(initialCategory)) {
            categoryFilter.value = initialCategory; // Seleccionar la categoría de la URL
        }

        // Mostrar todas las obras inicialmente o aplicar el filtro de URL
        filterArtworks();
    } catch (error) {
        console.error("Error al cargar las obras: ", error);
        artworksContainer.innerHTML = "<p>Error al cargar las obras.</p>";
    }
};

// Mostrar las obras en el grid
const displayArtworks = (artworks) => {
    const artworksContainer = document.getElementById('artworks-container');
    artworksContainer.innerHTML = '';

    if (artworks.length === 0) {
        artworksContainer.innerHTML = "<p>No hay obras disponibles.</p>";
        return;
    }

    artworks.forEach((artwork) => {
        const artworkDiv = document.createElement('div');
        artworkDiv.className = 'relative rounded-2xl overflow-hidden h-48 card-hover';

        // Cada obra se convierte en un botón
        artworkDiv.innerHTML = `
            <button 
                class="w-full h-full focus:outline-none"
            >
                <img 
                    src="${artwork.photos && artwork.photos.length > 0 ? artwork.photos[0] : '/path/to/default-image.png'}" 
                    class="w-full h-full object-cover" 
                />
            </button>
        `;

        // Asignar evento de clic directamente al objeto artwork
        artworkDiv.querySelector('button').addEventListener('click', () => {
            handleArtworkClick(artwork);
        });

        artworksContainer.appendChild(artworkDiv);
    });
};

// Función para cerrar el modal
const closeModal = () => {
    const modal = document.querySelector('.modal'); // Buscar el modal por clase
    if (modal) {
        modal.remove(); // Eliminar el modal del DOM
    }
};

// Manejar el clic en una obra para abrir un modal con todas las imágenes
const handleArtworkClick = (artwork) => {
    if (!artwork || !artwork.photos || artwork.photos.length === 0) {
        alert("Esta obra no tiene imágenes para mostrar.");
        return;
    }

    // Crear modal dinámico para mostrar todas las imágenes
    const modal = document.createElement('div');
    modal.className = 'modal fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50';

    // Generar galería de imágenes en columna
    const imagesHtml = artwork.photos
        .map((photo) => `<img src="${photo}" class="w-full h-auto mb-4 rounded-lg"/>`)
        .join('');

    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full overflow-auto max-h-[90vh] relative">
            <!-- Sección superior con foto de perfil, título de la obra y nombre del usuario -->
            <div class="flex flex-col items-center mb-6">
                <h2 class="text-2xl font-bold mb-4 artwork-title text-black">${artwork.name || 'Sin título'}</h2>
                <div class="flex items-center">
                    <img 
                        src="${artwork.userPhoto || '/path/to/default-user-photo.png'}" 
                        class="w-16 h-16 rounded-full mr-4 object-cover" 
                        alt="Foto del usuario"
                    />
                    <h3 class="text-xl font-bold text-black">Por: ${artwork.userName || 'Usuario desconocido'}</h3>
                </div>
            </div>

            <!-- Contenedor principal de imágenes -->
            <div class="flex flex-col items-center mb-8">
                ${imagesHtml}
            </div>

            <!-- Footer con detalles -->
            <div class="mt-8 bg-[#1B3046] text-white p-6 rounded-lg">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Columna izquierda -->
                    <div class="space-y-3">
                        <p><span class="font-semibold">Categoría:</span> ${artwork.category || 'No especificada'}</p>
                        <p><span class="font-semibold">Lugar:</span> ${artwork.place || 'No especificado'}</p>
                        <p><span class="font-semibold">Fecha:</span> ${artwork.creationDate || 'No especificada'}</p>
                    </div>
                    <!-- Columna derecha -->
                    <div class="space-y-3">
                        <p><span class="font-semibold">Dimensiones:</span> ${artwork.dimensions || 'No especificadas'}</p>
                        <p><span class="font-semibold">Materiales:</span> ${artwork.material || 'No especificados'}</p>
                    </div>
                </div>
                
                <!-- Descripción en una nueva fila que ocupa todo el ancho -->
                <div class="mt-6">
                    <h4 class="font-semibold mb-2">Descripción:</h4>
                    <p>${artwork.description || 'Sin descripción disponible.'}</p>
                </div>
            </div>

            <!-- Botón para cerrar -->
            <button 
                class="absolute top-4 right-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                id="close-modal-button"
            >
                Cerrar
            </button>
        </div>
    `;

    document.body.appendChild(modal);

    // Agregar evento de clic al botón "Cerrar"
    const closeButton = document.getElementById('close-modal-button');
    closeButton.addEventListener('click', closeModal);
};

// Filtrar obras por categoría y búsqueda
const filterArtworks = () => {
    const category = document.getElementById('category-filter').value;
    const searchQuery = document.getElementById('search-bar').value.toLowerCase();

    const filteredArtworks = allArtworks.filter(artwork => {
        const matchesCategory = category === 'all' || artwork.category === category;
        const matchesSearch = artwork.name.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    displayArtworks(filteredArtworks);
};

// Eventos
document.addEventListener("DOMContentLoaded", () => {
    loadArtworksFromDB();

    // Event listeners para filtros
    document.getElementById('category-filter').addEventListener('change', filterArtworks);
    document.getElementById('search-bar').addEventListener('input', filterArtworks);
});
