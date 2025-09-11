document
  .querySelector("input[type=submit]") // Sélectionne le bouton de soumission
  .addEventListener("click", function (e) {
    // Ajoute un écouteur d'événement de clic au bouton
    e.preventDefault(); // Empêche le comportement par défaut de soumission du formulaire
    console.log("click");
    login(); // Appelle la fonction de connexion
  });

function login() {
  const email = document.getElementById("email").value; // Récupère la valeur du champ d'entrée de l'email
  const password = document.getElementById("password").value; // Récupère la valeur du champ d'entrée du mot de passe

  fetch("http://localhost:5678/api/users/login", {
    // Envoie une requête POST vers l'endpoint de connexion
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Définit l'en-tête de la requête pour indiquer des données JSON
    },
    body: JSON.stringify({ email, password }), // Convertit l'email et le mot de passe en JSON et les inclut dans le corps de la requête
  })
    .then((response) => {
      if (!response.ok) {
        // Si le statut de la réponse n'est pas OK (200), lance une erreur
        throw new Error(
          "L’authentification a échoué. Veuillez vérifier votre identifiant et votre mot de passe et réessayer."
        );
      }
      return response.json(); // Analyse le corps de la réponse en tant que JSON
    })
    .then((data) => {
      sessionStorage.setItem("token", data.token); // Stocke le jeton dans le stockage de session
      window.location.href = "./index.html"; // Redirige l'utilisateur vers la page index.html
    })
    .catch((error) => {
      alert("Identifiant ou mot de passe incorrect"); // Affiche une alerte s'il y a une erreur
    });
}
