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

const shareTitle = "BEAUTY STYLIST — Peluquería & Barbería Unisex";
const shareDescription = "Peluquería y barbería unisex. Cortes, color, tratamientos y productos para cuidar tu estilo.";
const canonicalBaseUrl = (() => {
  const origin = window.location.origin;
  return origin && origin !== "null" ? origin : "https://example.com";
})();

const canonicalLink = document.querySelector('link[rel="canonical"]');
const shareUrl = `${canonicalBaseUrl}/`;

[
  ["og:url", "property", shareUrl],
  ["og:image", "property", `${canonicalBaseUrl}/assets/beauty-stylist-logo-current.jpg`],
  ["twitter:image", "name", `${canonicalBaseUrl}/assets/beauty-stylist-logo-current.jpg`],
].forEach(([propertyName, selectorType, content]) => {
  const selector = selectorType === "name"
    ? `meta[name="${propertyName}"]`
    : `meta[property="${propertyName}"]`;
  const tag = document.querySelector(selector);
  if (tag) tag.setAttribute("content", content);
});

if (canonicalLink) canonicalLink.setAttribute("href", shareUrl);

const shareButton = document.querySelector("#share-button");
let shareFeedbackTimer = null;

function setShareFeedback(message) {
  const currentText = shareButton.querySelector("span");
  const previousText = currentText.textContent;
  currentText.textContent = message;
  shareButton.setAttribute("aria-label", message);
  shareButton.title = message;

  clearTimeout(shareFeedbackTimer);
  shareFeedbackTimer = window.setTimeout(() => {
    currentText.textContent = previousText;
    shareButton.setAttribute("aria-label", "Compartir BEAUTY STYLIST");
    shareButton.title = "Compartir esta web";
  }, 1800);
}

async function sharePage() {
  const urlToShare = window.location.href && !window.location.href.startsWith("file:")
    ? window.location.href
    : shareUrl;

  const shareData = {
    title: shareTitle,
    text: shareDescription,
    url: urlToShare,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      setShareFeedback("Compartido");
      return;
    }
    throw new Error("Web Share API no disponible");
  } catch (error) {
    try {
      await navigator.clipboard.writeText(urlToShare);
      setShareFeedback("Enlace copiado");
      return;
    } catch (clipboardError) {
      const tempInput = document.createElement("textarea");
      tempInput.value = urlToShare;
      document.body.append(tempInput);
      tempInput.select();
      document.execCommand("copy");
      tempInput.remove();
      setShareFeedback("Enlace copiado");
    }
  }
}

if (shareButton) shareButton.addEventListener("click", sharePage);

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
