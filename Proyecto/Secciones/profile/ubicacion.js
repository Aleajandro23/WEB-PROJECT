let map, marker;

// Función para cargar la API de Google Maps dinámicamente
function loadGoogleMapsAPI(callbackName) {
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDRreK2FH3XT0zmKPlTtxdvCafBvqF4JpA&callback=${callbackName}&v=weekly`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

// Inicializar el mapa
async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");

  // Obtener la ubicación del usuario o una ubicación predeterminada
  const defaultLocation = await getUserLocation();

  // Configuración del mapa
  map = new Map(document.getElementById("map"), {
    center: defaultLocation,
    zoom: 8,
  });

  // Añadir un marcador inicial
  marker = new google.maps.Marker({
    position: defaultLocation,
    map: map,
    draggable: true,
  });

  // Actualizar el campo de ubicación al mover el marcador
  marker.addListener("dragend", () => {
    const position = marker.getPosition();
    document.getElementById("artwork-place").value =
      position.lat().toFixed(6) + ", " + position.lng().toFixed(6);
  });

  // Permitir seleccionar una nueva ubicación haciendo clic en el mapa
  map.addListener("click", (event) => {
    marker.setPosition(event.latLng);
    document.getElementById("artwork-place").value =
      event.latLng.lat().toFixed(6) + ", " + event.latLng.lng().toFixed(6);
  });
}

// Función para obtener la ubicación del usuario
async function getUserLocation() {
  return new Promise((resolve) => {
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
          resolve({ lat: -3.9936, lng: -79.2043 }); // Coordenadas de Loja, Ecuador
        }
      );
    } else {
      resolve({ lat: -3.9936, lng: -79.2043 }); // Coordenadas de Loja, Ecuador
    }
  });
}

// Cargar la API de Google Maps y luego inicializar el mapa
loadGoogleMapsAPI("initMap");
window.initMap = initMap;
