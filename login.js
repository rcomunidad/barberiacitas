// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA3gnkU_mvzoBtiHoFD7djZooOHvosBvUA",
  authDomain: "barberia-50132.firebaseapp.com",
  databaseURL: "https://barberia-50132-default-rtdb.firebaseio.com",
  projectId: "barberia-50132",
  storageBucket: "barberia-50132.appspot.com",
  messagingSenderId: "153622446393",
  appId: "1:153622446393:web:836cbafdabc4220f6d28e8",
  measurementId: "G-NLZTQ9SPKG",
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const loginMessage = document.getElementById("login-message");

function showLoginMessage(message, isSuccess = false) {
    loginMessage.textContent = message;
    loginMessage.style.display = "block";
    loginMessage.className = `login-message ${isSuccess ? "success" : "error"}`;
}

function clearLoginMessage() {
    loginMessage.style.display = "none";
}
// Manejar el formulario de login
const loginForm = document.getElementById("login-form");
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();


  // Validar credenciales en Firebase
  const usersRef = database.ref("users");
  usersRef.once("value")
      .then((snapshot) => {
          const users = snapshot.val();
          const user = Object.values(users).find(
              (u) => u.username === username && u.password === password
          );

          if (user) {
              // Login exitoso
              sessionStorage.setItem("loggedIn", "true");
              showLoginMessage("Inicio de sesión exitoso. Redirigiendo...", true);

              // Redirigir al panel administrativo
              setTimeout(() => {
                  window.location.href = "admin.html";
              }, 2000);
          } else {
              // Credenciales incorrectas
              showLoginMessage("Usuario o contraseña incorrectos.");

          }
      })
      .catch((error) => {
          // Manejar errores
          console.error("Error al validar el login:", error);
          showLoginMessage("Error al iniciar sesión. Inténtalo nuevamente.");

      });
});
