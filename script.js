const whatsappNumber = document
  .querySelector('meta[name="whatsapp-number"]')
  .content.replace(/\D/g, "");

document.querySelectorAll("[data-whatsapp]").forEach((link) => {
  const message = link.dataset.message;
  link.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
});

const searchInput = document.querySelector("#site-search");
const clearSearchButton = document.querySelector(".clear-search");
const searchStatus = document.querySelector(".search-status");
const searchableItems = [...document.querySelectorAll(".searchable-item")];
const filterButtons = [...document.querySelectorAll(".filter-button")];
let activeFilter = "todo";

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .trim();
}

function updateSearch() {
  const query = normalizeText(searchInput.value);
  let visibleCount = 0;

  searchableItems.forEach((item) => {
    const matchesQuery = normalizeText(
      `${item.dataset.search} ${item.textContent}`,
    ).includes(query);
    const matchesFilter =
      activeFilter === "todo" || item.dataset.kind === activeFilter;
    const isVisible = matchesQuery && matchesFilter;

    item.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  clearSearchButton.hidden = searchInput.value.length === 0;

  if (visibleCount === 0) {
    searchStatus.textContent = "No encontramos resultados. Probá con otra búsqueda.";
  } else if (query || activeFilter !== "todo") {
    const label = visibleCount === 1 ? "resultado" : "resultados";
    searchStatus.textContent = `${visibleCount} ${label}`;
  } else {
    searchStatus.textContent = `${visibleCount} opciones para explorar`;
  }
}

searchInput.addEventListener("input", updateSearch);

clearSearchButton.addEventListener("click", () => {
  searchInput.value = "";
  searchInput.focus();
  updateSearch();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("is-active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });
    updateSearch();
  });
});

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#main-nav");

function setMenuOpen(isOpen) {
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Cerrar menú" : "Abrir menú",
  );
  mainNav.classList.toggle("is-open", isOpen);
}

menuToggle.addEventListener("click", () => {
  setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
});

mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenuOpen(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenuOpen(false);
});

const locationNotice = document.querySelector("#location-notice");
locationNotice
  .querySelector(".location-notice-close")
  .addEventListener("click", () => {
    locationNotice.hidden = true;
  });

const presentationVideo = document.querySelector("#presentation-video");
const videoToggle = document.querySelector(".video-toggle");

function updateVideoToggle(isPlaying) {
  videoToggle.textContent = isPlaying ? "Pausar video" : "Reproducir video";
  videoToggle.setAttribute(
    "aria-label",
    `${isPlaying ? "Pausar" : "Reproducir"} video de presentación`,
  );
  videoToggle.setAttribute("aria-pressed", String(isPlaying));
}

presentationVideo.addEventListener("play", () => updateVideoToggle(true));
presentationVideo.addEventListener("pause", () => updateVideoToggle(false));
presentationVideo.addEventListener("volumechange", () => {
  if (!presentationVideo.muted) presentationVideo.muted = true;
});
presentationVideo.addEventListener("error", () => {
  document.querySelector("#video-fallback").hidden = false;
  videoToggle.hidden = true;
});

videoToggle.addEventListener("click", () => {
  if (presentationVideo.paused) {
    presentationVideo.muted = true;
    presentationVideo.play().catch(() => updateVideoToggle(false));
  } else {
    presentationVideo.pause();
  }
});

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  presentationVideo.muted = true;
  presentationVideo.play().catch(() => updateVideoToggle(false));
}

document.querySelector("#current-year").textContent = new Date().getFullYear();
updateSearch();
