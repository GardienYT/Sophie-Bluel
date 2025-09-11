// Variable globale pour stocker les travaux afin d'éviter des requêtes API multiples inutiles.
let globalWorks = null;

// Fonction asynchrone pour récupérer les travaux depuis l'API.
async function getWorks() {
  // Vérifie si les travaux ont déjà été récupérés et stockés dans la variable globale.
  if (!globalWorks) {
    try {
      // Effectue la requête à l'API.
      const response = await fetch("http://localhost:5678/api/works");
      // Vérifie si la réponse est valide.
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      // Convertit la réponse en JSON et la stocke dans la variable globale.
      globalWorks = await response.json();
      console.log("Works fetched:", globalWorks);
    } catch (error) {
      console.error("Failed to fetch works:", error.message);
      // Assigner un tableau vide en cas d'échec de la récupération des données.
      globalWorks = [];
    }
  }
  // Retourne les travaux stockés.
  return globalWorks;
}

// Fonction asynchrone pour récupérer les catégories depuis l'API.
async function getCategories() {
  // Requête pour récupérer les catégories.
  const categories = await fetch("http://localhost:5678/api/categories");
  console.log(categories);
  const categoriesJson = await categories.json();
  console.log(categoriesJson);
  return categoriesJson;
}
// Fonction pour afficher les catégories dans l'interface utilisateur.
async function displayCategories() {
  const categories = await getCategories();
  // Ajoute une option "Tous" pour permettre l'affichage de tous les travaux.
  categories.unshift({ id: 0, name: "Tous" });
  const filtersContainer = document.querySelector("#filter-container");
  filtersContainer.innerHTML = ""; // Vide les filtres existants pour éviter les duplications lors de l'affichage

  categories.forEach((cat) => {
    const filterElement = document.createElement("div");
    filterElement.classList.add("filter-item");
    filterElement.innerText = cat.name;
    filterElement.addEventListener("click", () => {
      // Supprime la classe 'selected' de tous les éléments pour s'assurer que seul l'élément actif l'ait
      document
        .querySelectorAll(".filter-item")
        .forEach((item) => item.classList.remove("selected"));
      filterElement.classList.add("selected"); // Ajoute la classe 'selected' à l'élément cliqué
      filterWorks(cat.id); // Filtre les travaux en fonction de la catégorie sélectionnée
    });
    filtersContainer.appendChild(filterElement);
  });

  // Sélectionne par défaut le premier élément 'Tous'
  filtersContainer.firstChild.classList.add("selected");
}

// Fonction pour filtrer les travaux par catégorie.
async function filterWorks(categoryId) {
  const works = await getWorks();
  // Si l'ID de la catégorie est 0, afficher tous les travaux.
  if (categoryId === 0) {
    displayFilteredWorks(works);
    return;
  }
  // Filtrer les travaux selon la catégorie sélectionnée.
  const filteredWorks = works.filter(
    (travail) => travail.category.id === categoryId
  );
  displayFilteredWorks(filteredWorks);
}

// Affiche les travaux filtrés dans la galerie
async function displayFilteredWorks(filteredWorks = null) {
  const galleryElement = document.querySelector(".gallery");
  // Vide la galerie avant d'ajouter les nouveaux éléments pour éviter les duplications
  galleryElement.innerHTML = "";

  // Si aucun travail filtré n'est fourni, récupère tous les travaux
  if (filteredWorks == null) {
    filteredWorks = await getWorks();
  }

  // Crée et ajoute chaque élément de travail à la galerie
  for (let travail of filteredWorks) {
    const figureElement = document.createElement("figure");
    const figcaptionElement = document.createElement("figcaption");
    const imgElement = document.createElement("img");
    imgElement.src = travail.imageUrl;
    figcaptionElement.innerText = travail.title;
    figureElement.appendChild(imgElement);
    figureElement.appendChild(figcaptionElement);
    galleryElement.appendChild(figureElement);
  }
}

// Vérifie si l'utilisateur est connecté
function isConnected() {
  // Retourne vrai si le token existe dans le sessionStorage, faux sinon
  return sessionStorage.getItem("token") !== null;
}

// Gère le bouton de connexion/déconnexion en fonction de l'état de connexion
function handleLoginButton() {
  const loginButton = document.querySelector("#login-button");
  if (isConnected()) {
    loginButton.innerText = "logout";
    loginButton.addEventListener("click", () => {
      sessionStorage.removeItem("token");
      window.location.href = "./index.html"; // Redirige vers l'accueil après déconnexion
    });
  } else {
    loginButton.innerText = "login";
    loginButton.addEventListener("click", () => {
      window.location.href = "./login.html"; // Redirige vers la page de connexion
    });
  }
}

// Affiche ou cache les éléments administratifs en fonction de l'état de connexion
function handleAdminElements() {
  const adminElements = document.querySelectorAll(".admin-element");
  if (isConnected()) {
    adminElements.forEach((element) => {
      element.classList.remove("hidden"); // Affiche les éléments
    });
  } else {
    adminElements.forEach((element) => {
      element.classList.add("hidden"); // Cache les éléments
    });
  }
}

// Ajuste l'affichage de certains éléments du DOM en fonction de l'état de connexion
function adjustDisplayBasedOnLogin() {
  const loggedIn = isConnected();
  const headerEdit = document.getElementById("header-edit");
  const editWorks = document.getElementById("edit-works");
  const filterContainer = document.getElementById("filter-container");

  // Si l'utilisateur est connecté, affiche les éléments d'édition et masque le conteneur de filtres
  if (loggedIn) {
    headerEdit.style.display = "flex";
    editWorks.style.display = "block";
    filterContainer.style.display = "none";
  } else {
    // Sinon, masque les éléments d'édition et affiche le conteneur de filtres
    headerEdit.style.display = "none";
    editWorks.style.display = "none";
    filterContainer.style.display = "flex";
  }
}

// Initialisation des fonctions liées à la connexion et l'affichage lors du chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  adjustDisplayBasedOnLogin();
  handleLoginButton();
});

// Fonction principale qui initialise toutes les autres au chargement de la page
(function main() {
  handleLoginButton();
  displayFilteredWorks();
  displayCategories();
  handleAdminElements();
})();
