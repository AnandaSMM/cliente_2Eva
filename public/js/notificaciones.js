function askNotificationPermission() {
  // función para pedir los permisos
  function handlePermission(permission) {
    // configura el botón para que se muestre u oculte, dependiendo de lo que
    // responda el usuario
    if (
      Notification.permission === "denied" ||
      Notification.permission === "default"
    ) {
      notificationBtn.style.display = "block";
    } else {
      notificationBtn.style.display = "none";
    }
  }

  // Comprobemos si el navegador admite notificaciones.
  if (!("Notification" in window)) {
    console.log("Este navegador no admite notificaciones.");
  } else {
    if (checkNotificationPromise()) {
      Notification.requestPermission().then((permission) => {
        handlePermission(permission);
      });
    } else {
      Notification.requestPermission(function (permission) {
        handlePermission(permission);
      });
    }
  }
}