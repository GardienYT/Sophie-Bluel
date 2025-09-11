// Déclaration de variables pour la gestion des modales
let modal = null;
const focusableSelector = "button, a, input, textarea"; // Sélecteurs pour éléments focusables dans la modale
let focusables = [];
let lastFocusedElement = null;

// Déclaration des variables pour les différentes modales
const modalContent = document.getElementById("modalContent");
const modalGallery = document.querySelector(".modalGallery");
const modalPortfolio = document.querySelector(".modalPortfolio");
const modalAddWorks = document.querySelector(".modalAddWorks");

// Variables pour le formulaire
const inputFile = document.querySelector("#file");
const previewImage = document.getElementById("previewImage");

// Flag pour vérifier si la configuration initiale de la modale a été effectuée
let isModalSetup = false;

// Configure la modale une seule fois pour éviter des configurations multiples
function setupModalOnce() {
  if (!isModalSetup) {
    setupModalButtons(); // Configure les interactions des boutons dans la modale
    const editWorksButton = document.getElementById("edit-works");
    if (editWorksButton) {
      editWorksButton.addEventListener("click", openModal);
      editWorksButton.setAttribute("data-modal-initialized", "true");
    }
    isModalSetup = true; // Marque la modale comme configurée
  }
}
// Attache la fonction de configuration au chargement du DOM
document.addEventListener("DOMContentLoaded", setupModalOnce);

// Ouvre la modale en réponse à un événement (par exemple, clic)
const openModal = function (e) {
  e.preventDefault(); // Empêche le comportement par défaut de l'événement
  modal = document.getElementById("modalGallery"); // Sélectionne la modale
  if (!modal) return; // Si aucun élément modal n'est trouvé, retourne pour éviter des erreurs
  lastFocusedElement = document.activeElement; // Sauvegarde de l'élément actuellement focusé
  focusables = Array.from(modal.querySelectorAll(focusableSelector)); // Collecte tous les éléments focusables
  if (focusables.length) focusables[0].focus(); // Focus sur le premier élément focusable
  modal.style.display = "flex"; // Affiche la modale
  modal.setAttribute("aria-hidden", "false");
  modal.setAttribute("aria-modal", "true");
  document.addEventListener("keydown", handleKeyDown); // Écouteur pour la gestion du clavier
  const closeModalButton = modal.querySelector(".js-modal-close");
  if (closeModalButton) {
    closeModalButton.addEventListener("click", closeModal); // Bouton de fermeture
  }
  modal.addEventListener("click", closeModal); // Ferme la modale si on clique en dehors
  modal
    .querySelector(".modal-wrapper")
    .addEventListener("click", stopPropagation); // Empêche la fermeture lors d'un clic à l'intérieur de la modale
};

// Ferme la modale et nettoie les écouteurs d'événements
const closeModal = function (e) {
  console.log("closeModal");
  if (e && e.preventDefault) e.preventDefault(); // Empêche le comportement par défaut lors de la fermeture
  if (!modal) return;
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
  modal.removeAttribute("aria-modal");
  document.removeEventListener("keydown", handleKeyDown);
  modal
    .querySelector(".modal-wrapper")
    .removeEventListener("click", stopPropagation);
  modal = null;
  if (lastFocusedElement) lastFocusedElement.focus(); // Restaure le focus à l'élément précédemment focusé
};

// Empêche la propagation des événements pour les clics à l'intérieur de la modale
const stopPropagation = function (e) {
  e.stopPropagation();
};

// Gère la navigation au clavier dans la modale
const handleKeyDown = function (e) {
  if (!modal) return;
  if (e.key === "Escape") {
    closeModal(e); // Ferme la modale avec la touche 'Escape'
  } else if (e.key === "Tab") {
    let index = focusables.indexOf(document.activeElement); // Trouve l'index de l'élément actuellement focusé
    if (e.shiftKey) {
      // Si 'Shift' est pressé, navigue en arrière
      index--;
    } else {
      // Sinon navigue en avant
      index++;
    }
    if (index >= focusables.length) index = 0; // Boucle au début si on dépasse la fin
    if (index < 0) index = focusables.length - 1; // Boucle à la fin si on revient en arrière au début
    focusables[index].focus(); // Focus sur le nouvel élément
    e.preventDefault(); // Empêche le comportement par défaut de 'Tab'
  }
};

