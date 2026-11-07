const express = require("express");
const app = express();

app.get("/api/salud", (req, res) => {
    res.json({ estado: "ok" });
});

app.listen(3000, () => {
    console.log("Servidor en http://localhost:3000");
});