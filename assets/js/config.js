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
  // Administradores fijos además de la dueña (el creador del sitio). Deben estar también en firestore.rules.
  administradores: [{ nombre: "Marlon Domínguez", email: "marlondominguez1012@gmail.com" }],
  firebase: {
    apiKey: "AIzaSyCGtPahsbTQeMJPxgpW2JvpV82TF6rdH98",
    authDomain: "edupan-e58ca.firebaseapp.com",
    projectId: "edupan-e58ca",
    storageBucket: "edupan-e58ca.firebasestorage.app",
    messagingSenderId: "29436771508",
    appId: "1:29436771508:web:3818ae2c054e2adc84ebe1",
  },
};
