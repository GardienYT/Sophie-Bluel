// écoute le clic sur le bouton "Se connecter"
document
  .querySelector("input[type=submit]")
  .addEventListener("click", function (e) {
    e.preventDefault(); // évite le rechargement du formulaire
    console.log("click");
    login(); // lance la fonction de login
  });

// envoie les identifiants à l’API et gère la réponse
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
    .then((response) => {
      if (!response.ok) {
        // si la requête échoue, on lève une erreur (mauvais identifiants)
        throw new Error(
          "L’authentification a échoué. Vérifie ton email ou ton mot de passe."
        );
      }
      return response.json();
    })
    .then((data) => {
      // si ok : on stocke le token + redirection vers la page principale
      sessionStorage.setItem("token", data.token);
      window.location.href = "./index.html";
    })
    .catch((error) => {
      // en cas d’erreur on prévient juste l’utilisateur
      alert("Identifiant ou mot de passe incorrect");
      console.error(error);
    });
}
