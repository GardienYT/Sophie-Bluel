/************ DATA & HELPERS (autonome) ************/
// cache global pour éviter de refetch les works à chaque fois
let globalWorks = null;

// récupère la liste des projets (avec cache)
async function getWorks() {
  if (!globalWorks) {
    try {
      const response = await fetch("http://localhost:5678/api/works");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      globalWorks = await response.json();
      console.log("Works fetched:", globalWorks);
    } catch (error) {
      console.error("Failed to fetch works:", error.message);
      globalWorks = []; // évite que ça casse si erreur
    }
  }
  return globalWorks;
}

// affiche la galerie principale avec la liste fournie (ou tout si non fournie)
async function displayFilteredWorks(list = null) {
  const galleryElement = document.querySelector(".gallery");
  if (!galleryElement) return;
  galleryElement.innerHTML = "";

  const works = list ?? (await getWorks());

  for (let travail of works) {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const caption = document.createElement("figcaption");

    img.src = travail.imageUrl;
    img.alt = travail.title || "Projet";
    caption.innerText = travail.title || "";

    figure.appendChild(img);
    figure.appendChild(caption);
    galleryElement.appendChild(figure);
  }
}

/************ MODALES (galerie/admin) ************/
// refs globales pour les modales / inputs
let modal = null;
const focusableSelector = "button, a, input, textarea";
let focusables = [];
let lastFocusedElement = null;

const modalContent = document.getElementById("modalContent"); // optionnel selon ton HTML
const modalGallery = document.querySelector(".modalGallery");
const modalPortfolio = document.querySelector(".modalPortfolio");
const modalAddWorks = document.querySelector(".modalAddWorks");

const inputFile = document.querySelector("#file");
const previewImage = document.getElementById("previewImage");

let isModalSetup = false;

// init modales (une seule fois au chargement)
function setupModalOnce() {
  if (!isModalSetup) {
    setupModalButtons();
    const editWorksButton = document.getElementById("edit-works");
    if (editWorksButton) {
      editWorksButton.addEventListener("click", openModal);
      editWorksButton.setAttribute("data-modal-initialized", "true");
    }
    isModalSetup = true;
  }
}
document.addEventListener("DOMContentLoaded", setupModalOnce);

// ouvre la modale “galerie” (avec focus + accessibilité)
const openModal = function (e) {
  e.preventDefault();
  modal = document.getElementById("modalGallery");
  if (!modal) return;

  lastFocusedElement = document.activeElement;
  focusables = Array.from(modal.querySelectorAll(focusableSelector));
  if (focusables.length) focusables[0].focus();

  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");
  modal.setAttribute("aria-modal", "true");

  document.addEventListener("keydown", handleKeyDown);

  const closeModalButton = modal.querySelector(".js-modal-close");
  if (closeModalButton) closeModalButton.addEventListener("click", closeModal);

  modal.addEventListener("click", closeModal);
  modal.querySelector(".modal-wrapper").addEventListener("click", stopPropagation);
};

// ferme la modale proprement
const closeModal = function (e) {
  if (e && e.preventDefault) e.preventDefault();
  if (!modal) return;

  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
  modal.removeAttribute("aria-modal");
  document.removeEventListener("keydown", handleKeyDown);
  const wrapper = modal.querySelector(".modal-wrapper");
  if (wrapper) wrapper.removeEventListener("click", stopPropagation);

  modal = null;
  if (lastFocusedElement) lastFocusedElement.focus();
};

// évite la fermeture quand on clique dans le contenu
const stopPropagation = function (e) {
  e.stopPropagation();
};

// gère les touches (ESC = ferme / TAB = boucle focus)
const handleKeyDown = function (e) {
  if (!modal) return;
  if (e.key === "Escape") {
    closeModal(e);
  } else if (e.key === "Tab") {
    let index = focusables.indexOf(document.activeElement);
    index += e.shiftKey ? -1 : 1;
    if (index >= focusables.length) index = 0;
    if (index < 0) index = focusables.length - 1;
    focusables[index].focus();
    e.preventDefault();
  }
};

// met à jour les handlers sur la modale active
function updateModalHandler(modalActive) {
  modal = modalActive;
  if (!modal) return;
  const closeModalButton = modal.querySelector(".js-modal-close");
  if (closeModalButton) closeModalButton.addEventListener("click", closeModal);
}

// ouvre la modale d’ajout (cache la galerie)
function openAddWorkModal() {
  const modalAddWork = document.getElementById("modalAddWork");
  const modalGallery = document.getElementById("modalGallery");
  if (modalGallery) modalGallery.style.display = "none";

  updateModalHandler(modalAddWork);
  if (!modalAddWork) return;

  modalAddWork.style.display = "flex";
  modalAddWork.setAttribute("aria-hidden", "false");
  modalAddWork.setAttribute("aria-modal", "true");

  modalAddWork.addEventListener("click", closeModal);
  modalAddWork.querySelector(".modal-wrapper").addEventListener("click", stopPropagation);
}

// retour à la galerie (depuis ajout)
function backToGalleryModal() {
  const modalAddWork = document.getElementById("modalAddWork");
  if (modalAddWork) modalAddWork.style.display = "none";

  const modalGallery = document.getElementById("modalGallery");
  updateModalHandler(modalGallery);
  if (modalGallery) modalGallery.style.display = "flex";
}

// connecte les boutons de la modale (ajout / retour)
function setupModalButtons() {
  const addPhotoButton = document.getElementById("addPhotoButton");
  const backButton = document.querySelector(".js-modal-back");

  if (addPhotoButton) {
    addPhotoButton.removeEventListener("click", openAddWorkModal);
    addPhotoButton.addEventListener("click", openAddWorkModal);
  }
  if (backButton) {
    backButton.removeEventListener("click", backToGalleryModal);
    backButton.addEventListener("click", backToGalleryModal);
  }
}
document.addEventListener("DOMContentLoaded", setupModalButtons);