// Fonction pour mettre à jour le gestionnaire de la modale active
function updateModalHandler(modalActive) {
  modal = modalActive; // Modifie la référence de la modale active
  const closeModalButton = modal.querySelector(".js-modal-close");
  if (closeModalButton) {
    closeModalButton.addEventListener("click", closeModal); // Bouton de fermeture
  }
}
// Fonction pour ouvrir la modale d'ajout de travail
function openAddWorkModal() {
  const modalAddWork = document.getElementById("modalAddWork");
  const modalGallery = document.getElementById("modalGallery");
  if (modalGallery) {
    modalGallery.style.display = "none"; // Cache la modale principale
  }
  updateModalHandler(modalAddWork);
  if (modalAddWork) {
    modalAddWork.style.display = "flex"; // Affiche la modale
    modalAddWork.setAttribute("aria-hidden", "false"); // Accessibilité : rend la modale visible aux technologies d'assistance
    modalAddWork.setAttribute("aria-modal", "true"); // Indique que c'est une modale
    modalAddWork.addEventListener("click", closeModal); // Ajoute l'écouteur pour fermer en cliquant en dehors de la modale
    modalAddWork
      .querySelector(".modal-wrapper")
      .addEventListener("click", stopPropagation); // Empêche la fermeture lors d'un clic à l'intérieur de la modale
  }
}

// Fonction pour revenir à la galerie principale depuis la modale d'ajout
function backToGalleryModal() {
  const modalAddWork = document.getElementById("modalAddWork");
  if (modalAddWork) {
    modalAddWork.style.display = "none"; // Cache la modale d'ajout
  }
  const modalGallery = document.getElementById("modalGallery");
  updateModalHandler(modalGallery);
  if (modalGallery) {
    modalGallery.style.display = "flex"; // Affiche la modale principale
  }
}

// Configure les boutons dans les modales pour éviter les écoutes multiples
function setupModalButtons() {
  const addPhotoButton = document.getElementById("addPhotoButton");
  const backButton = document.querySelector(".js-modal-back");

  // Enlève les écouteurs d'événements existants pour prévenir les duplications
  if (addPhotoButton) {
    addPhotoButton.removeEventListener("click", openAddWorkModal);
    addPhotoButton.addEventListener("click", openAddWorkModal);
  }

  if (backButton) {
    backButton.removeEventListener("click", backToGalleryModal);
    backButton.addEventListener("click", backToGalleryModal);
  }
}

// Initialisation des écouteurs d'événements au chargement de la page
document.addEventListener("DOMContentLoaded", setupModalButtons);

/////////////////////////// MODAL CONTENT //////////////////////////

// Fonction asynchrone pour afficher les travaux dans une modale
async function displayWorksInModal() {
  // Appelle la fonction getWorks pour obtenir les travaux depuis l'API ou le cache
  const works = await getWorks();

  // Sélectionne l'élément du DOM pour le contenu de la modale
  const modalContent = document.querySelector(".modal-content");
  if (!modalContent) {
    console.error("L'élément modal-content n'a pas été trouvé.");
    return;
  }
  // Vide le contenu précédent pour éviter les duplications lors de l'affichage
  modalContent.innerHTML = "";

  // Boucle sur chaque travail récupéré pour l'afficher dans la modale
  works.forEach((work) => {
    // Vérifie si un élément pour ce travail existe déjà pour éviter de le créer à nouveau
    let workElement = document.getElementById(`work-${work.id}`);
    if (!workElement) {
      // Crée un élément figure pour chaque travail si non existant
      const figureElement = document.createElement("figure");
      figureElement.classList.add("image-container");
      figureElement.id = `work-${work.id}`;

      // Crée un élément image, configure son source et le texte alternatif
      const imgElement = document.createElement("img");
      imgElement.src = work.imageUrl;
      imgElement.alt = work.title;

      // Prépare l'icône de suppression et son conteneur
      const spanElement = document.createElement("span");
      spanElement.classList.add("icon-background");
      // Crée une icône de suppression et y attache un gestionnaire d'événements
      const iconElement = document.createElement("i");
      iconElement.classList.add("fa-solid", "fa-trash-can", "icon-overlay");
      iconElement.addEventListener("click", function (event) {
        event.preventDefault(); // Empêche le rechargement de la page
        deleteWork(work.id); // Supprime le travail lors du clic
      });

      // Assemble et ajoute les éléments à la modale
      spanElement.appendChild(iconElement);
      figureElement.appendChild(imgElement);
      figureElement.appendChild(spanElement);
      modalContent.appendChild(figureElement);
    }
  });
}
////////////////////// FONCTION DELETE //////////////////////

// Fonction asynchrone pour supprimer un travail par son identifiant
async function deleteWork(workId) {
  try {
    // Envoie une requête DELETE à l'API pour supprimer le travail spécifié
    const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Utilise le token stocké pour l'authentification
      },
    });

    // Si la réponse n'est pas OK, lance une exception
    if (!response.ok) throw new Error("Failed to delete work"); // Gère les réponses non réussies
    globalWorks = null; // Réinitialise le cache des travaux
    await displayWorksInModal(); // Met à jour l'affichage sans rechargement de la page
    await displayFilteredWorks(); // Rafraîchit l'affichage des travaux
  } catch (error) {
    console.error("Erreur lors de la suppression:", error); // Log en cas d'erreur
  }
}

