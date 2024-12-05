

const artistList = document.getElementById("artist-list");

artists.forEach(artist => {
  const card = document.createElement("div");
  card.classList.add("flex", "items-center", "space-x-3");

  const avatar = document.createElement("img");
  avatar.src = artist.image;
  avatar.alt = artist.name;
  avatar.classList.add("w-8", "h-8", "rounded-full");

  const details = document.createElement("div");

  const nameContainer = document.createElement("div");
  nameContainer.classList.add("flex", "items-center", "space-x-1");

  const name = document.createElement("p");
  name.textContent = artist.name;
  name.classList.add("font-medium");

  const verifiedLogo = document.createElement("img");
  verifiedLogo.src = "Assets/verificado.png";
  verifiedLogo.alt = "Verificado";
  verifiedLogo.classList.add("w-4", "h-4");

  nameContainer.appendChild(name);
  nameContainer.appendChild(verifiedLogo);

  const title = document.createElement("p");
  title.textContent = artist.title;
  title.classList.add("text-gray-500", "text-sm");

  details.appendChild(nameContainer);
  details.appendChild(title);

  card.appendChild(avatar);
  card.appendChild(details);

  artistList.appendChild(card);
});

const artworks = [
  { title: "#Metaverse", author: "By TheSalvare", image: "Assets/metaverse.jpg" },
  { title: "#Polly Doll", author: "By TheNative", image: "Assets/pollyDoll.jpg" },
  { title: "#Alec Art", author: "By GeorgZvic", image: "Assets/AlecArt.jpg" },
  { title: "#Toxic Poeth", author: "By YazxiLup", image: "Assets/ToxicPoeth.png" },
  { title: "#Metaverse", author: "By TheSalvare", image: "Assets/metaverse.jpg" },
  { title: "#Polly Doll", author: "By TheNative", image: "Assets/pollyDoll.jpg" },
  { title: "#Alec Art", author: "By GeorgZvic", image: "Assets/AlecArt.jpg" },
  { title: "#Toxic Poeth", author: "By YazxiLup", image: "Assets/ToxicPoeth.png" }
  
];

const carousel = document.getElementById("carousel");
const dotsContainer = document.getElementById("dots");
const prevSlide = document.getElementById("prev-slide");
const nextSlide = document.getElementById("next-slide");

const itemsPerPage = 4; // Número de elementos visibles
const totalSlides = Math.ceil(artworks.length / itemsPerPage);
let currentSlide = 0;

// Crear los elementos del carrusel
artworks.forEach((artwork) => {
  const card = document.createElement("div");
  card.classList.add("flex", "flex-col", "items-center", "p-4");

  const img = document.createElement("img");
  img.src = artwork.image;
  img.alt = artwork.title;
  img.classList.add("w-full", "h-80", "rounded-lg", "object-cover");

  const title = document.createElement("h3");
  title.textContent = artwork.title;
  title.classList.add("font-bold", "text-lg", "mt-2");

  const author = document.createElement("p");
  author.textContent = artwork.author;
  author.classList.add("text-gray-600", "text-sm");

  card.appendChild(img);
  card.appendChild(title);
  card.appendChild(author);

  carousel.appendChild(card);
});

// Crear los puntos de navegación
for (let i = 0; i < totalSlides; i++) {
  const dot = document.createElement("div");
  dot.classList.add("dot");
  if (i === 0) dot.classList.add("active");
  dot.dataset.index = i;
  dot.addEventListener("click", () => goToSlide(i));
  dotsContainer.appendChild(dot);
}

// Actualizar los puntos activos
const updateDots = () => {
  document.querySelectorAll(".dot").forEach((dot, index) => {
    dot.classList.toggle("active", index === currentSlide);
  });
};

// Navegar al slide indicado
const goToSlide = (index) => {
  currentSlide = index;
  const offset = -currentSlide * 100; // Desplazamiento en porcentaje
  carousel.style.transform = `translateX(${offset}%)`;
  updateDots();
};

// Botones de navegación
const next = () => {
  if (currentSlide < totalSlides - 1) {
    goToSlide(currentSlide + 1);
  } else {
    goToSlide(0);
  }
};
const prev = () => {
  if (currentSlide > 0) {
    goToSlide(currentSlide - 1);
  } else {
    goToSlide(totalSlides - 1);
  }
};

nextSlide.addEventListener("click", next);
prevSlide.addEventListener("click", prev);

window.addEventListener("resize", () => goToSlide(currentSlide));
