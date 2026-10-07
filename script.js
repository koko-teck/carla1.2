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
  const urlToShare = window.location.href;

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
const videoToggle = document.querySelector("#video-toggle");
const videoLogo = document.querySelector(".result-video-logo");

function updateVideoToggle(isPlaying) {
  if (!videoToggle) return;
  videoToggle.textContent = isPlaying ? "Pausar" : "Reproducir";
  videoToggle.setAttribute(
    "aria-label",
    `${isPlaying ? "Pausar" : "Reproducir"} video de presentación`,
  );
  videoToggle.setAttribute("aria-pressed", String(isPlaying));
}

function showVideoLogo() {
  if (!presentationVideo || !videoLogo) return;
  presentationVideo.pause();
  presentationVideo.hidden = true;
  videoLogo.hidden = false;
  updateVideoToggle(false);
  if (videoToggle) videoToggle.textContent = "Ver de nuevo";
}

function replayVideo() {
  if (!presentationVideo || !videoLogo) return;
  videoLogo.hidden = true;
  presentationVideo.hidden = false;
  presentationVideo.currentTime = 0;
  presentationVideo.muted = true;
  presentationVideo.play().catch(() => updateVideoToggle(false));
}

if (presentationVideo) {
  presentationVideo.muted = true;
  presentationVideo.addEventListener("play", () => updateVideoToggle(true));
  presentationVideo.addEventListener("pause", () => updateVideoToggle(false));
  presentationVideo.addEventListener("volumechange", () => {
    if (!presentationVideo.muted) presentationVideo.muted = true;
  });
  presentationVideo.addEventListener("ended", showVideoLogo);
  presentationVideo.addEventListener("error", () => {
    showVideoLogo();
  });
}

videoToggle?.addEventListener("click", () => {
  if (!presentationVideo) return;
  if (presentationVideo.hidden) replayVideo();
  else if (presentationVideo.paused) {
    presentationVideo.muted = true;
    presentationVideo.play().catch(() => updateVideoToggle(false));
  } else {
    presentationVideo.pause();
  }
});

/* En ausencia de movimiento reducido, el video intenta arrancar solo al entrar
   en pantalla. En móviles modernos seguirá respetando muted + playsinline. */
if (presentationVideo && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  if (!("IntersectionObserver" in window)) {
    presentationVideo.play().catch(() => updateVideoToggle(false));
  }
}

document.querySelector("#current-year").textContent = new Date().getFullYear();
updateSearch();


/* ================================================================
   INTERACCIONES DE PRESENTACIÓN — sin cambiar contenido
   ================================================================ */

/* Estado activo de la sección visible para orientar al visitante. */
const navSectionMap = [
  { id: "servicios", link: 'a[href="#servicios"]' },
  { id: "resultados", link: 'a[href="#resultados"]' },
  { id: "productos", link: 'a[href="#productos"]' },
  { id: "contacto", link: 'a[href="#contacto"]' },
];

const navSectionEntries = navSectionMap
  .map(({ id, link }) => {
    const section = document.getElementById(id);
    const anchors = [...document.querySelectorAll(`.main-nav ${link}`)];
    return section && anchors.length ? { section, anchors } : null;
  })
  .filter(Boolean);

const setActiveNavigation = (activeId) => {
  navSectionEntries.forEach(({ section, anchors }) => {
    const isActive = section.id === activeId;
    anchors.forEach((anchor) => {
      anchor.classList.toggle("is-current", isActive);
      if (isActive) anchor.setAttribute("aria-current", "location");
      else anchor.removeAttribute("aria-current");
    });
  });
};

if ("IntersectionObserver" in window && navSectionEntries.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveNavigation(visible.target.id);
    },
    { rootMargin: "-25% 0px -55% 0px", threshold: [0.1, 0.35, 0.7] },
  );

  navSectionEntries.forEach(({ section }) => sectionObserver.observe(section));
}

/* Animaciones de entrada discretas: no afectan si el visitante reduce movimiento. */
const revealItems = [
  ...document.querySelectorAll(".service-card, .result-card, .product-card"),
];

document.documentElement.classList.add("reveal-ready");
revealItems.forEach((item, index) => {
  item.classList.add("reveal-item");
  item.style.transitionDelay = `${Math.min(index % 4, 3) * 45}ms`;
});

