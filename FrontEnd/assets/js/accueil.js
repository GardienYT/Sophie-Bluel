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

// récupère la liste des catégories (pas de cache ici)
async function getCategories() {
  const categories = await fetch("http://localhost:5678/api/categories");
  const categoriesJson = await categories.json();
  console.log(categoriesJson);
  return categoriesJson;
}

// affiche les boutons de filtre selon les catégories
async function displayCategories() {
  const categories = await getCategories();
  categories.unshift({ id: 0, name: "Tous" }); // bouton “Tous” en premier

  const filtersContainer = document.querySelector("#filter-container");
  filtersContainer.innerHTML = "";

  categories.forEach((cat) => {
    const filterElement = document.createElement("div");
    filterElement.classList.add("filter-item");
    filterElement.innerText = cat.name;

    // clic sur un filtre -> met à jour l'affichage
    filterElement.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-item")
        .forEach((item) => item.classList.remove("selected"));
      filterElement.classList.add("selected");
      filterWorks(cat.id);
    });

    filtersContainer.appendChild(filterElement);
  });

  filtersContainer.firstChild.classList.add("selected"); // “Tous” sélectionné par défaut
}

// applique un filtre sur les travaux selon la catégorie
async function filterWorks(categoryId) {
  const works = await getWorks();

  if (categoryId === 0) {
    displayFilteredWorks(works);
    return;
  }

  const filteredWorks = works.filter(
    (travail) => travail.category.id === categoryId
  );
  displayFilteredWorks(filteredWorks);
}

// affiche la galerie avec les projets filtrés
async function displayFilteredWorks(filteredWorks = null) {
  const galleryElement = document.querySelector(".gallery");
  galleryElement.innerHTML = "";

  if (!filteredWorks) filteredWorks = await getWorks();

  for (let travail of filteredWorks) {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const caption = document.createElement("figcaption");

    img.src = travail.imageUrl;
    caption.innerText = travail.title;

    figure.appendChild(img);
    figure.appendChild(caption);
    galleryElement.appendChild(figure);
  }
}

// vérifie si l'utilisateur est connecté
function isConnected() {
  return sessionStorage.getItem("token") !== null;
}

// met à jour le bouton login/logout
function handleLoginButton() {
  const loginButton = document.querySelector("#login-button");

  if (isConnected()) {
    loginButton.innerText = "logout";
    loginButton.addEventListener("click", () => {
      sessionStorage.removeItem("token");
      window.location.href = "./index.html";
    });
  } else {
    loginButton.innerText = "login";
    loginButton.addEventListener("click", () => {
      window.location.href = "./login.html";
    });
  }
}

// affiche/masque les éléments réservés à l’admin
function handleAdminElements() {
  const adminElements = document.querySelectorAll(".admin-element");
  adminElements.forEach((el) => {
    el.classList.toggle("hidden", !isConnected());
  });
}

// ajuste l’affichage général selon l’état de connexion
function adjustDisplayBasedOnLogin() {
  const loggedIn = isConnected();
  const headerEdit = document.getElementById("header-edit");
  const editWorks = document.getElementById("edit-works");
  const filterContainer = document.getElementById("filter-container");

  if (loggedIn) {
    headerEdit.style.display = "flex";
    editWorks.style.display = "block";
    filterContainer.style.display = "none";
  } else {
    headerEdit.style.display = "none";
    editWorks.style.display = "none";
    filterContainer.style.display = "flex";
  }
}

// quand la page est prête -> on adapte l’affichage
document.addEventListener("DOMContentLoaded", () => {
  adjustDisplayBasedOnLogin();
  handleLoginButton();
});

// exécution principale
(function main() {
  handleLoginButton();
  displayFilteredWorks();
  displayCategories();
  handleAdminElements();
})();
