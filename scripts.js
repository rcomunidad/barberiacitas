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

// Mostrar mensajes de error y éxito
function showError(message) {
  const errorMessage = document.getElementById("error-message");
  if (errorMessage) {
      errorMessage.style.color = "#d9534f"; // Rojo
      errorMessage.textContent = message;
      errorMessage.style.display = "block";
  }
}

function showSuccess(message) {
  const errorMessage = document.getElementById("error-message");
  if (errorMessage) {
      errorMessage.style.color = "#5cb85c"; // Verde
      errorMessage.textContent = message;
      errorMessage.style.display = "block";
  }
}

function clearError() {
  const errorMessage = document.getElementById("error-message");
  if (errorMessage) {
      errorMessage.style.display = "none";
  }
}

// Guardar una cita
function saveAppointment(appointment) {
  const appointmentsRef = database.ref("citas");
  appointmentsRef.push(appointment)
      .then(() => {
          showSuccess("Cita guardada con éxito.");
          setTimeout(() => clearError(), 3000);
      })
      .catch((error) => {
          showError("Error al guardar la cita. Inténtalo nuevamente.");
          console.error("Error al guardar la cita:", error);
      });
}

// Cargar citas
function loadAppointments(callback) {
  const appointmentsRef = database.ref("citas");
  appointmentsRef.once("value", (snapshot) => {
      const data = snapshot.val();
      const appointments = data
          ? Object.entries(data).map(([id, value]) => ({ id, ...value }))
          : [];
      callback(appointments);
  });
}

// Eliminar una cita
function deleteAppointment(id) {
  const appointmentRef = database.ref(`citas/${id}`);
  appointmentRef.remove()
      .then(() => {
          showSuccess("Cita eliminada.");
          setTimeout(() => clearError(), 3000);
      })
      .catch((error) => {
          showError("Error al eliminar la cita. Inténtalo nuevamente.");
          console.error("Error al eliminar la cita:", error);
      });
}

// Verificar si el horario y el barbero están ocupados
function isSlotOccupied(appointments, date, time, barber) {
  return appointments.some(
      (appt) =>
          appt.date === date &&
          appt.time === time &&
          appt.barber.toLowerCase() === barber.toLowerCase()
  );
}

// Generar opciones de horarios
function generateTimeSlots() {
  const startHour = 8; // 8:00 AM
  const endHour = 22; // 10:00 PM
  const interval = 45; // Intervalo en minutos
  const timeSelect = document.getElementById("time");

  if (!timeSelect) return;

  for (let hour = startHour; hour < endHour; hour++) {
      for (let minutes = 0; minutes < 60; minutes += interval) {
          const time = `${hour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
          const option = document.createElement("option");
          option.value = time;
          option.textContent = time;
          timeSelect.appendChild(option);
      }
  }
}

// Inicializar Flatpickr y generar horarios
document.addEventListener("DOMContentLoaded", () => {
  const datePicker = document.getElementById("date");
  if (datePicker) {
      flatpickr(datePicker, {
          minDate: "today",
          dateFormat: "Y-m-d",
      });
  }
  generateTimeSlots();

  // Mostrar citas en la administración
  if (document.getElementById("admin-appointment-list")) {
      loadAppointments((appointments) => {
          const adminAppointmentList = document.getElementById("admin-appointment-list");
          adminAppointmentList.innerHTML = "";
          appointments.forEach((appt) => {
              const li = document.createElement("li");

              const info = document.createElement("span");
              info.textContent = `${appt.name} - ${appt.phone} - ${appt.date} ${appt.time} con ${appt.barber}`;

              const deleteBtn = document.createElement("button");
              deleteBtn.textContent = "Eliminar";
              deleteBtn.onclick = () => deleteAppointment(appt.id);

              li.appendChild(info);
              li.appendChild(deleteBtn);
              adminAppointmentList.appendChild(li);
          });
      });
  }
});

// Manejo del formulario
const form = document.getElementById("appointment-form");
if (form) {
  form.addEventListener("submit", (e) => {
      e.preventDefault();
      clearError();

      const newAppointment = {
          name: document.getElementById("name").value.trim(),
          phone: document.getElementById("phone").value.trim(),
          date: document.getElementById("date").value.trim(),
          time: document.getElementById("time").value.trim(),
          barber: document.getElementById("barber").value.trim(),
      };

      if (
          !newAppointment.name ||
          !newAppointment.phone ||
          !newAppointment.date ||
          !newAppointment.time ||
          !newAppointment.barber
      ) {
          showError("Todos los campos son obligatorios.");
          return;
      }

      loadAppointments((appointments) => {
          if (isSlotOccupied(appointments, newAppointment.date, newAppointment.time, newAppointment.barber)) {
              showError("Este horario ya está ocupado con el barbero seleccionado.");
          } else {
              saveAppointment(newAppointment);
              form.reset();
              clearError();
          }
      });
  });
}
