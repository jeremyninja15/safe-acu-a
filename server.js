const express = require("express");
const admin = require("firebase-admin");

const app = express();
app.use(express.json());

// 🔍 Validar variables primero
const {
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_DATABASE_URL,
  ADMIN_KEY
} = process.env;

console.log("ENV CHECK:", {
  project: FIREBASE_PROJECT_ID,
  email: FIREBASE_CLIENT_EMAIL,
  hasKey: !!FIREBASE_PRIVATE_KEY,
  db: FIREBASE_DATABASE_URL,
  adminKey: !!ADMIN_KEY
});

// ❌ Si falta algo, no iniciar
if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY || !FIREBASE_DATABASE_URL) {
  console.error("❌ Faltan variables de entorno");
  process.exit(1);
}

// 🔥 Arreglar PRIVATE KEY (importante)
const privateKey = FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

// 🚀 Inicializar Firebase
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey
    }),
    databaseURL: FIREBASE_DATABASE_URL
  });
}

// 🔐 clave simple
const KEY = ADMIN_KEY;

// 🔥 endpoint principal
app.post("/config", async (req, res) => {
  try {
    const { key, download_enabled } = req.body;

    if (key !== KEY) {
      return res.status(403).json({ error: "No autorizado" });
    }

    await admin.database().ref("config").update({
      download_enabled
    });

    res.json({ ok: true, value: download_enabled });
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// 🧪 prueba rápida
app.get("/test-on", async (req, res) => {
  try {
    await admin.database().ref("config").update({
      download_enabled: true
    });
    res.send("Download ACTIVADO 🔥");
  } catch (e) {
    res.status(500).send("Error: " + e.message);
  }
});

app.get("/test-off", async (req, res) => {
  try {
    await admin.database().ref("config").update({
      download_enabled: false
    });
    res.send("Download DESACTIVADO ❌");
  } catch (e) {
    res.status(500).send("Error: " + e.message);
  }
});

// 🏠 ruta base (para evitar error en Railway)
app.get("/", (req, res) => {
  res.send("Servidor activo 🚀");
});

// 🚀 iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
