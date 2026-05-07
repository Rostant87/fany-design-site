/**
 * MESMINE STYLE - Serveur Express
 * Maison de couture africaine
 * API REST + Serveur de fichiers statiques
 */

const express = require('express');
const multer  = require('multer');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Chemins ────────────────────────────────────────────────────────────────
const DATA_FILE   = path.join(__dirname, 'data', 'models.json');
const IMAGES_DIR  = path.join(__dirname, 'public', 'images');

// ─── Middlewares ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ─── Multer : upload d'images ─────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, IMAGES_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, gif, webp)'));
  }
});

// ─── Helpers JSON ─────────────────────────────────────────────────────────
const readModels  = () => {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
};

const writeModels = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

// ─── Génération d'ID ──────────────────────────────────────────────────────
const generateId = (models) => {
  const nums = models.map(m => parseInt(m.id.replace('MOD', ''), 10)).filter(n => !isNaN(n));
  const next  = nums.length ? Math.max(...nums) + 1 : 1;
  return 'MOD' + String(next).padStart(3, '0');
};

// ─── ROUTES API ──────────────────────────────────────────────────────────────

// GET /api/models — liste tous les modèles
app.get('/api/models', (req, res) => {
  try {
    const models = readModels();
    res.json(models);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lecture données : ' + err.message });
  }
});

// POST /api/models — ajouter un modèle
app.post('/api/models', upload.single('image'), (req, res) => {
  try {
    const { name, category, description } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'Nom et catégorie sont obligatoires.' });
    }

    const models = readModels();
    const newModel = {
      id:          generateId(models),
      name:        name.trim(),
      category:    category.trim(),
      description: description ? description.trim() : '',
      image:       req.file ? '/images/' + req.file.filename : '/images/placeholder.jpg',
      createdAt:   new Date().toISOString()
    };

    models.push(newModel);
    writeModels(models);
    res.status(201).json(newModel);
  } catch (err) {
    res.status(500).json({ error: 'Erreur ajout modèle : ' + err.message });
  }
});

// PUT /api/models/:id — modifier un modèle
app.put('/api/models/:id', upload.single('image'), (req, res) => {
  try {
    const models = readModels();
    const idx    = models.findIndex(m => m.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Modèle introuvable.' });

    const { name, category, description } = req.body;
    if (name)        models[idx].name        = name.trim();
    if (category)    models[idx].category    = category.trim();
    if (description !== undefined) models[idx].description = description.trim();

    // Nouvelle image uploadée ?
    if (req.file) {
      // Supprimer l'ancienne image si ce n'est pas le placeholder
      const oldImg = models[idx].image;
      if (oldImg && !oldImg.includes('placeholder') && !oldImg.includes('logo')) {
        const oldPath = path.join(__dirname, 'public', oldImg);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      models[idx].image = '/images/' + req.file.filename;
    }

    models[idx].updatedAt = new Date().toISOString();
    writeModels(models);
    res.json(models[idx]);
  } catch (err) {
    res.status(500).json({ error: 'Erreur modification : ' + err.message });
  }
});

// DELETE /api/models/:id — supprimer un modèle
app.delete('/api/models/:id', (req, res) => {
  try {
    const models = readModels();
    const idx    = models.findIndex(m => m.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Modèle introuvable.' });

    // Supprimer l'image associée
    const img = models[idx].image;
    if (img && !img.includes('placeholder') && !img.includes('logo')) {
      const imgPath = path.join(__dirname, 'public', img);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    models.splice(idx, 1);
    writeModels(models);
    res.json({ message: 'Modèle supprimé avec succès.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur suppression : ' + err.message });
  }
});

// ─── Pages HTML ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ─── Démarrage ────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✨ MESMINE STYLE — Serveur démarré`);
  console.log(`🌐 Site public   : http://localhost:${PORT}`);
  console.log(`🔧 Administration: http://localhost:${PORT}/admin`);
  console.log(`📦 API           : http://localhost:${PORT}/api/models\n`);
});
