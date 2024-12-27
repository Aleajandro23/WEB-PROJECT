import { obtenerObrasDeUsuarios } from './persistencia.js'; 

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const obras = await obtenerObrasDeUsuarios();
        const obrasGrid = document.getElementById("obras-grid");

        if (obras.length === 0) {
            obrasGrid.innerHTML = "<p>No hay obras disponibles.</p>";
            return;
        }

        // Creamos un fragmento de documento para agregar todas las obras
        const fragment = document.createDocumentFragment();

        obras.forEach(obra => {
            const obraElement = document.createElement('div');
            obraElement.classList.add('bg-white', 'rounded-lg', 'shadow-md', 'overflow-hidden', 'hover:shadow-xl', 'transition-shadow');
            
            // Creamos el HTML para cada obra
            obraElement.innerHTML = `
                <div class="relative">
                    <div class="aspect-w-4 aspect-h-3">
                        <img src="${obra.imagen}" alt="${obra.nombre}" class="object-cover w-full h-64">
                    </div>
                    <div class="absolute top-4 right-4">
                        <button class="bg-white p-2 rounded-full shadow-md hover:bg-gray-100">
                            <i class="fas fa-heart text-gray-400 hover:text-red-500"></i>
                        </button>
                    </div>
                </div>
                <div class="p-4">
                    <h3 class="text-xl font-semibold mb-2">${obra.nombre}</h3>
                    <div class="flex items-center space-x-2 mb-2">
                        <img src="${obra.autor.avatar}" alt="Autor" class="w-8 h-8 rounded-full">
                        <span class="text-sm text-gray-600">${obra.autor.nombre}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-500">${obra.categoria}</span>
                        <span class="text-sm text-gray-500">${obra.ubicacion}</span>
                    </div>
                </div>
            `;
            
            // Agregamos la obra al fragmento
            fragment.appendChild(obraElement);
        });

        // Una vez creado todo el contenido, lo insertamos en el DOM
        obrasGrid.appendChild(fragment);
    } catch (error) {
        console.error("Error al obtener las obras: ", error);
        alert("Hubo un problema al cargar las obras.");
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const obraButton = document.getElementById("obras-grid");
    if (obraButton) {
        obraButton.addEventListener("click", () => {
            console.log("Obra seleccionada");
        });
    } else {
        console.error("No se encontró el contenedor de obras");
    }
});
