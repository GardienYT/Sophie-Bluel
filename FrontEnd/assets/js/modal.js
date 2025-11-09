let modal = null;
const focusableSelector = "button, a, input, textarea"; 
let focusables = [];
let lastFocusedElement = null;

const modalContent = document.getElementById("modalContent");
const modalGallery = document.querySelector(".modalGallery");
const modalPortfolio = document.querySelector(".modalPortfolio");
const modalAddWorks = document.querySelector(".modalAddWorks");

const inputFile = document.querySelector("#file");
const previewImage = document.getElementById("previewImage");

let isModalSetup = false;

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
  if (closeModalButton) {
    closeModalButton.addEventListener("click", closeModal); 
  }
  modal.addEventListener("click", closeModal);
  modal
    .querySelector(".modal-wrapper")
    .addEventListener("click", stopPropagation); 
};

const closeModal = function (e) {
  console.log("closeModal");
  if (e && e.preventDefault) e.preventDefault();
  if (!modal) return;
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
  modal.removeAttribute("aria-modal");
  document.removeEventListener("keydown", handleKeyDown);
  modal
    .querySelector(".modal-wrapper")
    .removeEventListener("click", stopPropagation);
  modal = null;
  if (lastFocusedElement) lastFocusedElement.focus();
};

const stopPropagation = function (e) {
  e.stopPropagation();
};

const handleKeyDown = function (e) {
  if (!modal) return;
  if (e.key === "Escape") {
    closeModal(e); 
  } else if (e.key === "Tab") {
    let index = focusables.indexOf(document.activeElement); 
    if (e.shiftKey) {
      index--;
    } else {
      index++;
    }
    if (index >= focusables.length) index = 0;
    if (index < 0) index = focusables.length - 1;
    focusables[index].focus(); 
    e.preventDefault(); 
  }
};


function updateModalHandler(modalActive) {
  modal = modalActive; 
  const closeModalButton = modal.querySelector(".js-modal-close");
  if (closeModalButton) {
    closeModalButton.addEventListener("click", closeModal); 
  }
}

function openAddWorkModal() {
  const modalAddWork = document.getElementById("modalAddWork");
  const modalGallery = document.getElementById("modalGallery");
  if (modalGallery) {
    modalGallery.style.display = "none"; 
  }
  updateModalHandler(modalAddWork);
  if (modalAddWork) {
    modalAddWork.style.display = "flex";
    modalAddWork.setAttribute("aria-hidden", "false");
    modalAddWork.setAttribute("aria-modal", "true"); 
    modalAddWork.addEventListener("click", closeModal); 
    modalAddWork
      .querySelector(".modal-wrapper")
      .addEventListener("click", stopPropagation); 
  }
}

function backToGalleryModal() {
  const modalAddWork = document.getElementById("modalAddWork");
  if (modalAddWork) {
    modalAddWork.style.display = "none"; 
  }
  const modalGallery = document.getElementById("modalGallery");
  updateModalHandler(modalGallery);
  if (modalGallery) {
    modalGallery.style.display = "flex"; 
  }
}

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

/////////////////////////// MODAL CONTENT //////////////////////////

async function displayWorksInModal() {
  const works = await getWorks();

  const modalContent = document.querySelector(".modal-content");
  if (!modalContent) {
    console.error("L'élément modal-content n'a pas été trouvé.");
    return;
  }
  modalContent.innerHTML = "";

  works.forEach((work) => {
    let workElement = document.getElementById(`work-${work.id}`);
    if (!workElement) {
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
      iconElement.addEventListener("click", function (event) {
        event.preventDefault(); 
        deleteWork(work.id); 
      });

      spanElement.appendChild(iconElement);
      figureElement.appendChild(imgElement);
      figureElement.appendChild(spanElement);
      modalContent.appendChild(figureElement);
    }
  });
}
////////////////////// FONCTION DELETE //////////////////////

async function deleteWork(workId) {
  try {
    const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });

    if (!response.ok) throw new Error("Failed to delete work");
    globalWorks = null; 
    await displayWorksInModal(); 
    await displayFilteredWorks(); 
  } catch (error) {
    console.error("Erreur lors de la suppression:", error); 
  }
}

const editWorksButton = document.getElementById("edit-works");
if (editWorksButton) {
  editWorksButton.addEventListener("click", displayWorksInModal);
}

/////////////////////// FONCTIONS POUR LE FORMULAIRE D'AJOUT DES TRAVAUX //////////////////////////

async function loadCategories() {
  const categorySelect = document.getElementById("categoryInput");
  if (!categorySelect) {
    console.error("L'élément categoryInput n'a pas été trouvé.");
    return;
  }
  categorySelect.innerHTML = "";

  try {
    const response = await fetch("http://localhost:5678/api/categories");
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

async function addWork(event) {
  event.preventDefault(); 

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

    globalWorks = null;

    await displayWorksInModal();
    await displayFilteredWorks();

    form.reset();
    previewImage.style.display = "none";

    document.querySelector(".containerAddPhoto i").style.display = "block";
    document.querySelector(".containerAddPhoto label").style.display = "block";
    document.querySelector(".containerAddPhoto p").style.display = "block";

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

if (inputFile) {
  inputFile.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        previewImage.src = e.target.result;
        previewImage.style.display = "block"; 

        document.querySelector(".containerAddPhoto i").style.display = "none";
        document.querySelector(".containerAddPhoto label").style.display =
          "none";
        document.querySelector(".containerAddPhoto p").style.display = "none";
      };
      reader.readAsDataURL(file);
    }
  });
}

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
        addWorkButton.disabled = false; 
        addWorkButton.style.backgroundColor = "#1d6154";
        addWorkButton.style.color = "white";
      } else {
        addWorkButton.disabled = true; 
        addWorkButton.style.backgroundColor = "#a7a7a7";
        addWorkButton.style.color = "white";
      }
    }
  }

  if (titleInput) titleInput.addEventListener("input", updateButtonState);
  if (categorySelect)
    categorySelect.addEventListener("change", updateButtonState);
  if (fileInput) fileInput.addEventListener("change", updateButtonState);

  updateButtonState();
});

document.addEventListener("DOMContentLoaded", async function () {
  setupModalButtons(); 
  await loadCategories(); 

  const formAddWorks = document.getElementById("formAddWork");
  if (formAddWorks) {
    formAddWorks.addEventListener("submit", addWork);
  }
});
