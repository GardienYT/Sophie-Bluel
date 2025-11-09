document
  .querySelector("input[type=submit]")
  .addEventListener("click", function (e) {
    e.preventDefault();
    console.log("click");
    login();
  });

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          "L’authentification a échoué. Veuillez vérifier votre identifiant et votre mot de passe et réessayer."
        );
      }
      return response.json();
    })
    .then((data) => {
      sessionStorage.setItem("token", data.token);
      window.location.href = "./index.html";
    })
    .catch((error) => {
      alert("Identifiant ou mot de passe incorrect");
    });
}