// Rafraîchit l'affichage des travaux quand nécessaire
const editWorksButton = document.getElementById("edit-works");
if (editWorksButton) {
  editWorksButton.addEventListener("click", displayWorksInModal);
}

/////////////////////// FONCTIONS POUR LE FORMULAIRE D'AJOUT DES TRAVAUX //////////////////////////

// Fonction pour charger les catégories depuis l'API et les afficher dans le sélecteur
async function loadCategories() {
  const categorySelect = document.getElementById("categoryInput");
  if (!categorySelect) {
    console.error("L'élément categoryInput n'a pas été trouvé.");
    return;
  }
  categorySelect.innerHTML = ""; // Vide les options existantes

  try {
    const response = await fetch("http://localhost:5678/api/categories");
    const categories = await response.json();

    // Ajoute une option par défaut
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Choisissez une catégorie";
    categorySelect.appendChild(defaultOption);

    // Ajoute les catégories au sélecteur
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

// Fonction pour soumettre le formulaire et ajouter un nouveau travail
async function addWork(event) {
  event.preventDefault(); // Empêche le rechargement de la page lors de la soumission

  const form = document.getElementById("formAddWork");
  if (!form) {
    console.error("Le formulaire d'ajout de travail n'a pas été trouvé.");
    return;
  }
  const formData = new FormData(form);

  try {
    const response = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Authentification avec le token
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Projet ajouté avec succès:", result);

    // Réinitialise le cache des travaux
    globalWorks = null;

    // Met à jour l'affichage des travaux
    await displayWorksInModal();
    await displayFilteredWorks();

    // Réinitialise le formulaire après la soumission
    form.reset();
    previewImage.style.display = "none"; // Cache l'aperçu de l'image

    // Réaffiche les éléments initiaux
    document.querySelector(".containerAddPhoto i").style.display = "block";
    document.querySelector(".containerAddPhoto label").style.display = "block";
    document.querySelector(".containerAddPhoto p").style.display = "block";

    // Ferme la modale après la soumission
    const modalAddWorks = document.getElementById("modalAddWork");
    if (modalAddWorks) {
      modalAddWorks.style.display = "none";
    }
    const modalPortfolio = document.getElementById("modalPortfolio");
    if (modalPortfolio) {
      modalPortfolio.style.display = "flex";
    }
    closeModal(event);
  } catch (error) {
    console.error("Erreur lors de l'ajout du projet:", error);
  }
}

// Prévisualise l'image chargée avant l'envoi
if (inputFile) {
  inputFile.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        previewImage.src = e.target.result;
        previewImage.style.display = "block"; // Affiche l'aperçu de l'image

        // Cache les éléments initiaux pour faire place à l'aperçu
        document.querySelector(".containerAddPhoto i").style.display = "none";
        document.querySelector(".containerAddPhoto label").style.display =
          "none";
        document.querySelector(".containerAddPhoto p").style.display = "none";
      };
      reader.readAsDataURL(file);
    }
  });
}

// Vérifie l'état du bouton de soumission en fonction de la complétude du formulaire
document.addEventListener("DOMContentLoaded", () => {
  const titleInput = document.getElementById("title");
  const categorySelect = document.getElementById("categoryInput");
  const fileInput = document.getElementById("file");
  const addWorkButton = document.getElementById("addWorkButton");

  function updateButtonState() {
    if (titleInput && categorySelect && fileInput && addWorkButton) {
      if (
        titleInput.value.trim() !== "" &&
        categorySelect.value &&
        fileInput.files.length > 0
      ) {
        addWorkButton.disabled = false; // Active le bouton si toutes les conditions sont remplies
        addWorkButton.style.backgroundColor = "#1d6154";
        addWorkButton.style.color = "white";
      } else {
        addWorkButton.disabled = true; // Désactive le bouton si une condition n'est pas remplie
        addWorkButton.style.backgroundColor = "#a7a7a7";
        addWorkButton.style.color = "white";
      }
    }
  }

  if (titleInput) titleInput.addEventListener("input", updateButtonState);
  if (categorySelect)
    categorySelect.addEventListener("change", updateButtonState);
  if (fileInput) fileInput.addEventListener("change", updateButtonState);

  // Initial check on load
  updateButtonState();
});

// S'assure que les boutons sont configurés dès que le DOM est chargé
document.addEventListener("DOMContentLoaded", async function () {
  setupModalButtons(); // Configure déjà les boutons pour les autres modales
  await loadCategories(); // Charge les catégories disponibles

  const formAddWorks = document.getElementById("formAddWork");
  if (formAddWorks) {
    formAddWorks.addEventListener("submit", addWork); // Configure la soumission du formulaire
  }
});
