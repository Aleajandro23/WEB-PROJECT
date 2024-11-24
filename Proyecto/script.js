const artists = [
    { name: "Streer_", image: "Imagenes/artist1.png", title: "3 Obras de Arte Guardadas" },
    { name: "Lara", image: "Imagenes/artist2.png", title: "Nueva Obra de Arte Guardada" },
    { name: "Vedic", image: "Imagenes/artist3.png", title: "2 Obras de Arte Guardadas" },
    { name: "Narie", image: "Imagenes/artist4.png", title: "5 Imágenes Guardadas" }
  ];

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
    { title: "#Metaverse", author: "By TheSalvare", image: "Imagenes/metaverse.jpg" },
    { title: "#Polly Doll", author: "By TheNative", image: "Imagenes/pollydoll.jpg" },
    { title: "#Alec Art", author: "By GeorgZvic", image: "Imagenes/alecart.jpg" },
    { title: "#Toxic Poeth", author: "By YazxiLup", image: "Imagenes/toxicpoeth.jpg" }
  ];

  const carousel = document.getElementById("carousel");
  const dotsContainer = document.getElementById("dots");
  const prevSlide = document.getElementById("prev-slide");
  const nextSlide = document.getElementById("next-slide");
  let currentSlide = 0;

  artworks.forEach((artwork, index) => {
    const card = document.createElement("div");
    card.classList.add("flex", "flex-col", "items-center", "w-full", "p-4", "flex-shrink-0");

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

    const dot = document.createElement("div");
    dot.classList.add("dot");
    if (index === 0) dot.classList.add("active");
    dot.dataset.index = index;
    dot.addEventListener("click", () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });

  const updateDots = () => {
    document.querySelectorAll(".dot").forEach((dot, index) => {
      dot.classList.toggle("active", index === currentSlide);
    });
  };

  const goToSlide = (index) => {
    currentSlide = index;
    const offset = -currentSlide * carousel.clientWidth;
    carousel.style.transform = `translateX(${offset}px)`;
    updateDots();
  };

  const next = () => currentSlide < artworks.length - 1 ? goToSlide(currentSlide + 1) : goToSlide(0);
  const prev = () => currentSlide > 0 ? goToSlide(currentSlide - 1) : goToSlide(artworks.length - 1);

  nextSlide.addEventListener("click", next);
  prevSlide.addEventListener("click", prev);

  window.addEventListener("resize", () => goToSlide(currentSlide));