/************ CONTENU MODALE (vignettes + suppression) ************/
async function displayWorksInModal() {
  const works = await getWorks();

  const modalContentEl = document.querySelector(".modal-content");
  if (!modalContentEl) {
    console.error("L'élément .modal-content est introuvable.");
    return;
  }
  modalContentEl.innerHTML = "";

  works.forEach((work) => {
    let exists = document.getElementById(`work-${work.id}`);
    if (exists) return;

    const figureElement = document.createElement("figure");
    figureElement.classList.add("image-container");
    figureElement.id = `work-${work.id}`;

    const imgElement = document.createElement("img");
    imgElement.src = work.imageUrl;
    imgElement.alt = work.title;

    const spanElement = document.createElement("span");
    spanElement.classList.add("icon-background");

    const iconElement = document.createElement("i");
    iconElement.classList.add("fa-solid", "fa-trash-can", "icon-overlay");
    iconElement.addEventListener("click", (event) => {
      event.preventDefault();
      deleteWork(work.id);
    });

    spanElement.appendChild(iconElement);
    figureElement.appendChild(imgElement);
    figureElement.appendChild(spanElement);
    modalContentEl.appendChild(figureElement);
  });
}

// supprime un projet côté API + refresh l’UI
async function deleteWork(workId) {
  try {
    const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
    });
    if (!response.ok) throw new Error("Failed to delete work");

    globalWorks = null; // invalide le cache
    await displayWorksInModal();
    await displayFilteredWorks();
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
  }
}

// bouton “éditer” -> affiche la modale avec les projets
const editWorksButton = document.getElementById("edit-works");
if (editWorksButton) editWorksButton.addEventListener("click", displayWorksInModal);

/************ FORMULAIRE AJOUT ************/
async function loadCategories() {
  const categorySelect = document.getElementById("categoryInput");
  if (!categorySelect) return;

  categorySelect.innerHTML = "";
  try {
    const response = await fetch("http://localhost:5678/api/categories");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const categories = await response.json();

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Choisissez une catégorie";
    categorySelect.appendChild(defaultOption);

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  } catch (error) {
    console.error("Erreur lors du chargement des catégories:", error);
  }
}

// ajoute un nouveau projet (form + API)
async function addWork(event) {
  event.preventDefault();

  const form = document.getElementById("formAddWork");
  if (!form) {
    console.error("formAddWork introuvable");
    return;
  }
  const formData = new FormData(form);

  try {
    const response = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      body: formData,
      headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    await response.json();
    console.log("Projet ajouté avec succès");

    globalWorks = null;               // on invalide le cache
    await displayWorksInModal();      // refresh modale
    await displayFilteredWorks();     // refresh galerie

    // reset UI upload
    form.reset();
    if (previewImage) previewImage.style.display = "none";
    const upI = document.querySelector(".containerAddPhoto i");
    const upL = document.querySelector(".containerAddPhoto label");
    const upP = document.querySelector(".containerAddPhoto p");
    if (upI) upI.style.display = "block";
    if (upL) upL.style.display = "block";
    if (upP) upP.style.display = "block";

    // bascule vers la galerie
    const modalAddWorks = document.getElementById("modalAddWork");
    if (modalAddWorks) modalAddWorks.style.display = "none";
    const modalPortfolio = document.getElementById("modalPortfolio");
    if (modalPortfolio) modalPortfolio.style.display = "flex";

    closeModal(event);
  } catch (error) {
    console.error("Erreur lors de l'ajout du projet:", error);
    // TODO: gérer 401 -> rediriger vers /login si token expiré
  }
}

// aperçu image (quand on choisit un fichier)
if (inputFile) {
  inputFile.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (!previewImage) return;
      previewImage.src = e.target.result;
      previewImage.style.display = "block";
      const upI = document.querySelector(".containerAddPhoto i");
      const upL = document.querySelector(".containerAddPhoto label");
      const upP = document.querySelector(".containerAddPhoto p");
      if (upI) upI.style.display = "none";
      if (upL) upL.style.display = "none";
      if (upP) upP.style.display = "none";
    };
    reader.readAsDataURL(file);
  });
}

// active le bouton “Valider” que si tous les champs sont remplis
document.addEventListener("DOMContentLoaded", () => {
  const titleInput = document.getElementById("title");
  const categorySelect = document.getElementById("categoryInput");
  const fileInput = document.getElementById("file");
  const addWorkButton = document.getElementById("addWorkButton");

  function updateButtonState() {
    if (!(titleInput && categorySelect && fileInput && addWorkButton)) return;

    const ready =
      titleInput.value.trim() !== "" &&
      categorySelect.value &&
      fileInput.files.length > 0;

    addWorkButton.disabled = !ready;
    addWorkButton.style.backgroundColor = ready ? "#1d6154" : "#a7a7a7";
    addWorkButton.style.color = "white";
  }

  titleInput?.addEventListener("input", updateButtonState);
  categorySelect?.addEventListener("change", updateButtonState);
  fileInput?.addEventListener("change", updateButtonState);

  updateButtonState();
});

// chargement initial : setup boutons + catégories + form submit + galerie
document.addEventListener("DOMContentLoaded", async () => {
  setupModalButtons();
  await loadCategories();

  const formAddWorks = document.getElementById("formAddWork");
  if (formAddWorks) formAddWorks.addEventListener("submit", addWork);

  // s'assure que la galerie principale s'affiche au chargement
  await displayFilteredWorks();
});