if (
  "IntersectionObserver" in window &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
  );
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

/* Barra de progreso del recorrido para que siempre se sepa dónde se está. */
let progressTick = false;
const updateScrollProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  document.documentElement.style.setProperty(
    "--scroll-progress",
    Math.min(1, Math.max(0, progress)).toFixed(4),
  );
  progressTick = false;
};

window.addEventListener(
  "scroll",
  () => {
    if (progressTick) return;
    progressTick = true;
    window.requestAnimationFrame(updateScrollProgress);
  },
  { passive: true },
);
updateScrollProgress();

/* Video integrado en Resultados: se activa al entrar en viewport. */
if (presentationVideo && "IntersectionObserver" in window) {
  const videoViewportObserver = new IntersectionObserver(
    (entries, observer) => {
      const [entry] = entries;
      if (!entry) return;
      if (entry.isIntersecting && !presentationVideo.hidden) {
        presentationVideo.muted = true;
        presentationVideo.play().catch(() => updateVideoToggle(false));
        observer.disconnect();
      }
    },
    { threshold: 0.25 },
  );
  videoViewportObserver.observe(presentationVideo);
}

/* ================================================================
   BUSCADOR LATERAL — nueva interfaz para la misma búsqueda existente
   ================================================================ */
const sideSearch = document.querySelector('#side-search');
const sideSearchTrigger = document.querySelector('#side-search-trigger');
const sideSearchClose = document.querySelector('#side-search-close');
const searchScrim = document.querySelector('#search-scrim');
const sideSearchInput = document.querySelector('#side-search-input');
const sideSearchStatus = document.querySelector('#side-search-status');
const sideFilterButtons = [...document.querySelectorAll('.side-filter')];

function updateSideSearchStatus() {
  if (!sideSearchStatus || !searchInput || !searchStatus) return;
  sideSearchStatus.textContent = searchStatus.textContent || 'Explorá servicios y productos.';
}

function setSideFilter(filter) {
  const target = filterButtons.find((button) => button.dataset.filter === filter);
  if (target) target.click();
  sideFilterButtons.forEach((button) => {
    const active = button.dataset.filter === filter;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  updateSideSearchStatus();
}

function syncSideSearchFromMain() {
  if (!sideSearchInput || !searchInput) return;
  if (document.activeElement !== sideSearchInput) sideSearchInput.value = searchInput.value;
  updateSideSearchStatus();
}

function openSideSearch() {
  if (!sideSearch) return;
  sideSearch.classList.add('is-open');
  searchScrim?.classList.add('is-open');
  sideSearch.setAttribute('aria-hidden', 'false');
  sideSearchTrigger?.setAttribute('aria-expanded', 'true');
  window.setTimeout(() => sideSearchInput?.focus(), 80);
  syncSideSearchFromMain();
}

function closeSideSearch() {
  if (!sideSearch) return;
  sideSearch.classList.remove('is-open');
  searchScrim?.classList.remove('is-open');
  sideSearch.setAttribute('aria-hidden', 'true');
  sideSearchTrigger?.setAttribute('aria-expanded', 'false');
}

sideSearchTrigger?.addEventListener('click', () => {
  const open = sideSearch?.classList.contains('is-open');
  if (open) closeSideSearch(); else openSideSearch();
});
sideSearchClose?.addEventListener('click', closeSideSearch);
searchScrim?.addEventListener('click', closeSideSearch);

const sideSearchLinks = sideSearch?.querySelectorAll('.side-search-links a');
sideSearchLinks?.forEach((link) => link.addEventListener('click', closeSideSearch));

sideSearchInput?.addEventListener('input', () => {
  searchInput.value = sideSearchInput.value;
  updateSearch();
  updateSideSearchStatus();
});
sideFilterButtons.forEach((button) => button.addEventListener('click', () => setSideFilter(button.dataset.filter)));
searchInput?.addEventListener('input', syncSideSearchFromMain);
filterButtons.forEach((button) => button.addEventListener('click', () => {
  sideFilterButtons.forEach((sideButton) => {
    const active = sideButton.dataset.filter === button.dataset.filter;
    sideButton.classList.toggle('is-active', active);
    sideButton.setAttribute('aria-pressed', String(active));
  });
  updateSideSearchStatus();
}));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeSideSearch();
});
