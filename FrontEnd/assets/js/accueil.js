let globalWorks = null;

async function getWorks() {
  if (!globalWorks) {
    try {
      const response = await fetch("http://localhost:5678/api/works");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      globalWorks = await response.json();
      console.log("Works fetched:", globalWorks);
    } catch (error) {
      console.error("Failed to fetch works:", error.message);
      globalWorks = [];
    }
  }
  return globalWorks;
}

async function getCategories() {
  const categories = await fetch("http://localhost:5678/api/categories");
  console.log(categories);
  const categoriesJson = await categories.json();
  console.log(categoriesJson);
  return categoriesJson;
}
async function displayCategories() {
  const categories = await getCategories();
  categories.unshift({ id: 0, name: "Tous" });
  const filtersContainer = document.querySelector("#filter-container");
  filtersContainer.innerHTML = "";

  categories.forEach((cat) => {
    const filterElement = document.createElement("div");
    filterElement.classList.add("filter-item");
    filterElement.innerText = cat.name;
    filterElement.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-item")
        .forEach((item) => item.classList.remove("selected"));
      filterElement.classList.add("selected");
      filterWorks(cat.id);
    });
    filtersContainer.appendChild(filterElement);
  });

  filtersContainer.firstChild.classList.add("selected");
}

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

async function displayFilteredWorks(filteredWorks = null) {
  const galleryElement = document.querySelector(".gallery");
  galleryElement.innerHTML = "";

  if (filteredWorks == null) {
    filteredWorks = await getWorks();
  }

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

function isConnected() {
  return sessionStorage.getItem("token") !== null;
}

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

function handleAdminElements() {
  const adminElements = document.querySelectorAll(".admin-element");
  if (isConnected()) {
    adminElements.forEach((element) => {
      element.classList.remove("hidden");
    });
  } else {
    adminElements.forEach((element) => {
      element.classList.add("hidden");
    });
  }
}

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

document.addEventListener("DOMContentLoaded", () => {
  adjustDisplayBasedOnLogin();
  handleLoginButton();
});

(function main() {
  handleLoginButton();
  displayFilteredWorks();
  displayCategories();
  handleAdminElements();
})();
