const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

//beispiel erweitern --> npm install multer davor
const multer = require("multer");
const path = require("path");

const app = express();
const port = 3000;

// middleware to parse json body
app.use(express.json());

//neu
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

// in memory storage
let items = [{ id: 1, name: "Item 1" }];

// GET
app.get("/items", (req, res) => {
    res.json(items);
});

// POST
app.post("/items", (req, res) => {
    const item = {
        id: items.length + 1,
        name: req.body.name,
    };
    items.push(item);
    res.status(201).send(item);
});

// PUT
app.put("/items/:id", (req, res) => {
    const item = items.find(i => i.id == parseInt(req.params.id));
    if (!item) return res.status(404).send("item not found");

    item.name = req.body.name;
    res.send(item);
});

// DELETE
app.delete("/items/:id", (req, res) => {
    items = items.filter(i => i.id !== parseInt(req.params.id));
    res.status(204).send();
});


// neue route
app.post("/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).send("Kein Bild hochgeladen");
    }

    res.json({
        message: "Upload erfolgreich",
        file: req.file
    });
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
