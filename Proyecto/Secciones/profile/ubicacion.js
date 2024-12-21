let map, marker;

async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");

  // Intentar obtener la ubicación del usuario
  const defaultLocation = await getUserLocation();

  // Configuración inicial del mapa
  map = new Map(document.getElementById("map"), {
    center: defaultLocation,
    zoom: 8,
  });

  // Añadir un marcador inicial
  marker = new google.maps.Marker({
    position: defaultLocation,
    map: map,
    draggable: true, // Hacer que el marcador sea movible
  });

  // Actualizar el campo "Lugar" cuando se mueva el marcador
  marker.addListener("dragend", () => {
    const position = marker.getPosition();
    document.getElementById("artwork-place").value =
      position.lat().toFixed(6) + ", " + position.lng().toFixed(6);
  });

  // Permitir al usuario seleccionar la ubicación haciendo clic en el mapa
  map.addListener("click", (event) => {
    marker.setPosition(event.latLng);
    document.getElementById("artwork-place").value =
      event.latLng.lat().toFixed(6) + ", " + event.latLng.lng().toFixed(6);
  });
}

// Función para obtener la ubicación del usuario
async function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          resolve(userLocation);
        },
        () => {
          // Si no se puede obtener la ubicación del usuario, se usa Loja, Ecuador
          resolve({ lat: -3.9936, lng: -79.2043 }); // Coordenadas de Loja, Ecuador
        }
      );
    } else {
      // Si la geolocalización no está disponible, se usa Loja, Ecuador
      resolve({ lat: -3.9936, lng: -79.2043 });
    }
  });
}

// Llamar a la inicialización del mapa
initMap();
