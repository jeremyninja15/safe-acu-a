const express = require("express");
const admin = require("firebase-admin");

const app = express();
app.use(express.json());

// 🔥 Firebase config desde variables (Railway)
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

// 🔐 clave simple
const ADMIN_KEY = process.env.ADMIN_KEY;

// 🔥 endpoint principal
app.post("/config", async (req, res) => {
  try {
    const { key, download_enabled } = req.body;

    if (key !== ADMIN_KEY) {
      return res.status(403).json({ error: "No autorizado" });
    }

    await admin.database().ref("config").update({
      download_enabled
    });

    res.json({ ok: true, value: download_enabled });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🧪 prueba rápida desde navegador
app.get("/test-on", async (req, res) => {
  await admin.database().ref("config").update({
    download_enabled: true
  });
  res.send("Download ACTIVADO 🔥");
});

app.get("/test-off", async (req, res) => {
  await admin.database().ref("config").update({
    download_enabled: false
  });
  res.send("Download DESACTIVADO ❌");
});

// 🚀 iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
