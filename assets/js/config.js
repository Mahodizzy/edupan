/* =============================================================
   EduPan · PPX — Configuración
   Paso 5 de la GUÍA: reemplaza el bloque "firebase" por el que te
   da Firebase (Configuración del proyecto → Tus apps → SDK config).
   Estos datos NO son secretos: identifican el proyecto. Lo que
   protege la información son las reglas de firestore.rules.
   ============================================================= */
window.PPX_CONFIG = {
  demo: false,
  empresa: "EduPan Panaderías",
  // La dueña del sistema: debe ser el MISMO correo que está en firestore.rules
  administradora: { nombre: "Ely Piccinini", email: "elypiccinini298@gmail.com" },
  firebase: {
    apiKey: "PEGA_AQUI_TU_API_KEY",
    authDomain: "PEGA_AQUI.firebaseapp.com",
    projectId: "PEGA_AQUI",
    storageBucket: "PEGA_AQUI.appspot.com",
    messagingSenderId: "PEGA_AQUI",
    appId: "PEGA_AQUI",
  },
};
