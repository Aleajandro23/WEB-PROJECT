import { auth, db } from '/Proyecto/Secciones/Auth/persistencia.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.createElement('div');
    overlay.id = 'artwork-overlay';
    
    const modal = document.createElement('div');
    modal.id = 'artwork-modal';
    
    const closeButton = document.createElement('button');
    closeButton.id = 'modal-close';
    closeButton.innerHTML = '×';

    modal.appendChild(closeButton);
    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    document.body.addEventListener('click', async (event) => {
        const artworkBox = event.target.closest('.project-box');
        if (artworkBox && artworkBox.id.startsWith('artwork-box')) {
            try {
                const user = auth.currentUser;
                if (!user) {
                    console.error("Usuario no autenticado");
                    return;
                }

                const userDoc = await getDoc(doc(db, "users", user.uid));
                const userData = userDoc.data();
                const artworks = userData?.artworks || [];
                const index = artworkBox.id.split('-')[2];
                const artwork = artworks[index];

                if (!artwork) {
                    console.error("Obra no encontrada");
                    return;
                }

                const modalContent = document.createElement('div');
                modalContent.className = 'modal-content';

                const header = document.createElement('div');
                header.className = 'modal-header';

                const profileImg = document.createElement('img');
                profileImg.src = userData.profileImage || '/default-profile.jpg';
                profileImg.className = 'profile-image';

                const headerText = document.createElement('div');
                headerText.className = 'header-text';
                headerText.innerHTML = `
                    <h2 class="artwork-title">${artwork.name}</h2>
                    <p class="artist-name">por ${userData.name || 'Artista'}</p>
                `;

                header.appendChild(profileImg);
                header.appendChild(headerText);

                const gallery = document.createElement('div');
                gallery.className = 'modal-gallery';

                if (artwork.photos && artwork.photos.length > 0) {
                    artwork.photos.forEach(photo => {
                        const imageContainer = document.createElement('div');
                        imageContainer.className = 'gallery-image';
                        
                        const img = document.createElement('img');
                        img.src = photo;
                        img.alt = artwork.name;
                        
                        imageContainer.appendChild(img);
                        gallery.appendChild(imageContainer);
                    });
                }

                const details = document.createElement('div');
                details.className = 'artwork-details';
                details.innerHTML = `
                    <div class="details-item"><strong>Categoría:</strong> ${artwork.category}</div>
                    <div class="details-item"><strong>Lugar:</strong> ${artwork.place}</div>
                    <div class="details-item"><strong>Fecha:</strong> ${artwork.creationDate}</div>
                    <div class="details-item"><strong>Dimensiones:</strong> ${artwork.dimensions || 'No especificado'}</div>
                    <div class="details-item"><strong>Materiales:</strong> ${artwork.material || 'No especificado'}</div>
                    <div class="details-item">${artwork.description || ''}</div>
                `;

                // Crear contenedor del mapa
                const mapContainer = document.createElement('div');
                mapContainer.className = 'map-container';
                const mapDiv = document.createElement('div');
                mapDiv.id = 'map';
                mapContainer.appendChild(mapDiv);

                modalContent.appendChild(header);
                modalContent.appendChild(gallery);
                modalContent.appendChild(details);
                modalContent.appendChild(mapContainer);

                modal.innerHTML = '';
                modal.appendChild(closeButton);
                modal.appendChild(modalContent);

                modal.classList.add('active');
                overlay.classList.add('active');

                // Extraer las coordenadas del string de ubicación
                const coordinates = artwork.place.split(',').map(coord => parseFloat(coord.trim()));
                const location = {
                    lat: coordinates[0],
                    lng: coordinates[1]
                };

                // Cargar y inicializar el mapa
                await loadGoogleMapsAPI('initModalMap');
                window.initModalMap = async function() {
                    const { Map } = await google.maps.importLibrary("maps");
                    const map = new Map(mapDiv, {
                        center: location,
                        zoom: 15,
                        mapTypeId: 'hybrid',
                        mapTypeControl: true,
                        mapTypeControlOptions: {
                            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                            position: google.maps.ControlPosition.TOP_RIGHT
                        },
                        zoomControl: true,
                        zoomControlOptions: {
                            position: google.maps.ControlPosition.RIGHT_CENTER
                        },
                        scaleControl: true,
                        streetViewControl: true,
                        streetViewControlOptions: {
                            position: google.maps.ControlPosition.RIGHT_CENTER
                        },
                        fullscreenControl: true
                    });

                    // Añadir marcador
                    new google.maps.Marker({
                        position: location,
                        map: map,
                        title: artwork.name,
                        animation: google.maps.Animation.DROP
                    });
                };

            } catch (error) {
                console.error("Error al cargar la obra:", error);
            }
        }
    });

    const closeModal = () => {
        modal.classList.remove('active');
        overlay.classList.remove('active');
    };

    closeButton.onclick = closeModal;
    overlay.onclick = closeModal;

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
});

// Función para cargar la API de Google Maps
function loadGoogleMapsAPI(callbackName) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDRreK2FH3XT0zmKPlTtxdvCafBvqF4JpA&callback=${callbackName}&v=weekly`;
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}